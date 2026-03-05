import { createHashRouter } from 'react-router-dom';

import { AppShell } from '../ui/components/AppShell';
import { LearningLayout } from '../ui/components/LearningLayout';
import { LibraryScreen } from '../ui/screens/library/LibraryScreen';
import { MissionRunScreen } from '../ui/screens/mission-run/MissionRunScreen';
import { ReplayScreen } from '../ui/screens/replay/ReplayScreen';
import { NotFoundScreen } from '../ui/screens/not-found/NotFoundScreen';
import { ProfilePage } from '../ui/components/Profile';

export function createAppRouter() {
  return createHashRouter([
    {
      path: '/',
      Component: AppShell,
      children: [
        {
          Component: LearningLayout,
          children: [
            { index: true, Component: LibraryScreen },
            { path: 'missions/:missionId', Component: MissionRunScreen },
            { path: 'replays/:attemptId', Component: ReplayScreen },
          ],
        },
        { path: 'profile', Component: ProfilePage },
        { path: '*', Component: NotFoundScreen },
      ],
    },
  ]);
}
