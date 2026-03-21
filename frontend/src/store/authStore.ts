import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/api/authService';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  version: number;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<void>;
  clearError: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      version: 0,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ username, password });

          set({
            user: response.user || null,
            accessToken: response.tokens?.accessToken || null,
            refreshToken: response.tokens?.refreshToken || null,
            isLoading: false,
            version: get().version + 1,
          });
        } catch (error) {
          console.error('Login error:', error);
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      fetchProfile: async () => {
        try {
          const user = await authService.getMe();

          set({
            user,
            version: get().version + 1,
          });
        } catch (error) {
          console.error('Fetch profile error:', error);
          get().logout();
        }
      },

      register: async (username: string, email, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({ username, email, password });

          set({
            user: response.user || null,
            accessToken: response.tokens?.accessToken || null,
            refreshToken: response.tokens?.refreshToken || null,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
        });
      },

      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await authService.refreshToken(refreshToken);
          set({
            accessToken: response.tokens?.accessToken || null,
            refreshToken: response.tokens?.refreshToken || null,
            user: response.user || get().user,
          });
        } catch (error) {
          get().logout();
          console.error(error);
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

export const useIsAuthenticated = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return !!accessToken;
};

export const useUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
