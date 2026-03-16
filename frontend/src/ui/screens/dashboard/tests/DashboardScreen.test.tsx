import { render, screen } from '@testing-library/react';
import { DashboardScreen } from '../DashboardScreen';
import { modules } from '@/mocks/modules';
import userEvent from '@testing-library/user-event';

it('renders modules titles', () => {
  render(<DashboardScreen />);

  modules.forEach((module) => {
    expect(screen.getByText(module.title)).toBeInTheDocument();
  });
});

it('renders lessons when module opened', async () => {
  render(<DashboardScreen />);

  const trigger = screen.getByText(modules[0].title);

  await userEvent.click(trigger);

  modules[0].lessons.forEach((lesson) => {
    expect(screen.getByText(lesson.title)).toBeInTheDocument();
  });
});

it('opens accordion on click', async () => {
  render(<DashboardScreen />);

  const trigger = screen.getByText(modules[0].title);

  await userEvent.click(trigger);

  expect(screen.getByText(modules[0].lessons[0].title)).toBeVisible();
});
