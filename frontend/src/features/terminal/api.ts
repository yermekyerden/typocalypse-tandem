import { apiRequest } from '@/lib/api';

export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';

export type ValidationReport = {
  checkId: string;
  checkType: string;
  ok: boolean;
  message: string;
  details?: Record<string, unknown>;
};

export type ValidationResult =
  | {
      type: 'validation_ok';
      completedAtUtc: string;
      reports: ValidationReport[];
    }
  | {
      type: 'validation_failed';
      failedAtUtc: string;
      failedCheckId: string;
      reports: ValidationReport[];
    };

export type AttemptCreateResponse = {
  attemptId: string;
  initialCwd: string;
  initialFs: unknown;
  mission: {
    id: string;
    version: number;
    chapterId: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedMinutes: number;
    shortDescription: string;
    tags?: string[];
  };
};

export type SubmitCommandResponse = {
  stdout: string;
  stderr: string;
  exitCode: number;
  cwdAfter: string;
  attemptStatus: AttemptStatus;
  validation: ValidationResult;
  trace: Record<string, unknown>;
  progressChanged: boolean;
};

export function createAttempt(missionId: string) {
  return apiRequest<AttemptCreateResponse>(
    '/attempts',
    {
      method: 'POST',
      body: JSON.stringify({ missionId }),
    },
    { requiresAuth: true },
  );
}

export function submitCommand(attemptId: string, command: string, clientCommandId: string) {
  return apiRequest<SubmitCommandResponse>(
    `/attempts/${attemptId}/command`,
    {
      method: 'PATCH',
      body: JSON.stringify({ command, clientCommandId }),
    },
    { requiresAuth: true },
  );
}

export function abandonAttempt(attemptId: string) {
  return apiRequest<{ attemptId: string; status: 'abandoned' }>(
    `/attempts/${attemptId}/abandon`,
    {
      method: 'PATCH',
    },
    { requiresAuth: true },
  );
}
