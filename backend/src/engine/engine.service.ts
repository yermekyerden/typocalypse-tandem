import { Injectable } from '@nestjs/common';
import {
  BudgetExceededError,
  CommandExecution,
  EngineRunInput,
  EngineRunResult,
} from './engine.types';
import { MAX_INPUT_LENGTH } from './engine.constants';
import { parseCompoundInput } from './parser/shell-parser';
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

    // ── Step 2: Parse (compound) ───────────────────────────────────────────
    const parseResult = parseCompoundInput(inputLine);

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

    const { commands } = parseResult;

    // ── Steps 3–5b: Execute compound command chain ─────────────────────────
    // Each command runs with the VFS/cwd produced by the previous one.
    // For &&, a non-zero exit code stops the chain.
    let currentVfs = vfs;
    let currentCwd = cwd;
    let lastExecution: CommandExecution = {
      stdout: '',
      stderr: '',
      exitCode: 0,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
    };
    let lastCommand = commands[0];
    let lastResolved: Array<{ raw: string; resolved: string }> = [];

    for (const command of commands) {
      // ── Step 3: Allowed commands check ───────────────────────────────────
      if (
        constraints.allowedCommands &&
        !constraints.allowedCommands.includes(command.commandName)
      ) {
        const error = {
          type: 'operation_not_allowed' as const,
          message: `Command not allowed: ${command.commandName}`,
          reason: `Allowed: ${constraints.allowedCommands.join(', ')}`,
        };
        lastExecution = {
          stdout: '',
          stderr: error.message,
          exitCode: 1,
          vfsAfter: currentVfs,
          cwdAfter: currentCwd,
          effects: [],
          error,
        };
        lastCommand = command;
        lastResolved = [];
        break;
      }

      // ── Step 4: Resolve paths ─────────────────────────────────────────────
      // Some commands take non-path first args (mode for chmod, text for echo).
      // Those handlers resolve paths internally; pass raw args to avoid the
      // resolver treating "644" or "hello" as relative POSIX paths.
      const rawArgCommands = new Set(['echo', 'chmod']);
      const resolved = rawArgCommands.has(command.commandName)
        ? command.args.map((a) => ({ raw: a, resolved: a }))
        : resolveArgs(command.args, currentCwd);
      const argsForDispatch = rawArgCommands.has(command.commandName)
        ? command.args
        : resolved.map((r) => r.resolved);

      const resolvedRedirectTarget = command.redirect
        ? resolvePath(currentCwd, command.redirect.target)
        : undefined;

      // ── Step 5: Dispatch to handler ───────────────────────────────────────
      let execution = dispatch(
        command.commandName,
        argsForDispatch,
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

      lastExecution = execution;
      lastCommand = command;
      lastResolved = resolved;
      currentVfs = execution.vfsAfter;
      currentCwd = execution.cwdAfter;

      // Short-circuit: && requires left side to succeed
      if (execution.exitCode !== 0) {
        break;
      }
    }

    // ── Step 6: Validate ───────────────────────────────────────────────────
    const validation = evaluate(checks, {
      vfsAfter: lastExecution.vfsAfter,
      cwdAfter: lastExecution.cwdAfter,
      stdout: lastExecution.stdout,
      stderr: lastExecution.stderr,
      exitCode: lastExecution.exitCode,
    });

    // ── Step 7: Build trace ────────────────────────────────────────────────
    const trace = buildTrace({
      inputLine,
      parseOk: true,
      parsedCommand: lastCommand,
      cwdBefore: cwd,
      resolvedPaths: lastResolved,
      execution: lastExecution,
      validation,
    });

    return {
      stdout: lastExecution.stdout,
      stderr: lastExecution.stderr,
      exitCode: lastExecution.exitCode,
      vfsAfter: lastExecution.vfsAfter,
      cwdAfter: lastExecution.cwdAfter,
      validation,
      trace,
    };
  }
}
