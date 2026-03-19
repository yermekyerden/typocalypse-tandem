import { ParsedCommand, ParseError, Redirect } from '../engine.types';

export type ParseResult = { ok: true; command: ParsedCommand } | { ok: false; error: ParseError };
export type SplitSequenceResult =
  | { ok: true; commands: string[] }
  | { ok: false; error: ParseError };

/**
 * Tokenizes a shell input line into a command name, arguments, and an
 * optional output redirect (> or >>). Handles single and double quoted
 * strings; does NOT support pipes, subshells, or environment variables.
 */
export function parseShellLine(input: string): ParseResult {
  if (input.trim().length === 0) {
    return {
      ok: false,
      error: { type: 'parse_error', message: 'Empty command.' },
    };
  }

  const tokens = tokenize(input);
  if (!tokens.ok) {
    return { ok: false, error: tokens.error };
  }

  const { words, redirect } = extractRedirect(tokens.tokens);

  if (words.length === 0) {
    return {
      ok: false,
      error: { type: 'parse_error', message: 'No command found (only a redirect).' },
    };
  }

  return {
    ok: true,
    command: {
      commandName: words[0],
      args: words.slice(1),
      ...(redirect ? { redirect } : {}),
    },
  };
}

export function splitShellSequence(input: string): SplitSequenceResult {
  if (input.trim().length === 0) {
    return {
      ok: false,
      error: { type: 'parse_error', message: 'Empty command.' },
    };
  }

  const commands: string[] = [];
  let current = '';
  let i = 0;
  let quote: "'" | '"' | null = null;

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];

    if (quote) {
      current += ch;
      if (ch === quote) {
        quote = null;
      } else if (ch === '\\' && quote === '"' && next) {
        current += next;
        i += 1;
      }
      i += 1;
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      current += ch;
      i += 1;
      continue;
    }

    if ((ch === '&' && next === '&') || ch === ';' || ch === '\n') {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        commands.push(trimmed);
      }
      current = '';
      i += ch === '&' && next === '&' ? 2 : 1;
      continue;
    }

    current += ch;
    i += 1;
  }

  if (quote) {
    return {
      ok: false,
      error: {
        type: 'parse_error',
        message:
          quote === '"'
            ? 'Unterminated double-quoted string.'
            : 'Unterminated single-quoted string.',
      },
    };
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) {
    commands.push(trimmed);
  }

  if (commands.length === 0) {
    return {
      ok: false,
      error: { type: 'parse_error', message: 'Empty command.' },
    };
  }

  return { ok: true, commands };
}

// ── Tokenizer ──────────────────────────────────────────────────────────────

type TokenizeResult = { ok: true; tokens: string[] } | { ok: false; error: ParseError };

function tokenize(input: string): TokenizeResult {
  const tokens: string[] = [];
  let current = '';
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (ch === "'") {
      // Single-quoted: no escape processing inside
      i++;
      const start = i;
      while (i < input.length && input[i] !== "'") {
        i++;
      }
      if (i >= input.length) {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Unterminated single-quoted string.',
            position: start,
          },
        };
      }
      current += input.slice(start, i);
      i++; // skip closing quote
      continue;
    }

    if (ch === '"') {
      // Double-quoted: backslash escapes for \, ", $, `
      i++;
      const start = i;
      while (i < input.length && input[i] !== '"') {
        if (input[i] === '\\' && i + 1 < input.length) {
          const next = input[i + 1];
          if (next === '"' || next === '\\' || next === '$' || next === '`') {
            current += next;
            i += 2;
            continue;
          }
        }
        current += input[i];
        i++;
      }
      if (i >= input.length) {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Unterminated double-quoted string.',
            position: start,
          },
        };
      }
      i++; // skip closing quote
      continue;
    }

    if (ch === '>' || ch === '>>' || (ch === '>' && input[i + 1] === '>')) {
      // Redirect operators — handled as literal tokens
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      if (input[i + 1] === '>') {
        tokens.push('>>');
        i += 2;
      } else {
        tokens.push('>');
        i++;
      }
      continue;
    }

    if (ch === ' ' || ch === '\t') {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return { ok: true, tokens };
}

// ── Redirect extraction ────────────────────────────────────────────────────

function extractRedirect(tokens: string[]): { words: string[]; redirect?: Redirect } {
  const words: string[] = [];
  let redirect: Redirect | undefined;
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === '>>' || token === '>') {
      const target = tokens[i + 1];
      if (!target || target === '>' || target === '>>') {
        // Malformed redirect — treat as word to let the command fail naturally
        words.push(token);
        i++;
        continue;
      }
      redirect = { type: token === '>>' ? 'append' : 'overwrite', target };
      i += 2;
      continue;
    }

    words.push(token);
    i++;
  }

  return { words, redirect };
}
