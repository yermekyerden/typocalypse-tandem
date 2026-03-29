import { randomUUID } from 'crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

// Constants sourced from lesson-mission-mapping.ts and the matching mission JSON.
// The ls-home lesson maps to ch01-m03-list-home which starts with /home/dojo/projects/
// and requires `ls` to produce "projects" on stdout.
const E2E_LESSON_ID = 'ls-home';
const E2E_COMPLETION_COMMANDS = ['ls'];

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') throw new Error('Expected object');
  return value as Record<string, unknown>;
}

describe('Learning → Attempts end-to-end flow (e2e)', () => {
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

    // Register + login a fresh user for isolation
    const username = `flow_user_${Date.now()}`;
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

  it('completes the full lesson-attempt flow and reflects progress in overview', async () => {
    // Step 1: GET /learning/overview — first lesson should be active
    const overviewRes1 = await request(app.getHttpServer())
      .get('/learning/overview')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const overviewBody1 = toRecord(overviewRes1.body);
    expect(overviewBody1['ok']).toBe(true);
    expect(typeof overviewBody1['contractsVersion']).toBe('string');
    expect(typeof overviewBody1['serverTimeUtc']).toBe('string');

    const modules1 = toRecord(overviewBody1['data'])['modules'] as Array<Record<string, unknown>>;
    expect(Array.isArray(modules1)).toBe(true);
    const allLessons1 = modules1.flatMap((m) => m['lessons'] as Array<Record<string, unknown>>);
    const targetLesson1 = allLessons1.find((l) => l['id'] === E2E_LESSON_ID);
    expect(targetLesson1).toBeDefined();
    expect(targetLesson1?.['status']).toBe('active');

    // Step 2: GET /lessons/:id — returns full lesson detail, no missionId
    const lessonRes = await request(app.getHttpServer())
      .get(`/lessons/${E2E_LESSON_ID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const lessonBody = toRecord(lessonRes.body);
    expect(lessonBody['ok']).toBe(true);
    const lessonData = toRecord(toRecord(lessonBody['data'])['lesson']);
    expect(lessonData['id']).toBe(E2E_LESSON_ID);
    expect(typeof lessonData['theoryMarkdown']).toBe('string');
    expect(typeof lessonData['taskDescription']).toBe('string');
    expect(lessonData['missionId']).toBeUndefined();

    // Step 3: POST /attempts with lessonId — returns attemptId, no mission field
    const createRes = await request(app.getHttpServer())
      .post('/attempts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ lessonId: E2E_LESSON_ID })
      .expect(201);

    const createBody = toRecord(createRes.body);
    expect(createBody['ok']).toBe(true);
    const createData = toRecord(createBody['data']);
    expect(typeof createData['attemptId']).toBe('string');
    expect(createData['initialCwd']).toBe('/home/dojo');
    expect(createData['initialFs']).toBeDefined();
    expect(createData['mission']).toBeUndefined();

    const attemptId = createData['attemptId'] as string;

    // Step 4: submit all completion commands; last one must return attemptStatus: 'completed'
    let lastCommandData: Record<string, unknown> = {};
    for (const command of E2E_COMPLETION_COMMANDS) {
      const cmdRes = await request(app.getHttpServer())
        .patch(`/attempts/${attemptId}/command`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ command, clientCommandId: randomUUID() })
        .expect(200);

      const cmdBody = toRecord(cmdRes.body);
      expect(cmdBody['ok']).toBe(true);
      lastCommandData = toRecord(cmdBody['data']);
    }

    expect(lastCommandData['attemptStatus']).toBe('completed');

    // Step 5: GET /learning/overview — E2E_LESSON_ID should now be 'completed'
    const overviewRes2 = await request(app.getHttpServer())
      .get('/learning/overview')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const overviewBody2 = toRecord(overviewRes2.body);
    const modules2 = toRecord(overviewBody2['data'])['modules'] as Array<Record<string, unknown>>;
    const allLessons2 = modules2.flatMap((m) => m['lessons'] as Array<Record<string, unknown>>);

    const completedLesson = allLessons2.find((l) => l['id'] === E2E_LESSON_ID);
    expect(completedLesson?.['status']).toBe('completed');

    // If there is a next lesson it should be active; otherwise no active lesson (terminal state)
    const lessonIndex = allLessons2.findIndex((l) => l['id'] === E2E_LESSON_ID);
    const nextLesson = allLessons2[lessonIndex + 1];
    if (nextLesson) {
      expect(nextLesson['status']).toBe('active');
    } else {
      expect(allLessons2.some((l) => l['status'] === 'active')).toBe(false);
    }
  });
});
