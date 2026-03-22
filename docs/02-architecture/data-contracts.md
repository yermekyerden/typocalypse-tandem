# Data Contracts (SSOT)

This document is the **single source of truth** for JSON contracts shared by:
- Frontend (React + TypeScript)
- Backend (NestJS)
- Database persistence model (via Prisma schema)

If Frontend and Backend disagree — **this document wins**.

---

## 0) Versioning

### contractsVersion
All API responses MUST include `contractsVersion`.

- Additive changes (new optional fields / new union variants): bump **patch**
- Breaking changes (rename/remove fields, meaning changes): bump **minor/major** + ADR

```ts
export const CONTRACTS_VERSION = "0.1.1" as const;
export type ContractsVersion = typeof CONTRACTS_VERSION;
````

---

## 1) General conventions

### JSON + naming

* JSON only (no custom serialization tricks)
* `camelCase` for field names
* Discriminated unions MUST use `type` as a discriminator

### Time

* All timestamps are ISO 8601 strings in UTC: `YYYY-MM-DDTHH:mm:ss.sssZ`

```ts
export type IsoDateTimeUtc = string;
```

### IDs

* IDs are UUID v4 strings

```ts
export type UserId = string;     // UUID v4
export type MissionId = string;  // UUID v4 (or stable slug, but pick ONE)
export type AttemptId = string;  // UUID v4
export type TraceId = string;    // UUID v4
```

### Paths

* POSIX-style paths (frontend-simulated)
* Use `/` separator
* Missions SHOULD use absolute paths

```ts
export type PosixPath = string;
```

---

## 2) API envelope and error shape

### Successful response envelope

```ts
export type ApiOk<T> = {
  ok: true;
  contractsVersion: ContractsVersion;
  serverTimeUtc: IsoDateTimeUtc;
  data: T;
};
```

### Error response envelope

```ts
export type ApiError = {
  ok: false;
  contractsVersion: ContractsVersion;
  serverTimeUtc: IsoDateTimeUtc;
  error: {
    httpStatus: number;
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type ApiErrorCode =
  | "validation_error"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "internal_error";
```

---

## 3) Mission contracts

### Difficulty / chapter

```ts
export type MissionDifficulty = "easy" | "medium" | "hard";
export type MissionChapterId = string; // e.g. "ch-01-basics"
```

### Mission list item (for Library)

```ts
export type MissionHeader = {
  id: MissionId;
  version: number; // increments when mission changes
  chapterId: MissionChapterId;

  title: string;
  difficulty: MissionDifficulty;
  estimatedMinutes: number;

  shortDescription: string;

  // Optional UX fields
  tags?: string[];
};
```

### Full mission (runtime)

```ts
export type Mission = {
  id: MissionId;
  version: number;
  chapterId: MissionChapterId;

  title: string;
  difficulty: MissionDifficulty;
  estimatedMinutes: number;

  descriptionMd: string; // markdown allowed; UI renders safely
  goalMd?: string;

  // Start state
  initialCwd: PosixPath;
  initialFs: VfsSnapshot;

  // Validation
  checks: MissionCheck[];
  hints: MissionHint[];

  // Optional constraints
  allowedCommands?: string[]; // e.g. ["pwd","ls","cd","mkdir"]
  maxStepsHint?: number;      // UX-only guidance, not a strict limiter
};
```

### Mission hints

```ts
export type MissionHint = {
  id: string;
  order: number;

  textMd: string;

  // Unlock rules
  unlockAfterAttempts?: number; // e.g. 2 means "show after 2 failed attempts"
  unlockAfterSeconds?: number;  // time spent in mission
};
```

---

## 4) Virtual File System snapshot (mission start)

### Snapshot root

```ts
export type VfsSnapshot = {
  root: VfsDirNode;

  // Optional per-mission budgets (if omitted, engine defaults apply)
  budgets?: VfsBudgets;
};

export type VfsBudgets = {
  maxNodes: number;
  maxDepth: number;
  maxFileBytes: number;
};
```

### Nodes

```ts
export type VfsMetadata = {
  owner?: string; // defaults to "student"
  group?: string; // defaults to "dojo"
  mode?: string;  // octal permission bits, e.g. "755" or "644"
};

export type VfsNode = VfsDirNode | VfsFileNode;

export type VfsDirNode = {
  type: "dir";
  name: string; // "/" root represented by name: ""
  children: VfsNode[];
  metadata?: VfsMetadata;
};

export type VfsFileNode = {
  type: "file";
  name: string;
  content: string; // bounded by budgets
  metadata?: VfsMetadata;
};
```

**Rules**

* `name` MUST NOT contain `/`
* Root is `type:"dir", name:""` (empty name)

---

## 5) Mission checks (discriminated unions)

### Common base

```ts
export type MissionCheckBase = {
  id: string;

  // Optional: UI text to show on failure (if engine does not provide a better one)
  failMessage?: string;
};
```

### Regex payload

```ts
export type RegexSpec = {
  pattern: string;
  flags?: string; // e.g. "i", "m"
};
```

### Check variants

```ts
export type MissionCheck =
  | CheckCwdIs
  | CheckExitCodeIs
  | CheckPathExists
  | CheckPathModeIs
  | CheckPathNotExists
  | CheckFileContentEquals
  | CheckFileContentMatches
  | CheckOutputContains
  | CheckOutputMatches;

export type CheckCwdIs = MissionCheckBase & {
  type: "cwd_is";
  expectedPath: PosixPath;
};

export type CheckExitCodeIs = MissionCheckBase & {
  type: "exit_code_is";
  expectedExitCode: number; // 0..255
};

export type CheckPathExists = MissionCheckBase & {
  type: "path_exists";
  path: PosixPath;
  expectedKind?: "file" | "dir"; // if omitted, any node kind passes
};

export type CheckPathModeIs = MissionCheckBase & {
  type: "path_mode_is";
  path: PosixPath;
  expectedMode: string; // octal permission bits, e.g. "600"
};

export type CheckPathNotExists = MissionCheckBase & {
  type: "path_not_exists";
  path: PosixPath;
};

export type CheckFileContentEquals = MissionCheckBase & {
  type: "file_content_equals";
  path: PosixPath;
  expectedText: string;
};

export type CheckFileContentMatches = MissionCheckBase & {
  type: "file_content_matches";
  path: PosixPath;
  expected: RegexSpec;
};

export type OutputStream = "stdout" | "stderr" | "both";

export type TextNormalization = {
  // Optional: additive, mission authors can ignore for MVP.
  trim?: boolean;
  collapseWhitespace?: boolean;
  normalizeNewlines?: boolean; // recommended default true
};

export type CheckFileContentEquals = MissionCheckBase & {
  type: "file_content_equals";
  path: PosixPath;
  expectedText: string;
  normalize?: TextNormalization;
};

export type CheckFileContentMatches = MissionCheckBase & {
  type: "file_content_matches";
  path: PosixPath;
  expected: RegexSpec;
  normalize?: TextNormalization;
};

export type CheckOutputContains = MissionCheckBase & {
  type: "output_contains";
  stream: OutputStream;
  text: string;
  normalize?: TextNormalization;
};

export type CheckOutputMatches = MissionCheckBase & {
  type: "output_matches";
  stream: OutputStream;
  expected: RegexSpec;
  normalize?: TextNormalization;
};
```

---

## 6) Engine results (Frontend Domain)

### Engine error (typed)

```ts
export type EngineError =
  | ParseError
  | UnknownCommandError
  | InvalidArgumentsError
  | PathNotFoundError
  | NotADirectoryError
  | IsADirectoryError
  | BudgetExceededError
  | OperationNotAllowedError;

export type ParseError = {
  type: "parse_error";
  message: string;
  position?: number;
};

export type UnknownCommandError = {
  type: "unknown_command";
  message: string;
  commandName: string;
};

export type InvalidArgumentsError = {
  type: "invalid_arguments";
  message: string;
  commandName: string;
};

export type PathNotFoundError = {
  type: "path_not_found";
  message: string;
  path: PosixPath;
};

export type NotADirectoryError = {
  type: "not_a_directory";
  message: string;
  path: PosixPath;
};

export type IsADirectoryError = {
  type: "is_a_directory";
  message: string;
  path: PosixPath;
};

export type BudgetExceededError = {
  type: "budget_exceeded";
  message: string;
  budget: BudgetName;
};

export type OperationNotAllowedError = {
  type: "operation_not_allowed";
  message: string;
  reason: string;
};

export type BudgetName =
  | "max_input_length"
  | "max_output_bytes"
  | "max_output_lines"
  | "max_vfs_nodes"
  | "max_vfs_depth"
  | "max_file_bytes"
  | "max_iterations"
  | "max_pipeline_stages";
```

### Command result (typed, no exceptions as control flow)

```ts
export type CommandResult = CommandOk | CommandFailed;

export type CommandOk = {
  type: "command_ok";
  traceId: TraceId;

  stdout: string;
  stderr: string;
  exitCode: number; // usually 0
};

export type CommandFailed = {
  type: "command_failed";
  traceId: TraceId;

  stdout: string;
  stderr: string;
  exitCode: number; // non-zero
  error: EngineError;
};
```

---

## 7) Validation results

### Check report

```ts
export type CheckReport = {
  checkId: string;
  checkType: MissionCheck["type"];
  ok: boolean;

  message: string; // human-readable, safe to show in UI
  details?: Record<string, unknown>;
};
```

### Validation union

```ts
export type ValidationResult = ValidationOk | ValidationFailed;

export type ValidationOk = {
  type: "validation_ok";
  completedAtUtc: IsoDateTimeUtc;
  reports: CheckReport[]; // can be empty, but recommended to include all as ok=true
};

export type ValidationFailed = {
  type: "validation_failed";
  failedAtUtc: IsoDateTimeUtc;

  failedCheckId: string;
  reports: CheckReport[]; // MUST include failed check report (ok=false)
};
```

---

## 8) Execution trace (Explain Mode)

Trace is produced and persisted by the backend engine on every command step.
Frontend receives the trace in `CommandStepResult` and uses it for Explain Mode rendering.

```ts
export type ExecutionTrace = {
  traceId: TraceId;
  inputLine: string;

  parse: {
    ok: boolean;
    commandName?: string;
    args?: string[];
    error?: EngineError; // parse_error only in practice
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

export type TraceEffect =
  | { type: "cwd_changed"; from: PosixPath; to: PosixPath }
  | { type: "node_created"; path: PosixPath; kind: "file" | "dir" }
  | { type: "node_removed"; path: PosixPath }
  | { type: "file_written"; path: PosixPath; bytesWritten: number };
```

---

## 9) Attempts and progress (Persistence)

Attempts are owned by authenticated users (JWT). The backend is the authoritative owner of
attempt state — `cwd`, VFS snapshot, status, and the immutable step log.

### Attempt status

```ts
export type AttemptStatus = "in_progress" | "completed" | "abandoned";
```

### Attempt detail (full attempt with steps, for restore)

```ts
export type AttemptTargetId = MissionId | `lesson:${string}`;

export type AttemptDetail = {
  attemptId: AttemptId;
  missionId: AttemptTargetId;
  missionVersion: number;
  status: AttemptStatus;
  currentCwd: PosixPath;
  startedAtUtc: IsoDateTimeUtc;
  updatedAtUtc: IsoDateTimeUtc;
  finishedAtUtc?: IsoDateTimeUtc;
  steps: AttemptStepSummary[];
};
```

### Attempt step summary (immutable log entry)

```ts
export type AttemptStepSummary = {
  stepIndex: number;
  inputLine: string;
  exitCode: number;
  validation: ValidationResult;
  trace: ExecutionTrace;
  createdAtUtc: IsoDateTimeUtc;
};
```

### Command step result (response to PATCH /attempts/:id/command)

```ts
export type CommandStepResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  cwdAfter: PosixPath;
  attemptStatus: AttemptStatus;
  validation: ValidationResult;
  trace: ExecutionTrace;
  progressChanged: boolean;
};
```

### Progress snapshot (server-derived from attempt table)

```ts
export type ProgressSnapshot = {
  updatedAtUtc: IsoDateTimeUtc;

  missions: Array<{
    missionId: MissionId;
    missionVersion: number;

    status: "not_started" | "in_progress" | "completed";

    attemptsCount: number;
    lastAttemptAtUtc?: IsoDateTimeUtc;

    bestAttemptId?: AttemptId;
    completedAtUtc?: IsoDateTimeUtc;
  }>;
};
```

### Learning curriculum contracts

```ts
export type LessonStatus = "locked" | "active" | "completed";

export type LearningLessonSummary = {
  id: string;
  slug: string;
  title: string;
  order: number;
  status: LessonStatus;
};

export type LearningModule = {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: LearningLessonSummary[];
};

export type LessonRuntime = {
  expectedCommand: string;
  expectedCwd?: PosixPath;
  sampleOutput?: string;
};

export type LearningLessonDetail = {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  order: number;
  theoryMarkdown: string;
  taskDescription: string;
  hints?: string[];
  runtime?: LessonRuntime;
};
```

---

## 10) Backend endpoints (contracts)

### `GET /api/version`

```ts
export type GetVersionResponse = ApiOk<{
  contractsVersion: ContractsVersion; // duplicated on purpose (easy debugging)
}>;
```

### `GET /api/missions`

Returns headers for Library.

```ts
export type GetMissionsResponse = ApiOk<{
  missions: MissionHeader[];
}>;
```

### `GET /api/missions/:id`

Returns full mission.

```ts
export type GetMissionByIdResponse = ApiOk<{
  mission: Mission;
}>;
```

### `POST /attempts`

Create a new in-progress attempt. Requires authentication (JWT).

```ts
export type PostAttemptsRequest = {
  // Exactly one of missionId / lessonId MUST be provided.
  missionId?: MissionId;
  lessonId?: string;
};

export type LessonAttemptHeader = {
  id: string;
  moduleId: string;
  title: string;
  order: number;
};

export type PostAttemptsResponse = ApiOk<
  | {
      attemptId: AttemptId;
      initialCwd: PosixPath;
      initialFs: VfsSnapshot;
      mission: MissionHeader;
    }
  | {
      attemptId: AttemptId;
      initialCwd: PosixPath;
      initialFs: VfsSnapshot;
      lesson: LessonAttemptHeader;
      runtime?: LessonRuntime;
    }
>;
```

### `GET /learning/overview`

Returns module and lesson overview for the curriculum. Requires authentication (JWT).

```ts
export type GetLearningOverviewResponse = ApiOk<{
  modules: LearningModule[];
}>;
```

### `GET /lessons/:id`

Returns full lesson detail content. Requires authentication (JWT).

```ts
export type GetLessonByIdResponse = ApiOk<{
  lesson: LearningLessonDetail;
}>;
```

### `GET /attempts/:id`

Restore attempt with full step log. Requires ownership (JWT).

```ts
export type GetAttemptResponse = ApiOk<{
  attempt: AttemptDetail;
}>;
```

### `PATCH /attempts/:id/command`

Execute one command in an in-progress attempt. Idempotent by `clientCommandId`. Requires ownership.
Returns 409 if attempt is already completed or abandoned.

```ts
export type PatchAttemptCommandRequest = {
  command: string;
  clientCommandId: string; // UUID generated by client per submission
};

export type PatchAttemptCommandResponse = ApiOk<CommandStepResult>;
```

### `PATCH /attempts/:id/abandon`

Mark an attempt as abandoned. Requires ownership.

```ts
export type PatchAttemptAbandonResponse = ApiOk<{
  attemptId: AttemptId;
  status: "abandoned";
}>;
```

### `GET /progress`

Returns derived progress for the current user (from JWT). No request body.

```ts
export type GetProgressResponse = ApiOk<{
  progress: ProgressSnapshot;
}>;
```

---

## 11) Minimal examples

### Example: MissionHeader

```json
{
  "id": "f2cbd6b1-2a2b-4b93-8c34-8a0c2a5f7c7b",
  "version": 1,
  "chapterId": "ch-01-basics",
  "title": "Create directories and files",
  "difficulty": "easy",
  "estimatedMinutes": 5,
  "shortDescription": "Use mkdir and touch to build a small structure."
}
```

### Example: ValidationFailed

```json
{
  "type": "validation_failed",
  "failedAtUtc": "2026-02-22T03:12:30.000Z",
  "failedCheckId": "check-02",
  "reports": [
    {
      "checkId": "check-01",
      "checkType": "path_exists",
      "ok": true,
      "message": "Directory /dojo exists."
    },
    {
      "checkId": "check-02",
      "checkType": "path_exists",
      "ok": false,
      "message": "Expected file /dojo/readme.txt to exist."
    }
  ]
}
```

---

## 12) Compatibility rules (strict)

* Never rename fields silently.
* Never change meaning of a field without bumping version + ADR.
* New union variants are allowed (clients must handle unknown variants safely).
* Add new fields as optional first, then make them required only in a breaking release.

---
