import { CommandExecution, EngineConstraints, VfsBudgets, VfsSnapshot } from '../engine.types';
import { DEFAULT_BUDGETS } from '../engine.constants';

/** All constraints passed into every handler. */
export type HandlerConstraints = {
  allowedCommands?: string[];
  budgets: VfsBudgets;
};

/**
 * A command handler is a pure function. It receives resolved args (paths already
 * absolute), the current VFS snapshot, the current cwd, and constraints.
 * It returns a CommandExecution describing the outcome.
 */
export type CommandHandler = (
  args: string[],
  vfs: VfsSnapshot,
  cwd: string,
  constraints: HandlerConstraints,
) => CommandExecution;

export function makeConstraints(
  engineConstraints: EngineConstraints,
  snapshotBudgets?: VfsBudgets,
): HandlerConstraints {
  return {
    allowedCommands: engineConstraints.allowedCommands,
    budgets: {
      maxNodes:
        engineConstraints.budgets?.maxNodes ??
        snapshotBudgets?.maxNodes ??
        DEFAULT_BUDGETS.maxNodes,
      maxDepth:
        engineConstraints.budgets?.maxDepth ??
        snapshotBudgets?.maxDepth ??
        DEFAULT_BUDGETS.maxDepth,
      maxFileBytes:
        engineConstraints.budgets?.maxFileBytes ??
        snapshotBudgets?.maxFileBytes ??
        DEFAULT_BUDGETS.maxFileBytes,
    },
  };
}
