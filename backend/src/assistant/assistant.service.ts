import { ConflictException, Injectable, Inject } from '@nestjs/common';

import { AttemptsService } from '../attempts/attempts.service';
import { MissionsService } from '../missions/missions.service';
import { OpenRouterClient } from './openrouter.client';
import { AssistantChatHistoryMessage } from './history/assistant-chat-history.types';
import { ASSISTANT_CHAT_HISTORY_REPOSITORY } from './history/assistant-chat-history.repository';
import type { AssistantChatHistoryRepository } from './history/assistant-chat-history.repository';
import {
  AssistantAttemptStatus,
  AssistantAttemptStepContext,
  AssistantChatMessage,
  AssistantCompletionResult,
  AssistantConversationContextMessage,
  AssistantMissionContext,
  BuildAssistantMessagesContext,
} from './assistant.types';

@Injectable()
export class AssistantService {
  private readonly recentConversationMessageLimit = 6;

  constructor(
    private readonly attemptsService: AttemptsService,
    private readonly missionsService: MissionsService,
    private readonly openRouterClient: OpenRouterClient,
    @Inject(ASSISTANT_CHAT_HISTORY_REPOSITORY)
    private readonly chatHistoryRepository: AssistantChatHistoryRepository,
  ) {}

  async askForAttempt(
    userId: string,
    attemptId: string,
    question: string,
  ): Promise<AssistantCompletionResult> {
    const attemptData = await this.attemptsService.getAttempt(userId, attemptId);
    const attempt = attemptData.attempt;

    this.assertAttemptIsInProgress(attempt.status);
    this.assertMissionAttempt(attempt.missionId);

    const mission = this.missionsService.getMissionById(attempt.missionId);

    const session = this.chatHistoryRepository.getOrCreateSession(attemptId);
    const recentConversationMessages = this.getRecentConversationMessages(session.messages);

    const context = this.createMessagesContext(
      mission,
      attempt.currentCwd,
      attempt.status,
      attempt.steps,
      recentConversationMessages,
      question,
    );

    this.chatHistoryRepository.appendMessage({
      attemptId,
      role: 'user',
      content: question,
    });

    const messages = this.buildMessages(context);
    const completion = await this.openRouterClient.createChatCompletion(messages);

    this.chatHistoryRepository.appendMessage({
      attemptId,
      role: 'assistant',
      content: completion.answer,
    });

    return completion;
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

  private createMessagesContext(
    mission: AssistantMissionContext,
    currentWorkingDirectory: string,
    attemptStatus: AssistantAttemptStatus,
    steps: AssistantAttemptStepContext[],
    recentConversationMessages: AssistantConversationContextMessage[],
    question: string,
  ): BuildAssistantMessagesContext {
    return {
      mission,
      currentWorkingDirectory,
      attemptStatus,
      steps,
      recentConversationMessages,
      question,
    };
  }

  private buildMessages(context: BuildAssistantMessagesContext): AssistantChatMessage[] {
    const messages: AssistantChatMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(),
      },
      {
        role: 'user',
        content: this.buildEnvironmentContextPrompt(context),
      },
      ...context.recentConversationMessages,
      {
        role: 'user',
        content: context.question,
      },
    ];

    return messages;
  }

  private buildSystemPrompt(): string {
    return [
      'You are an AI assistant for a terminal learning app.',
      'Your job is to help the learner with hints, not to fully solve the mission immediately.',
      'Prefer short, practical, and actionable answers.',
      'Do not invent files, commands, or paths that are not present in the provided context.',
      'If the learner asks for the final answer directly, first give a hint-oriented response.',
    ].join(' ');
  }

  private buildEnvironmentContextPrompt(context: BuildAssistantMessagesContext): string {
    const sections = [
      this.buildMissionSection(context.mission),
      this.buildAttemptSection(
        context.currentWorkingDirectory,
        context.attemptStatus,
        context.steps,
      ),
    ];

    return sections.join('\n\n');
  }

  private buildMissionSection(mission: AssistantMissionContext): string {
    const lines = [
      `Mission title: ${mission.title}`,
      `Mission short description: ${mission.shortDescription}`,
      this.buildAllowedCommandsLine(mission.allowedCommands),
    ];

    return lines.join('\n');
  }

  private buildAttemptSection(
    currentWorkingDirectory: string,
    attemptStatus: AssistantAttemptStatus,
    steps: AssistantAttemptStepContext[],
  ): string {
    const lines = [
      `Current working directory: ${currentWorkingDirectory}`,
      `Attempt status: ${attemptStatus}`,
      this.buildRecentStepsSection(steps),
    ];

    return lines.join('\n\n');
  }

  private buildAllowedCommandsLine(allowedCommands?: string[]): string {
    if (!allowedCommands || allowedCommands.length === 0) {
      return 'Allowed commands: not restricted';
    }

    return `Allowed commands: ${allowedCommands.join(', ')}`;
  }

  private buildRecentStepsSection(steps: AssistantAttemptStepContext[]): string {
    const recentSteps = steps.slice(-5);

    if (recentSteps.length === 0) {
      return 'Recent steps: no commands submitted yet.';
    }

    const formattedSteps = recentSteps.map((step) => this.formatStep(step));

    return `Recent steps:\n${formattedSteps.join('\n\n')}`;
  }

  private formatStep(step: AssistantAttemptStepContext): string {
    const lines = [
      `Step ${step.stepIndex}`,
      `Command: ${step.inputLine}`,
      `Exit code: ${step.exitCode}`,
      `Validation type: ${step.validation.type}`,
    ];

    const executionErrorMessage = step.trace.execute?.error?.message;

    if (executionErrorMessage) {
      lines.push(`Execution error: ${executionErrorMessage}`);
    }

    return lines.join('\n');
  }

  private getRecentConversationMessages(
    historyMessages: AssistantChatHistoryMessage[],
  ): AssistantConversationContextMessage[] {
    return historyMessages.slice(-this.recentConversationMessageLimit).map((message) => ({
      role: message.role,
      content: message.content,
    }));
  }
}
