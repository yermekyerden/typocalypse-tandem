import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ProfileModule } from './profile/profile.module';
import { LearningModule } from './learning/learning.module';
import { MissionsModule } from './missions/missions.module';
import { EngineModule } from './engine/engine.module';
import { PrismaModule } from './prisma/prisma.module';
import { AttemptsModule } from './attempts/attempts.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HealthModule,
    ProfileModule,
    LearningModule,
    MissionsModule,
    EngineModule,
    AttemptsModule,
    ProgressModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
