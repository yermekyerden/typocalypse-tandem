const DEFAULT_API_BASE_URL = 'http://localhost:3001';
const DEFAULT_ACCESS_TOKEN_KEYS = [
  'accessToken',
  'access_token',
  'auth.accessToken',
  'auth.tokens.accessToken',
  'token',
] as const;

type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
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

function getConfiguredAccessTokenKey() {
  return import.meta.env.VITE_ACCESS_TOKEN_STORAGE_KEY as string | undefined;
}

export function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const configuredKey = getConfiguredAccessTokenKey();
  const candidateKeys = configuredKey
    ? [configuredKey, ...DEFAULT_ACCESS_TOKEN_KEYS]
    : DEFAULT_ACCESS_TOKEN_KEYS;

  for (const key of candidateKeys) {
    const value = window.localStorage.getItem(key);
    if (value && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function joinUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text.length > 0 ? (JSON.parse(text) as T | ApiEnvelope<T>) : null;

  if (!response.ok) {
    const errorMessage =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : `Request failed with status ${response.status}`;

    throw new ApiError(errorMessage, response.status);
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
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

  const bodyIsJson = init.body !== undefined && !headers.has('Content-Type');
  if (bodyIsJson) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.requiresAuth) {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new ApiError(
        'Missing access token in localStorage. Set it before using learning and terminal API.',
        401,
      );
    }
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(joinUrl(getApiBaseUrl(), path), {
    ...init,
    headers,
  });

  return parseResponse<T>(response);
}
