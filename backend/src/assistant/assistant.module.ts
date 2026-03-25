import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AttemptsModule } from '../attempts/attempts.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MissionsModule } from '../missions/missions.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { OpenRouterClient } from './openrouter.client';

@Module({
  imports: [JwtModule.register({}), AttemptsModule, MissionsModule],
  controllers: [AssistantController],
  providers: [AssistantService, OpenRouterClient, JwtAuthGuard],
})
export class AssistantModule {}
