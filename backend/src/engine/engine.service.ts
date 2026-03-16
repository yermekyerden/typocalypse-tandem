import { Injectable } from '@nestjs/common';
import {
  BudgetExceededError,
  CommandExecution,
  EngineRunInput,
  EngineRunResult,
  MAX_INPUT_LENGTH,
} from './engine.types';
import { parseShellLine } from './parser/shell-parser';
import { resolveArgs, resolvePath } from './resolver/path-resolver';
import { dispatch } from './commands/registry';
import { makeConstraints } from './commands/command-handler.types';
import { evaluate } from './validator/validator';
import { buildTrace } from './trace/trace-builder';
import { vfsWriteFile } from './vfs/vfs.service';

@Injectable()
export class EngineService {
  run(input: EngineRunInput): EngineRunResult {
    const { inputLine, vfs, cwd, checks, constraints } = input;

    // ── Step 1: Input length budget ────────────────────────────────────────
    if (inputLine.length > MAX_INPUT_LENGTH) {
      const error: BudgetExceededError = {
        type: 'budget_exceeded',
        message: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`,
        budget: 'max_input_length',
      };
      const emptyExecution: CommandExecution = {
        stdout: '',
        stderr: error.message,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error,
      };
      const validation = evaluate(checks, {
        vfsAfter: vfs,
        cwdAfter: cwd,
        stdout: '',
        stderr: error.message,
        exitCode: 1,
      });
      return {
        stdout: '',
        stderr: error.message,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        validation,
        trace: buildTrace({
          inputLine,
          parseOk: false,
          parseError: error,
          cwdBefore: cwd,
          resolvedPaths: [],
          execution: emptyExecution,
          validation,
          violatedBudget: 'max_input_length',
        }),
      };
    }

    // ── Step 2: Parse ──────────────────────────────────────────────────────
    const parseResult = parseShellLine(inputLine);

    if (!parseResult.ok) {
      const emptyExecution: CommandExecution = {
        stdout: '',
        stderr: parseResult.error.message,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error: parseResult.error,
      };
      const validation = evaluate(checks, {
        vfsAfter: vfs,
        cwdAfter: cwd,
        stdout: '',
        stderr: parseResult.error.message,
        exitCode: 1,
      });
      return {
        stdout: '',
        stderr: parseResult.error.message,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        validation,
        trace: buildTrace({
          inputLine,
          parseOk: false,
          parseError: parseResult.error,
          cwdBefore: cwd,
          resolvedPaths: [],
          execution: emptyExecution,
          validation,
        }),
      };
    }

    const { command } = parseResult;

    // ── Step 3: Allowed commands check ─────────────────────────────────────
    if (constraints.allowedCommands && !constraints.allowedCommands.includes(command.commandName)) {
      const error = {
        type: 'operation_not_allowed' as const,
        message: `Command not allowed: ${command.commandName}`,
        reason: `Allowed: ${constraints.allowedCommands.join(', ')}`,
      };
      const emptyExecution: CommandExecution = {
        stdout: '',
        stderr: error.message,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error,
      };
      const validation = evaluate(checks, {
        vfsAfter: vfs,
        cwdAfter: cwd,
        stdout: '',
        stderr: error.message,
        exitCode: 1,
      });
      return {
        stdout: '',
        stderr: error.message,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        validation,
        trace: buildTrace({
          inputLine,
          parseOk: true,
          parsedCommand: command,
          cwdBefore: cwd,
          resolvedPaths: [],
          execution: emptyExecution,
          validation,
        }),
      };
    }

    // ── Step 4: Resolve paths ──────────────────────────────────────────────
    const resolved = resolveArgs(command.args, cwd);
    const resolvedArgValues = resolved.map((r) => r.resolved);

    // Also resolve redirect target if present
    const resolvedRedirectTarget = command.redirect
      ? resolvePath(cwd, command.redirect.target)
      : undefined;

    // ── Step 5: Dispatch to handler ────────────────────────────────────────
    let execution = dispatch(
      command.commandName,
      resolvedArgValues,
      vfs,
      cwd,
      makeConstraints(constraints, vfs.budgets),
    );

    // ── Step 5b: Apply redirect (echo > file / echo >> file) ───────────────
    if (execution.exitCode === 0 && command.redirect && resolvedRedirectTarget) {
      const writeResult = vfsWriteFile(
        execution.vfsAfter,
        resolvedRedirectTarget,
        execution.stdout,
        command.redirect.type === 'append',
      );

      if ('type' in writeResult) {
        execution = {
          ...execution,
          stdout: '',
          stderr: `${resolvedRedirectTarget}: ${writeResult.message}`,
          exitCode: 1,
          error: writeResult,
        };
      } else {
        execution = {
          ...execution,
          stdout: '',
          vfsAfter: writeResult,
          effects: [
            ...execution.effects,
            {
              type: 'file_written' as const,
              path: resolvedRedirectTarget,
              bytesWritten: execution.stdout.length,
            },
          ],
        };
      }
    }

    // ── Step 6: Validate ───────────────────────────────────────────────────
    const validation = evaluate(checks, {
      vfsAfter: execution.vfsAfter,
      cwdAfter: execution.cwdAfter,
      stdout: execution.stdout,
      stderr: execution.stderr,
      exitCode: execution.exitCode,
    });

    // ── Step 7: Build trace ────────────────────────────────────────────────
    const trace = buildTrace({
      inputLine,
      parseOk: true,
      parsedCommand: command,
      cwdBefore: cwd,
      resolvedPaths: resolved,
      execution,
      validation,
    });

    return {
      stdout: execution.stdout,
      stderr: execution.stderr,
      exitCode: execution.exitCode,
      vfsAfter: execution.vfsAfter,
      cwdAfter: execution.cwdAfter,
      validation,
      trace,
    };
  }
}
