import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [AuthModule, HealthModule],
  controllers: [AppController],
})
export class AppModule {}
