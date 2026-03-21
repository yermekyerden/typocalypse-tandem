import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import type { LearningModule } from '@/features/learning/types';

import { DashboardScreen } from '../DashboardScreen';

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

vi.mock('@/store/terminalSession', () => ({
  useTerminalSession: (selector: (state: { modules: LearningModule[] }) => unknown) =>
    selector({ modules: modulesFixture }),
}));

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

  expect(screen.getByText(modulesFixture[0].lessons[0].title)).toBeVisible();
});
