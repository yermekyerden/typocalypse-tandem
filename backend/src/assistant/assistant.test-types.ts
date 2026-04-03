import type {
  AssistantAttemptLookupResult,
  AssistantMissionLookupResult,
  AssistantChatMessage,
  AssistantCompletionResult,
} from './assistant.types';
import type {
  AssistantChatHistoryMessage,
  AssistantChatSession,
  CreateAssistantChatMessageParams,
} from './history/assistant-chat-history.types';

export type AttemptsServiceMock = {
  getAttempt: jest.Mock<Promise<AssistantAttemptLookupResult>, [string, string]>;
};

export type MissionsServiceMock = {
  getMissionById: jest.Mock<AssistantMissionLookupResult, [string]>;
};

export type OpenRouterClientMock = {
  createChatCompletion: jest.Mock<Promise<AssistantCompletionResult>, [AssistantChatMessage[]]>;
};

export type AssistantChatHistoryRepositoryMock = {
  getOrCreateSession: jest.Mock<AssistantChatSession, [string]>;
  getSession: jest.Mock<AssistantChatSession | null, [string]>;
  appendMessage: jest.Mock<AssistantChatHistoryMessage, [CreateAssistantChatMessageParams]>;
  clearSession: jest.Mock<void, [string]>;
};
