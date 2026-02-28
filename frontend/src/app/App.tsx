import { RouterProvider } from 'react-router-dom';

import { AppProviders } from './providers/AppProviders';
import { createAppRouter } from './compositionRoot';

export default function App() {
  const router = createAppRouter();

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
