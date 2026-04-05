import type {
  AssistantAutoScrollMode,
  AssistantConversationRole,
  AssistantMessageStatus,
  AssistantRole,
  AssistantUiPhase,
} from './assistant.types';

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  status: AssistantMessageStatus;
  createdAtIso: string;
}

export interface AssistantHydratedMessage {
  id: string;
  role: AssistantConversationRole;
  content: string;
  createdAtIso: string;
}

export interface AssistantSessionState {
  attemptId: string;
  messages: AssistantMessage[];
  draft: string;
  phase: AssistantUiPhase;
  autoScrollMode: AssistantAutoScrollMode;
  errorMessage: string | null;
  activeStreamingMessageId: string | null;
  hasUnreadAssistantDelta: boolean;
}

export interface AssistantStoreState {
  activeAttemptId: string | null;
  sessionsByAttemptId: Record<string, AssistantSessionState>;
}

export interface AssistantStoreActions {
  // Session lifecycle
  setActiveAttemptId: (attemptId: string) => void;
  ensureSession: (attemptId: string) => void;
  hydrateSessionMessages: (
    attemptId: string,
    messages: AssistantHydratedMessage[],
  ) => void;
  clearSession: (attemptId: string) => void;

  // Draft
  setDraft: (attemptId: string, draft: string) => void;

  // Request lifecycle
  addUserMessage: (attemptId: string, message: AssistantMessage) => void;
  startAssistantMessage: (attemptId: string, message: AssistantMessage) => void;
  restartFailedAssistantMessage: (attemptId: string) => void;
  appendAssistantDelta: (attemptId: string, delta: string) => void;
  completeAssistantMessage: (attemptId: string) => void;
  failAssistantMessage: (attemptId: string, errorMessage: string) => void;

  // UI state
  setAutoScrollMode: (attemptId: string, autoScrollMode: AssistantAutoScrollMode) => void;
  clearError: (attemptId: string) => void;
}

export interface AssistantStore extends AssistantStoreState, AssistantStoreActions {}
