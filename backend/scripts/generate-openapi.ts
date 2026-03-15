import { writeFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

const OUTPUT_PATH = join(__dirname, '..', '..', 'docs', '02-architecture', 'openapi.json');

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Typocalypse Backend API')
    .setDescription('REST API for Typocalypse terminal training app')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide access token as: Bearer <token>',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync(OUTPUT_PATH, JSON.stringify(document, null, 2) + '\n');

  await app.close();

  console.log(`OpenAPI spec written to ${OUTPUT_PATH}`);
}

void generate();
