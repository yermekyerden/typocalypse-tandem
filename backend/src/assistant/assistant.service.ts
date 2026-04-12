import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { AttemptsService } from '../attempts/attempts.service';
import { MissionsService } from '../missions/missions.service';
import { OpenRouterClient } from './openrouter.client';
import { ASSISTANT_CHAT_HISTORY_REPOSITORY } from './history/assistant-chat-history.repository';
import type { AssistantChatHistoryRepository } from './history/assistant-chat-history.repository';
import { isAssistantQuestionOffTopic } from './prompt/assistant-offtopic.guard';
import { AssistantPromptBuilder } from './prompt/assistant-prompt.builder';
import { getAssistantOffTopicRefusal, normalizeAssistantLocale } from './prompt/assistant-locale';
import type {
  AssistantAttemptContext,
  AssistantAttemptStatus,
  AssistantCompletionResult,
  AssistantConversationContextMessage,
  AssistantHistoryResponse,
  AssistantLocale,
  BuildAssistantMessagesContext,
} from './assistant.types';
import type { AssistantStreamWriter } from './stream/assistant-stream.writer';

@Injectable()
export class AssistantService {
  private readonly recentConversationMessageLimit = 6;
  private readonly localGuardStreamDelayMs = 35;

  constructor(
    private readonly attemptsService: AttemptsService,
    private readonly missionsService: MissionsService,
    private readonly openRouterClient: OpenRouterClient,
    private readonly assistantPromptBuilder: AssistantPromptBuilder,
    @Inject(ASSISTANT_CHAT_HISTORY_REPOSITORY)
    private readonly chatHistoryRepository: AssistantChatHistoryRepository,
  ) {}

  public async askForAttempt(
    userId: string,
    attemptId: string,
    question: string,
    locale?: string,
  ): Promise<AssistantCompletionResult> {
    const attempt = await this.getValidatedAttempt(userId, attemptId, true);

    this.ensureHistorySession(attemptId);

    const recentConversationMessages = this.getRecentConversationMessages(attemptId);
    const assistantLocale = normalizeAssistantLocale(locale);

    this.appendUserMessage(attemptId, question);

    if (isAssistantQuestionOffTopic(question)) {
      return this.createOffTopicRefusalCompletion(attemptId, assistantLocale);
    }

    const promptContext = this.createPromptContext(
      attempt,
      recentConversationMessages,
      assistantLocale,
      question,
    );

    const messages = this.assistantPromptBuilder.buildMessages(promptContext);
    const completion = await this.openRouterClient.createChatCompletion(messages);

    this.appendAssistantMessage(attemptId, completion.answer);

    return completion;
  }

  public async askForAttemptStream(
    userId: string,
    attemptId: string,
    question: string,
    locale: string | undefined,
    streamWriter: AssistantStreamWriter,
  ): Promise<void> {
    const attempt = await this.getValidatedAttempt(userId, attemptId, true);

    this.ensureHistorySession(attemptId);

    const recentConversationMessages = this.getRecentConversationMessages(attemptId);
    const assistantLocale = normalizeAssistantLocale(locale);

    this.appendUserMessage(attemptId, question);

    streamWriter.start();
    streamWriter.write({
      type: 'start',
      attemptId,
    });

    if (isAssistantQuestionOffTopic(question)) {
      await this.writeOffTopicRefusalStream(attemptId, assistantLocale, streamWriter);
      streamWriter.end();
      return;
    }

    try {
      const promptContext = this.createPromptContext(
        attempt,
        recentConversationMessages,
        assistantLocale,
        question,
      );

      const messages = this.assistantPromptBuilder.buildMessages(promptContext);

      const completion = await this.openRouterClient.createChatCompletionStream(
        messages,
        (delta) => {
          streamWriter.write({
            type: 'delta',
            delta,
          });
        },
      );

      this.appendAssistantMessage(attemptId, completion.answer);

      streamWriter.write({
        type: 'complete',
        answer: completion.answer,
        model: completion.model,
      });
    } catch (error) {
      streamWriter.write({
        type: 'error',
        message: this.resolveStreamErrorMessage(error),
      });
    } finally {
      streamWriter.end();
    }
  }

  public async getHistoryForAttempt(
    userId: string,
    attemptId: string,
  ): Promise<AssistantHistoryResponse> {
    await this.getValidatedAttempt(userId, attemptId, false);

    const session = this.chatHistoryRepository.getOrCreateSession(attemptId);

    return {
      attemptId,
      messages: session.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAtIso: message.createdAtIso,
      })),
    };
  }

  private async getValidatedAttempt(
    userId: string,
    attemptId: string,
    requireInProgress: boolean,
  ): Promise<AssistantAttemptContext> {
    const attemptData = await this.attemptsService.getAttempt(userId, attemptId);
    const attempt = attemptData.attempt;

    if (requireInProgress) {
      this.assertAttemptIsInProgress(attempt.status);
    }

    this.assertMissionAttempt(attempt.missionId);

    return attempt;
  }

  private ensureHistorySession(attemptId: string): void {
    this.chatHistoryRepository.getOrCreateSession(attemptId);
  }

  private getRecentConversationMessages(attemptId: string): AssistantConversationContextMessage[] {
    return this.chatHistoryRepository
      .getRecentMessages(attemptId, this.recentConversationMessageLimit)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));
  }

  private createPromptContext(
    attempt: AssistantAttemptContext,
    recentConversationMessages: AssistantConversationContextMessage[],
    locale: AssistantLocale,
    question: string,
  ): BuildAssistantMessagesContext {
    const mission = this.missionsService.getMissionById(attempt.missionId);

    return {
      mission,
      currentWorkingDirectory: attempt.currentCwd,
      attemptStatus: attempt.status,
      steps: attempt.steps,
      recentConversationMessages,
      locale,
      question,
    };
  }

  private appendUserMessage(attemptId: string, question: string): void {
    this.chatHistoryRepository.appendMessage({
      attemptId,
      role: 'user',
      content: question,
    });
  }

  private appendAssistantMessage(attemptId: string, answer: string): void {
    this.chatHistoryRepository.appendMessage({
      attemptId,
      role: 'assistant',
      content: answer,
    });
  }

  private createOffTopicRefusalCompletion(
    attemptId: string,
    locale: AssistantLocale,
  ): AssistantCompletionResult {
    const refusalAnswer = getAssistantOffTopicRefusal(locale);

    this.appendAssistantMessage(attemptId, refusalAnswer);

    return {
      answer: refusalAnswer,
      model: 'assistant-local-guard',
      usage: null,
    };
  }

  private async writeOffTopicRefusalStream(
    attemptId: string,
    locale: AssistantLocale,
    streamWriter: AssistantStreamWriter,
  ): Promise<void> {
    const refusalAnswer = getAssistantOffTopicRefusal(locale);

    this.appendAssistantMessage(attemptId, refusalAnswer);

    const chunks = this.createLocalGuardStreamChunks(refusalAnswer);

    for (const chunk of chunks) {
      streamWriter.write({
        type: 'delta',
        delta: chunk,
      });

      await this.delay(this.localGuardStreamDelayMs);
    }

    streamWriter.write({
      type: 'complete',
      answer: refusalAnswer,
      model: 'assistant-local-guard',
    });
  }

  private createLocalGuardStreamChunks(text: string): string[] {
    const chunks = text.match(/\S+\s*/g);

    if (!chunks || chunks.length === 0) {
      return [text];
    }

    return chunks;
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  private resolveStreamErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return 'Assistant streaming request failed.';
  }

  private assertAttemptIsInProgress(status: AssistantAttemptStatus): void {
    if (status !== 'in_progress') {
      throw new ConflictException('Assistant is available only for in-progress attempts.');
    }
  }

  private assertMissionAttempt(missionId: string): void {
    if (missionId.startsWith('lesson:')) {
      throw new ConflictException('Assistant is currently available only for mission attempts.');
    }
  }
}
