import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

const ALLOWED_ORIGIN = 'http://test-origin.example.com';
const UNTRUSTED_ORIGIN = 'http://untrusted.example.com';

describe('CORS (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    process.env.CORS_ORIGIN = ALLOWED_ORIGIN;

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    const corsOrigin = process.env.CORS_ORIGIN
      ? new URL(process.env.CORS_ORIGIN).origin
      : undefined;

    app.enableCors({
      origin: corsOrigin ? [corsOrigin] : undefined,
    });
    await app.init();
  });

  afterEach(async () => {
    delete process.env.CORS_ORIGIN;
    await app.close();
  });

  it('OPTIONS preflight from allowed origin returns Access-Control-Allow-Origin and Vary: Origin', async () => {
    await request(app.getHttpServer())
      .options('/auth/login')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type,Authorization')
      .expect((res) => {
        expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
        expect(res.headers['vary']).toContain('Origin');
      });
  });

  it('OPTIONS preflight from untrusted origin does not receive Access-Control-Allow-Origin header', async () => {
    await request(app.getHttpServer())
      .options('/auth/login')
      .set('Origin', UNTRUSTED_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type,Authorization')
      .expect((res) => {
        expect(res.headers['access-control-allow-origin']).toBeUndefined();
      });
  });

  it('POST from allowed origin includes Access-Control-Allow-Origin in response', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('Origin', ALLOWED_ORIGIN)
      .send({ username: 'x', password: 'x' })
      .expect((res) => {
        expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
      });
  });

  it('request from untrusted origin does not receive Access-Control-Allow-Origin header', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('Origin', UNTRUSTED_ORIGIN)
      .send({ username: 'x', password: 'x' })
      .expect((res) => {
        expect(res.headers['access-control-allow-origin']).toBeUndefined();
      });
  });
});
