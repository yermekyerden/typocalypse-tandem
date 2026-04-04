import { Injectable } from '@nestjs/common';

import type {
  AssistantAttemptStatus,
  AssistantAttemptStepContext,
  AssistantChatMessage,
  AssistantMissionContext,
  BuildAssistantMessagesContext,
} from '../assistant.types';

@Injectable()
export class AssistantPromptBuilder {
  public buildMessages(context: BuildAssistantMessagesContext): AssistantChatMessage[] {
    return [
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
}
