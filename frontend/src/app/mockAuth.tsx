import { useAuthStore } from '@/store/authStore';

export function mockAuth(user?: { id: string; username: string; email: string }) {
  useAuthStore.setState({
    accessToken: user ? 'test-token' : null,
    user: user ?? null,
  });
}
