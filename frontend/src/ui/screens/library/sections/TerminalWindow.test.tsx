import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const terminalSessionMocks = vi.hoisted(() => ({
  output: [],
  cwd: '/home/student',
  runCommand: vi.fn(),
  history: [],
  isTerminalBusy: false,
}));

const terminalHarness = vi.hoisted(() => {
  let onDataHandler: ((data: string) => void) | null = null;

  class MockTerminal {
    write = vi.fn();
    writeln = vi.fn();
    open = vi.fn();
    loadAddon = vi.fn();
    focus = vi.fn();
    clear = vi.fn();
    dispose = vi.fn();

    onData(handler: (data: string) => void) {
      onDataHandler = handler;
      return {
        dispose: vi.fn(() => {
          onDataHandler = null;
        }),
      };
    }
  }

  class MockFitAddon {
    fit = vi.fn();
  }

  return {
    MockTerminal,
    MockFitAddon,
    emitData(data: string) {
      onDataHandler?.(data);
    },
    reset() {
      onDataHandler = null;
    },
  };
});

vi.mock('xterm', () => ({
  Terminal: terminalHarness.MockTerminal,
}));

vi.mock('xterm-addon-fit', () => ({
  FitAddon: terminalHarness.MockFitAddon,
}));

vi.mock('xterm/css/xterm.css', () => ({}));

vi.mock('@/store/terminalSession', () => ({
  useTerminalSession: (selector: (state: typeof terminalSessionMocks) => unknown) =>
    selector(terminalSessionMocks),
}));

import { TerminalWindow } from './TerminalWindow';

describe('TerminalWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    terminalHarness.reset();
    terminalSessionMocks.output = [];
    terminalSessionMocks.cwd = '/home/student';
    terminalSessionMocks.history = [];
    terminalSessionMocks.isTerminalBusy = false;
  });

  it('supports moving the cursor left and right within the current command', () => {
    render(<TerminalWindow />);

    terminalHarness.emitData('a');
    terminalHarness.emitData('c');
    terminalHarness.emitData('\u001b[D');
    terminalHarness.emitData('b');
    terminalHarness.emitData('\u001b[C');
    terminalHarness.emitData('d');
    terminalHarness.emitData('\r');

    expect(terminalSessionMocks.runCommand).toHaveBeenCalledWith('abcd');
  });
});
