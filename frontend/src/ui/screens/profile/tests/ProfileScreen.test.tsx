import { render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';

import type { LearningModule } from '@/features/learning/types';
import { ProfileScreen } from '../ProfileScreen';
import userEvent from '@testing-library/user-event';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/authService';

const userData = {
  userName: 'Ivan Petrov',
  login: 'ivan.petrov',
  email: 'ivan@example.com',
  firstName: 'Ivan',
  lastName: 'Petrov',
};

const modules: LearningModule[] = [
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
    ],
  },
];

vi.mock('@/api/authService', () => ({
  authService: {
    getMe: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));

vi.mock('@/store/terminalSession', () => ({
  useTerminalSession: (
    selector: (state: { modules: LearningModule[]; initialize: () => Promise<void> }) => unknown,
  ) =>
    selector({
      modules,
      initialize: vi.fn().mockResolvedValue(undefined),
    }),
}));

beforeEach(() => {
  vi.mocked(authService.getMe).mockResolvedValue({
    id: '1',
    username: userData.login,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
  });
  useAuthStore.setState({
    user: {
      id: '1',
      username: userData.login,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    isLoading: false,
    error: null,
  });
});

it('renders user data', () => {
  render(<ProfileScreen />);

  expect(screen.getByRole('heading', { name: userData.userName })).toBeInTheDocument();
  expect(screen.getByText(userData.login)).toBeInTheDocument();
  expect(screen.getByText(userData.email)).toBeInTheDocument();
});

it('switches to progress tab', async () => {
  render(<ProfileScreen />);

  await userEvent.click(screen.getByText('Progress'));

  expect(screen.getByText(modules[0].title)).toBeInTheDocument();
});

it('prefills input with current value', async () => {
  render(<ProfileScreen />);

  await userEvent.click(screen.getAllByText('Edit')[0]);

  const input = screen.getByRole('textbox');

  expect(input).toHaveValue(userData.firstName);
});
