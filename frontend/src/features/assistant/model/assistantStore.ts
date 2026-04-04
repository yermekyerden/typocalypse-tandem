import { create } from 'zustand';

import type {
  AssistantHydratedMessage,
  AssistantMessage,
  AssistantSessionState,
  AssistantStore,
} from './assistant.interfaces';
import type { AssistantAutoScrollMode } from './assistant.types';

const createEmptySessionState = (attemptId: string): AssistantSessionState => ({
  attemptId,
  messages: [],
  draft: '',
  phase: 'idle',
  autoScrollMode: 'sticky-bottom',
  errorMessage: null,
  activeStreamingMessageId: null,
  hasUnreadAssistantDelta: false,
});

const getOrCreateSessionState = (
  sessionsByAttemptId: Record<string, AssistantSessionState>,
  attemptId: string,
): AssistantSessionState => {
  return sessionsByAttemptId[attemptId] ?? createEmptySessionState(attemptId);
};

const updateSessionState = (
  sessionsByAttemptId: Record<string, AssistantSessionState>,
  attemptId: string,
  updater: (sessionState: AssistantSessionState) => AssistantSessionState,
): Record<string, AssistantSessionState> => {
  const currentSessionState = getOrCreateSessionState(sessionsByAttemptId, attemptId);
  const nextSessionState = updater(currentSessionState);

  return {
    ...sessionsByAttemptId,
    [attemptId]: nextSessionState,
  };
};

const hydrateMessagesAsCompleted = (
  messages: AssistantHydratedMessage[],
): AssistantMessage[] => {
  return messages.map((message) => ({
    ...message,
    status: 'completed',
  }));
};

export const useAssistantStore = create<AssistantStore>((set) => ({
  activeAttemptId: null,
  sessionsByAttemptId: {},

  // Session lifecycle
  setActiveAttemptId: (attemptId: string): void => {
    set((state) => ({
      activeAttemptId: attemptId,
      sessionsByAttemptId: updateSessionState(
        state.sessionsByAttemptId,
        attemptId,
        (sessionState) => sessionState,
      ),
    }));
  },

  ensureSession: (attemptId: string): void => {
    set((state) => ({
      sessionsByAttemptId: updateSessionState(
        state.sessionsByAttemptId,
        attemptId,
        (sessionState) => sessionState,
      ),
    }));
  },

  hydrateSessionMessages: (
    attemptId: string,
    messages: AssistantHydratedMessage[],
  ): void => {
    set((state) => ({
      sessionsByAttemptId: updateSessionState(
        state.sessionsByAttemptId,
        attemptId,
        (sessionState) => ({
          ...sessionState,
          messages: hydrateMessagesAsCompleted(messages),
          phase: 'idle',
          errorMessage: null,
          activeStreamingMessageId: null,
          hasUnreadAssistantDelta: false,
        }),
      ),
    }));
  },

  clearSession: (attemptId: string): void => {
    set((state) => {
      const nextSessionsByAttemptId = { ...state.sessionsByAttemptId };
      delete nextSessionsByAttemptId[attemptId];

      return {
        sessionsByAttemptId: nextSessionsByAttemptId,
        activeAttemptId:
          state.activeAttemptId === attemptId ? null : state.activeAttemptId,
      };
    });
  },

  // Draft
  setDraft: (attemptId: string, draft: string): void => {
    set((state) => ({
      sessionsByAttemptId: updateSessionState(
        state.sessionsByAttemptId,
        attemptId,
        (sessionState) => ({
          ...sessionState,
          draft,
        }),
      ),
    }));
  },

  // Request lifecycle
  addUserMessage: (attemptId: string, message: AssistantMessage): void => {
    set((state) => ({
      sessionsByAttemptId: updateSessionState(
        state.sessionsByAttemptId,
        attemptId,
        (sessionState) => ({
          ...sessionState,
          messages: [...sessionState.messages, message],
          phase: 'idle',
          errorMessage: null,
        }),
      ),
    }));
  },

  startAssistantMessage: (attemptId: string, message: AssistantMessage): void => {
    set((state) => ({
      sessionsByAttemptId: updateSessionState(
        state.sessionsByAttemptId,
        attemptId,
        (sessionState) => ({
          ...sessionState,
          messages: [...sessionState.messages, message],
          phase: message.status === 'thinking' ? 'thinking' : 'streaming',
          errorMessage: null,
          activeStreamingMessageId: message.id,
          hasUnreadAssistantDelta: sessionState.autoScrollMode === 'detached',
        }),
      ),
    }));
  },

  appendAssistantDelta: (attemptId: string, delta: string): void => {
    set((state) => ({
      sessionsByAttemptId: updateSessionState(
        state.sessionsByAttemptId,
        attemptId,
        (sessionState) => {
          if (!sessionState.activeStreamingMessageId) {
            return sessionState;
          }

          const nextMessages: AssistantMessage[] = sessionState.messages.map(
            (message) => {
              if (message.id !== sessionState.activeStreamingMessageId) {
                return message;
              }

              return {
                ...message,
                content: `${message.content}${delta}`,
                status: 'streaming',
              };
            },
          );

          return {
            ...sessionState,
            messages: nextMessages,
            phase: 'streaming',
            hasUnreadAssistantDelta: sessionState.autoScrollMode === 'detached',
          };
        },
      ),
    }));
  },

  completeAssistantMessage: (attemptId: string): void => {
    set((state) => ({
      sessionsByAttemptId: updateSessionState(
        state.sessionsByAttemptId,
        attemptId,
        (sessionState) => {
          if (!sessionState.activeStreamingMessageId) {
            return {
              ...sessionState,
              phase: 'idle',
              errorMessage: null,
            };
          }

          const nextMessages: AssistantMessage[] = sessionState.messages.map(
            (message) => {
              if (message.id !== sessionState.activeStreamingMessageId) {
                return message;
              }

              return {
                ...message,
                status: 'completed',
              };
            },
          );

          return {
            ...sessionState,
            messages: nextMessages,
            phase: 'idle',
            errorMessage: null,
            activeStreamingMessageId: null,
          };
        },
      ),
    }));
  },

  failAssistantMessage: (attemptId: string, errorMessage: string): void => {
    set((state) => ({
      sessionsByAttemptId: updateSessionState(
        state.sessionsByAttemptId,
        attemptId,
        (sessionState) => {
          const nextMessages: AssistantMessage[] = sessionState.activeStreamingMessageId
            ? sessionState.messages.map((message) => {
                if (message.id !== sessionState.activeStreamingMessageId) {
                  return message;
                }

                return {
                  ...message,
                  status: 'failed',
                };
              })
            : sessionState.messages;

          return {
            ...sessionState,
            messages: nextMessages,
            phase: 'error',
            errorMessage,
            activeStreamingMessageId: null,
          };
        },
      ),
    }));
  },

  // UI state
  setAutoScrollMode: (
    attemptId: string,
    autoScrollMode: AssistantAutoScrollMode,
  ): void => {
    set((state) => ({
      sessionsByAttemptId: updateSessionState(
        state.sessionsByAttemptId,
        attemptId,
        (sessionState) => ({
          ...sessionState,
          autoScrollMode,
          hasUnreadAssistantDelta:
            autoScrollMode === 'sticky-bottom'
              ? false
              : sessionState.hasUnreadAssistantDelta,
        }),
      ),
    }));
  },

  clearError: (attemptId: string): void => {
    set((state) => ({
      sessionsByAttemptId: updateSessionState(
        state.sessionsByAttemptId,
        attemptId,
        (sessionState) => ({
          ...sessionState,
          phase: sessionState.activeStreamingMessageId ? sessionState.phase : 'idle',
          errorMessage: null,
        }),
      ),
    }));
  },
}));
