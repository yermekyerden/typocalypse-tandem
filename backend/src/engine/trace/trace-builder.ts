import { randomUUID } from 'crypto';
import {
  BudgetName,
  CommandExecution,
  EngineError,
  ExecutionTrace,
  ParsedCommand,
  ValidationResult,
} from '../engine.types';

export type TraceInput = {
  inputLine: string;
  parseOk: boolean;
  parsedCommand?: ParsedCommand;
  parseError?: EngineError;
  cwdBefore: string;
  resolvedPaths: Array<{ raw: string; resolved: string }>;
  execution: CommandExecution;
  validation: ValidationResult;
  violatedBudget?: BudgetName;
};

export function buildTrace(input: TraceInput): ExecutionTrace {
  return {
    traceId: randomUUID(),
    inputLine: input.inputLine,

    parse: {
      ok: input.parseOk,
      ...(input.parsedCommand
        ? {
            commandName: input.parsedCommand.commandName,
            args: input.parsedCommand.args,
          }
        : {}),
      ...(input.parseError ? { error: input.parseError } : {}),
    },

    resolve: {
      cwdBefore: input.cwdBefore,
      resolvedPaths: input.resolvedPaths,
    },

    execute: {
      exitCode: input.execution.exitCode,
      ...(input.execution.effects.length > 0 ? { effects: input.execution.effects } : {}),
      ...(input.execution.error ? { error: input.execution.error } : {}),
    },

    validate: {
      result: input.validation,
    },

    budgets: {
      ...(input.violatedBudget ? { violated: input.violatedBudget } : {}),
    },
  };
}
