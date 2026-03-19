import { useEffect } from 'react';

import type {
  LearningLessonDetail,
  LearningLessonView,
  LearningModule,
} from '@/features/learning/types';
import { useTerminalSession } from '@/store/terminalSession';

import { LibraryCompletionModal } from './sections/LibraryCompletionModal';
import { LibraryLessonDetails } from './sections/LibraryLessonDetails';
import { LibraryTerminalSection } from './sections/LibraryTerminalSection';

type LessonProgress = {
  completed: number;
  total: number;
};

function resolveCurrentModule(modules: LearningModule[], lessonId: string | null) {
  if (!lessonId) {
    return null;
  }

  return (
    modules.find((module) => module.lessons.some((lesson) => lesson.id === lessonId)) ??
    null
  );
}

function resolveCurrentLesson(
  module: LearningModule | null,
  lessonId: string | null,
  lessonDetailsById: Record<string, LearningLessonDetail>,
): LearningLessonView | null {
  if (!module || !lessonId) {
    return null;
  }

  const summary = module.lessons.find((lesson) => lesson.id === lessonId);
  if (!summary) {
    return null;
  }

  const detail = lessonDetailsById[lessonId];

  return {
    ...summary,
    theoryMarkdown: detail?.theoryMarkdown ?? '',
    taskDescription: detail?.taskDescription ?? '',
    hints: detail?.hints ?? [],
  };
}

function resolveLessonProgress(module: LearningModule | null): LessonProgress {
  if (!module) {
    return { completed: 0, total: 0 };
  }

  return {
    completed: module.lessons.filter((lesson) => lesson.status === 'completed').length,
    total: module.lessons.length,
  };
}

export function LibraryScreen() {
  const modules = useTerminalSession((s) => s.modules);
  const lessonDetailsById = useTerminalSession((s) => s.lessonDetailsById);
  const activeLessonId = useTerminalSession((s) => s.activeLessonId);
  const initialize = useTerminalSession((s) => s.initialize);
  const setActiveLesson = useTerminalSession((s) => s.setActiveLesson);
  const completedModuleId = useTerminalSession((s) => s.completedModuleId);
  const apiError = useTerminalSession((s) => s.apiError);
  const isBootstrapping = useTerminalSession((s) => s.isBootstrapping);
  const acknowledgeModuleCompletion = useTerminalSession(
    (s) => s.acknowledgeModuleCompletion,
  );

  const firstLessonId = modules[0]?.lessons[0]?.id ?? null;
  const currentLessonId = activeLessonId ?? firstLessonId;
  const currentModule = resolveCurrentModule(modules, currentLessonId);
  const currentLesson = resolveCurrentLesson(
    currentModule,
    currentLessonId,
    lessonDetailsById,
  );
  const currentProgress = resolveLessonProgress(currentModule);
  const completedModule =
    modules.find((module) => module.id === completedModuleId) ?? null;

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!activeLessonId && firstLessonId) {
      void setActiveLesson(firstLessonId);
    }
  }, [activeLessonId, firstLessonId, setActiveLesson]);

  return (
    <div className="flex flex-1 min-h-0 h-full flex-col gap-6 overflow-hidden bg-mist-950 text-yellow-50">
      {apiError ? (
        <div className="rounded border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {apiError}
        </div>
      ) : null}

      <LibraryTerminalSection />

      {currentLesson && currentModule && (
        <LibraryLessonDetails
          lesson={currentLesson}
          moduleTitle={currentModule.title}
          progress={currentProgress}
        />
      )}
      {!currentLesson && !isBootstrapping ? (
        <section className="rounded border border-yellow-400/20 bg-white/5 px-4 py-6 text-sm text-yellow-100/80">
          No lesson details available yet.
        </section>
      ) : null}
      <LibraryCompletionModal
        module={completedModule}
        onAcknowledge={acknowledgeModuleCompletion}
      />
    </div>
  );
}
