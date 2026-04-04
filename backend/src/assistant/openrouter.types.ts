import type { AssistantChatRole } from './assistant.types';

export type OpenRouterApiUsage = {
  cost?: number;
  total_tokens?: number;
};

export type OpenRouterError = {
  message?: string;
};

export type OpenRouterChoiceMessage = {
  role?: AssistantChatRole | 'tool';
  content?: string;
};

export type OpenRouterChoice = {
  message?: OpenRouterChoiceMessage;
};

export type OpenRouterChatCompletionApiResponse = {
  model?: string;
  choices?: OpenRouterChoice[];
  usage?: OpenRouterApiUsage | null;
  error?: OpenRouterError;
};

export type OpenRouterStreamDelta = {
  content?: string;
};

export type OpenRouterStreamChoice = {
  delta?: OpenRouterStreamDelta;
  finish_reason?: string | null;
};

export type OpenRouterStreamChunkApiResponse = {
  model?: string;
  choices?: OpenRouterStreamChoice[];
};
