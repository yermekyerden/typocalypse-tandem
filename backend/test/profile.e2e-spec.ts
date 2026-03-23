import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

const TEST_UPLOAD_DIR = join(process.cwd(), 'uploads-test');

type UserResponse = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
};

type TokensResponse = {
  accessToken: string;
  refreshToken: string;
};

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') throw new Error('Expected object');
  return value as Record<string, unknown>;
}

function asAuthBody(value: unknown): { user: UserResponse; tokens: TokensResponse } {
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
    },
    tokens: {
      accessToken: String(tokens.accessToken),
      refreshToken: String(tokens.refreshToken),
    },
  };
}

describe('ProfileController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  const credentials = {
    username: 'profileuser',
    email: 'profile@zion.dev',
    password: 'supersecure',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    (app as NestExpressApplication).useStaticAssets(TEST_UPLOAD_DIR, { prefix: '/uploads' });
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);

    const body = asAuthBody(res.body as unknown);
    accessToken = body.tokens.accessToken;
    refreshToken = body.tokens.refreshToken;
    userId = body.user.id;
  });

  afterAll(async () => {
    await app.close();
    if (existsSync(TEST_UPLOAD_DIR)) {
      rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
    }
  });

  describe('GET /profile/me', () => {
    it('returns 200 with full user for valid access token', async () => {
      const res = await request(app.getHttpServer())
        .get('/profile/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = toRecord(res.body as unknown);
      expect(body.id).toBe(userId);
      expect(body.email).toBe(credentials.email);
    });

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/profile/me').expect(401);
    });

    it('returns 401 with refresh token instead of access token', async () => {
      await request(app.getHttpServer())
        .get('/profile/me')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(401);
    });

    it('returns 401 with malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/profile/me')
        .set('Authorization', 'Bearer garbage.token.here')
        .expect(401);
    });
  });

  describe('PATCH /profile/me', () => {
    it('returns 200 with updated firstName and lastName', async () => {
      const res = await request(app.getHttpServer())
        .patch('/profile/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ firstName: 'Thomas', lastName: 'Anderson' })
        .expect(200);

      const body = toRecord(res.body as unknown);
      expect(body.firstName).toBe('Thomas');
      expect(body.lastName).toBe('Anderson');
    });
  });

  describe('GET /profile/:id', () => {
    it('returns 200 with public fields only (no email)', async () => {
      const res = await request(app.getHttpServer()).get(`/profile/${userId}`).expect(200);

      const body = toRecord(res.body as unknown);
      expect(body.id).toBe(userId);
      expect(body.username).toBe(credentials.username);
      expect(body.email).toBeUndefined();
    });

    it('returns 404 for unknown UUID', async () => {
      await request(app.getHttpServer())
        .get('/profile/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /profile/me/password', () => {
    it('returns 204 on successful password change', async () => {
      await request(app.getHttpServer())
        .patch('/profile/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: credentials.password, newPassword: 'newpassword123' })
        .expect(204);
    });

    it('returns 401 with wrong current password', async () => {
      await request(app.getHttpServer())
        .patch('/profile/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: 'wrongpassword', newPassword: 'doesnotmatter' })
        .expect(401);
    });
  });

  describe('POST /profile/me/avatar', () => {
    it('returns 200 with avatarUrl set after valid image upload', async () => {
      const imageBuffer = Buffer.alloc(100, 0xff);

      const res = await request(app.getHttpServer())
        .post('/profile/me/avatar')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('avatar', imageBuffer, { filename: 'test.png', contentType: 'image/png' })
        .expect(200);

      const body = toRecord(res.body as unknown);
      expect(typeof body.avatarUrl).toBe('string');
      expect(String(body.avatarUrl)).toMatch(/^\/uploads\/avatars\//);
    });

    it('returns 400 for invalid MIME type (text file)', async () => {
      const textBuffer = Buffer.from('not an image');

      await request(app.getHttpServer())
        .post('/profile/me/avatar')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('avatar', textBuffer, { filename: 'test.txt', contentType: 'text/plain' })
        .expect(400);
    });

    it('returns 413 for oversized file (> 2 MB)', async () => {
      const oversizedBuffer = Buffer.alloc(3 * 1024 * 1024, 0xff);

      await request(app.getHttpServer())
        .post('/profile/me/avatar')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('avatar', oversizedBuffer, { filename: 'big.png', contentType: 'image/png' })
        .expect(413);
    });
  });

  describe('DELETE /profile/me/avatar', () => {
    it('returns 200 with avatarUrl set to null', async () => {
      const res = await request(app.getHttpServer())
        .delete('/profile/me/avatar')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = toRecord(res.body as unknown);
      expect(body.avatarUrl).toBeNull();
    });
  });
});
