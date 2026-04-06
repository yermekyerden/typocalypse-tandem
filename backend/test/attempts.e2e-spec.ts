import { randomUUID } from 'crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

// The two seed missions defined in ch-01-basics
const MISSION_PWD_ID = 'ch01-m01-print-cwd';
const MISSION_MKDIR_ID = 'ch01-m02-create-dirs';

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

  it('POST /attempts → 201 with attemptId and initialState', async () => {
    const res = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ missionId: MISSION_PWD_ID });

    expect(res.status).toBe(201);
    const data = toRecord(toRecord(res.body)['data']);
    expect(typeof data['attemptId']).toBe('string');
    expect(data['initialCwd']).toBe('/home/dojo');
    expect(data['initialFs']).toBeDefined();
    expect(toRecord(data['mission'])['id']).toBe(MISSION_PWD_ID);
  });

  it('POST /attempts → 401 without token', async () => {
    const res = await request(app.getHttpServer())
      .post('/attempts')
      .send({ missionId: MISSION_PWD_ID });
    expect(res.status).toBe(401);
  });

  it('POST /attempts → 404 for unknown missionId', async () => {
    const res = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ missionId: 'nonexistent-mission' });
    expect(res.status).toBe(404);
  });

  // ── PATCH /attempts/:id/command ─────────────────────────────────────────

  it('PATCH /attempts/:id/command → 200 with stdout and validation', async () => {
    // Create attempt for pwd mission
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ missionId: MISSION_PWD_ID });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

    const res = await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ command: 'pwd', clientCommandId: randomUUID() });

    expect(res.status).toBe(200);
    const data = toRecord(toRecord(res.body)['data']);
    expect(data['exitCode']).toBe(0);
    expect(String(data['stdout'])).toContain('dojo');
    expect(data['validation']).toBeDefined();
    expect(data['trace']).toBeDefined();
    expect(data['attemptStatus']).toBe('completed'); // pwd mission completes in one step
  });

  it('PATCH /attempts/:id/command → idempotent on repeat clientCommandId', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ missionId: MISSION_MKDIR_ID });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

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
    // Both responses should have the same stdout
    expect(toRecord(toRecord(first.body)['data'])['stdout']).toBe(
      toRecord(toRecord(second.body)['data'])['stdout'],
    );
  });

  it('PATCH /attempts/:id/command → 409 on completed attempt', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ missionId: MISSION_PWD_ID });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

    // Complete it
    await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ command: 'pwd', clientCommandId: randomUUID() });

    // Try to submit again
    const res = await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ command: 'pwd', clientCommandId: randomUUID() });

    expect(res.status).toBe(409);
  });

  it('PATCH /attempts/:id/command → 403 for wrong user', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ missionId: MISSION_MKDIR_ID });
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
      .send({ missionId: MISSION_MKDIR_ID });
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
      .send({ missionId: MISSION_MKDIR_ID });
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
      .send({ missionId: MISSION_MKDIR_ID });
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
      .send({ missionId: MISSION_PWD_ID });
    const attemptId = toRecord(toRecord(createRes.body)['data'])['attemptId'] as string;

    await request(app.getHttpServer())
      .patch(`/attempts/${attemptId}/command`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ command: 'pwd', clientCommandId: randomUUID() });

    const res = await request(app.getHttpServer())
      .get('/progress')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    const missions = toRecord(toRecord(toRecord(res.body)['data'])['progress'])[
      'missions'
    ] as Array<Record<string, unknown>>;
    expect(missions.length).toBe(1);
    expect(missions[0]['missionId']).toBe(MISSION_PWD_ID);
    expect(missions[0]['status']).toBe('completed');
  });

  it('GET /progress → 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/progress');
    expect(res.status).toBe(401);
  });
});
