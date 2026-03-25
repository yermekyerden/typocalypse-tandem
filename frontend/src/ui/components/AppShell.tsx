import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { OfflineBanner } from './OfflineBanner';

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  useEffect(() => {
    if (!user && token) {
      fetchProfile();
    }
  }, [user, token, fetchProfile]);

  return (
    <div className="h-dvh flex flex-col bg-mist-950 text-yellow-50 overflow-hidden">
      <Header />

      <main className="flex-1 w-full flex flex-col bg-mist-950 min-h-0 overflow-hidden">
        <Outlet />
        <OfflineBanner />
      </main>

      <Footer />
    </div>
  );
}
