import { create } from 'zustand';

import { getLearningOverview, getLessonById } from '@/api/learning';
import type {
  LearningLessonDetail,
  LearningLessonSummary,
  LearningModule,
} from '@/features/learning/types';
import {
  abandonAttempt,
  createAttempt,
  submitCommand,
  type AttemptStatus,
  type ValidationResult,
} from '@/api/attempts';
import { ApiError } from '@/api/client';

export type OutputKind = 'stdout' | 'stderr' | 'system';

export type OutputLine = {
  id: string;
  text: string;
  kind: OutputKind;
  lessonId?: string | null;
  timestamp: number;
};

type TerminalAttempt = {
  attemptId: string;
  lessonId: string;
  status: AttemptStatus;
};

type TerminalState = {
  modules: LearningModule[];
  activeModuleId: string | null;
  activeLessonId: string | null;
  expandedModuleId: string | null;
  completedModuleId: string | null;
  lessonDetailsById: Record<string, LearningLessonDetail>;
  apiError: string | null;
  isBootstrapping: boolean;
  isLessonLoading: boolean;
  isTerminalBusy: boolean;
  cwd: string;
  history: string[];
  output: OutputLine[];
  activeAttempt: TerminalAttempt | null;
  initialize: () => Promise<void>;
  setExpandedModuleId: (moduleId: string | null) => void;
  setActiveLesson: (lessonId: string) => Promise<void>;
  runCommand: (input: string) => Promise<void>;
  acknowledgeModuleCompletion: () => void;
  resetSession: () => Promise<void>;
};

function createOutputLine(
  text: string,
  kind: OutputKind,
  lessonId?: string | null,
): OutputLine {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    kind,
    lessonId,
    timestamp: Date.now(),
  };
}

function appendOutputLines(
  current: OutputLine[],
  text: string,
  kind: OutputKind,
  lessonId?: string | null,
) {
  if (text.length === 0) {
    return current;
  }

  const nextLines = text
    .split('\n')
    .map((line) => createOutputLine(line, kind, lessonId));
  return [...current, ...nextLines];
}

function normalizeModules(modules: LearningModule[]) {
  let activeModuleId: string | null = null;
  let activeLessonId: string | null = null;
  let activeFound = false;

  const normalizedModules = modules.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => {
      if (lesson.status === 'active' && !activeFound) {
        activeFound = true;
        activeModuleId = module.id;
        activeLessonId = lesson.id;
        return lesson;
      }

      if (lesson.status === 'active') {
        return { ...lesson, status: 'locked' as const };
      }

      return lesson;
    }),
  }));

  if (!activeFound) {
    const firstModule = normalizedModules[0];
    const firstLesson = firstModule?.lessons[0];

    if (firstModule && firstLesson) {
      activeModuleId = firstModule.id;
      activeLessonId = firstLesson.id;
      firstLesson.status = 'active';
    }
  }

  return {
    modules: normalizedModules,
    activeModuleId,
    activeLessonId,
  };
}

function findLessonSummary(modules: LearningModule[], lessonId: string | null) {
  if (!lessonId) {
    return null;
  }

  for (const module of modules) {
    const lesson = module.lessons.find((candidate) => candidate.id === lessonId);
    if (lesson) {
      return lesson;
    }
  }

  return null;
}

function findModuleByLessonId(modules: LearningModule[], lessonId: string | null) {
  if (!lessonId) {
    return null;
  }

  return (
    modules.find((module) => module.lessons.some((lesson) => lesson.id === lessonId)) ??
    null
  );
}

function getNextLesson(
  modules: LearningModule[],
  currentLessonId: string,
): { lesson: LearningLessonSummary; moduleId: string } | null {
  for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex += 1) {
    const module = modules[moduleIndex];
    for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex += 1) {
      const lesson = module.lessons[lessonIndex];
      if (lesson.id !== currentLessonId) {
        continue;
      }

      const sameModuleNext = module.lessons[lessonIndex + 1];
      if (sameModuleNext) {
        return { lesson: sameModuleNext, moduleId: module.id };
      }

      const nextModule = modules[moduleIndex + 1];
      const nextModuleLesson = nextModule?.lessons[0];
      if (nextModule && nextModuleLesson) {
        return { lesson: nextModuleLesson, moduleId: nextModule.id };
      }

      return null;
    }
  }

  return null;
}

function completeLesson(modules: LearningModule[], lessonId: string) {
  let completedModuleId: string | null = null;

  const withCompleted = modules.map((module) => {
    const lessons = module.lessons.map((lesson) =>
      lesson.id === lessonId ? { ...lesson, status: 'completed' as const } : lesson,
    );

    if (lessons.some((lesson) => lesson.id === lessonId)) {
      const allCompleted = lessons.every((lesson) => lesson.status === 'completed');
      if (allCompleted) {
        completedModuleId = module.id;
      }
    }

    return { ...module, lessons };
  });

  const next = getNextLesson(withCompleted, lessonId);
  const updatedModules = next
    ? withCompleted.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) =>
          lesson.id === next.lesson.id && lesson.status === 'locked'
            ? { ...lesson, status: 'active' as const }
            : lesson,
        ),
      }))
    : withCompleted;

  return {
    modules: updatedModules,
    nextLessonId: next?.lesson.id ?? null,
    nextModuleId: next?.moduleId ?? null,
    completedModuleId,
  };
}

function getReadableError(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected frontend error';
}

async function ensureLessonLoaded(lessonId: string) {
  const existing = useTerminalSession.getState().lessonDetailsById[lessonId];
  if (existing) {
    return existing;
  }

  useTerminalSession.setState({ isLessonLoading: true, apiError: null });

  try {
    const response = await getLessonById(lessonId);
    useTerminalSession.setState((state) => ({
      lessonDetailsById: {
        ...state.lessonDetailsById,
        [lessonId]: response.lesson,
      },
      isLessonLoading: false,
    }));
    return response.lesson;
  } catch (error) {
    useTerminalSession.setState({
      isLessonLoading: false,
      apiError: getReadableError(error),
    });
    throw error;
  }
}

async function ensureAttemptForLesson(lessonId: string) {
  const state = useTerminalSession.getState();

  if (
    state.activeAttempt &&
    state.activeAttempt.lessonId === lessonId &&
    state.activeAttempt.status === 'in_progress'
  ) {
    return state.activeAttempt;
  }

  const response = await createAttempt(lessonId);
  const nextAttempt: TerminalAttempt = {
    attemptId: response.attemptId,
    lessonId,
    status: 'in_progress',
  };

  useTerminalSession.setState((current) => ({
    activeAttempt: nextAttempt,
    cwd: response.initialCwd,
    output:
      current.output.length > 0
        ? current.output
        : [
            createOutputLine(
              `Connected lesson "${lessonId}" to backend terminal runtime.`,
              'system',
              lessonId,
            ),
          ],
  }));

  return nextAttempt;
}

function formatValidationMessage(validation: ValidationResult) {
  if (validation.type === 'validation_ok') {
    return 'Mission completed. The next lesson is unlocked locally in the frontend.';
  }

  const failedReport = validation.reports.find(
    (report) => report.checkId === validation.failedCheckId,
  );
  return (
    failedReport?.message ?? 'Command executed, but mission checks are not satisfied yet.'
  );
}

export const useTerminalSession = create<TerminalState>((set, get) => ({
  modules: [],
  activeModuleId: null,
  activeLessonId: null,
  expandedModuleId: null,
  completedModuleId: null,
  lessonDetailsById: {},
  apiError: null,
  isBootstrapping: false,
  isLessonLoading: false,
  isTerminalBusy: false,
  cwd: '~',
  history: [],
  output: [],
  activeAttempt: null,

  initialize: async () => {
    const state = get();
    if (state.isBootstrapping || state.modules.length > 0) {
      return;
    }

    set({
      isBootstrapping: true,
      apiError: null,
    });

    try {
      const overviewResponse = await getLearningOverview();
      const normalized = normalizeModules(overviewResponse.modules);

      set({
        modules: normalized.modules,
        activeModuleId: normalized.activeModuleId,
        activeLessonId: normalized.activeLessonId,
        expandedModuleId: normalized.activeModuleId,
        completedModuleId: null,
        cwd: '~',
        history: [],
        output: [],
        activeAttempt: null,
        isBootstrapping: false,
      });

      if (normalized.activeLessonId) {
        await ensureLessonLoaded(normalized.activeLessonId);
      }
    } catch (error) {
      set({
        isBootstrapping: false,
        apiError: getReadableError(error),
      });
    }
  },

  setExpandedModuleId: (moduleId) => set({ expandedModuleId: moduleId }),

  setActiveLesson: async (lessonId: string) => {
    const state = get();
    const targetLesson = findLessonSummary(state.modules, lessonId);
    if (!targetLesson || targetLesson.status === 'locked') {
      return;
    }

    const module = findModuleByLessonId(state.modules, lessonId);

    set({
      activeLessonId: lessonId,
      activeModuleId: module?.id ?? state.activeModuleId,
      expandedModuleId: module?.id ?? state.expandedModuleId,
      cwd: '~',
      history: [],
      output: [],
      activeAttempt: null,
      apiError: null,
    });

    try {
      await ensureLessonLoaded(lessonId);
    } catch {
      // Store already contains readable API error state.
    }
  },

  runCommand: async (input: string) => {
    const normalizedInput = input.trim();
    if (normalizedInput.length === 0) {
      return;
    }

    const state = get();
    const activeLessonId = state.activeLessonId;

    if (!activeLessonId) {
      set((current) => ({
        output: [
          ...current.output,
          createOutputLine(
            'No active lesson selected.',
            'system',
            current.activeLessonId,
          ),
        ],
      }));
      return;
    }

    set((current) => ({
      isTerminalBusy: true,
      apiError: null,
      history: [...current.history, input],
      output: [
        ...current.output,
        createOutputLine(`$ ${input}`, 'stdout', activeLessonId),
      ],
    }));

    try {
      await ensureLessonLoaded(activeLessonId);
      const attempt = await ensureAttemptForLesson(activeLessonId);
      const response = await submitCommand(
        attempt.attemptId,
        normalizedInput,
        crypto.randomUUID(),
      );

      set((current) => {
        let output = current.output;

        output = appendOutputLines(output, response.stdout, 'stdout', activeLessonId);
        output = appendOutputLines(output, response.stderr, 'stderr', activeLessonId);

        const validationMessage = formatValidationMessage(response.validation);
        if (validationMessage) {
          output = [
            ...output,
            createOutputLine(validationMessage, 'system', activeLessonId),
          ];
        }

        let modules = current.modules;
        let nextLessonId = current.activeLessonId;
        let nextModuleId = current.activeModuleId;
        let completedModuleId = current.completedModuleId;

        if (response.validation.type === 'validation_ok') {
          const completion = completeLesson(current.modules, activeLessonId);
          modules = completion.modules;
          nextLessonId = completion.nextLessonId ?? current.activeLessonId;
          nextModuleId = completion.nextModuleId ?? current.activeModuleId;
          completedModuleId = completion.completedModuleId ?? current.completedModuleId;
        }

        return {
          modules,
          activeLessonId: nextLessonId,
          activeModuleId: nextModuleId,
          expandedModuleId: nextModuleId ?? current.expandedModuleId,
          completedModuleId,
          cwd: response.cwdAfter,
          output,
          isTerminalBusy: false,
          activeAttempt: {
            ...attempt,
            status: response.attemptStatus,
          },
        };
      });

      const nextActiveLessonId = useTerminalSession.getState().activeLessonId;
      if (nextActiveLessonId && nextActiveLessonId !== activeLessonId) {
        await ensureLessonLoaded(nextActiveLessonId);
        useTerminalSession.setState({
          cwd: '~',
          history: [],
          output: [],
          activeAttempt: null,
        });
      }
    } catch (error) {
      const message = getReadableError(error);

      set((current) => ({
        isTerminalBusy: false,
        apiError: message,
        output: [
          ...current.output,
          createOutputLine(message, 'stderr', current.activeLessonId),
        ],
      }));
    }
  },

  acknowledgeModuleCompletion: () => set({ completedModuleId: null }),

  resetSession: async () => {
    const state = get();

    try {
      if (state.activeAttempt?.status === 'in_progress') {
        await abandonAttempt(state.activeAttempt.attemptId);
      }
    } catch {
      // Reset should stay resilient even if abandon fails.
    }

    set({
      modules: [],
      activeModuleId: null,
      activeLessonId: null,
      expandedModuleId: null,
      completedModuleId: null,
      lessonDetailsById: {},
      apiError: null,
      isBootstrapping: false,
      isLessonLoading: false,
      isTerminalBusy: false,
      cwd: '~',
      history: [],
      output: [],
      activeAttempt: null,
    });

    await get().initialize();
  },
}));
