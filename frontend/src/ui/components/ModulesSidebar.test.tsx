import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LearningModule } from '@/features/learning/types';

import { ModulesSidebar } from './ModulesSidebar';

type StoreState = {
  modules: LearningModule[];
  expandedModuleId: string | null;
  activeLessonId: string | null;
  setActiveLesson: ReturnType<typeof vi.fn>;
  setExpandedModuleId: ReturnType<typeof vi.fn>;
  initialize: ReturnType<typeof vi.fn>;
  isBootstrapping: boolean;
};

const storeState: StoreState = {
  modules: [],
  expandedModuleId: null,
  activeLessonId: null,
  setActiveLesson: vi.fn(),
  setExpandedModuleId: vi.fn(),
  initialize: vi.fn().mockResolvedValue(undefined),
  isBootstrapping: false,
};

vi.mock('@/store/terminalSession', () => ({
  useTerminalSession: (selector: (state: StoreState) => unknown) => selector(storeState),
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
        status: 'active',
      },
    ],
  },
];

describe('ModulesSidebar', () => {
  beforeEach(() => {
    storeState.modules = modulesFixture;
    storeState.expandedModuleId = 'cmd-basics';
    storeState.activeLessonId = 'lesson-1';
    storeState.setActiveLesson = vi.fn();
    storeState.setExpandedModuleId = vi.fn();
    storeState.initialize = vi.fn().mockResolvedValue(undefined);
    storeState.isBootstrapping = false;
  });

  it('collapses an open module on the first click without logging React warnings', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ModulesSidebar />);

    await user.click(screen.getByRole('button', { name: /command line basics/i }));

    expect(storeState.setExpandedModuleId).toHaveBeenCalledWith(null);
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
