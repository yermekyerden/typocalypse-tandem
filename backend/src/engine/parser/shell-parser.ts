import { ParsedCommand, ParseError, Redirect } from '../engine.types';

export type ParseResult = { ok: true; command: ParsedCommand } | { ok: false; error: ParseError };

export type CompoundParseResult =
  | { ok: true; commands: ParsedCommand[] }
  | { ok: false; error: ParseError };

/**
 * Parses a compound shell input (commands joined by &&) into an ordered list
 * of ParsedCommands. Each sub-command is fully parsed including redirects.
 * Returns an error if any sub-command is malformed or empty.
 */
export function parseCompoundInput(input: string): CompoundParseResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { type: 'parse_error', message: 'Empty command.' } };
  }

  const tokensResult = tokenize(input);
  if (!tokensResult.ok) {
    return { ok: false, error: tokensResult.error };
  }

  const segments: string[][] = [];
  let segment: string[] = [];
  for (const token of tokensResult.tokens) {
    if (token === '&&') {
      segments.push(segment);
      segment = [];
    } else {
      segment.push(token);
    }
  }
  segments.push(segment);

  const commands: ParsedCommand[] = [];
  for (const seg of segments) {
    const { words, redirect } = extractRedirect(seg);
    if (words.length === 0) {
      return {
        ok: false,
        error: { type: 'parse_error', message: 'Empty command in && sequence.' },
      };
    }
    commands.push({
      commandName: words[0],
      args: words.slice(1),
      ...(redirect ? { redirect } : {}),
    });
  }

  return { ok: true, commands };
}

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

    if (ch === '&' && input[i + 1] === '&') {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      tokens.push('&&');
      i += 2;
      continue;
    }

    if (ch === '>') {
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
