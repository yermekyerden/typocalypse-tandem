import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
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

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument, {
    jsonDocumentUrl: 'api-docs-json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Normalize to scheme+host only — strips accidental trailing slash or path.
  // Throws at startup if CORS_ORIGIN is set but malformed (fail-fast).
  const corsOrigin = process.env.CORS_ORIGIN ? new URL(process.env.CORS_ORIGIN).origin : undefined;

  app.enableCors({
    // Array form compares request Origin against the list — only matching origins
    // receive the header. Undefined in dev is intentional: the Vite proxy serves
    // all requests same-origin, so CORS headers are never requested.
    origin: corsOrigin ? [corsOrigin] : undefined,
    // credentials: true omitted — JWT is sent via Authorization header, not cookies.
    // Omitting this prevents inadvertent cross-origin cookie access.
  });

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
