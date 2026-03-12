import { useEffect } from 'react';

import { type Module, type Lesson } from '@/mocks/modules';
import { useTerminalSession } from '@/store/terminalSession';

import { LibraryCompletionModal } from './sections/LibraryCompletionModal';
import { LibraryLessonDetails } from './sections/LibraryLessonDetails';
import { LibraryTerminalSection } from './sections/LibraryTerminalSection';

type LessonProgress = {
  completed: number;
  total: number;
};

function resolveCurrentModule(modules: Module[], lessonId: string | null) {
  if (!lessonId) {
    return null;
  }

  return modules.find((module) => module.lessons.some((lesson) => lesson.id === lessonId)) ?? null;
}

function resolveCurrentLesson(module: Module | null, lessonId: string | null): Lesson | null {
  if (!module || !lessonId) {
    return null;
  }

  return module.lessons.find((lesson) => lesson.id === lessonId) ?? null;
}

function resolveLessonProgress(module: Module | null): LessonProgress {
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
  const activeLessonId = useTerminalSession((s) => s.activeLessonId);
  const setActiveLesson = useTerminalSession((s) => s.setActiveLesson);
  const completedModuleId = useTerminalSession((s) => s.completedModuleId);
  const acknowledgeModuleCompletion = useTerminalSession(
    (s) => s.acknowledgeModuleCompletion,
  );

  const firstLessonId = modules[0]?.lessons[0]?.id ?? null;
  const currentLessonId = activeLessonId ?? firstLessonId;
  const currentModule = resolveCurrentModule(modules, currentLessonId);
  const currentLesson = resolveCurrentLesson(currentModule, currentLessonId);
  const currentProgress = resolveLessonProgress(currentModule);
  const completedModule =
    modules.find((module) => module.id === completedModuleId) ?? null;

  useEffect(() => {
    if (!activeLessonId && firstLessonId) {
      setActiveLesson(firstLessonId);
    }
  }, [activeLessonId, firstLessonId, setActiveLesson]);

  return (
    <div className="flex flex-1 min-h-0 h-full flex-col gap-6 overflow-hidden bg-mist-950 text-yellow-50">
      <LibraryTerminalSection />

      {currentLesson && currentModule && (
        <LibraryLessonDetails
          lesson={currentLesson}
          moduleTitle={currentModule.title}
          progress={currentProgress}
        />
      )}

      <LibraryCompletionModal
        module={completedModule}
        onAcknowledge={acknowledgeModuleCompletion}
      />
    </div>
  );
}
