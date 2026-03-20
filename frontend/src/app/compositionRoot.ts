import { createHashRouter } from 'react-router-dom';

import { AppShell } from '../ui/components/AppShell';
import { LearningLayout } from '../ui/components/LearningLayout';
import { LibraryScreen } from '../ui/screens/library/LibraryScreen';
import { MissionRunScreen } from '../ui/screens/mission-run/MissionRunScreen';
import { ReplayScreen } from '../ui/screens/replay/ReplayScreen';
import { NotFoundScreen } from '../ui/screens/not-found/NotFoundScreen';
import { ProfileScreen } from '../ui/screens/profile/ProfileScreen';
import { AuthScreen } from '@/ui/screens/authentication/AuthScreen';
import { ProtectedRoute } from '@/ui/screens/authentication/ProtectedRoute';
import { PublicRoute } from '@/ui/screens/authentication/PublicRoute';

export function createAppRouter() {
  return createHashRouter([
    {
      path: '/',
      Component: AppShell,
      children: [
        {
          Component: PublicRoute,
          children: [
            {
              path: 'auth',
              Component: AuthScreen,
            },
          ],
        },
        {
          Component: ProtectedRoute,
          children: [
            {
              Component: LearningLayout,
              children: [
                { index: true, Component: LibraryScreen },
                { path: 'missions/:missionId', Component: MissionRunScreen },
                { path: 'replays/:attemptId', Component: ReplayScreen },
              ],
            },
            { path: 'profile', Component: ProfileScreen },
          ],
        },
        { path: '*', Component: NotFoundScreen },
      ],
    },
  ]);
}
