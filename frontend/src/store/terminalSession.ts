import { create } from 'zustand';

import { modules as modulesSource, type Lesson, type Module } from '@/mocks/modules';
import {
  createInitialFs,
  DEFAULT_CWD,
  type VirtualFileSystem,
} from '@/lib/virtualFs';

export type OutputKind = 'stdout' | 'stderr' | 'system';

export type OutputLine = {
  id: string;
  text: string;
  kind: OutputKind;
  lessonId?: string;
  timestamp: number;
};

type TerminalState = {
  modules: Module[];
  activeModuleId: string | null;
  activeLessonId: string | null;
  cwd: string;
  fs: VirtualFileSystem;
  history: string[];
  output: OutputLine[];
  setActiveLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string) => void;
  unlockNextLesson: (lessonId: string) => void;
  pushOutput: (text: string, kind?: OutputKind, lessonId?: string) => void;
  runCommand: (input: string) => void;
  resetSession: () => void;
};

function cloneModules(): Module[] {
  return modulesSource.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => ({ ...lesson })),
  }));
}

function normalizeModules(modules: Module[]): {
  modules: Module[];
  activeModuleId: string | null;
  activeLessonId: string | null;
} {
  let activeFound = false;
  let activeModuleId: string | null = null;
  let activeLessonId: string | null = null;

  const normalized: Module[] = modules.map((module) => {
    const lessons: Lesson[] = module.lessons.map((lesson) => {
      if (lesson.status === 'active') {
        if (activeFound) {
          return { ...lesson, status: 'locked' };
        }
        activeFound = true;
        activeModuleId = module.id;
        activeLessonId = lesson.id;
        return lesson;
      }
      return lesson;
    });
    return { ...module, lessons };
  });

  if (!activeFound && normalized.length > 0) {
    const firstModule = normalized[0];
    const firstLesson = firstModule.lessons[0];
    if (firstLesson) {
      activeModuleId = firstModule.id;
      activeLessonId = firstLesson.id;
      firstLesson.status = 'active';
    }
  }

  return { modules: normalized, activeModuleId, activeLessonId };
}

function createOutputLine(
  text: string,
  kind: OutputKind,
  lessonId?: string,
): OutputLine {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    kind,
    lessonId,
    timestamp: Date.now(),
  };
}

function getNextLesson(
  modules: Module[],
  currentLessonId: string | null,
): { lesson: Module['lessons'][number]; moduleId: string } | null {
  for (const module of modules) {
    for (let i = 0; i < module.lessons.length; i += 1) {
      const lesson = module.lessons[i];
      if (lesson.id === currentLessonId) {
        const nextLesson = module.lessons[i + 1];
        if (nextLesson) {
          return { lesson: nextLesson, moduleId: module.id };
        }
        return null;
      }
    }
  }
  return null;
}

export const useTerminalSession = create<TerminalState>((set, get) => {
  const { modules, activeLessonId, activeModuleId } = normalizeModules(
    cloneModules(),
  );

  const initialData = {
    modules,
    activeModuleId,
    activeLessonId,
    cwd: DEFAULT_CWD,
    fs: createInitialFs(),
    history: [],
    output: [],
  };

  return {
    ...initialData,
    setActiveLesson: (lessonId: string) =>
      set((state) => {
        const updatedModules: Module[] = state.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map<Lesson>((lesson) => {
            if (lesson.id === lessonId) {
              return { ...lesson, status: lesson.status === 'completed' ? 'completed' : 'active' };
            }
            if (lesson.status === 'active') {
              return { ...lesson, status: 'locked' };
            }
            return lesson;
          }),
        }));

        const moduleOfLesson = updatedModules.find((mod) =>
          mod.lessons.some((lesson) => lesson.id === lessonId),
        );

        return {
          modules: updatedModules,
          activeLessonId: lessonId,
          activeModuleId: moduleOfLesson?.id ?? state.activeModuleId,
        };
      }),

    completeLesson: (lessonId: string) =>
      set((state) => {
        let nextLessonId: string | null = null;
        let nextModuleId: string | null = null;
        const updatedModules: Module[] = state.modules.map((module) => {
          const lessons: Lesson[] = module.lessons.map((lesson, index) => {
            if (lesson.id === lessonId) {
              nextLessonId = module.lessons[index + 1]?.id ?? null;
              nextModuleId = nextLessonId ? module.id : null;
              return { ...lesson, status: 'completed' };
            }
            return lesson;
          });

          if (nextLessonId) {
            return {
              ...module,
              lessons: lessons.map((lesson) =>
                lesson.id === nextLessonId ? { ...lesson, status: 'active' } : lesson,
              ),
            };
          }

          return { ...module, lessons };
        });

        if (!nextLessonId) {
          const acrossModules = getNextLesson(updatedModules, lessonId);
          nextLessonId = acrossModules?.lesson.id ?? null;
          nextModuleId = acrossModules?.moduleId ?? nextModuleId;
        }

        return {
          modules: updatedModules,
          activeLessonId: nextLessonId ?? state.activeLessonId,
          activeModuleId: nextModuleId ?? state.activeModuleId,
        };
      }),

    unlockNextLesson: (lessonId: string) =>
      set((state) => {
        let activatedNext: string | null = null;
        let activatedModule: string | null = null;
        const updatedModules: Module[] = state.modules.map((module) => {
          const currentIdx = module.lessons.findIndex((lesson) => lesson.id === lessonId);
          const next = currentIdx >= 0 ? module.lessons[currentIdx + 1] : null;

          if (next && next.status === 'locked') {
            activatedNext = next.id;
            activatedModule = module.id;
            return {
              ...module,
              lessons: module.lessons.map<Lesson>((lesson) =>
                lesson.id === next.id ? { ...lesson, status: 'active' } : lesson,
              ),
            };
          }

          return module;
        });

        return {
          modules: updatedModules,
          activeLessonId: activatedNext ?? state.activeLessonId,
          activeModuleId: activatedModule ?? state.activeModuleId,
        };
      }),

    pushOutput: (text: string, kind: OutputKind = 'stdout', lessonId?: string) =>
      set((state) => ({
        output: [...state.output, createOutputLine(text, kind, lessonId)],
      })),

    runCommand: (input: string) => {
      const pushOutput = get().pushOutput;

      pushOutput(`$ ${input}`, 'stdout');
      pushOutput('Command interpreter is not implemented yet.', 'system');

      set((state) => ({
        history: [...state.history, input],
      }));
    },

    resetSession: () => {
      const fresh = normalizeModules(cloneModules());
      set({
        ...initialData,
        modules: fresh.modules,
        activeLessonId: fresh.activeLessonId,
        activeModuleId: fresh.activeModuleId,
        cwd: DEFAULT_CWD,
        fs: createInitialFs(),
        history: [],
        output: [],
      });
    },
  };
});
