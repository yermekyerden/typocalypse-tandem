import type { PropsWithChildren } from 'react';
import { I18nProvider } from '@/i18n/I18nProvider';
import { AuthProvider } from './AuthProvider';

export function AppProviders({ children }: PropsWithChildren) {
  // TODO: Add providers here later (theme, error boundary, etc.)
  return (
    <I18nProvider>
      <AuthProvider>{children}</AuthProvider>
    </I18nProvider>
  );
}
