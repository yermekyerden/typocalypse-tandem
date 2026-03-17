import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import type { LessonHeuristicStatus } from '../src/learning-content/learning-content.types';

import { AppModule } from '../src/app.module';

type LessonOverview = {
  id: string;
  slug: string;
  title: string;
  order: number;
  status: LessonHeuristicStatus;
};

type ModuleOverview = {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonOverview[];
};

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    throw new Error('Expected object response body');
  }
  return value as Record<string, unknown>;
}

function asModules(value: unknown): ModuleOverview[] {
  const root = toRecord(value);
  const modules = root.modules;
  if (!Array.isArray(modules)) {
    throw new Error('Expected modules array');
  }

  return modules.map((module) => {
    const moduleRecord = toRecord(module);
    const lessons = moduleRecord.lessons;
    if (!Array.isArray(lessons)) {
      throw new Error('Expected lessons array');
    }

    return {
      id: String(moduleRecord.id),
      slug: String(moduleRecord.slug),
      title: String(moduleRecord.title),
      description: String(moduleRecord.description),
      order: Number(moduleRecord.order),
      lessons: lessons.map((lesson) => {
        const lessonRecord = toRecord(lesson);
        return {
          id: String(lessonRecord.id),
          slug: String(lessonRecord.slug),
          title: String(lessonRecord.title),
          order: Number(lessonRecord.order),
          status: String(lessonRecord.status) as LessonHeuristicStatus,
        };
      }),
    };
  });
}

describe('Learning API (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

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

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'learning-user',
        email: 'learning-user@example.com',
        password: 'supersecure',
      })
      .expect(201);

    const registerBody = toRecord(registerResponse.body as unknown);
    const tokens = toRecord(registerBody.tokens);
    accessToken = String(tokens.accessToken);
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /learning/overview requires auth', async () => {
    await request(app.getHttpServer()).get('/learning/overview').expect(401);
  });

  it('GET /learning/overview returns ordered modules with default heuristic statuses', async () => {
    const response = await request(app.getHttpServer())
      .get('/learning/overview')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const modules = asModules(response.body as unknown);
    expect(modules.length).toBeGreaterThan(0);

    const moduleOrders = modules.map((module) => module.order);
    expect(moduleOrders).toEqual([...moduleOrders].sort((a, b) => a - b));

    const lessons = modules.flatMap((module) => module.lessons);
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons[0].status).toBe('active');
    expect(lessons.slice(1).every((lesson) => lesson.status === 'locked')).toBe(true);
  });

  it('GET /lessons/:id returns only lesson UI detail fields', async () => {
    const overview = await request(app.getHttpServer())
      .get('/learning/overview')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const modules = asModules(overview.body as unknown);
    const firstLessonId = modules[0]?.lessons[0]?.id;

    expect(typeof firstLessonId).toBe('string');

    const response = await request(app.getHttpServer())
      .get(`/lessons/${firstLessonId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const lesson = toRecord(toRecord(response.body as unknown).lesson);
    expect(lesson).toEqual(
      expect.objectContaining({
        id: firstLessonId,
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        moduleId: expect.any(String),
        slug: expect.any(String),
        title: expect.any(String),
        order: expect.any(Number),
        theoryMarkdown: expect.any(String),
        taskDescription: expect.any(String),
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      }),
    );
    expect(lesson.expectedCommand).toBeUndefined();
    expect(lesson.runtime).toBeUndefined();
  });

  it('GET /lessons/:id returns 404 for unknown lesson', async () => {
    await request(app.getHttpServer())
      .get('/lessons/unknown-lesson')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
