import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ProfileModule } from './profile/profile.module';
import { LearningModule } from './learning/learning.module';

@Module({
  imports: [AuthModule, HealthModule, ProfileModule, LearningModule],
  controllers: [AppController],
})
export class AppModule {}
