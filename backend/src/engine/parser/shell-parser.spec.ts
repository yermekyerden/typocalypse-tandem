import { parseShellLine, parseCompoundInput } from './shell-parser';

function expectParseSuccess(result: ReturnType<typeof parseShellLine>) {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(`Expected parse success, got: ${result.error.message}`);
  }
  return result.command;
}

function expectParseFailure(result: ReturnType<typeof parseShellLine>) {
  expect(result.ok).toBe(false);
  if (result.ok) {
    throw new Error(`Expected parse failure, got: ${result.command.commandName}`);
  }
  return result.error;
}

function expectCompoundSuccess(result: ReturnType<typeof parseCompoundInput>) {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(`Expected compound parse success, got: ${result.error.message}`);
  }
  return result.commands;
}

function expectCompoundFailure(result: ReturnType<typeof parseCompoundInput>) {
  expect(result.ok).toBe(false);
  if (result.ok) {
    throw new Error(`Expected compound parse failure, got commands: ${result.commands.length}`);
  }
  return result.error;
}

describe('ShellParser', () => {
  describe('happy paths', () => {
    it('parses a bare command', () => {
      const command = expectParseSuccess(parseShellLine('pwd'));

      expect(command.commandName).toBe('pwd');
      expect(command.args).toEqual([]);
    });

    it('parses a command with arguments', () => {
      const command = expectParseSuccess(parseShellLine('ls -a /home/dojo'));

      expect(command.commandName).toBe('ls');
      expect(command.args).toEqual(['-a', '/home/dojo']);
    });

    it('parses double-quoted argument', () => {
      const command = expectParseSuccess(parseShellLine('echo "hello world"'));

      expect(command.args).toEqual(['hello world']);
    });

    it('parses single-quoted argument', () => {
      const command = expectParseSuccess(parseShellLine("echo 'it works'"));

      expect(command.args).toEqual(['it works']);
    });

    it('parses overwrite redirect', () => {
      const command = expectParseSuccess(parseShellLine('echo hello > file.txt'));

      expect(command.commandName).toBe('echo');
      expect(command.args).toEqual(['hello']);
      expect(command.redirect).toEqual({ type: 'overwrite', target: 'file.txt' });
    });

    it('parses append redirect', () => {
      const command = expectParseSuccess(parseShellLine('echo more >> file.txt'));

      expect(command.redirect).toEqual({ type: 'append', target: 'file.txt' });
    });
  });

  describe('parseCompoundInput', () => {
    it('parses a single command as a one-element array', () => {
      const commands = expectCompoundSuccess(parseCompoundInput('pwd'));

      expect(commands).toHaveLength(1);
      expect(commands[0].commandName).toBe('pwd');
    });

    it('parses two commands joined by &&', () => {
      const commands = expectCompoundSuccess(parseCompoundInput('mkdir x && cd x'));

      expect(commands).toHaveLength(2);
      expect(commands[0].commandName).toBe('mkdir');
      expect(commands[0].args).toEqual(['x']);
      expect(commands[1].commandName).toBe('cd');
      expect(commands[1].args).toEqual(['x']);
    });

    it('parses three commands in sequence', () => {
      const commands = expectCompoundSuccess(parseCompoundInput('mkdir a && mkdir b && ls'));

      expect(commands).toHaveLength(3);
      expect(commands[0].commandName).toBe('mkdir');
      expect(commands[1].commandName).toBe('mkdir');
      expect(commands[2].commandName).toBe('ls');
    });

    it('preserves redirect in the last command of a chain', () => {
      const commands = expectCompoundSuccess(parseCompoundInput('echo hi && echo hello > out.txt'));

      expect(commands).toHaveLength(2);
      expect(commands[1].redirect).toEqual({ type: 'overwrite', target: 'out.txt' });
    });

    it('does not split on && inside double quotes', () => {
      const commands = expectCompoundSuccess(parseCompoundInput('echo "foo && bar"'));

      expect(commands).toHaveLength(1);
      expect(commands[0].args).toEqual(['foo && bar']);
    });

    it('returns error for empty input', () => {
      const error = expectCompoundFailure(parseCompoundInput('   '));

      expect(error.type).toBe('parse_error');
    });

    it('returns error for && with empty left-hand side', () => {
      const error = expectCompoundFailure(parseCompoundInput('&& cd x'));

      expect(error.type).toBe('parse_error');
    });

    it('returns error for && with empty right-hand side', () => {
      const error = expectCompoundFailure(parseCompoundInput('cd x &&'));

      expect(error.type).toBe('parse_error');
    });
  });

  describe('error cases', () => {
    it('returns error for empty input', () => {
      const error = expectParseFailure(parseShellLine('   '));

      expect(error.type).toBe('parse_error');
    });

    it('returns error for unterminated double quote', () => {
      const error = expectParseFailure(parseShellLine('echo "unterminated'));

      expect(error.type).toBe('parse_error');
    });

    it('returns error for unterminated single quote', () => {
      const error = expectParseFailure(parseShellLine("echo 'unterminated"));

      expect(error.type).toBe('parse_error');
    });
  });
});
