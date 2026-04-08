import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock useAuthStore before importing authService to avoid Zustand store initialization.
vi.mock('@/store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      accessToken: null,
      refreshTokens: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

// Import after mocks are in place.
import { authService } from './authService';

const MOCK_FETCH_RESPONSE = new Response(JSON.stringify({ user: {}, tokens: {} }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
});

describe('authService URL construction', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(MOCK_FETCH_RESPONSE.clone()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('uses VITE_API_BASE_URL when set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');

    await authService.login({ username: 'user', password: 'pass' }).catch(() => {});

    const [calledUrl] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
    expect(calledUrl).toBe('https://api.example.com/auth/login');
  });

  it('falls back to /api when VITE_API_BASE_URL is not set', async () => {
    // No stub — VITE_API_BASE_URL is undefined in the test environment by default.
    // vi.unstubAllEnvs() in afterEach ensures cleanup from previous tests.
    await authService.login({ username: 'user', password: 'pass' }).catch(() => {});

    const [calledUrl] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
    expect(calledUrl).toBe('/api/auth/login');
  });
});
