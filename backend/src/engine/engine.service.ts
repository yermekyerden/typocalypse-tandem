import { Injectable } from '@nestjs/common';
import {
  BudgetExceededError,
  CommandExecution,
  EngineRunInput,
  EngineRunResult,
} from './engine.types';
import { MAX_INPUT_LENGTH } from './engine.constants';
import { parseShellLine, splitShellSequence } from './parser/shell-parser';
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
    const splitResult = splitShellSequence(inputLine);

    if (!splitResult.ok) {
      const emptyExecution: CommandExecution = {
        stdout: '',
        stderr: splitResult.error.message,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error: splitResult.error,
      };
      const validation = evaluate(checks, {
        vfsAfter: vfs,
        cwdAfter: cwd,
        stdout: '',
        stderr: splitResult.error.message,
        exitCode: 1,
      });
      return {
        stdout: '',
        stderr: splitResult.error.message,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        validation,
        trace: buildTrace({
          inputLine,
          parseOk: false,
          parseError: splitResult.error,
          cwdBefore: cwd,
          resolvedPaths: [],
          execution: emptyExecution,
          validation,
        }),
      };
    }

    let currentVfs = vfs;
    let currentCwd = cwd;
    let stdout = '';
    let stderr = '';
    let lastExecution: CommandExecution = {
      stdout: '',
      stderr: '',
      exitCode: 0,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
    };
    let lastResolvedPaths: ReturnType<typeof resolveArgs> = [];
    let lastParsedCommand = undefined;

    for (const commandInput of splitResult.commands) {
      const parseResult = parseShellLine(commandInput);

      if (!parseResult.ok) {
        const errorExecution: CommandExecution = {
          stdout: '',
          stderr: parseResult.error.message,
          exitCode: 1,
          vfsAfter: currentVfs,
          cwdAfter: currentCwd,
          effects: [],
          error: parseResult.error,
        };
        const validation = evaluate(checks, {
          vfsAfter: currentVfs,
          cwdAfter: currentCwd,
          stdout,
          stderr: stderr + parseResult.error.message,
          exitCode: 1,
        });

        return {
          stdout,
          stderr: stderr + parseResult.error.message,
          exitCode: 1,
          vfsAfter: currentVfs,
          cwdAfter: currentCwd,
          validation,
          trace: buildTrace({
            inputLine,
            parseOk: false,
            parseError: parseResult.error,
            cwdBefore: cwd,
            resolvedPaths: lastResolvedPaths,
            execution: errorExecution,
            validation,
          }),
        };
      }

      const { command } = parseResult;
      lastParsedCommand = command;

      // ── Step 3: Allowed commands check ───────────────────────────────────
      if (constraints.allowedCommands && !constraints.allowedCommands.includes(command.commandName)) {
        const error = {
          type: 'operation_not_allowed' as const,
          message: `Command not allowed: ${command.commandName}`,
          reason: `Allowed: ${constraints.allowedCommands.join(', ')}`,
        };
        const blockedExecution: CommandExecution = {
          stdout: '',
          stderr: error.message,
          exitCode: 1,
          vfsAfter: currentVfs,
          cwdAfter: currentCwd,
          effects: [],
          error,
        };
        const validation = evaluate(checks, {
          vfsAfter: currentVfs,
          cwdAfter: currentCwd,
          stdout,
          stderr: stderr + error.message,
          exitCode: 1,
        });
        return {
          stdout,
          stderr: stderr + error.message,
          exitCode: 1,
          vfsAfter: currentVfs,
          cwdAfter: currentCwd,
          validation,
          trace: buildTrace({
            inputLine,
            parseOk: true,
            parsedCommand: command,
            cwdBefore: cwd,
            resolvedPaths: [],
            execution: blockedExecution,
            validation,
          }),
        };
      }

      // ── Step 4: Resolve paths ────────────────────────────────────────────
      const resolved = resolveArgs(command.args, currentCwd);
      const resolvedArgValues = resolved.map((r) => r.resolved);
      lastResolvedPaths = resolved;

      // Also resolve redirect target if present
      const resolvedRedirectTarget = command.redirect
        ? resolvePath(currentCwd, command.redirect.target)
        : undefined;

      // ── Step 5: Dispatch to handler ──────────────────────────────────────
      let execution = dispatch(
        command.commandName,
        resolvedArgValues,
        currentVfs,
        currentCwd,
        makeConstraints(constraints, currentVfs.budgets),
      );

      // ── Step 5b: Apply redirect (echo > file / echo >> file) ─────────────
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

      stdout += execution.stdout;
      stderr += execution.stderr;
      currentVfs = execution.vfsAfter;
      currentCwd = execution.cwdAfter;
      lastExecution = execution;

      if (execution.exitCode !== 0) {
        break;
      }
    }

    // ── Step 6: Validate ───────────────────────────────────────────────────
    const validation = evaluate(checks, {
      vfsAfter: currentVfs,
      cwdAfter: currentCwd,
      stdout,
      stderr,
      exitCode: lastExecution.exitCode,
    });

    // ── Step 7: Build trace ────────────────────────────────────────────────
    const trace = buildTrace({
      inputLine,
      parseOk: true,
      ...(lastParsedCommand ? { parsedCommand: lastParsedCommand } : {}),
      cwdBefore: cwd,
      resolvedPaths: lastResolvedPaths,
      execution: lastExecution,
      validation,
    });

    return {
      stdout,
      stderr,
      exitCode: lastExecution.exitCode,
      vfsAfter: currentVfs,
      cwdAfter: currentCwd,
      validation,
      trace,
    };
  }
}
