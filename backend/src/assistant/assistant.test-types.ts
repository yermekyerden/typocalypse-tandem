import type {
  AssistantAttemptLookupResult,
  AssistantChatMessage,
  AssistantCompletionResult,
  AssistantMissionLookupResult,
} from './assistant.types';
import type {
  AssistantChatHistoryMessage,
  AssistantChatSession,
  CreateAssistantChatMessageParams,
} from './history/assistant-chat-history.types';

export type OpenRouterStreamCompletionResult = {
  answer: string;
  model: string;
};

export type OpenRouterStreamDeltaHandler = (delta: string) => void;

export type CreateChatCompletionFunction = (
  messages: AssistantChatMessage[],
) => Promise<AssistantCompletionResult>;

export type CreateChatCompletionStreamFunction = (
  messages: AssistantChatMessage[],
  onDelta: OpenRouterStreamDeltaHandler,
) => Promise<OpenRouterStreamCompletionResult>;

export type AttemptsServiceMock = {
  getAttempt: jest.Mock<Promise<AssistantAttemptLookupResult>, [string, string]>;
};

export type MissionsServiceMock = {
  getMissionById: jest.Mock<AssistantMissionLookupResult, [string]>;
};

export type OpenRouterClientMock = {
  createChatCompletion: jest.MockedFunction<CreateChatCompletionFunction>;
  createChatCompletionStream: jest.MockedFunction<CreateChatCompletionStreamFunction>;
};

export type AssistantChatHistoryRepositoryMock = {
  getOrCreateSession: jest.Mock<AssistantChatSession, [string]>;
  getSession: jest.Mock<AssistantChatSession | null, [string]>;
  getRecentMessages: jest.Mock<AssistantChatHistoryMessage[], [string, number]>;
  appendMessage: jest.Mock<AssistantChatHistoryMessage, [CreateAssistantChatMessageParams]>;
  clearSession: jest.Mock<void, [string]>;
};
