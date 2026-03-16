import { parseShellLine } from './shell-parser';

describe('ShellParser', () => {
  describe('happy paths', () => {
    it('parses a bare command', () => {
      const result = parseShellLine('pwd');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.command.commandName).toBe('pwd');
      expect(result.command.args).toEqual([]);
    });

    it('parses a command with arguments', () => {
      const result = parseShellLine('ls -a /home/dojo');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.command.commandName).toBe('ls');
      expect(result.command.args).toEqual(['-a', '/home/dojo']);
    });

    it('parses double-quoted argument', () => {
      const result = parseShellLine('echo "hello world"');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.command.args).toEqual(['hello world']);
    });

    it('parses single-quoted argument', () => {
      const result = parseShellLine("echo 'it works'");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.command.args).toEqual(['it works']);
    });

    it('parses overwrite redirect', () => {
      const result = parseShellLine('echo hello > file.txt');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.command.commandName).toBe('echo');
      expect(result.command.args).toEqual(['hello']);
      expect(result.command.redirect).toEqual({ type: 'overwrite', target: 'file.txt' });
    });

    it('parses append redirect', () => {
      const result = parseShellLine('echo more >> file.txt');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.command.redirect).toEqual({ type: 'append', target: 'file.txt' });
    });
  });

  describe('error cases', () => {
    it('returns error for empty input', () => {
      const result = parseShellLine('   ');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe('parse_error');
    });

    it('returns error for unterminated double quote', () => {
      const result = parseShellLine('echo "unterminated');
      expect(result.ok).toBe(false);
    });

    it('returns error for unterminated single quote', () => {
      const result = parseShellLine("echo 'unterminated");
      expect(result.ok).toBe(false);
    });
  });
});
