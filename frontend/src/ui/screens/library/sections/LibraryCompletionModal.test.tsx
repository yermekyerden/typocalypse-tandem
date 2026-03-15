import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LibraryCompletionModal } from './LibraryCompletionModal';

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

describe('LibraryCompletionModal', () => {
  it('does not render when module is null', () => {
    render(<LibraryCompletionModal module={null} onAcknowledge={vi.fn()} />);

    expect(screen.queryByText('Module completed')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /continue learning/i }),
    ).not.toBeInTheDocument();
  });

  it('calls onAcknowledge when the continue button is clicked', async () => {
    const user = userEvent.setup();
    const onAcknowledge = vi.fn();

    render(
      <LibraryCompletionModal
        module={{
          id: 'module-1',
          title: 'Command Line Basics',
          description: 'Intro module',
          order: 1,
          lessons: [
            {
              id: 'lesson-1',
              title: 'First lesson',
              order: 1,
              status: 'completed',
              theory: 'Theory',
              task: 'Task',
              expectedCommand: 'ls',
            },
          ],
        }}
        onAcknowledge={onAcknowledge}
      />,
    );

    await user.click(screen.getByRole('button', { name: /continue learning/i }));

    expect(onAcknowledge).toHaveBeenCalledTimes(1);
  });
});
