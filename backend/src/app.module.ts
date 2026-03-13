import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [AuthModule, HealthModule, ProfileModule],
  controllers: [AppController],
})
export class AppModule {}
