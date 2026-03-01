import { createHashRouter } from 'react-router-dom';

import { AppShell } from '../ui/components/AppShell';
import { AuthScreen } from '../ui/screens/authentication/AuthScreen';
import { LibraryScreen } from '../ui/screens/library/LibraryScreen';
import { MissionRunScreen } from '../ui/screens/mission-run/MissionRunScreen';
import { ReplayScreen } from '../ui/screens/replay/ReplayScreen';
import { NotFoundScreen } from '../ui/screens/not-found/NotFoundScreen';

export function createAppRouter() {
  return createHashRouter([
    {
      path: '/auth',
      Component: AuthScreen,
    },
    {
      path: '/',
      Component: AppShell,
      children: [
        { index: true, Component: LibraryScreen },
        { path: 'missions/:missionId', Component: MissionRunScreen },
        { path: 'replays/:attemptId', Component: ReplayScreen },
        { path: '*', Component: NotFoundScreen },
      ],
    },
  ]);
}
