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
