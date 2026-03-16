/**
 * Shared types for the engine pipeline.
 * These mirror the contracts doc types but are expressed as TypeScript
 * so the engine can import them without depending on the contracts doc itself.
 */

export type PosixPath = string;

// ── VFS ────────────────────────────────────────────────────────────────────

export type VfsDirNode = {
  type: 'dir';
  name: string;
  children: VfsNode[];
};

export type VfsFileNode = {
  type: 'file';
  name: string;
  content: string;
};

export type VfsNode = VfsDirNode | VfsFileNode;

export type VfsBudgets = {
  maxNodes: number;
  maxDepth: number;
  maxFileBytes: number;
};

export type VfsSnapshot = {
  root: VfsDirNode;
  budgets?: VfsBudgets;
};

export const DEFAULT_BUDGETS: VfsBudgets = {
  maxNodes: 200,
  maxDepth: 10,
  maxFileBytes: 65536,
};

export const MAX_INPUT_LENGTH = 4096;

// ── Engine errors ──────────────────────────────────────────────────────────

export type ParseError = {
  type: 'parse_error';
  message: string;
  position?: number;
};

export type UnknownCommandError = {
  type: 'unknown_command';
  message: string;
  commandName: string;
};

export type InvalidArgumentsError = {
  type: 'invalid_arguments';
  message: string;
  commandName: string;
};

export type PathNotFoundError = {
  type: 'path_not_found';
  message: string;
  path: PosixPath;
};

export type NotADirectoryError = {
  type: 'not_a_directory';
  message: string;
  path: PosixPath;
};

export type IsADirectoryError = {
  type: 'is_a_directory';
  message: string;
  path: PosixPath;
};

export type BudgetExceededError = {
  type: 'budget_exceeded';
  message: string;
  budget: BudgetName;
};

export type OperationNotAllowedError = {
  type: 'operation_not_allowed';
  message: string;
  reason: string;
};

export type EngineError =
  | ParseError
  | UnknownCommandError
  | InvalidArgumentsError
  | PathNotFoundError
  | NotADirectoryError
  | IsADirectoryError
  | BudgetExceededError
  | OperationNotAllowedError;

export type BudgetName =
  | 'max_input_length'
  | 'max_output_bytes'
  | 'max_output_lines'
  | 'max_vfs_nodes'
  | 'max_vfs_depth'
  | 'max_file_bytes'
  | 'max_iterations'
  | 'max_pipeline_stages';

// ── Trace effects ──────────────────────────────────────────────────────────

export type TraceEffect =
  | { type: 'cwd_changed'; from: PosixPath; to: PosixPath }
  | { type: 'node_created'; path: PosixPath; kind: 'file' | 'dir' }
  | { type: 'node_removed'; path: PosixPath }
  | { type: 'file_written'; path: PosixPath; bytesWritten: number };

// ── Command execution result ───────────────────────────────────────────────

export type CommandExecution = {
  stdout: string;
  stderr: string;
  exitCode: number;
  vfsAfter: VfsSnapshot;
  cwdAfter: PosixPath;
  effects: TraceEffect[];
  error?: EngineError;
};

// ── Parsed command ─────────────────────────────────────────────────────────

export type Redirect = {
  type: 'overwrite' | 'append';
  /** Target path token (not yet resolved). */
  target: string;
};

export type ParsedCommand = {
  commandName: string;
  args: string[];
  redirect?: Redirect;
};

// ── Validation ─────────────────────────────────────────────────────────────

export type CheckReport = {
  checkId: string;
  checkType: string;
  ok: boolean;
  message: string;
  details?: Record<string, unknown>;
};

export type ValidationOk = {
  type: 'validation_ok';
  completedAtUtc: string;
  reports: CheckReport[];
};

export type ValidationFailed = {
  type: 'validation_failed';
  failedAtUtc: string;
  failedCheckId: string;
  reports: CheckReport[];
};

export type ValidationResult = ValidationOk | ValidationFailed;

// ── Execution trace ────────────────────────────────────────────────────────

export type ExecutionTrace = {
  traceId: string;
  inputLine: string;

  parse: {
    ok: boolean;
    commandName?: string;
    args?: string[];
    error?: EngineError;
  };

  resolve: {
    cwdBefore: PosixPath;
    resolvedPaths: Array<{ raw: string; resolved: PosixPath }>;
  };

  execute: {
    exitCode: number;
    effects?: TraceEffect[];
    error?: EngineError;
  };

  validate: {
    result: ValidationResult;
  };

  budgets: {
    violated?: BudgetName;
  };
};

// ── Engine run result ──────────────────────────────────────────────────────

export type EngineRunInput = {
  inputLine: string;
  vfs: VfsSnapshot;
  cwd: PosixPath;
  checks: MissionCheck[];
  constraints: EngineConstraints;
};

export type EngineConstraints = {
  allowedCommands?: string[];
  budgets?: Partial<VfsBudgets>;
};

export type EngineRunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  vfsAfter: VfsSnapshot;
  cwdAfter: PosixPath;
  validation: ValidationResult;
  trace: ExecutionTrace;
};

// ── Mission check types (needed by Validator) ──────────────────────────────

export type MissionCheckBase = { id: string; failMessage?: string };

export type MissionCheck =
  | (MissionCheckBase & { type: 'cwd_is'; expectedPath: PosixPath })
  | (MissionCheckBase & { type: 'exit_code_is'; expectedExitCode: number })
  | (MissionCheckBase & { type: 'path_exists'; path: PosixPath; expectedKind?: 'file' | 'dir' })
  | (MissionCheckBase & { type: 'path_not_exists'; path: PosixPath })
  | (MissionCheckBase & {
      type: 'file_content_equals';
      path: PosixPath;
      expectedText: string;
      normalize?: { trim?: boolean; collapseWhitespace?: boolean; normalizeNewlines?: boolean };
    })
  | (MissionCheckBase & {
      type: 'file_content_matches';
      path: PosixPath;
      expected: { pattern: string; flags?: string };
      normalize?: { trim?: boolean; collapseWhitespace?: boolean; normalizeNewlines?: boolean };
    })
  | (MissionCheckBase & {
      type: 'output_contains';
      stream: 'stdout' | 'stderr' | 'both';
      text: string;
      normalize?: { trim?: boolean; collapseWhitespace?: boolean; normalizeNewlines?: boolean };
    })
  | (MissionCheckBase & {
      type: 'output_matches';
      stream: 'stdout' | 'stderr' | 'both';
      expected: { pattern: string; flags?: string };
      normalize?: { trim?: boolean; collapseWhitespace?: boolean; normalizeNewlines?: boolean };
    });
