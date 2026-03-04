import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    throw new Error('Expected an object');
  }
  return value as Record<string, unknown>;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Typocalypse Backend API')
      .setDescription('REST API for Typocalypse terminal training app')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, swaggerDocument, {
      jsonDocumentUrl: 'api-docs-json',
    });
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  it('/api-docs-json (GET) exposes OpenAPI document with auth endpoints', async () => {
    const response = await request(app.getHttpServer()).get('/api-docs-json').expect(200);

    const body = toRecord(response.body as unknown);
    const paths = toRecord(body.paths);

    expect(body.openapi).toEqual(expect.any(String));
    expect(paths['/auth/register']).toBeDefined();
    expect(paths['/auth/login']).toBeDefined();
    expect(paths['/auth/refresh']).toBeDefined();
  });
});
