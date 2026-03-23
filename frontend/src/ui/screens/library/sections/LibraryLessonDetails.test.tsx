import { render, screen } from '@testing-library/react';
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
          title: 'List files',
          order: 1,
          status: 'active',
          theory: '',
          task: '',
          expectedCommand: 'ls',
        }}
      />,
    );

    expect(screen.getByText('Command Line Basics')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'List files' })).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.getByText('0/3 steps')).toBeInTheDocument();
  });
});
