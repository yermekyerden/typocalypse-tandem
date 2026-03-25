import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { OpenRouterClient } from './openrouter.client';
import { AssistantChatMessage } from './assistant.types';

describe('OpenRouterClient', () => {
  const originalApiKey = process.env.OPENROUTER_API_KEY;
  const originalModel = process.env.OPENROUTER_MODEL;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
    process.env.OPENROUTER_MODEL = 'openrouter/free';
  });

  afterAll(() => {
    process.env.OPENROUTER_API_KEY = originalApiKey;
    process.env.OPENROUTER_MODEL = originalModel;
  });

  it('throws at construction time when OPENROUTER_API_KEY is missing', () => {
    delete process.env.OPENROUTER_API_KEY;

    expect(() => new OpenRouterClient()).toThrow('OPENROUTER_API_KEY is not configured.');
  });

  it('uses default model when OPENROUTER_MODEL is not set', async () => {
    delete process.env.OPENROUTER_MODEL;

    mockFetchResolved(
      createFetchResponse({
        ok: true,
        jsonBody: createSuccessResponseBody({
          model: 'google/gemma-3-4b-it:free',
          content: 'Hint',
        }),
      }),
    );

    const client = new OpenRouterClient();

    await client.createChatCompletion([createUserMessage('Give me a hint.')]);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const requestInit = getLastFetchRequestInit();
    const parsedBody = parseRequestBody(requestInit.body);

    expect(parsedBody.model).toBe('openrouter/free');
  });

  it('returns answer, model, and usage from a successful provider response', async () => {
    mockFetchResolved(
      createFetchResponse({
        ok: true,
        jsonBody: createSuccessResponseBody({
          model: 'google/gemma-3-4b-it:free',
          content: 'Try using pwd first.',
          usage: {
            cost: 0,
            total_tokens: 24,
          },
        }),
      }),
    );

    const client = new OpenRouterClient();

    const result = await client.createChatCompletion([
      createSystemMessage('You are a helpful assistant.'),
      createUserMessage('Give me a hint.'),
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, requestInit] = getLastFetchCall();

    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(requestInit.method).toBe('POST');
    expect(requestInit.headers).toEqual({
      Authorization: 'Bearer test-openrouter-key',
      'Content-Type': 'application/json',
    });

    const parsedBody = parseRequestBody(requestInit.body);

    expect(parsedBody.model).toBe('openrouter/free');
    expect(parsedBody.max_tokens).toBe(300);
    expect(parsedBody.messages).toEqual([
      createSystemMessage('You are a helpful assistant.'),
      createUserMessage('Give me a hint.'),
    ]);

    expect(result).toEqual({
      answer: 'Try using pwd first.',
      model: 'google/gemma-3-4b-it:free',
      usage: {
        cost: 0,
        totalTokens: 24,
      },
    });
  });

  it('throws BadGatewayException when provider responds with non-ok status', async () => {
    mockFetchResolved(
      createFetchResponse({
        ok: false,
        jsonBody: createErrorResponseBody('Upstream provider failed.'),
      }),
    );

    const client = new OpenRouterClient();

    await expect(client.createChatCompletion([createUserMessage('Help me.')])).rejects.toThrow(
      BadGatewayException,
    );

    await expect(client.createChatCompletion([createUserMessage('Help me.')])).rejects.toThrow(
      'Upstream provider failed.',
    );
  });

  it('throws BadGatewayException when provider returns empty answer', async () => {
    mockFetchResolved(
      createFetchResponse({
        ok: true,
        jsonBody: createSuccessResponseBody({
          model: 'google/gemma-3-4b-it:free',
          content: '   ',
        }),
      }),
    );

    const client = new OpenRouterClient();

    await expect(client.createChatCompletion([createUserMessage('Help me.')])).rejects.toThrow(
      BadGatewayException,
    );

    await expect(client.createChatCompletion([createUserMessage('Help me.')])).rejects.toThrow(
      'AI provider returned an empty answer.',
    );
  });

  it('throws ServiceUnavailableException when request times out', async () => {
    mockFetchRejected(createAbortError('TimeoutError'));

    const client = new OpenRouterClient();

    await expect(client.createChatCompletion([createUserMessage('Help me.')])).rejects.toThrow(
      ServiceUnavailableException,
    );

    await expect(client.createChatCompletion([createUserMessage('Help me.')])).rejects.toThrow(
      'AI provider request timed out after 15000 ms.',
    );
  });

  it('throws ServiceUnavailableException when request is aborted', async () => {
    mockFetchRejected(createAbortError('AbortError'));

    const client = new OpenRouterClient();

    await expect(client.createChatCompletion([createUserMessage('Help me.')])).rejects.toThrow(
      ServiceUnavailableException,
    );

    await expect(client.createChatCompletion([createUserMessage('Help me.')])).rejects.toThrow(
      'AI provider request timed out after 15000 ms.',
    );
  });

  it('throws ServiceUnavailableException on network failure', async () => {
    mockFetchRejected(new Error('Network down'));

    const client = new OpenRouterClient();

    await expect(client.createChatCompletion([createUserMessage('Help me.')])).rejects.toThrow(
      ServiceUnavailableException,
    );

    await expect(client.createChatCompletion([createUserMessage('Help me.')])).rejects.toThrow(
      'Failed to reach the AI provider.',
    );
  });

  function getLastFetchCall() {
    const fetchMock = global.fetch as jest.Mock;
    return fetchMock.mock.calls[0] as [string, RequestInit];
  }

  function getLastFetchRequestInit(): RequestInit {
    const [, requestInit] = getLastFetchCall();
    return requestInit;
  }
});

function createSystemMessage(content: string): AssistantChatMessage {
  return {
    role: 'system',
    content,
  };
}

function createUserMessage(content: string): AssistantChatMessage {
  return {
    role: 'user',
    content,
  };
}

function createSuccessResponseBody(params: {
  model: string;
  content: string;
  usage?: {
    cost?: number;
    total_tokens?: number;
  } | null;
}) {
  return {
    model: params.model,
    choices: [
      {
        message: {
          role: 'assistant',
          content: params.content,
        },
      },
    ],
    usage: params.usage ?? null,
  };
}

function createErrorResponseBody(message: string) {
  return {
    error: {
      message,
    },
  };
}

function createFetchResponse(params: { ok: boolean; jsonBody: unknown }) {
  return {
    ok: params.ok,
    json: jest.fn().mockResolvedValue(params.jsonBody),
  } as unknown as Response;
}

function mockFetchResolved(response: Response): void {
  jest.spyOn(global, 'fetch').mockResolvedValue(response);
}

function mockFetchRejected(error: Error): void {
  jest.spyOn(global, 'fetch').mockRejectedValue(error);
}

function createAbortError(name: 'AbortError' | 'TimeoutError'): Error {
  const error = new Error(name);
  error.name = name;
  return error;
}

function parseRequestBody(body: BodyInit | null | undefined) {
  if (typeof body !== 'string') {
    throw new Error('Expected request body to be a JSON string.');
  }

  return JSON.parse(body) as {
    model: string;
    max_tokens: number;
    messages: Array<{
      role: string;
      content: string;
    }>;
  };
}
