import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { refreshTokens, accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(
      () => {
        refreshTokens();
      },
      14 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [accessToken, refreshTokens]);

  return <>{children}</>;
}
