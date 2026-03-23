import { ConflictException, Injectable } from '@nestjs/common';
import { AttemptsService } from '../attempts/attempts.service';
import { MissionsService } from '../missions/missions.service';
import { OpenRouterClient } from './openrouter.client';
import {
  AssistantAttemptStepContext,
  AssistantChatMessage,
  AssistantMissionContext,
  BuildAssistantMessagesContext,
} from './assistant.types';

@Injectable()
export class AssistantService {
  constructor(
    private readonly attemptsService: AttemptsService,
    private readonly missionsService: MissionsService,
    private readonly openRouterClient: OpenRouterClient,
  ) {}

  async askForAttempt(userId: string, attemptId: string, question: string) {
    const attemptData = await this.attemptsService.getAttempt(userId, attemptId);
    const attempt = attemptData.attempt;

    this.assertAttemptIsInProgress(attempt.status);

    const mission = this.missionsService.getMissionById(attempt.missionId);

    const context = this.createMessagesContext(
      {
        title: mission.title,
        shortDescription: mission.shortDescription,
        allowedCommands: mission.allowedCommands,
      },
      attempt.currentCwd,
      attempt.status,
      attempt.steps,
      question,
    );

    const messages = this.buildMessages(context);
    const completion = await this.openRouterClient.createChatCompletion(messages);

    return {
      answer: completion.answer,
      model: completion.model,
      usage: completion.usage,
    };
  }

  private assertAttemptIsInProgress(status: string): void {
    if (status !== 'in_progress') {
      throw new ConflictException('Assistant is available only for in-progress attempts.');
    }
  }

  private createMessagesContext(
    mission: AssistantMissionContext,
    currentWorkingDirectory: string,
    attemptStatus: string,
    steps: AssistantAttemptStepContext[],
    question: string,
  ): BuildAssistantMessagesContext {
    return {
      mission,
      currentWorkingDirectory,
      attemptStatus,
      steps,
      question,
    };
  }

  private buildMessages(context: BuildAssistantMessagesContext): AssistantChatMessage[] {
    return [
      {
        role: 'system',
        content: this.buildSystemPrompt(),
      },
      {
        role: 'user',
        content: this.buildUserPrompt(context),
      },
    ];
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

  private buildUserPrompt(context: BuildAssistantMessagesContext): string {
    const sections = [
      this.buildMissionSection(context.mission),
      this.buildAttemptSection(
        context.currentWorkingDirectory,
        context.attemptStatus,
        context.steps,
      ),
      `Learner question: ${context.question}`,
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
    attemptStatus: string,
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
}
