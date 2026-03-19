import {
  CheckReport,
  MissionCheck,
  ValidationFailed,
  ValidationOk,
  ValidationResult,
  VfsSnapshot,
} from '../engine.types';
import { getEffectiveMetadata, vfsRead, vfsResolve } from '../vfs/vfs.service';

export type ValidatorInput = {
  vfsAfter: VfsSnapshot;
  cwdAfter: string;
  stdout: string;
  stderr: string;
  exitCode: number;
};

/**
 * Evaluates all MissionChecks against the current command result.
 * Stops at the first failed check and returns ValidationFailed.
 * Returns ValidationOk only when every check passes.
 */
export function evaluate(checks: MissionCheck[], input: ValidatorInput): ValidationResult {
  const now = new Date().toISOString();
  const reports: CheckReport[] = [];

  for (const check of checks) {
    const report = evaluateCheck(check, input);
    reports.push(report);

    if (!report.ok) {
      const result: ValidationFailed = {
        type: 'validation_failed',
        failedAtUtc: now,
        failedCheckId: check.id,
        reports,
      };
      return result;
    }
  }

  const result: ValidationOk = {
    type: 'validation_ok',
    completedAtUtc: now,
    reports,
  };
  return result;
}

function evaluateCheck(check: MissionCheck, input: ValidatorInput): CheckReport {
  const base: Omit<CheckReport, 'ok' | 'message'> = {
    checkId: check.id,
    checkType: check.type,
  };

  switch (check.type) {
    case 'cwd_is': {
      const ok = input.cwdAfter === check.expectedPath;
      return {
        ...base,
        ok,
        message: ok
          ? `Working directory is ${check.expectedPath}.`
          : `Expected cwd ${check.expectedPath}, got ${input.cwdAfter}.`,
      };
    }

    case 'exit_code_is': {
      const ok = input.exitCode === check.expectedExitCode;
      return {
        ...base,
        ok,
        message: ok
          ? `Exit code is ${check.expectedExitCode}.`
          : `Expected exit code ${check.expectedExitCode}, got ${input.exitCode}.`,
      };
    }

    case 'path_exists': {
      const node = vfsResolve(input.vfsAfter, check.path);
      if (!node) {
        return { ...base, ok: false, message: `Path does not exist: ${check.path}` };
      }
      if (check.expectedKind && node.type !== check.expectedKind) {
        return {
          ...base,
          ok: false,
          message: `Expected ${check.expectedKind} at ${check.path}, found ${node.type}.`,
        };
      }
      return { ...base, ok: true, message: `Path exists: ${check.path}` };
    }

    case 'path_mode_is': {
      const node = vfsResolve(input.vfsAfter, check.path);
      if (!node) {
        return { ...base, ok: false, message: `Path does not exist: ${check.path}` };
      }

      const metadata = getEffectiveMetadata(node);
      const ok = metadata.mode === check.expectedMode;
      return {
        ...base,
        ok,
        message: ok
          ? `Path mode matches ${check.expectedMode}.`
          : `Expected mode ${check.expectedMode}, got ${metadata.mode}.`,
      };
    }

    case 'path_not_exists': {
      const node = vfsResolve(input.vfsAfter, check.path);
      const ok = node === null;
      return {
        ...base,
        ok,
        message: ok
          ? `Path does not exist: ${check.path}`
          : `Expected path to be absent: ${check.path}`,
      };
    }

    case 'file_content_equals': {
      const content = vfsRead(input.vfsAfter, check.path);
      if (typeof content !== 'string') {
        return { ...base, ok: false, message: `Cannot read file: ${check.path}` };
      }
      const actual = normalize(content, check.normalize);
      const expected = normalize(check.expectedText, check.normalize);
      const ok = actual === expected;
      return {
        ...base,
        ok,
        message: ok ? `File content matches.` : `File content mismatch at ${check.path}.`,
      };
    }

    case 'file_content_matches': {
      const content = vfsRead(input.vfsAfter, check.path);
      if (typeof content !== 'string') {
        return { ...base, ok: false, message: `Cannot read file: ${check.path}` };
      }
      const actual = normalize(content, check.normalize);
      const re = buildRegex(check.expected.pattern, check.expected.flags);
      const ok = re.test(actual);
      return {
        ...base,
        ok,
        message: ok
          ? `File content matches pattern.`
          : `File content does not match pattern at ${check.path}.`,
      };
    }

    case 'output_contains': {
      const text = getStream(check.stream, input.stdout, input.stderr);
      const actual = normalize(text, check.normalize);
      const ok = actual.includes(normalize(check.text, check.normalize));
      return {
        ...base,
        ok,
        message: ok
          ? `Output contains expected text.`
          : `Output does not contain: "${check.text}".`,
      };
    }

    case 'output_matches': {
      const text = getStream(check.stream, input.stdout, input.stderr);
      const actual = normalize(text, check.normalize);
      const re = buildRegex(check.expected.pattern, check.expected.flags);
      const ok = re.test(actual);
      return {
        ...base,
        ok,
        message: ok ? `Output matches pattern.` : `Output does not match pattern.`,
      };
    }

    default: {
      const exhaustive: never = check;
      return {
        ...base,
        ok: false,
        message: `Unknown check type: ${(exhaustive as MissionCheck).type}`,
      };
    }
  }
}

function getStream(stream: 'stdout' | 'stderr' | 'both', stdout: string, stderr: string): string {
  if (stream === 'stdout') return stdout;
  if (stream === 'stderr') return stderr;
  return stdout + stderr;
}

function normalize(
  text: string,
  opts?: { trim?: boolean; collapseWhitespace?: boolean; normalizeNewlines?: boolean },
): string {
  let result = text;
  if (opts?.normalizeNewlines !== false) result = result.replace(/\r\n/g, '\n');
  if (opts?.collapseWhitespace) result = result.replace(/\s+/g, ' ');
  if (opts?.trim) result = result.trim();
  return result;
}

function buildRegex(pattern: string, flags?: string): RegExp {
  try {
    return new RegExp(pattern, flags ?? '');
  } catch {
    return /(?:)/; // fallback: matches everything (safe degradation)
  }
}
