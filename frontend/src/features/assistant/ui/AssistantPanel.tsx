import { useEffect, useMemo, useState } from 'react';

import { useAssistantStore } from '../model/assistantStore';
import type { AssistantMessage } from '../model/assistant.types';

type AssistantPanelProps = {
  attemptId: string;
};

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
  phase: 'idle' | 'thinking' | 'streaming' | 'error',
): string | null => {
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

const getMessageBubbleClassName = (message: AssistantMessage): string => {
  if (message.role === 'user') {
    return 'ml-auto max-w-[85%] rounded-2xl rounded-br-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-50';
  }

  if (message.role === 'system') {
    return 'mx-auto max-w-[90%] rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-center text-sm text-slate-300';
  }

  return 'mr-auto max-w-[85%] rounded-2xl rounded-bl-md border border-cyan-500/20 bg-slate-900/90 px-4 py-3 text-sm text-slate-100';
};

const simulateAssistantStreaming = (
  attemptId: string,
  startAssistantMessage: (attemptId: string, message: AssistantMessage) => void,
  appendAssistantDelta: (attemptId: string, delta: string) => void,
  completeAssistantMessage: (attemptId: string) => void,
): void => {
  const assistantMessage = createMessage('assistant', '', 'thinking');

  startAssistantMessage(attemptId, assistantMessage);

  const responseChunks = [
    'Assistant UI is connected to the local store. ',
    'The next step will replace this simulation with real backend requests ',
    'and streaming transport from the assistant module.',
  ];

  let currentChunkIndex = 0;

  const streamNextChunk = (): void => {
    const nextChunk = responseChunks[currentChunkIndex];

    if (!nextChunk) {
      completeAssistantMessage(attemptId);
      return;
    }

    appendAssistantDelta(attemptId, nextChunk);
    currentChunkIndex += 1;

    window.setTimeout(streamNextChunk, 240);
  };

  window.setTimeout(streamNextChunk, 420);
};

export function AssistantPanel({ attemptId }: AssistantPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const ensureSession = useAssistantStore((state) => state.ensureSession);
  const draft = useAssistantStore(
    (state) => state.sessionsByAttemptId[attemptId]?.draft ?? '',
  );
  const messages = useAssistantStore(
    (state) => state.sessionsByAttemptId[attemptId]?.messages ?? [],
  );
  const phase = useAssistantStore(
    (state) => state.sessionsByAttemptId[attemptId]?.phase ?? 'idle',
  );
  const errorMessage = useAssistantStore(
    (state) => state.sessionsByAttemptId[attemptId]?.errorMessage ?? null,
  );
  const setDraft = useAssistantStore((state) => state.setDraft);
  const addUserMessage = useAssistantStore((state) => state.addUserMessage);
  const startAssistantMessage = useAssistantStore((state) => state.startAssistantMessage);
  const appendAssistantDelta = useAssistantStore((state) => state.appendAssistantDelta);
  const completeAssistantMessage = useAssistantStore(
    (state) => state.completeAssistantMessage,
  );

  useEffect(() => {
    ensureSession(attemptId);
  }, [attemptId, ensureSession]);

  const statusLabel = useMemo(() => getStatusLabel(phase), [phase]);

  const handleSend = (): void => {
    const normalizedDraft = draft.trim();

    if (!normalizedDraft) {
      return;
    }

    addUserMessage(attemptId, createMessage('user', normalizedDraft, 'completed'));
    setDraft(attemptId, '');
    simulateAssistantStreaming(
      attemptId,
      startAssistantMessage,
      appendAssistantDelta,
      completeAssistantMessage,
    );
  };

  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    handleSend();
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
    <section className="fixed bottom-4 right-5 z-50 flex h-[32rem] w-[24rem] flex-col overflow-hidden rounded-2xl border border-yellow-500/20 bg-black/85 shadow-[0_0_24px_rgba(250,204,21,0.18)] backdrop-blur-sm">
      <header className="flex items-center justify-between border-b border-yellow-500/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">AI Assistant</h2>
          <p className="text-xs text-slate-400">{statusLabel ?? 'Ready'}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-lg font-bold text-slate-200 transition hover:text-yellow-400"
        >
          ×
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-950/70 px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[14rem] items-center justify-center rounded-2xl border border-dashed border-slate-700 px-4 text-center text-sm text-slate-400">
            Ask about the current mission, terminal output, or your last command.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <article key={message.id} className={getMessageBubbleClassName(message)}>
                <p className="whitespace-pre-wrap break-words">
                  {message.content ||
                    (message.status === 'thinking' ? 'Thinking...' : '')}
                </p>
              </article>
            ))}
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
            onChange={(event) => setDraft(attemptId, event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            rows={3}
            placeholder="Ask about the mission..."
            className="min-h-[5rem] flex-1 resize-none rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-yellow-500/40"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            className="rounded-full border border-yellow-500/30 bg-yellow-400 px-4 py-3 text-sm font-medium text-black transition hover:bg-gray-900 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ➤
          </button>
        </div>
      </footer>
    </section>
  );
}
