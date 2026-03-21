import { render, screen } from '@testing-library/react';
import { userData } from '@/mocks/user-data';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { ProfileScreen } from '../ProfileScreen';

vi.mock('../../dashboard/DashboardScreen', () => ({
  DashboardScreen: () => <div>Mocked dashboard content</div>,
}));

it('renders user data', () => {
  render(<ProfileScreen />);

  expect(screen.getByRole('heading', { name: userData.userName })).toBeInTheDocument();
  expect(screen.getByText(userData.login)).toBeInTheDocument();
  expect(screen.getByText(userData.email)).toBeInTheDocument();
});

it('switches to progress tab', async () => {
  render(<ProfileScreen />);

  await userEvent.click(screen.getByText('Progress'));

  expect(screen.getByText('Mocked dashboard content')).toBeInTheDocument();
});

it('prefills input with current value', async () => {
  render(<ProfileScreen />);

  await userEvent.click(screen.getAllByText('Edit')[0]);

  const input = screen.getByRole('textbox');

  expect(input).toHaveValue(userData.userName);
});
