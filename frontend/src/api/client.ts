import { useAuthStore } from '@/store/authStore';

const DEFAULT_API_BASE_URL = '/api';

type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
};

type ErrorPayload = {
  message?: string | string[];
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getApiBaseUrl() {
  return (
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_API_BASE_URL
  );
}

function joinUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function getErrorMessage(payload: ErrorPayload | null, status: number) {
  if (Array.isArray(payload?.message)) {
    return payload.message.join(', ');
  }

  if (typeof payload?.message === 'string' && payload.message.trim().length > 0) {
    return payload.message;
  }

  return `Request failed with status ${status}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload =
    text.length > 0 ? (JSON.parse(text) as T | ApiEnvelope<T> | ErrorPayload) : null;

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload as ErrorPayload | null, response.status),
      response.status,
    );
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'ok' in payload &&
    'data' in payload &&
    payload.ok === true
  ) {
    return payload.data as T;
  }

  return payload as T;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: { requiresAuth?: boolean } = {},
) {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.requiresAuth) {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      throw new ApiError('Missing access token for authorized API request.', 401);
    }

    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(joinUrl(getApiBaseUrl(), path), {
    ...init,
    headers,
  });

  return parseResponse<T>(response);
}
