import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { MissionsModule } from '../missions/missions.module';
import { EngineModule } from '../engine/engine.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LearningModule } from '../learning/learning.module';

@Module({
  imports: [JwtModule.register({}), MissionsModule, EngineModule, LearningModule],
  controllers: [AttemptsController],
  providers: [AttemptsService, JwtAuthGuard],
  exports: [AttemptsService],
})
export class AttemptsModule {}
