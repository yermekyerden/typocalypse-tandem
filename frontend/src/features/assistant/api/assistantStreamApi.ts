import { ApiError, getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

import type {
  AssistantStreamEvent,
  StreamAssistantHandlers,
  StreamAssistantRequest,
} from './assistantStreamApi.types';

const parseStreamEvent = (line: string): AssistantStreamEvent | null => {
  try {
    return JSON.parse(line) as AssistantStreamEvent;
  } catch {
    return null;
  }
};

export async function streamAssistant(
  attemptId: string,
  question: string,
  locale: string,
  handlers: StreamAssistantHandlers,
): Promise<void> {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw new ApiError('Missing access token for authorized API request.', 401);
  }

  const requestBody: StreamAssistantRequest = {
    question,
    locale,
  };

  const response = await fetch(
    `${getApiBaseUrl()}/assistant/attempts/${attemptId}/stream`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/x-ndjson',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

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
    throw new ApiError('Assistant stream response body is missing.', 502);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

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

      if (event.type === 'start') {
        handlers.onStart?.(event);
        continue;
      }

      if (event.type === 'delta') {
        handlers.onDelta(event);
        continue;
      }

      if (event.type === 'complete') {
        handlers.onComplete(event);
        continue;
      }

      if (event.type === 'error') {
        handlers.onError(event);
        return;
      }
    }
  }
}
