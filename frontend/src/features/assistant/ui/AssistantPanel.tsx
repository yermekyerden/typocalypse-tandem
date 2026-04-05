import { useEffect, useMemo, useRef, useState } from 'react';

import { useI18n } from '@/i18n/useI18n';

import {
  AssistantStreamStoppedByUserError,
  startAssistantStream,
  type AssistantStreamSession,
} from '../api/assistantStreamApi';
import { getAssistantHistory } from '../api/assistantApi';
import type { AssistantMessage } from '../model/assistant.interfaces';
import { useAssistantStore } from '../model/assistantStore';
import type { AssistantPanelProps, AssistantUiPhase } from '../model/assistant.types';
import { AssistantMessageMarkdown } from './AssistantMessageMarkdown';
import { SendIcon } from '@/components/ui/icons/SendIcon';
import { StopIcon } from '@/components/ui/icons/StopIcon';

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

const getStatusLabel = (
  phase: AssistantUiPhase,
  t: ReturnType<typeof useI18n>['t'],
): string | null => {
  if (phase === 'thinking') {
    return t('assistant.thinking');
  }

  if (phase === 'streaming') {
    return t('assistant.streaming');
  }

  if (phase === 'error') {
    return t('assistant.error');
  }

  return null;
};

const getAssistantErrorMessage = (
  error: unknown,
  t: ReturnType<typeof useI18n>['t'],
): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return t('assistant.fallbackError');
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
  const activeStreamSessionRef = useRef<AssistantStreamSession | null>(null);

  const { language, t } = useI18n();

  const ensureSession = useAssistantStore((state) => state.ensureSession);
  const hydrateSessionMessages = useAssistantStore(
    (state) => state.hydrateSessionMessages,
  );
  const setDraft = useAssistantStore((state) => state.setDraft);
  const addUserMessage = useAssistantStore((state) => state.addUserMessage);
  const startAssistantMessage = useAssistantStore((state) => state.startAssistantMessage);
  const restartFailedAssistantMessage = useAssistantStore(
    (state) => state.restartFailedAssistantMessage,
  );
  const appendAssistantDelta = useAssistantStore((state) => state.appendAssistantDelta);
  const completeAssistantMessage = useAssistantStore(
    (state) => state.completeAssistantMessage,
  );
  const failAssistantMessage = useAssistantStore((state) => state.failAssistantMessage);
  const stopAssistantMessage = useAssistantStore((state) => state.stopAssistantMessage);
  const setAutoScrollMode = useAssistantStore((state) => state.setAutoScrollMode);

  const sessionState = useAssistantStore((state) =>
    attemptId ? state.sessionsByAttemptId[attemptId] : undefined,
  );
  const draft = sessionState?.draft ?? '';
  const messages = sessionState?.messages ?? [];
  const phase = sessionState?.phase ?? 'idle';
  const autoScrollMode = sessionState?.autoScrollMode ?? 'sticky-bottom';
  const hasUnreadAssistantDelta = sessionState?.hasUnreadAssistantDelta ?? false;

  const lastUserQuestion =
    [...messages].reverse().find((message) => message.role === 'user')?.content ?? null;

  const lastFailedMessage =
    [...messages].reverse().find((message) => message.status === 'failed') ?? null;

  const lastMessage = messages.at(-1) ?? null;
  const lastMessageFingerprint = lastMessage
    ? `${lastMessage.id}:${lastMessage.content.length}:${lastMessage.status}`
    : 'empty';

  const isAssistantAvailable = attemptId !== null;
  const isRequestInFlight = phase === 'thinking' || phase === 'streaming';

  const canRetryLastQuestion =
    Boolean(attemptId) &&
    Boolean(lastUserQuestion) &&
    !isRequestInFlight &&
    !isHistoryLoading;

  const shouldShowJumpToLatest =
    isAssistantAvailable && autoScrollMode === 'detached' && messages.length > 0;

  const statusLabel = useMemo(() => {
    if (isHistoryLoading) {
      return t('assistant.loading');
    }

    return getStatusLabel(phase, t) ?? t('assistant.ready');
  }, [isHistoryLoading, phase, t]);

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

  const sendQuestion = async (question: string, mode: 'new' | 'retry'): Promise<void> => {
    const normalizedQuestion = question.trim();

    if (!normalizedQuestion || !attemptId || isRequestInFlight) {
      return;
    }

    if (mode === 'new') {
      addUserMessage(attemptId, createMessage('user', normalizedQuestion, 'completed'));
      setDraft(attemptId, '');

      const assistantMessage = createMessage('assistant', '', 'thinking');
      startAssistantMessage(attemptId, assistantMessage);
    } else if (lastFailedMessage?.role === 'assistant') {
      restartFailedAssistantMessage(attemptId);
    } else {
      const assistantMessage = createMessage('assistant', '', 'thinking');
      startAssistantMessage(attemptId, assistantMessage);
    }

    const streamSession = await startAssistantStream(
      attemptId,
      normalizedQuestion,
      language,
      {
        onDelta: (event) => {
          appendAssistantDelta(attemptId, event.delta);
        },
        onComplete: () => {
          completeAssistantMessage(attemptId);
        },
        onError: (event) => {
          failAssistantMessage(attemptId, event.message);
        },
      },
    );

    activeStreamSessionRef.current = streamSession;

    try {
      await streamSession.promise;
    } catch (error) {
      if (error instanceof AssistantStreamStoppedByUserError) {
        stopAssistantMessage(attemptId, t('assistant.stoppedByUser'));
        return;
      }

      failAssistantMessage(attemptId, getAssistantErrorMessage(error, t));
    } finally {
      if (activeStreamSessionRef.current === streamSession) {
        activeStreamSessionRef.current = null;
      }
    }
  };

  const handleSend = async (): Promise<void> => {
    await sendQuestion(draft, 'new');
  };

  const handleRetryLastQuestion = async (): Promise<void> => {
    if (!lastUserQuestion) {
      return;
    }

    await sendQuestion(lastUserQuestion, 'retry');
  };

  const handleStopGeneration = (): void => {
    activeStreamSessionRef.current?.stop();
  };

  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (isRequestInFlight) {
      return;
    }

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
        className="fixed bottom-6 right-6 z-50 rounded-full border border-yellow-500/30 bg-yellow-400 px-5 py-3 text-sm font-medium text-black shadow-lg transition-all duration-200 ease-out hover:bg-gray-900 hover:text-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.8)]"
      >
        {t('assistant.title')}
      </button>
    );
  }

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 flex h-[min(42rem,calc(100vh-5rem))] w-auto flex-col overflow-hidden rounded-3xl border border-yellow-500/20 bg-[linear-gradient(180deg,rgba(10,11,16,0.96)_0%,rgba(14,15,19,0.94)_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:right-5 sm:left-auto sm:w-md lg:w-120">
      <header className="flex items-center justify-between border-b border-yellow-500/10 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{t('assistant.title')}</h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-400">{statusLabel}</p>
            {hasUnreadAssistantDelta ? (
              <span className="rounded-full border border-yellow-500/25 bg-yellow-500/8 px-2 py-0.5 text-[10px] uppercase tracking-wide text-yellow-300">
                {t('assistant.newBadge')}
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
        className="flex-1 overflow-y-auto bg-transparent px-4 py-4 sm:px-5"
      >
        {!isAssistantAvailable ? (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-700 px-4 text-center text-sm text-slate-400">
            {t('assistant.unavailable')}
          </div>
        ) : isHistoryLoading ? (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-700 px-4 text-center text-sm text-slate-400">
            {t('assistant.loadingHistory')}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-700 px-4 text-center text-sm text-slate-400">
            {t('assistant.emptyState')}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => {
              const isFailedAssistantMessage =
                message.role === 'assistant' && message.status === 'failed';

              const isFailedSystemMessage =
                message.role === 'system' && message.status === 'failed';

              const isRetryableErrorMessage =
                isFailedAssistantMessage || isFailedSystemMessage;

              return (
                <article
                  key={message.id}
                  className={
                    isRetryableErrorMessage
                      ? 'mr-auto max-w-[85%] rounded-2xl rounded-bl-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100'
                      : getMessageBubbleClassName(message)
                  }
                >
                  {isRetryableErrorMessage ? (
                    <p className="whitespace-pre-wrap wrap-break-word">
                      {message.content || t('assistant.fallbackError')}
                    </p>
                  ) : message.role === 'assistant' && message.status === 'completed' ? (
                    <AssistantMessageMarkdown content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap wrap-break-word">
                      {message.content ||
                        (message.status === 'thinking' ? t('assistant.thinking') : '')}
                    </p>
                  )}

                  {isRetryableErrorMessage && canRetryLastQuestion ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleRetryLastQuestion();
                      }}
                      className="mt-3 rounded-full border border-red-300/30 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-red-100 transition hover:border-red-200/50 hover:bg-slate-800"
                    >
                      {t('assistant.retry')}
                    </button>
                  ) : null}
                </article>
              );
            })}

            {shouldShowJumpToLatest ? (
              <div className="sticky bottom-0 z-10 flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleJumpToLatest}
                  className="rounded-full border border-yellow-500/30 bg-slate-900/95 px-3 py-2 text-xs font-medium text-yellow-200 shadow-lg transition hover:border-yellow-400/50 hover:bg-slate-800"
                >
                  {hasUnreadAssistantDelta
                    ? t('assistant.jumpToLatestNew')
                    : t('assistant.jumpToLatest')}
                </button>
              </div>
            ) : null}

            <div ref={bottomAnchorRef} />
          </div>
        )}
      </div>

      <footer className="border-t border-yellow-500/10 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <textarea
            value={draft}
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            rows={3}
            disabled={!isAssistantAvailable || isHistoryLoading}
            placeholder={
              isAssistantAvailable
                ? t('assistant.placeholderReady')
                : t('assistant.placeholderUnavailable')
            }
            className="min-h-24 flex-1 resize-none rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-yellow-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {isRequestInFlight ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              aria-label={t('assistant.stop')}
              title={t('assistant.stop')}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-100 transition hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60"
            >
              <StopIcon className="h-8 w-8" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                void handleSend();
              }}
              aria-label={t('assistant.send')}
              title={t('assistant.send')}
              disabled={!attemptId || !draft.trim() || isHistoryLoading}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-400 text-black transition hover:bg-gray-900 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300/60"
            >
              <SendIcon className="h-8 w-8" />
            </button>
          )}
        </div>
      </footer>
    </aside>
  );
}
