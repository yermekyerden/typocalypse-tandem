import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';

import type { LearningModule } from '@/features/learning/types';
import { DashboardScreen } from '../DashboardScreen';
import userEvent from '@testing-library/user-event';

type StoreState = {
  modules: LearningModule[];
  initialize: ReturnType<typeof vi.fn>;
};

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
        status: 'locked',
      },
      {
        id: 'lesson-2',
        slug: 'lesson-2',
        title: 'Read mission.txt',
        order: 2,
        status: 'locked',
      },
    ],
  },
];

const storeState: StoreState = {
  modules: modulesFixture,
  initialize: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/store/terminalSession', () => ({
  useTerminalSession: (selector: (state: StoreState) => unknown) => selector(storeState),
}));

beforeEach(() => {
  storeState.modules = modulesFixture;
  storeState.initialize = vi.fn().mockResolvedValue(undefined);
});

it('renders modules titles', () => {
  render(<DashboardScreen />);

  modulesFixture.forEach((module) => {
    expect(screen.getByText(module.title)).toBeInTheDocument();
  });
});

it('renders lessons when module opened', async () => {
  render(<DashboardScreen />);

  const trigger = screen.getByText(modulesFixture[0].title);

  await userEvent.click(trigger);

  modulesFixture[0].lessons.forEach((lesson) => {
    expect(screen.getByText(lesson.title)).toBeInTheDocument();
  });
});

it('opens accordion on click', async () => {
  render(<DashboardScreen />);

  const trigger = screen.getByText(modulesFixture[0].title);

  await userEvent.click(trigger);
  await new Promise((resolve) => setTimeout(resolve, 100));

  await waitFor(
    () => {
      const lessonElement = screen.getByText(modulesFixture[0].lessons[0].title);
      expect(lessonElement).toBeVisible();
    },
    { timeout: 3000 },
  );
});
