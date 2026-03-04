import { useEffect, useMemo, useRef, useState } from 'react';

import { useTerminalSession } from '@/store/terminalSession';

type Props = {
  height?: number | string;
};

export function TerminalWindow({ height = 420 }: Props) {
  const output = useTerminalSession((s) => s.output);
  const cwd = useTerminalSession((s) => s.cwd);
  const runCommand = useTerminalSession((s) => s.runCommand);
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const history = useTerminalSession((s) => s.history);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 16);
    return () => clearTimeout(timer);
  }, [output.length]);

  const prompt = useMemo(() => {
    const parts = cwd.split('/');
    const last = parts[parts.length - 1] || '/';
    return `student@dojo:${last === '' ? '/' : last}$`;
  }, [cwd]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    runCommand(value);
    setInput('');
    setHistoryIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex] ?? '');
      }
    }
  };

  return (
    <div
      className="flex flex-col rounded-lg border border-yellow-400/25 bg-mist-950/80 shadow-lg backdrop-blur-sm"
      style={{ height }}
      ref={containerRef}
    >
      <div className="flex items-center gap-2 border-b border-yellow-400/15 px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-yellow-200/80">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
        terminal dojo
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 font-mono text-sm text-yellow-100">
        {output.map((line) => (
          <div
            key={line.id}
            className={
              line.kind === 'stderr'
                ? 'text-rose-200'
                : line.kind === 'system'
                  ? 'text-sky-200'
                  : 'text-yellow-100'
            }
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="border-t border-yellow-400/15 px-3 py-2">
        <div className="flex items-center gap-2 font-mono text-sm text-yellow-100">
          <span className="text-amber-300">{prompt}</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-yellow-50 outline-none placeholder:text-yellow-200/50"
            autoFocus
            spellCheck={false}
            placeholder="type a command"
          />
        </div>
      </form>
    </div>
  );
}
