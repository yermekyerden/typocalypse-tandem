import { useAuthStore } from '@/store/authStore';

interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
}
interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

class AuthService {
  private baseUrl = '/api';
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();

    return data;
  }

  async getMe(): Promise<AuthResponse['user']> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/profile/me`);

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    return data.user ?? data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return await response.json();
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return await response.json();
  }

  private async ensureFreshToken(): Promise<string | null> {
    const state = useAuthStore.getState();

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshPromise = state.refreshTokens().finally(() => {
        this.isRefreshing = false;
        this.refreshPromise = null;
      });
    }

    await this.refreshPromise;
    return useAuthStore.getState().accessToken;
  }
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = useAuthStore.getState().accessToken;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      const newToken = await this.ensureFreshToken();
      if (!newToken) throw new Error('Session expired');

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }
    return response;
  }

  async updateProfile(data: { firstName?: string; lastName?: string }) {
    const response = await this.fetchWithAuth(`${this.baseUrl}/profile/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  }

  async changePassword({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }) {
    const response = await this.fetchWithAuth(`${this.baseUrl}/profile/me/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || 'Failed to change password');
    }
  }
}

export const authService = new AuthService();
