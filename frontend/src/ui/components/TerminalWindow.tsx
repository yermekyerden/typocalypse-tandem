import { useEffect, useMemo, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

import { useTerminalSession } from '@/store/terminalSession';

type Props = {
  height?: number | string;
  className?: string;
};

const RESET = '\u001b[0m';
const COLORS: Record<'stdout' | 'stderr' | 'system', string> = {
  stdout: '',
  stderr: '\u001b[91m',
  system: '\u001b[96m',
};

function formatPromptPath(cwd: string) {
  const home = '/home/student';
  if (cwd === home) return '~';
  if (cwd.startsWith(`${home}/`)) {
    return `~/${cwd.slice(home.length + 1)}`;
  }
  return cwd;
}

export function TerminalWindow({ height, className }: Props) {
  const output = useTerminalSession((s) => s.output);
  const cwd = useTerminalSession((s) => s.cwd);
  const runCommand = useTerminalSession((s) => s.runCommand);
  const history = useTerminalSession((s) => s.history);

  const prompt = useMemo(() => `student@dojo:${formatPromptPath(cwd)}$ `, [cwd]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const inputRef = useRef('');
  const historyIndexRef = useRef<number | null>(null);
  const historyRef = useRef<string[]>(history);
  const runCommandRef = useRef(runCommand);
  const promptRef = useRef(prompt);
  const lastOutputIndexRef = useRef(0);
  const lastSubmittedCommandRef = useRef<string | null>(null);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    runCommandRef.current = runCommand;
  }, [runCommand]);

  useEffect(() => {
    promptRef.current = prompt;
    const term = termRef.current;
    if (!term) return;
    term.write('\r');
    term.write('\u001b[2K');
    term.write(`${promptRef.current}${inputRef.current}`);
  }, [prompt]);

  useEffect(() => {
    const term = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontFamily: 'JetBrains Mono, SFMono-Regular, Menlo, monospace',
      fontSize: 14,
      rows: 24,
      theme: {
        background: '#000000',
        foreground: '#f8f6e5',
        cursor: '#facc15',
        black: '#000000',
        green: '#bbf7d0',
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    termRef.current = term;
    fitAddonRef.current = fitAddon;

    term.open(containerRef.current!);
    fitAddon.fit();
    term.focus();

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    const renderPrompt = () => {
      term.write('\r');
      term.write('\u001b[2K');
      term.write(`${promptRef.current}${inputRef.current}`);
    };

    const applyInput = (value: string) => {
      inputRef.current = value;
      term.write('\r');
      term.write('\u001b[2K');
      term.write(`${promptRef.current}${value}`);
    };

    const handleHistory = (direction: 'up' | 'down') => {
      const historyList = historyRef.current;
      if (historyList.length === 0) return;

      if (direction === 'up') {
        const nextIndex =
          historyIndexRef.current === null
            ? historyList.length - 1
            : Math.max(0, historyIndexRef.current - 1);
        historyIndexRef.current = nextIndex;
        applyInput(historyList[nextIndex] ?? '');
      } else {
        if (historyIndexRef.current === null) return;
        const nextIndex = historyIndexRef.current + 1;
        if (nextIndex >= historyList.length) {
          historyIndexRef.current = null;
          applyInput('');
        } else {
          historyIndexRef.current = nextIndex;
          applyInput(historyList[nextIndex] ?? '');
        }
      }
    };

    const handleData = (data: string) => {
      if (data === '\u0003') {
        term.writeln('^C');
        inputRef.current = '';
        historyIndexRef.current = null;
        renderPrompt();
        return;
      }

      if (data === '\r') {
        const raw = inputRef.current;
        term.writeln('');
        historyIndexRef.current = null;
        inputRef.current = '';
        if (raw.trim().length > 0) {
          lastSubmittedCommandRef.current = raw;
          runCommandRef.current(raw);
        } else {
          renderPrompt();
        }
        return;
      }

      if (data === '\u007f') {
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1);
          term.write('\b \b');
        }
        return;
      }

      if (data === '\u001b[A') {
        handleHistory('up');
        return;
      }
      if (data === '\u001b[B') {
        handleHistory('down');
        return;
      }

      if (data.startsWith('\u001b')) {
        return;
      }

      inputRef.current += data;
      term.write(data);
    };

    const dataDisposable = term.onData(handleData);
    renderPrompt();

    return () => {
      dataDisposable.dispose();
      window.removeEventListener('resize', handleResize);
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;

    if (lastOutputIndexRef.current > output.length) {
      term.clear();
      lastOutputIndexRef.current = 0;
      inputRef.current = '';
      historyIndexRef.current = null;
      lastSubmittedCommandRef.current = null;
    }

    const linesToRender = output.slice(lastOutputIndexRef.current);

    linesToRender.forEach((line) => {
      const isEcho =
        lastSubmittedCommandRef.current !== null &&
        line.text === `$ ${lastSubmittedCommandRef.current}`;
      if (isEcho) {
        return;
      }

      const color = COLORS[line.kind];
      const segments = line.text.split('\n');
      segments.forEach((segment) => {
        term.writeln(`${color}${segment}${color ? RESET : ''}`);
      });
    });

    lastOutputIndexRef.current = output.length;

    term.write('\r');
    term.write('\u001b[2K');
    term.write(`${promptRef.current}${inputRef.current}`);
  }, [output]);

  useEffect(() => {
    const fitAddon = fitAddonRef.current;
    if (!fitAddon) return;
    fitAddon.fit();
  }, [height, className]);

  return (
    <div
      className={`flex flex-col rounded-lg border border-yellow-400/25 bg-mist-950/80 shadow-lg backdrop-blur-sm overflow-hidden min-h-0 max-h-full ${className ?? ''}`}
      style={height ? { height } : undefined}
    >
      <div className="flex items-center gap-2 border-b border-yellow-400/15 px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-yellow-200/80">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
        terminal dojo
      </div>

      <div className="flex-1 min-h-0 max-h-full px-3 py-3">
        <div
          ref={containerRef}
          className="h-full w-full rounded-md border border-yellow-400/20 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.08),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.07),transparent_40%),#0b0f19] shadow-inner"
        />
      </div>
    </div>
  );
}
