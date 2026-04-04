import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AttemptsModule } from '../attempts/attempts.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MissionsModule } from '../missions/missions.module';
import { AssistantController } from './assistant.controller';
import { AssistantPromptBuilder } from './prompt/assistant-prompt.builder';
import { AssistantService } from './assistant.service';
import { ASSISTANT_CHAT_HISTORY_REPOSITORY } from './history/assistant-chat-history.repository';
import { InMemoryAssistantChatHistoryRepository } from './history/in-memory-assistant-chat-history.repository';
import { OpenRouterClient } from './openrouter.client';

@Module({
  imports: [JwtModule.register({}), AttemptsModule, MissionsModule],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    AssistantPromptBuilder,
    OpenRouterClient,
    JwtAuthGuard,
    {
      provide: ASSISTANT_CHAT_HISTORY_REPOSITORY,
      useClass: InMemoryAssistantChatHistoryRepository,
    },
  ],
})
export class AssistantModule {}
