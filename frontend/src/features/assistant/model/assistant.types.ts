export type AssistantRole = 'user' | 'assistant' | 'system';

export type AssistantConversationRole = Exclude<AssistantRole, 'system'>;

export type AssistantMessageStatus =
  | 'pending'
  | 'thinking'
  | 'streaming'
  | 'completed'
  | 'failed';

export type AssistantUiPhase = 'idle' | 'thinking' | 'streaming' | 'error';

export type AssistantAutoScrollMode = 'sticky-bottom' | 'detached';

export type AssistantPanelProps = {
  attemptId: string | null;
};
