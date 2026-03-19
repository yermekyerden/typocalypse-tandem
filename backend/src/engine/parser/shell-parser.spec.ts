import { parseShellLine, splitShellSequence } from './shell-parser';
import { resolveCommandArgs } from '../resolver/path-resolver';

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

    it('splits chained commands by &&', () => {
      const result = splitShellSequence('mkdir practice_arena && cd practice_arena');

      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error(result.error.message);
      }

      expect(result.commands).toEqual(['mkdir practice_arena', 'cd practice_arena']);
    });

    it('does not split separators inside quotes', () => {
      const result = splitShellSequence('echo "A && B" && pwd');

      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error(result.error.message);
      }

      expect(result.commands).toEqual(['echo "A && B"', 'pwd']);
    });

    it('does not resolve echo text arguments as paths', () => {
      const resolved = resolveCommandArgs('echo', ['Keep learning every day'], '/home/student');

      expect(resolved).toEqual([
        {
          raw: 'Keep learning every day',
          resolved: 'Keep learning every day',
        },
      ]);
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
