import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LibraryLessonDetails } from './LibraryLessonDetails';

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

describe('LibraryLessonDetails', () => {
  it('renders fallback placeholders for empty theory and task', () => {
    render(
      <LibraryLessonDetails
        moduleTitle="Command Line Basics"
        progress={{ completed: 0, total: 3 }}
        lesson={{
          id: 'lesson-1',
          slug: 'lesson-1',
          title: 'List files',
          order: 1,
          status: 'active',
          theoryMarkdown: '',
          taskDescription: '',
          hints: [],
        }}
      />,
    );

    expect(screen.getByText('Command Line Basics')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'List files' })).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.getByText('0/3 steps')).toBeInTheDocument();
  });

  it('keeps hints hidden until the spoiler is expanded', async () => {
    const user = userEvent.setup();

    render(
      <LibraryLessonDetails
        moduleTitle="Command Line Basics"
        progress={{ completed: 1, total: 3 }}
        lesson={{
          id: 'lesson-2',
          slug: 'lesson-2',
          title: 'Read a file',
          order: 2,
          status: 'active',
          theoryMarkdown: 'Use cat to print file content.',
          taskDescription: 'Read mission.txt.',
          hints: ['Try the cat command.'],
        }}
      />,
    );

    expect(screen.queryByText('Try the cat command.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hints' }));

    expect(screen.getByText('Try the cat command.')).toBeInTheDocument();
  });
});
