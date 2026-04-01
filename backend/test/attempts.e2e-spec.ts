import { randomUUID } from 'crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

// Lesson ID mapped to ch01-m03-list-home. The `ls` command completes this mission in one step.
const LESSON_LS_HOME = 'ls-home';

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') throw new Error('Expected object');
  return value as Record<string, unknown>;
}

describe('Attempts & Progress (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    // Register + login a fresh user
    const username = `user_${Date.now()}`;
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username,
        email: `${username}@test.com`,
        password: 'Password1!',
      });
    const body = toRecord(registerRes.body);
    accessToken = toRecord(body['tokens'])['accessToken'] as string;
  });

  afterEach(async () => {
    await app.close();
  });

  // ── POST /attempts ──────────────────────────────────────────────────────

  it('POST /attempts → 201 with attemptId and initialState, no mission field', async () => {
    const res = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: LESSON_LS_HOME });

    expect(res.status).toBe(201);
    const body = toRecord(res.body);
    expect(body['contractsVersion']).toBeDefined();
    expect(typeof body['serverTimeUtc']).toBe('string');
    const data = toRecord(body['data']);
    expect(typeof data['attemptId']).toBe('string');
    expect(data['initialCwd']).toBe('/home/dojo');
    expect(data['initialFs']).toBeDefined();
    expect(data['mission']).toBeUndefined();
  });

  it('POST /attempts → 401 without token', async () => {
    const res = await request(app.getHttpServer())
      .post('/attempts')
      .send({ lessonId: LESSON_LS_HOME });
    expect(res.status).toBe(401);
  });

  it('POST /attempts → 404 for unknown lessonId', async () => {
    const res = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: 'nonexistent-lesson' });
    expect(res.status).toBe(404);
  });

  it('POST /attempts → 422 for lessonId that exists but has no mission mapping', async () => {
    // cat-mission is a real lesson in learning content but not in LESSON_MISSION_MAP
    const res = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: 'cat-mission' });
    expect(res.status).toBe(422);
  });

  // ── PATCH /attempts/:id/command ─────────────────────────────────────────

  it('PATCH /attempts/:id/command → 200 with stdout and validation', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: LESSON_LS_HOME });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

    const res = await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ command: 'ls', clientCommandId: randomUUID() });

    expect(res.status).toBe(200);
    const data = toRecord(toRecord(res.body)['data']);
    expect(data['exitCode']).toBe(0);
    expect(String(data['stdout'])).toContain('projects');
    expect(data['validation']).toBeDefined();
    expect(data['trace']).toBeDefined();
    expect(data['attemptStatus']).toBe('completed'); // ls-home mission completes in one step
  });

  it('PATCH /attempts/:id/command → idempotent on repeat clientCommandId, including after completion', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: LESSON_LS_HOME });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

    // `ls` completes the mission. Re-submitting the same clientCommandId after
    // completion should return the cached result (200), not 409.
    const cmdId = randomUUID();
    const first = await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ command: 'ls', clientCommandId: cmdId });

    const second = await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ command: 'ls', clientCommandId: cmdId });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    // Both responses should have the same stdout (cached idempotency)
    expect(toRecord(toRecord(first.body)['data'])['stdout']).toBe(
      toRecord(toRecord(second.body)['data'])['stdout'],
    );
    // Both should report completed since the first call completed the attempt
    expect(toRecord(toRecord(first.body)['data'])['attemptStatus']).toBe('completed');
    expect(toRecord(toRecord(second.body)['data'])['attemptStatus']).toBe('completed');
  });

  it('PATCH /attempts/:id/command → 409 on completed attempt', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: LESSON_LS_HOME });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

    // Complete the ls-home attempt
    await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ command: 'ls', clientCommandId: randomUUID() });

    // Try to submit again with a new clientCommandId — must get 409
    const res = await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ command: 'ls', clientCommandId: randomUUID() });

    expect(res.status).toBe(409);
  });

  it('PATCH /attempts/:id/command → 403 for wrong user', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: LESSON_LS_HOME });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

    // Register second user
    const u2 = `user2_${Date.now()}`;
    const r2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: u2,
        email: `${u2}@test.com`,
        password: 'Password1!',
      });
    const token2 = toRecord(toRecord(r2.body)['tokens'])['accessToken'] as string;

    const res = await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ command: 'ls', clientCommandId: randomUUID() });

    expect(res.status).toBe(403);
  });

  // ── GET /attempts/:id ───────────────────────────────────────────────────

  it('GET /attempts/:id → 200 with steps after commands', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: LESSON_LS_HOME });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

    await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ command: 'ls', clientCommandId: randomUUID() });

    const res = await request(app.getHttpServer())
      .get(`/attempts/${attemptId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    const attempt = toRecord(toRecord(toRecord(res.body)['data'])['attempt']);
    expect(attempt['attemptId']).toBe(attemptId);
    expect(Array.isArray(attempt['steps'])).toBe(true);
    expect((attempt['steps'] as unknown[]).length).toBe(1);
  });

  // ── PATCH /attempts/:id/abandon ─────────────────────────────────────────

  it('PATCH /attempts/:id/abandon → 200 and marks abandoned', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: LESSON_LS_HOME });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

    const res = await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/abandon`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(toRecord(toRecord(res.body)['data'])['status']).toBe('abandoned');
  });

  it('PATCH /attempts/:id/abandon → 409 if already abandoned', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: LESSON_LS_HOME });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

    await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/abandon`)
      .set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/abandon`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(409);
  });

  // ── GET /progress ───────────────────────────────────────────────────────

  it('GET /progress → 200 with empty missions list for new user', async () => {
    const res = await request(app.getHttpServer())
      .get('/progress')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    const progress = toRecord(toRecord(toRecord(res.body)['data'])['progress']);
    expect(Array.isArray(progress['missions'])).toBe(true);
    expect((progress['missions'] as unknown[]).length).toBe(0);
  });

  it('GET /progress → reflects completed attempt', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: LESSON_LS_HOME });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

    await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ command: 'ls', clientCommandId: randomUUID() });

    const res = await request(app.getHttpServer())
      .get('/progress')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    const missions = toRecord(toRecord(toRecord(res.body)['data'])['progress'])[
      'missions'
    ] as Array<Record<string, unknown>>;
    expect(missions.length).toBe(1);
    expect(missions[0]['missionId']).toBe('ch01-m03-list-home');
    expect(missions[0]['status']).toBe('completed');
  });

  it('GET /progress → 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/progress');
    expect(res.status).toBe(401);
  });
});
