import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

type UserResponse = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type TokensResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

type AuthResponse = {
  user: UserResponse;
  tokens: TokensResponse;
};

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    throw new Error('Expected object response body');
  }

  return value as Record<string, unknown>;
}

function asAuthResponse(value: unknown): AuthResponse {
  const root = toRecord(value);
  const user = toRecord(root.user);
  const tokens = toRecord(root.tokens);

  return {
    user: {
      id: String(user.id),
      username: String(user.username),
      firstName: String(user.firstName),
      lastName: String(user.lastName),
      email: String(user.email),
      avatarUrl: typeof user.avatarUrl === 'string' ? user.avatarUrl : null,
      createdAt: String(user.createdAt),
      updatedAt: String(user.updatedAt),
    },
    tokens: {
      accessToken: String(tokens.accessToken),
      refreshToken: String(tokens.refreshToken),
      expiresAt: String(tokens.expiresAt),
    },
  };
}

function asTokensResponse(value: unknown): TokensResponse {
  const root = toRecord(value);
  return {
    accessToken: String(root.accessToken),
    refreshToken: String(root.refreshToken),
    expiresAt: String(root.expiresAt),
  };
}

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  const userOne: RegisterPayload = {
    username: 'neo',
    email: 'neo@zion.dev',
    password: 'supersecure',
  };

  const userTwo: RegisterPayload = {
    username: 'trinity',
    email: 'trinity@zion.dev',
    password: 'supersecure',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/register returns full user and tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userOne)
      .expect(201);

    const body = asAuthResponse(response.body as unknown);

    expect(typeof body.user.id).toBe('string');
    expect(body.user.username).toBe(userOne.username);
    expect(body.user.email).toBe(userOne.email);
    expect(body.user.firstName).toBe('');
    expect(body.user.lastName).toBe('');
    expect(body.user.avatarUrl).toBeNull();
    expect(typeof body.user.createdAt).toBe('string');
    expect(typeof body.user.updatedAt).toBe('string');

    expect(typeof body.tokens.accessToken).toBe('string');
    expect(typeof body.tokens.refreshToken).toBe('string');
    expect(typeof body.tokens.expiresAt).toBe('string');
  });

  it('POST /auth/register returns 409 for duplicate username', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(userOne).expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...userTwo,
        username: userOne.username,
      })
      .expect(409);
  });

  it('POST /auth/register returns 409 for duplicate email', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(userOne).expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...userTwo,
        email: userOne.email,
      })
      .expect(409);
  });

  it('POST /auth/register returns 400 for invalid payload', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'ab',
        email: 'not-an-email',
        password: 'short',
      })
      .expect(400);
  });

  it('POST /auth/login returns 200 for valid credentials', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(userOne).expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: userOne.username,
        password: userOne.password,
      })
      .expect(200);

    const body = asAuthResponse(response.body as unknown);

    expect(body.user.username).toBe(userOne.username);
    expect(typeof body.tokens.accessToken).toBe('string');
    expect(typeof body.tokens.refreshToken).toBe('string');
    expect(typeof body.tokens.expiresAt).toBe('string');
  });

  it('POST /auth/login returns 401 for unknown username', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'unknown',
        password: 'supersecure',
      })
      .expect(401);
  });

  it('POST /auth/login returns 401 for wrong password', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(userOne).expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: userOne.username,
        password: 'incorrect-password',
      })
      .expect(401);
  });

  it('POST /auth/refresh returns new token pair for valid refresh token', async () => {
    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userOne)
      .expect(201);
    const registerBody = asAuthResponse(register.body as unknown);

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: registerBody.tokens.refreshToken,
      })
      .expect(200);

    const body = asTokensResponse(response.body as unknown);
    expect(typeof body.accessToken).toBe('string');
    expect(typeof body.refreshToken).toBe('string');
    expect(typeof body.expiresAt).toBe('string');
  });

  it('POST /auth/refresh returns 401 for malformed token', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: 'not-a-jwt',
      })
      .expect(401);
  });

  it('POST /auth/refresh returns 401 for access token passed as refresh token', async () => {
    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userOne)
      .expect(201);
    const registerBody = asAuthResponse(register.body as unknown);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: registerBody.tokens.accessToken,
      })
      .expect(401);
  });
});
