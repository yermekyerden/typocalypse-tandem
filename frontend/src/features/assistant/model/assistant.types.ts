export type AssistantRole = 'user' | 'assistant' | 'system';

export type AssistantMessageStatus =
  | 'pending'
  | 'thinking'
  | 'streaming'
  | 'completed'
  | 'failed';

export type AssistantUiPhase = 'idle' | 'thinking' | 'streaming' | 'error';

export type AssistantAutoScrollMode = 'sticky-bottom' | 'detached';

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  content: string;
  status: AssistantMessageStatus;
  createdAtIso: string;
};

export type AssistantSessionState = {
  attemptId: string;
  messages: AssistantMessage[];
  draft: string;
  phase: AssistantUiPhase;
  autoScrollMode: AssistantAutoScrollMode;
  errorMessage: string | null;
  activeStreamingMessageId: string | null;
  hasUnreadAssistantDelta: boolean;
};

export type AssistantStoreState = {
  activeAttemptId: string | null;
  sessionsByAttemptId: Record<string, AssistantSessionState>;
};

export type AssistantStoreActions = {
  setActiveAttemptId: (attemptId: string) => void;
  ensureSession: (attemptId: string) => void;
  setDraft: (attemptId: string, draft: string) => void;
  addUserMessage: (attemptId: string, message: AssistantMessage) => void;
  startAssistantMessage: (attemptId: string, message: AssistantMessage) => void;
  appendAssistantDelta: (attemptId: string, delta: string) => void;
  completeAssistantMessage: (attemptId: string) => void;
  failAssistantMessage: (attemptId: string, errorMessage: string) => void;
  setAutoScrollMode: (attemptId: string, autoScrollMode: AssistantAutoScrollMode) => void;
  clearError: (attemptId: string) => void;
  clearSession: (attemptId: string) => void;
};

export type AssistantStore = AssistantStoreState & AssistantStoreActions;
