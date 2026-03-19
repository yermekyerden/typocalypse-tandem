import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LearningLessonDetail, LearningModule } from '@/features/learning/types';

import { LibraryScreen } from './LibraryScreen';

type StoreState = {
  modules: LearningModule[];
  lessonDetailsById: Record<string, LearningLessonDetail>;
  activeLessonId: string | null;
  completedModuleId: string | null;
  apiError: string | null;
  isBootstrapping: boolean;
  initialize: ReturnType<typeof vi.fn>;
  setActiveLesson: ReturnType<typeof vi.fn>;
  acknowledgeModuleCompletion: ReturnType<typeof vi.fn>;
};

const storeState: StoreState = {
  modules: [],
  lessonDetailsById: {},
  activeLessonId: null,
  completedModuleId: null,
  apiError: null,
  isBootstrapping: false,
  initialize: vi.fn(),
  setActiveLesson: vi.fn(),
  acknowledgeModuleCompletion: vi.fn(),
};

vi.mock('@/store/terminalSession', () => ({
  useTerminalSession: (selector: (state: StoreState) => unknown) => selector(storeState),
}));

vi.mock('@/ui/components/TerminalWindow', () => ({
  TerminalWindow: ({ className }: { className?: string }) => (
    <div data-testid="terminal-window" className={className}>
      terminal
    </div>
  ),
}));

vi.mock('@/ui/components/AchievementStars', () => ({
  AchievementStars: ({
    completed,
    total,
  }: {
    completed: number;
    total: number;
    className?: string;
    size?: number;
  }) => <div>{`stars:${completed}/${total}`}</div>,
}));

const modulesFixture: LearningModule[] = [
  {
    id: 'cmd-basics',
    slug: 'cmd-basics',
    title: 'Command Line Basics',
    description: 'Core shell basics',
    order: 1,
    lessons: [
      {
        id: 'lesson-1',
        slug: 'lesson-1',
        title: 'List files',
        order: 1,
        status: 'completed',
      },
      {
        id: 'lesson-2',
        slug: 'lesson-2',
        title: 'Read a file',
        order: 2,
        status: 'active',
      },
    ],
  },
];

describe('LibraryScreen', () => {
  beforeEach(() => {
    storeState.modules = modulesFixture;
    storeState.lessonDetailsById = {
      'lesson-1': {
        id: 'lesson-1',
        moduleId: 'cmd-basics',
        slug: 'lesson-1',
        title: 'List files',
        order: 1,
        theoryMarkdown: 'Use ls to inspect the current directory.',
        taskDescription: 'Print the contents of the current directory.',
      },
      'lesson-2': {
        id: 'lesson-2',
        moduleId: 'cmd-basics',
        slug: 'lesson-2',
        title: 'Read a file',
        order: 2,
        theoryMarkdown: 'Use cat to print file content.',
        taskDescription: 'Read mission.txt.',
      },
    };
    storeState.activeLessonId = null;
    storeState.completedModuleId = null;
    storeState.apiError = null;
    storeState.isBootstrapping = false;
    storeState.initialize = vi.fn();
    storeState.setActiveLesson = vi.fn();
    storeState.acknowledgeModuleCompletion = vi.fn();
  });

  it('selects the first lesson when there is no active lesson', () => {
    render(<LibraryScreen />);

    expect(storeState.setActiveLesson).toHaveBeenCalledWith('lesson-1');
  });

  it('renders details and progress for the active lesson', () => {
    storeState.activeLessonId = 'lesson-2';

    render(<LibraryScreen />);

    expect(
      screen.getByRole('heading', { name: 'Sandbox for completing tasks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Command Line Basics')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Read a file' })).toBeInTheDocument();
    expect(screen.getByText('Use cat to print file content.')).toBeInTheDocument();
    expect(screen.getByText('Read mission.txt.')).toBeInTheDocument();
    expect(screen.getByText('1/2 steps')).toBeInTheDocument();
  });
});
