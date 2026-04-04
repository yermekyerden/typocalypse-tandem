import { useEffect, useMemo, useRef, useState } from 'react';

import { useI18n } from '@/i18n/useI18n';

import { getAssistantHistory } from '../api/assistantApi';
import { streamAssistant } from '../api/assistantStreamApi';
import type { AssistantMessage } from '../model/assistant.interfaces';
import { useAssistantStore } from '../model/assistantStore';
import type { AssistantPanelProps, AssistantUiPhase } from '../model/assistant.types';

const createMessageId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `assistant-message-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createMessage = (
  role: AssistantMessage['role'],
  content: string,
  status: AssistantMessage['status'],
): AssistantMessage => ({
  id: createMessageId(),
  role,
  content,
  status,
  createdAtIso: new Date().toISOString(),
});

const getStatusLabel = (phase: AssistantUiPhase): string | null => {
  if (phase === 'thinking') {
    return 'Thinking...';
  }

  if (phase === 'streaming') {
    return 'Streaming...';
  }

  if (phase === 'error') {
    return 'Something went wrong.';
  }

  return null;
};

const getAssistantErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Assistant request failed.';
};

const getMessageBubbleClassName = (message: AssistantMessage): string => {
  if (message.role === 'user') {
    return 'ml-auto max-w-[85%] rounded-2xl rounded-br-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-50';
  }

  if (message.role === 'system') {
    return 'mx-auto max-w-[90%] rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-center text-sm text-slate-300';
  }

  return 'mr-auto max-w-[85%] rounded-2xl rounded-bl-md border border-cyan-500/20 bg-slate-900/90 px-4 py-3 text-sm text-slate-100';
};

const isScrolledNearBottom = (element: HTMLDivElement): boolean => {
  const thresholdInPixels = 24;
  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;

  return distanceFromBottom <= thresholdInPixels;
};

export function AssistantPanel({ attemptId }: AssistantPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  const { language } = useI18n();

  const ensureSession = useAssistantStore((state) => state.ensureSession);
  const hydrateSessionMessages = useAssistantStore(
    (state) => state.hydrateSessionMessages,
  );
  const setDraft = useAssistantStore((state) => state.setDraft);
  const addUserMessage = useAssistantStore((state) => state.addUserMessage);
  const startAssistantMessage = useAssistantStore((state) => state.startAssistantMessage);
  const appendAssistantDelta = useAssistantStore((state) => state.appendAssistantDelta);
  const completeAssistantMessage = useAssistantStore(
    (state) => state.completeAssistantMessage,
  );
  const failAssistantMessage = useAssistantStore((state) => state.failAssistantMessage);
  const setAutoScrollMode = useAssistantStore((state) => state.setAutoScrollMode);

  const sessionState = useAssistantStore((state) =>
    attemptId ? state.sessionsByAttemptId[attemptId] : undefined,
  );
  const draft = sessionState?.draft ?? '';
  const messages = sessionState?.messages ?? [];
  const phase = sessionState?.phase ?? 'idle';
  const errorMessage = sessionState?.errorMessage ?? null;
  const autoScrollMode = sessionState?.autoScrollMode ?? 'sticky-bottom';
  const hasUnreadAssistantDelta = sessionState?.hasUnreadAssistantDelta ?? false;

  const lastMessage = messages.at(-1) ?? null;
  const lastMessageFingerprint = lastMessage
    ? `${lastMessage.id}:${lastMessage.content.length}:${lastMessage.status}`
    : 'empty';

  const isAssistantAvailable = attemptId !== null;
  const isRequestInFlight = phase === 'thinking' || phase === 'streaming';

  const shouldShowJumpToLatest =
    isAssistantAvailable && autoScrollMode === 'detached' && messages.length > 0;

  const statusLabel = useMemo(() => {
    if (isHistoryLoading) {
      return 'Loading...';
    }

    return getStatusLabel(phase) ?? 'Ready';
  }, [isHistoryLoading, phase]);

  useEffect(() => {
    if (!attemptId) {
      return;
    }

    ensureSession(attemptId);
  }, [attemptId, ensureSession]);

  useEffect(() => {
    if (!attemptId || !isOpen || messages.length > 0) {
      return;
    }

    let isCancelled = false;

    const loadAssistantHistory = async (): Promise<void> => {
      setIsHistoryLoading(true);

      try {
        const history = await getAssistantHistory(attemptId);

        if (isCancelled) {
          return;
        }

        hydrateSessionMessages(attemptId, history.messages);
      } catch {
        if (isCancelled) {
          return;
        }
      } finally {
        if (!isCancelled) {
          setIsHistoryLoading(false);
        }
      }
    };

    void loadAssistantHistory();

    return () => {
      isCancelled = true;
    };
  }, [attemptId, isOpen, messages.length, hydrateSessionMessages]);

  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current || !bottomAnchorRef.current) {
      return;
    }

    if (autoScrollMode !== 'sticky-bottom') {
      return;
    }

    bottomAnchorRef.current.scrollIntoView({
      behavior: 'auto',
      block: 'end',
    });
  }, [isOpen, autoScrollMode, lastMessageFingerprint]);

  const handleSend = async (): Promise<void> => {
    const normalizedDraft = draft.trim();

    if (!normalizedDraft || !attemptId || isRequestInFlight) {
      return;
    }

    addUserMessage(attemptId, createMessage('user', normalizedDraft, 'completed'));
    setDraft(attemptId, '');

    const assistantMessage = createMessage('assistant', '', 'thinking');
    startAssistantMessage(attemptId, assistantMessage);

    try {
      await streamAssistant(attemptId, normalizedDraft, language, {
        onDelta: (event) => {
          appendAssistantDelta(attemptId, event.delta);
        },
        onComplete: () => {
          completeAssistantMessage(attemptId);
        },
        onError: (event) => {
          failAssistantMessage(attemptId, event.message);
        },
      });
    } catch (error) {
      failAssistantMessage(attemptId, getAssistantErrorMessage(error));
    }
  };

  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handleSend();
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    if (!attemptId) {
      return;
    }

    setDraft(attemptId, event.target.value);
  };

  const handleTranscriptScroll = (): void => {
    if (!attemptId || !scrollContainerRef.current) {
      return;
    }

    const nextAutoScrollMode = isScrolledNearBottom(scrollContainerRef.current)
      ? 'sticky-bottom'
      : 'detached';

    setAutoScrollMode(attemptId, nextAutoScrollMode);
  };

  const handleJumpToLatest = (): void => {
    if (!attemptId || !bottomAnchorRef.current) {
      return;
    }

    setAutoScrollMode(attemptId, 'sticky-bottom');

    bottomAnchorRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 z-50 rounded-full border border-yellow-500/30 bg-yellow-400 px-5 py-3 text-sm font-medium text-black shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-900 hover:text-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.8)]"
      >
        AI Assistant
      </button>
    );
  }

  return (
    <section className="fixed bottom-4 right-5 z-50 flex h-128 w-[24rem] flex-col overflow-hidden rounded-2xl border border-yellow-500/20 bg-black/85 shadow-[0_0_24px_rgba(250,204,21,0.18)] backdrop-blur-sm">
      <header className="flex items-center justify-between border-b border-yellow-500/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">AI Assistant</h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-400">{statusLabel}</p>
            {hasUnreadAssistantDelta ? (
              <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-yellow-300">
                New
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-lg font-bold text-slate-200 transition hover:text-yellow-400"
        >
          ×
        </button>
      </header>

      <div
        ref={scrollContainerRef}
        onScroll={handleTranscriptScroll}
        className="flex-1 overflow-y-auto bg-slate-950/70 px-3 py-3"
      >
        {!isAssistantAvailable ? (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-700 px-4 text-center text-sm text-slate-400">
            Assistant becomes available after you start the lesson in the terminal.
          </div>
        ) : isHistoryLoading ? (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-700 px-4 text-center text-sm text-slate-400">
            Loading assistant history...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-700 px-4 text-center text-sm text-slate-400">
            Ask about the current mission, terminal output, or your last command.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <article key={message.id} className={getMessageBubbleClassName(message)}>
                <p className="whitespace-pre-wrap wrap-break-word">
                  {message.content ||
                    (message.status === 'thinking' ? 'Thinking...' : '')}
                </p>
              </article>
            ))}

            {shouldShowJumpToLatest ? (
              <div className="sticky bottom-0 z-10 flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleJumpToLatest}
                  className="rounded-full border border-yellow-500/30 bg-slate-900/95 px-3 py-2 text-xs font-medium text-yellow-200 shadow-lg transition hover:border-yellow-400/50 hover:bg-slate-800"
                >
                  {hasUnreadAssistantDelta ? 'Jump to latest • New' : 'Jump to latest'}
                </button>
              </div>
            ) : null}

            <div ref={bottomAnchorRef} />
          </div>
        )}
      </div>

      <footer className="border-t border-yellow-500/10 px-3 py-3">
        {errorMessage ? (
          <div className="mb-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            rows={3}
            disabled={!isAssistantAvailable || isRequestInFlight || isHistoryLoading}
            placeholder={
              isAssistantAvailable
                ? 'Ask about the mission...'
                : 'Start the lesson in the terminal first...'
            }
            className="min-h-20 flex-1 resize-none rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-yellow-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => {
              void handleSend();
            }}
            disabled={
              !attemptId || !draft.trim() || isRequestInFlight || isHistoryLoading
            }
            className="rounded-full border border-yellow-500/30 bg-yellow-400 px-4 py-3 text-sm font-medium text-black transition hover:bg-gray-900 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ➤
          </button>
        </div>
      </footer>
    </section>
  );
}
