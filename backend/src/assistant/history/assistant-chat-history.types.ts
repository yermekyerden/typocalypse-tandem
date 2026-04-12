export type AssistantConversationRole = 'user' | 'assistant';

export type AssistantChatMessageStatus = 'completed' | 'failed';

export type AssistantChatHistoryMessage = {
  id: string;
  attemptId: string;
  role: AssistantConversationRole;
  content: string;
  status: AssistantChatMessageStatus;
  createdAtIso: string;
};

export type AssistantChatSession = {
  attemptId: string;
  messages: AssistantChatHistoryMessage[];
  summary: string | null;
  createdAtIso: string;
  lastActivityAtIso: string;
};

export type CreateAssistantChatMessageParams = {
  attemptId: string;
  role: AssistantConversationRole;
  content: string;
  status?: AssistantChatMessageStatus;
};
