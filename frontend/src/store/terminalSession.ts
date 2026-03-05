import { create } from 'zustand';

import { modules as modulesSource, type Lesson, type Module } from '@/mocks/modules';
import {
  changeDirectory,
  createInitialFs,
  DEFAULT_CWD,
  listDirectory,
  makeDirectory,
  readFile,
  touchFile,
  type VirtualFileSystem,
} from '@/lib/virtualFs';

export type OutputKind = 'stdout' | 'stderr' | 'system';

export type OutputLine = {
  id: string;
  text: string;
  kind: OutputKind;
  lessonId?: string | null;
  timestamp: number;
};

type TerminalState = {
  modules: Module[];
  activeModuleId: string | null;
  activeLessonId: string | null;
  completedModuleId: string | null;
  cwd: string;
  fs: VirtualFileSystem;
  history: string[];
  output: OutputLine[];
  setActiveLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string) => void;
  unlockNextLesson: (lessonId: string) => void;
  pushOutput: (text: string, kind?: OutputKind, lessonId?: string) => void;
  runCommand: (input: string) => void;
  acknowledgeModuleCompletion: () => void;
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

function normalizeCommand(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function splitByAnd(value: string): string[] {
  return value
    .split('&&')
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function parseArgs(command: string): string[] {
  return command.split(' ').filter(Boolean);
}

function isLastLessonInModule(modules: Module[], lessonId: string | null): boolean {
  if (!lessonId) return false;
  const ownerModule = modules.find((module) =>
    module.lessons.some((lesson) => lesson.id === lessonId),
  );
  if (!ownerModule) return false;
  const idx = ownerModule.lessons.findIndex((lesson) => lesson.id === lessonId);
  return idx === ownerModule.lessons.length - 1;
}

function hasReadPermission(node: { permissions?: string | null }) {
  if (!node.permissions) return true;
  return /r/.test(node.permissions);
}

function executeCommand(
  args: string[],
  fs: VirtualFileSystem,
  cwd: string,
): { lines: OutputLine[]; fs?: VirtualFileSystem; cwd?: string; clear?: boolean } {
  const [command, ...rest] = args;
  const lines: OutputLine[] = [];

  const makeLine = (text: string, kind: OutputKind = 'stdout') =>
    createOutputLine(text, kind);

  switch (command) {
    case 'pwd': {
      lines.push(makeLine(cwd));
      return { lines };
    }

    case 'ls': {
      const includeHidden = rest.includes('-a');
      const target = rest.filter((part) => part !== '-a')[0] ?? '.';
      const result = listDirectory(fs, cwd, target, includeHidden);
      if (!result.ok) {
        lines.push(makeLine(result.error.message, 'stderr'));
        return { lines };
      }
      lines.push(makeLine(result.entries.join('  ')));
      return { lines };
    }

    case 'cd': {
      const target = rest[0] ?? '.';
      const result = changeDirectory(fs, cwd, target);
      if (!result.ok) {
        lines.push(makeLine(result.error.message, 'stderr'));
        return { lines };
      }
      return { lines, cwd: result.cwd };
    }

    case 'cat': {
      const target = rest[0];
      if (!target) {
        lines.push(makeLine('cat: missing file operand', 'stderr'));
        return { lines };
      }
      const result = readFile(fs, cwd, target);
      if (!result.ok) {
        if (result.error.kind === 'not-a-directory') {
          lines.push(makeLine(`${target}: Is a directory`, 'stderr'));
        } else if (result.error.kind === 'not-found') {
          lines.push(makeLine(`${target}: No such file or directory`, 'stderr'));
        } else if (result.error.kind === 'permission-denied') {
          lines.push(makeLine(`${target}: Permission denied`, 'stderr'));
        } else {
          lines.push(makeLine(result.error.message, 'stderr'));
        }
        return { lines };
      }
      if (!hasReadPermission(result)) {
        lines.push(makeLine(`${target}: Permission denied`, 'stderr'));
        return { lines };
      }
      lines.push(...result.content.split('\n').map((line) => makeLine(line)));
      return { lines };
    }

    case 'mkdir': {
      const target = rest[0];
      if (!target) {
        lines.push(makeLine('mkdir: missing operand', 'stderr'));
        return { lines };
      }
      const result = makeDirectory(fs, cwd, target);
      if (!result.ok) {
        if (result.error.kind === 'already-exists') {
          lines.push(makeLine(`mkdir: cannot create directory '${target}': File exists`, 'stderr'));
        } else {
          lines.push(makeLine(result.error.message, 'stderr'));
        }
        return { lines };
      }
      return { lines, fs: result.fs };
    }

    case 'touch': {
      const target = rest[0];
      if (!target) {
        lines.push(makeLine('touch: missing file operand', 'stderr'));
        return { lines };
      }
      const result = touchFile(fs, cwd, target);
      if (!result.ok) {
        lines.push(makeLine(result.error.message, 'stderr'));
        return { lines };
      }
      return { lines, fs: result.fs };
    }

    case 'clear': {
      return { lines: [], clear: true };
    }

    default: {
      lines.push(makeLine(`${command}: command not found`, 'stderr'));
      return { lines };
    }
  }
}

export const useTerminalSession = create<TerminalState>((set, get) => {
  const { modules, activeLessonId, activeModuleId } = normalizeModules(
    cloneModules(),
  );

  const initialData = {
    modules,
    activeModuleId,
    activeLessonId,
    completedModuleId: null,
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
      const state = get();
      const lines: OutputLine[] = [];
      const history = [...state.history, input];

      const prevModuleId = state.activeModuleId;

      const normalizedInput = normalizeCommand(input);
      const activeLesson =
        state.modules
          .flatMap((module) => module.lessons)
          .find((lesson) => lesson.id === state.activeLessonId) ?? null;

      const shouldComplete =
        activeLesson &&
        normalizeCommand(activeLesson.expectedCommand) === normalizedInput;
      const moduleCompleted =
        shouldComplete && isLastLessonInModule(state.modules, state.activeLessonId);

      const commandChunks = splitByAnd(normalizedInput);

      let nextFs = state.fs;
      let nextCwd = state.cwd;
      let shouldClear = false;

      lines.push(createOutputLine(`$ ${input}`, 'stdout', state.activeLessonId));

      for (const chunk of commandChunks) {
        const parsed = parseArgs(chunk);
        if (parsed.length === 0) continue;
        const execResult = executeCommand(parsed, nextFs, nextCwd);
        nextFs = execResult.fs ?? nextFs;
        nextCwd = execResult.cwd ?? nextCwd;
        shouldClear = shouldClear || Boolean(execResult.clear);
        lines.push(...execResult.lines.map((l) => ({ ...l, lessonId: state.activeLessonId })));
      }

      if (shouldComplete) {
        get().completeLesson(activeLesson!.id);
        if (activeLesson?.sampleOutput) {
          lines.push(createOutputLine(activeLesson.sampleOutput, 'stdout', activeLesson.id));
        }
      }

      const nextModuleId = get().activeModuleId;
      const moduleSwitched = shouldComplete && prevModuleId !== nextModuleId;
      const shouldResetTerminal = moduleCompleted || moduleSwitched || shouldClear;

      set((prev) => ({
        history: shouldResetTerminal ? [] : history,
        fs: nextFs,
        cwd: nextCwd,
        output: shouldResetTerminal ? [] : [...prev.output, ...lines],
        completedModuleId: moduleCompleted ? prevModuleId : prev.completedModuleId,
      }));
    },

    acknowledgeModuleCompletion: () =>
      set((state) => ({
        completedModuleId: null,
        output: state.output,
      })),

    resetSession: () => {
      const fresh = normalizeModules(cloneModules());
      set({
        ...initialData,
        modules: fresh.modules,
        activeLessonId: fresh.activeLessonId,
        activeModuleId: fresh.activeModuleId,
        completedModuleId: null,
        cwd: DEFAULT_CWD,
        fs: createInitialFs(),
        history: [],
        output: [],
      });
    },
  };
});
