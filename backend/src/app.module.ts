import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ProfileModule } from './profile/profile.module';
import { LearningModule } from './learning/learning.module';
import { MissionsModule } from './missions/missions.module';

@Module({
  imports: [AuthModule, HealthModule, ProfileModule, LearningModule, MissionsModule],
  controllers: [AppController],
})
export class AppModule {}
