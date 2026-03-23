import {
  AssistantAttemptLookupResult,
  AssistantMissionLookupResult,
  AssistantChatMessage,
  AssistantCompletionResult,
} from './assistant.types';

export type AttemptsServiceMock = {
  getAttempt: jest.Mock<Promise<AssistantAttemptLookupResult>, [string, string]>;
};

export type MissionsServiceMock = {
  getMissionById: jest.Mock<AssistantMissionLookupResult, [string]>;
};

export type OpenRouterClientMock = {
  createChatCompletion: jest.Mock<Promise<AssistantCompletionResult>, [AssistantChatMessage[]]>;
};
