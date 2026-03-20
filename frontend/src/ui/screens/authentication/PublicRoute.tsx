import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function PublicRoute() {
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <Outlet />;
}
