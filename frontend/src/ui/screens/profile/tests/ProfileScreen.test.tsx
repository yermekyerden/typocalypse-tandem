import { render, screen } from '@testing-library/react';
import { ProfileScreen } from '../ProfileScreen';
import { userData } from '@/mocks/user-data';
import userEvent from '@testing-library/user-event';
import { modules } from '@/mocks/modules';
import { vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/authService';

vi.mock('@/api/authService', () => ({
  authService: {
    getMe: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
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
