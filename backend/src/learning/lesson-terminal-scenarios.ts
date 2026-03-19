import type { LessonAttemptScenario } from '../learning-content/learning-content.types';
import { cmdBasicsScenarios } from './lesson-terminal-scenarios/cmd-basics.scenarios';
import { fileOpsScenarios } from './lesson-terminal-scenarios/file-ops.scenarios';
import { fsBasicsScenarios } from './lesson-terminal-scenarios/fs-basics.scenarios';
import { permissionsScenarios } from './lesson-terminal-scenarios/permissions.scenarios';

const allLessonScenarios: Record<string, LessonAttemptScenario> = {
  ...cmdBasicsScenarios,
  ...fsBasicsScenarios,
  ...permissionsScenarios,
  ...fileOpsScenarios,
};

export function getLessonAttemptScenario(lessonId: string): LessonAttemptScenario | null {
  return allLessonScenarios[lessonId] ?? null;
}
