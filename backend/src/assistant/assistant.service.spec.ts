import { ConflictException } from '@nestjs/common';

import { AttemptsService } from '../attempts/attempts.service';
import { MissionsService } from '../missions/missions.service';
import { AssistantPromptBuilder } from './prompt/assistant-prompt.builder';
import { OpenRouterClient } from './openrouter.client';
import { AssistantService } from './assistant.service';
import type {
  AssistantAttemptContext,
  AssistantAttemptLookupResult,
  AssistantAttemptStepContext,
  AssistantChatMessage,
  AssistantCompletionResult,
  AssistantMissionLookupResult,
} from './assistant.types';
import {
  type AssistantChatHistoryMessage,
  type AssistantChatSession,
  type CreateAssistantChatMessageParams,
} from './history/assistant-chat-history.types';
import type {
  AssistantChatHistoryRepositoryMock,
  AttemptsServiceMock,
  CreateChatCompletionFunction,
  CreateChatCompletionStreamFunction,
  MissionsServiceMock,
  OpenRouterClientMock,
} from './assistant.test-types';

describe('AssistantService', () => {
  let assistantService: AssistantService;

  let attemptsServiceMock: AttemptsServiceMock;
  let missionsServiceMock: MissionsServiceMock;
  let openRouterClientMock: OpenRouterClientMock;
  let assistantChatHistoryRepositoryMock: AssistantChatHistoryRepositoryMock;

  beforeEach(() => {
    attemptsServiceMock = {
      getAttempt: jest.fn<Promise<AssistantAttemptLookupResult>, [string, string]>(),
    };

    missionsServiceMock = {
      getMissionById: jest.fn<AssistantMissionLookupResult, [string]>(),
    };

    openRouterClientMock = {
      createChatCompletion: jest.fn<
        ReturnType<CreateChatCompletionFunction>,
        Parameters<CreateChatCompletionFunction>
      >(),
      createChatCompletionStream: jest.fn<
        ReturnType<CreateChatCompletionStreamFunction>,
        Parameters<CreateChatCompletionStreamFunction>
      >(),
    };

    assistantChatHistoryRepositoryMock = {
      getOrCreateSession: jest.fn<AssistantChatSession, [string]>(),
      getSession: jest.fn<AssistantChatSession | null, [string]>(),
      getRecentMessages: jest.fn<AssistantChatHistoryMessage[], [string, number]>(),
      appendMessage: jest.fn<AssistantChatHistoryMessage, [CreateAssistantChatMessageParams]>(),
      clearSession: jest.fn<void, [string]>(),
    };

    assistantChatHistoryRepositoryMock.getOrCreateSession.mockReturnValue(createChatSession());

    assistantChatHistoryRepositoryMock.getRecentMessages.mockReturnValue([]);

    assistantService = new AssistantService(
      attemptsServiceMock as unknown as AttemptsService,
      missionsServiceMock as unknown as MissionsService,
      openRouterClientMock as unknown as OpenRouterClient,
      new AssistantPromptBuilder(),
      assistantChatHistoryRepositoryMock,
    );
  });

  it('throws ConflictException when attempt is not in progress', async () => {
    attemptsServiceMock.getAttempt.mockResolvedValue({
      attempt: createAttempt({
        status: 'completed',
      }),
    });

    await expect(
      assistantService.askForAttempt('user-1', 'attempt-1', 'Give me a hint.'),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(missionsServiceMock.getMissionById).not.toHaveBeenCalled();
    expect(openRouterClientMock.createChatCompletion).not.toHaveBeenCalled();
    expect(assistantChatHistoryRepositoryMock.getOrCreateSession).not.toHaveBeenCalled();
    expect(assistantChatHistoryRepositoryMock.getRecentMessages).not.toHaveBeenCalled();
    expect(assistantChatHistoryRepositoryMock.appendMessage).not.toHaveBeenCalled();
  });

  it('returns OpenRouter response data for a valid in-progress mission attempt', async () => {
    attemptsServiceMock.getAttempt.mockResolvedValue({
      attempt: createAttempt({
        missionId: 'ch01-m01-print-cwd',
        currentCwd: '/home/dojo',
        status: 'in_progress',
        steps: [
          createStep({
            stepIndex: 1,
            inputLine: 'pwd',
            exitCode: 0,
            validationType: 'exact_match',
          }),
        ],
      }),
    });

    missionsServiceMock.getMissionById.mockReturnValue(
      createMission({
        id: 'ch01-m01-print-cwd',
        title: 'Print your working directory',
        shortDescription: 'Use pwd to find out where you are in the filesystem.',
        allowedCommands: ['pwd'],
      }),
    );

    openRouterClientMock.createChatCompletion.mockResolvedValue({
      answer: 'Try checking the command that prints the current directory.',
      model: 'google/gemma-3-4b-it:free',
      usage: {
        cost: 0,
        totalTokens: 42,
      },
    });

    const result = await assistantService.askForAttempt(
      'user-1',
      'attempt-1',
      'Give me a hint without solving the mission.',
    );

    expect(attemptsServiceMock.getAttempt).toHaveBeenCalledWith('user-1', 'attempt-1');
    expect(missionsServiceMock.getMissionById).toHaveBeenCalledWith('ch01-m01-print-cwd');
    expect(assistantChatHistoryRepositoryMock.getOrCreateSession).toHaveBeenCalledWith('attempt-1');
    expect(assistantChatHistoryRepositoryMock.getRecentMessages).toHaveBeenCalledWith(
      'attempt-1',
      6,
    );
    expect(assistantChatHistoryRepositoryMock.appendMessage).toHaveBeenNthCalledWith(1, {
      attemptId: 'attempt-1',
      role: 'user',
      content: 'Give me a hint without solving the mission.',
    });
    expect(assistantChatHistoryRepositoryMock.appendMessage).toHaveBeenNthCalledWith(2, {
      attemptId: 'attempt-1',
      role: 'assistant',
      content: 'Try checking the command that prints the current directory.',
    });

    const environmentPrompt = getEnvironmentContextPrompt(openRouterClientMock);

    expect(environmentPrompt).toContain('Mission title: Print your working directory');
    expect(environmentPrompt).toContain(
      'Mission short description: Use pwd to find out where you are in the filesystem.',
    );
    expect(environmentPrompt).toContain('Allowed commands: pwd');
    expect(environmentPrompt).toContain('Current working directory: /home/dojo');
    expect(environmentPrompt).not.toContain('Give me a hint without solving the mission.');

    const lastUserQuestion = getLastUserQuestion(openRouterClientMock);

    expect(lastUserQuestion).toBe('Give me a hint without solving the mission.');

    expect(result).toEqual({
      answer: 'Try checking the command that prints the current directory.',
      model: 'google/gemma-3-4b-it:free',
      usage: {
        cost: 0,
        totalTokens: 42,
      },
    });
  });

  it('includes only the last 5 steps in the environment context prompt', async () => {
    attemptsServiceMock.getAttempt.mockResolvedValue({
      attempt: createAttempt({
        steps: [
          createStep({
            stepIndex: 1,
            inputLine: 'command-1',
            exitCode: 0,
            validationType: 'exact_match',
          }),
          createStep({
            stepIndex: 2,
            inputLine: 'command-2',
            exitCode: 0,
            validationType: 'exact_match',
          }),
          createStep({
            stepIndex: 3,
            inputLine: 'command-3',
            exitCode: 0,
            validationType: 'exact_match',
          }),
          createStep({
            stepIndex: 4,
            inputLine: 'command-4',
            exitCode: 0,
            validationType: 'exact_match',
          }),
          createStep({
            stepIndex: 5,
            inputLine: 'command-5',
            exitCode: 0,
            validationType: 'exact_match',
          }),
          createStep({
            stepIndex: 6,
            inputLine: 'command-6',
            exitCode: 0,
            validationType: 'exact_match',
          }),
          createStep({
            stepIndex: 7,
            inputLine: 'command-7',
            exitCode: 0,
            validationType: 'exact_match',
          }),
        ],
      }),
    });

    missionsServiceMock.getMissionById.mockReturnValue(createMission());

    openRouterClientMock.createChatCompletion.mockResolvedValue(
      createCompletionResult({
        answer: 'Hint',
      }),
    );

    await assistantService.askForAttempt('user-1', 'attempt-1', 'Help me.');

    const environmentPrompt = getEnvironmentContextPrompt(openRouterClientMock);

    expect(environmentPrompt).not.toContain('Step 1');
    expect(environmentPrompt).not.toContain('Command: command-1');
    expect(environmentPrompt).not.toContain('Step 2');
    expect(environmentPrompt).not.toContain('Command: command-2');

    expect(environmentPrompt).toContain('Step 3');
    expect(environmentPrompt).toContain('Command: command-3');
    expect(environmentPrompt).toContain('Step 7');
    expect(environmentPrompt).toContain('Command: command-7');
  });

  it('includes execution error text when present in recent steps', async () => {
    attemptsServiceMock.getAttempt.mockResolvedValue({
      attempt: createAttempt({
        steps: [
          createStep({
            stepIndex: 1,
            inputLine: 'cat missing.txt',
            exitCode: 1,
            validationType: 'runtime_error',
            executionErrorMessage: 'No such file or directory',
          }),
        ],
      }),
    });

    missionsServiceMock.getMissionById.mockReturnValue(createMission());

    openRouterClientMock.createChatCompletion.mockResolvedValue(
      createCompletionResult({
        answer: 'Hint',
      }),
    );

    await assistantService.askForAttempt('user-1', 'attempt-1', 'What went wrong?');

    const environmentPrompt = getEnvironmentContextPrompt(openRouterClientMock);

    expect(environmentPrompt).toContain('Execution error: No such file or directory');
  });

  it('uses "not restricted" when mission has no allowed commands', async () => {
    attemptsServiceMock.getAttempt.mockResolvedValue({
      attempt: createAttempt(),
    });

    missionsServiceMock.getMissionById.mockReturnValue(
      createMission({
        allowedCommands: undefined,
      }),
    );

    openRouterClientMock.createChatCompletion.mockResolvedValue(
      createCompletionResult({
        answer: 'Hint',
      }),
    );

    await assistantService.askForAttempt('user-1', 'attempt-1', 'Help me.');

    const environmentPrompt = getEnvironmentContextPrompt(openRouterClientMock);

    expect(environmentPrompt).toContain('Allowed commands: not restricted');
  });

  it('includes recent conversation messages before the current question', async () => {
    attemptsServiceMock.getAttempt.mockResolvedValue({
      attempt: createAttempt(),
    });

    missionsServiceMock.getMissionById.mockReturnValue(createMission());

    assistantChatHistoryRepositoryMock.getRecentMessages.mockReturnValue([
      createHistoryMessage({
        id: 'message-1',
        role: 'user',
        content: 'What does pwd do?',
      }),
      createHistoryMessage({
        id: 'message-2',
        role: 'assistant',
        content: 'It prints the current working directory.',
      }),
    ]);

    openRouterClientMock.createChatCompletion.mockResolvedValue(
      createCompletionResult({
        answer: 'Hint',
      }),
    );

    await assistantService.askForAttempt('user-1', 'attempt-1', 'What should I try next?');

    const sentMessages = getSentMessages(openRouterClientMock);

    expect(sentMessages[2]).toEqual({
      role: 'user',
      content: 'What does pwd do?',
    });

    expect(sentMessages[3]).toEqual({
      role: 'assistant',
      content: 'It prints the current working directory.',
    });

    expect(sentMessages[4]).toEqual({
      role: 'user',
      content: 'What should I try next?',
    });
  });

  it('returns a localized refusal without calling OpenRouter for an obvious off-topic question', async () => {
    attemptsServiceMock.getAttempt.mockResolvedValue({
      attempt: createAttempt(),
    });

    missionsServiceMock.getMissionById.mockReturnValue(createMission());
    assistantChatHistoryRepositoryMock.getRecentMessages.mockReturnValue([]);

    const result = await assistantService.askForAttempt(
      'user-1',
      'attempt-1',
      'Can you give me a cookie recipe?',
      'en',
    );

    expect(openRouterClientMock.createChatCompletion).not.toHaveBeenCalled();

    expect(result).toEqual({
      answer: 'I can only help with the current mission and terminal learning tasks.',
      model: 'assistant-local-guard',
      usage: null,
    });

    expect(assistantChatHistoryRepositoryMock.appendMessage).toHaveBeenNthCalledWith(1, {
      attemptId: 'attempt-1',
      role: 'user',
      content: 'Can you give me a cookie recipe?',
    });

    expect(assistantChatHistoryRepositoryMock.appendMessage).toHaveBeenNthCalledWith(2, {
      attemptId: 'attempt-1',
      role: 'assistant',
      content: 'I can only help with the current mission and terminal learning tasks.',
    });
  });

  it('includes a Kazakh-only answer instruction when locale is kk', async () => {
    attemptsServiceMock.getAttempt.mockResolvedValue({
      attempt: createAttempt(),
    });

    missionsServiceMock.getMissionById.mockReturnValue(createMission());

    openRouterClientMock.createChatCompletion.mockResolvedValue(
      createCompletionResult({
        answer: 'Жауап',
      }),
    );

    await assistantService.askForAttempt('user-1', 'attempt-1', 'Маған ишара берші.', 'kk');

    const systemPrompt = getSystemPrompt(openRouterClientMock);

    expect(systemPrompt).toContain('Тек қазақ тілінде жауап бер.');
    expect(systemPrompt).toContain(
      'Пайдаланушы тікелей сұрамайынша орыс немесе ағылшын тіліне ауыспа.',
    );
    expect(systemPrompt).toContain(
      'Миссия сипаттамасы, техникалық контекст немесе командалар ағылшын тілінде болса да, қорытынды жауабың қазақ тілінде болсын.',
    );
  });

  it('includes a Russian-only answer instruction when locale is ru', async () => {
    attemptsServiceMock.getAttempt.mockResolvedValue({
      attempt: createAttempt(),
    });

    missionsServiceMock.getMissionById.mockReturnValue(createMission());

    openRouterClientMock.createChatCompletion.mockResolvedValue(
      createCompletionResult({
        answer: 'Ответ',
      }),
    );

    await assistantService.askForAttempt('user-1', 'attempt-1', 'Дай мне подсказку.', 'ru');

    const systemPrompt = getSystemPrompt(openRouterClientMock);

    expect(systemPrompt).toContain('Отвечай только на русском языке.');
    expect(systemPrompt).toContain(
      'Не переключайся на английский или казахский, если пользователь сам об этом не попросил.',
    );
    expect(systemPrompt).toContain(
      'Даже если описание миссии, технический контекст или команды написаны на английском, итоговый ответ должен быть на русском языке.',
    );
  });

  it('falls back to English when locale is not provided', async () => {
    attemptsServiceMock.getAttempt.mockResolvedValue({
      attempt: createAttempt(),
    });

    missionsServiceMock.getMissionById.mockReturnValue(createMission());

    openRouterClientMock.createChatCompletion.mockResolvedValue(
      createCompletionResult({
        answer: 'Answer',
      }),
    );

    await assistantService.askForAttempt('user-1', 'attempt-1', 'Give me a hint.');

    const systemPrompt = getSystemPrompt(openRouterClientMock);

    expect(systemPrompt).toContain('Answer only in English.');
    expect(systemPrompt).toContain(
      'Do not switch to Russian or Kazakh unless the learner explicitly asks you to do so.',
    );
    expect(systemPrompt).toContain(
      'Even if the mission metadata or technical context is written in another language, keep your final answer in English.',
    );
  });

  it('throws a descriptive error for lesson attempts', async () => {
    attemptsServiceMock.getAttempt.mockResolvedValue({
      attempt: createAttempt({
        missionId: 'lesson:intro-to-terminal',
      }),
    });

    await expect(assistantService.askForAttempt('user-1', 'attempt-1', 'Help me.')).rejects.toThrow(
      'Assistant is currently available only for mission attempts.',
    );

    expect(missionsServiceMock.getMissionById).not.toHaveBeenCalled();
    expect(openRouterClientMock.createChatCompletion).not.toHaveBeenCalled();
    expect(assistantChatHistoryRepositoryMock.getOrCreateSession).not.toHaveBeenCalled();
    expect(assistantChatHistoryRepositoryMock.getRecentMessages).not.toHaveBeenCalled();
    expect(assistantChatHistoryRepositoryMock.appendMessage).not.toHaveBeenCalled();
  });
});

function createAttempt(overrides: Partial<AssistantAttemptContext> = {}): AssistantAttemptContext {
  return {
    missionId: 'ch01-m01-print-cwd',
    currentCwd: '/home/dojo',
    status: 'in_progress',
    steps: [],
    ...overrides,
  };
}

function createMission(
  overrides: Partial<AssistantMissionLookupResult> = {},
): AssistantMissionLookupResult {
  return {
    id: 'ch01-m01-print-cwd',
    title: 'Print your working directory',
    shortDescription: 'Use pwd to find out where you are in the filesystem.',
    ...overrides,
  };
}

function createCompletionResult(
  overrides: Partial<AssistantCompletionResult> = {},
): AssistantCompletionResult {
  return {
    answer: 'Hint',
    model: 'google/gemma-3-4b-it:free',
    usage: null,
    ...overrides,
  };
}

function createChatSession(overrides: Partial<AssistantChatSession> = {}): AssistantChatSession {
  return {
    attemptId: 'attempt-1',
    messages: [],
    summary: null,
    createdAtIso: '2026-04-05T10:00:00.000Z',
    lastActivityAtIso: '2026-04-05T10:00:00.000Z',
    ...overrides,
  };
}

function createStep(params: {
  stepIndex: number;
  inputLine: string;
  exitCode: number;
  validationType: string;
  executionErrorMessage?: string;
}): AssistantAttemptStepContext {
  return {
    stepIndex: params.stepIndex,
    inputLine: params.inputLine,
    exitCode: params.exitCode,
    validation: {
      type: params.validationType,
    },
    trace: createTrace(params.executionErrorMessage),
  };
}

function createTrace(executionErrorMessage?: string) {
  if (!executionErrorMessage) {
    return {};
  }

  return {
    execute: {
      error: {
        message: executionErrorMessage,
      },
    },
  };
}

function createHistoryMessage(params: {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}): AssistantChatHistoryMessage {
  return {
    id: params.id,
    attemptId: 'attempt-1',
    role: params.role,
    content: params.content,
    status: 'completed',
    createdAtIso: '2026-04-05T10:00:00.000Z',
  };
}

function getSentMessages(openRouterClientMock: OpenRouterClientMock): AssistantChatMessage[] {
  const firstCall = openRouterClientMock.createChatCompletion.mock.calls[0];

  if (!firstCall) {
    throw new Error('OpenRouterClient.createChatCompletion was not called.');
  }

  return firstCall[0];
}

function getSystemPrompt(openRouterClientMock: OpenRouterClientMock): string {
  const messages = getSentMessages(openRouterClientMock);
  const systemMessage = messages.find((message) => message.role === 'system');

  if (!systemMessage) {
    throw new Error('System prompt message was not sent to OpenRouterClient.');
  }

  return systemMessage.content;
}

function getEnvironmentContextPrompt(openRouterClientMock: OpenRouterClientMock): string {
  const messages = getSentMessages(openRouterClientMock);
  const environmentMessage = messages[1];

  if (!environmentMessage) {
    throw new Error('Environment context prompt was not sent to OpenRouterClient.');
  }

  return environmentMessage.content;
}

function getLastUserQuestion(openRouterClientMock: OpenRouterClientMock): string {
  const messages = getSentMessages(openRouterClientMock);
  const lastMessage = messages.at(-1);

  if (!lastMessage || lastMessage.role !== 'user') {
    throw new Error('Final learner question message was not sent to OpenRouterClient.');
  }

  return lastMessage.content;
}
