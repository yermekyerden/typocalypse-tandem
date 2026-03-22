import type { PropsWithChildren } from 'react';
import { AuthProvider } from './AuthProvider';

export function AppProviders({ children }: PropsWithChildren) {
  // TODO: Add providers here later (theme, error boundary, etc.)
  return <AuthProvider>{children}</AuthProvider>;
}
