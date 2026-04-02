import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LearningModule } from '@/features/learning/types';

const learningApiMocks = vi.hoisted(() => ({
  getLearningOverview: vi.fn(),
  getLessonById: vi.fn(),
}));

const attemptsApiMocks = vi.hoisted(() => ({
  abandonAttempt: vi.fn(),
  createAttempt: vi.fn(),
  submitCommand: vi.fn(),
}));

vi.mock('@/api/learning', () => ({
  getLearningOverview: learningApiMocks.getLearningOverview,
  getLessonById: learningApiMocks.getLessonById,
}));

vi.mock('@/api/attempts', () => ({
  abandonAttempt: attemptsApiMocks.abandonAttempt,
  createAttempt: attemptsApiMocks.createAttempt,
  submitCommand: attemptsApiMocks.submitCommand,
}));

import { useTerminalSession } from './terminalSession';

const completedOverviewModules: LearningModule[] = [
  {
    id: 'module-1',
    slug: 'module-1',
    title: 'Module 1',
    description: 'Completed module',
    order: 1,
    lessons: [
      {
        id: 'lesson-1',
        slug: 'lesson-1',
        title: 'Lesson 1',
        order: 1,
        status: 'completed',
      },
      {
        id: 'lesson-2',
        slug: 'lesson-2',
        title: 'Lesson 2',
        order: 2,
        status: 'completed',
      },
    ],
  },
];

describe('useTerminalSession.initialize', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useTerminalSession.setState({
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
  });

  it('preserves the backend all-completed state without inventing an active lesson', async () => {
    learningApiMocks.getLearningOverview.mockResolvedValue({
      modules: completedOverviewModules,
    });

    await useTerminalSession.getState().initialize();

    const state = useTerminalSession.getState();

    expect(learningApiMocks.getLearningOverview).toHaveBeenCalledTimes(1);
    expect(learningApiMocks.getLessonById).not.toHaveBeenCalled();
    expect(state.activeModuleId).toBeNull();
    expect(state.activeLessonId).toBeNull();
    expect(state.expandedModuleId).toBeNull();
    expect(state.modules).toEqual(completedOverviewModules);
    expect(
      state.modules[0]?.lessons.every((lesson) => lesson.status === 'completed'),
    ).toBe(true);
  });
});
