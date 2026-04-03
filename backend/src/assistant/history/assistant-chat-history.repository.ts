import type {
  AssistantChatHistoryMessage,
  AssistantChatSession,
  CreateAssistantChatMessageParams,
} from './assistant-chat-history.types';

export const ASSISTANT_CHAT_HISTORY_REPOSITORY = Symbol('ASSISTANT_CHAT_HISTORY_REPOSITORY');

export interface AssistantChatHistoryRepository {
  getOrCreateSession(attemptId: string): AssistantChatSession;
  getSession(attemptId: string): AssistantChatSession | null;
  appendMessage(params: CreateAssistantChatMessageParams): AssistantChatHistoryMessage;
  clearSession(attemptId: string): void;
}
