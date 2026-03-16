import { render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { createAppRouter } from './compositionRoot';

function renderRoute(hash: string) {
  window.location.hash = hash;
  const router = createAppRouter();

  return render(<RouterProvider router={router} />);
}

describe('app routing', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('renders the mission run screen for a mission route', async () => {
    renderRoute('#/missions/mission-123');

    expect(
      await screen.findByRole('heading', { name: /mission run/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/mission-123/i)).toBeInTheDocument();
  });

  it('renders the replay screen for a replay route', async () => {
    renderRoute('#/replays/attempt-42');

    expect(await screen.findByRole('heading', { name: /replay/i })).toBeInTheDocument();
    expect(screen.getByText(/attempt-42/i)).toBeInTheDocument();
  });

  it('renders the not found screen for an unknown route', async () => {
    renderRoute('#/unknown-route');

    expect(await screen.findByRole('heading', { name: /404/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
  });
});
