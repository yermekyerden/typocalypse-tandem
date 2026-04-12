import { ApiError, getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

import type {
  AssistantStreamEvent,
  StreamAssistantHandlers,
  StreamAssistantRequest,
} from './assistantStreamApi.types';

const assistantStreamTimeoutMs = 15_000;

export class AssistantStreamStoppedByUserError extends Error {
  public constructor() {
    super('Assistant stream stopped by user.');
    this.name = 'AssistantStreamStoppedByUserError';
  }
}

export type AssistantStreamSession = {
  promise: Promise<void>;
  stop: () => void;
};

const parseStreamEvent = (line: string): AssistantStreamEvent | null => {
  try {
    return JSON.parse(line) as AssistantStreamEvent;
  } catch {
    return null;
  }
};

const normalizeStreamTransportError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError('Connection to the assistant service timed out.', 408);
  }

  if (error instanceof TypeError) {
    return new ApiError(
      'Cannot reach the assistant service. Check that the backend is running.',
      503,
    );
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return new ApiError(error.message, 500);
  }

  return new ApiError('Assistant streaming request failed.', 500);
};

const createStreamActivityTimeout = (
  abortController: AbortController,
): {
  refresh: () => void;
  clear: () => void;
} => {
  let timeoutId: number | null = null;

  const refresh = (): void => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      abortController.abort();
    }, assistantStreamTimeoutMs);
  };

  const clear = (): void => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return {
    refresh,
    clear,
  };
};

const isAssistantDevMockModeEnabled = (): boolean => {
  return import.meta.env.DEV && import.meta.env.VITE_ASSISTANT_DEV_STREAM_MODE === 'mock';
};

export async function startAssistantStream(
  attemptId: string,
  question: string,
  locale: string,
  handlers: StreamAssistantHandlers,
): Promise<AssistantStreamSession> {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw new ApiError('Missing access token for authorized API request.', 401);
  }

  if (isAssistantDevMockModeEnabled()) {
    const { startAssistantDevMockStream } = await import('./assistantDevStreamMock');

    return startAssistantDevMockStream(attemptId, handlers);
  }

  const requestBody: StreamAssistantRequest = {
    question,
    locale,
  };

  const abortController = new AbortController();
  const streamActivityTimeout = createStreamActivityTimeout(abortController);

  let wasStoppedByUser = false;

  const stop = (): void => {
    if (abortController.signal.aborted) {
      return;
    }

    wasStoppedByUser = true;
    abortController.abort();
  };

  const promise = (async (): Promise<void> => {
    let response: Response;

    try {
      streamActivityTimeout.refresh();

      response = await fetch(
        `${getApiBaseUrl()}/assistant/attempts/${attemptId}/stream`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/x-ndjson',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
          signal: abortController.signal,
        },
      );
    } catch (error) {
      streamActivityTimeout.clear();

      if (wasStoppedByUser) {
        throw new AssistantStreamStoppedByUserError();
      }

      throw normalizeStreamTransportError(error);
    }

    if (!response.ok) {
      streamActivityTimeout.clear();

      let errorMessage =
        response.status >= 500
          ? 'Assistant service is unavailable right now.'
          : `Request failed with status ${response.status}`;

      try {
        const payload = (await response.json()) as { message?: string | string[] };

        if (Array.isArray(payload.message)) {
          errorMessage = payload.message.join(', ');
        } else if (
          typeof payload.message === 'string' &&
          payload.message.trim().length > 0
        ) {
          errorMessage = payload.message;
        }
      } catch {
        // Keep fallback error message.
      }

      throw new ApiError(errorMessage, response.status);
    }

    if (!response.body) {
      streamActivityTimeout.clear();
      throw new ApiError('Assistant stream response body is missing.', 502);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';
    let didReceiveTerminalEvent = false;

    try {
      while (true) {
        streamActivityTimeout.refresh();

        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        streamActivityTimeout.refresh();

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const rawLine of lines) {
          const line = rawLine.trim();

          if (line.length === 0) {
            continue;
          }

          const event = parseStreamEvent(line);

          if (!event) {
            continue;
          }

          streamActivityTimeout.refresh();

          if (event.type === 'start') {
            handlers.onStart?.(event);
            continue;
          }

          if (event.type === 'delta') {
            handlers.onDelta(event);
            continue;
          }

          if (event.type === 'complete') {
            didReceiveTerminalEvent = true;
            handlers.onComplete(event);
            continue;
          }

          if (event.type === 'error') {
            didReceiveTerminalEvent = true;
            handlers.onError(event);
            return;
          }
        }
      }
    } catch (error) {
      if (wasStoppedByUser) {
        throw new AssistantStreamStoppedByUserError();
      }

      throw normalizeStreamTransportError(error);
    } finally {
      streamActivityTimeout.clear();
    }

    if (!didReceiveTerminalEvent) {
      throw new ApiError(
        'Connection to the assistant service was interrupted before the reply completed.',
        502,
      );
    }
  })();

  return {
    promise,
    stop,
  };
}
