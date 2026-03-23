import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AssistantChatMessage, OpenRouterChatCompletionResponse } from './assistant.types';

@Injectable()
export class OpenRouterClient {
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly timeoutMs = 15_000;
  private readonly apiKey: string;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured.');
    }

    this.apiKey = apiKey;
    this.model = process.env.OPENROUTER_MODEL ?? 'openrouter/free';
  }

  public async createChatCompletion(messages: AssistantChatMessage[]) {
    let response: Response;

    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 300,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new ServiceUnavailableException(
          `AI provider request timed out after ${this.timeoutMs} ms.`,
        );
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ServiceUnavailableException(
          `AI provider request timed out after ${this.timeoutMs} ms.`,
        );
      }

      throw new ServiceUnavailableException('Failed to reach the AI provider.');
    }

    let responseJson: OpenRouterChatCompletionResponse;

    try {
      responseJson = (await response.json()) as OpenRouterChatCompletionResponse;
    } catch {
      throw new BadGatewayException('AI provider returned an invalid response.');
    }

    if (!response.ok) {
      const providerErrorMessage = responseJson.error?.message ?? 'AI provider request failed.';

      throw new BadGatewayException(providerErrorMessage);
    }

    const answer = responseJson.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      throw new BadGatewayException('AI provider returned an empty answer.');
    }

    return {
      answer,
      model: responseJson.model ?? this.model,
      usage: responseJson.usage ?? null,
    };
  }
}
