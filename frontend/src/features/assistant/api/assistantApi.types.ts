import type { AssistantConversationRole } from '../model/assistant.types';

export type AssistantApiUsage = {
  cost?: number;
  totalTokens?: number;
};

export type AskAssistantRequest = {
  question: string;
  locale: string;
};

export type AskAssistantResponse = {
  answer: string;
  model: string;
  usage: AssistantApiUsage | null;
};

export type AssistantHistoryMessageResponse = {
  id: string;
  role: AssistantConversationRole;
  content: string;
  createdAtIso: string;
};

export type AssistantHistoryResponse = {
  attemptId: string;
  messages: AssistantHistoryMessageResponse[];
};
