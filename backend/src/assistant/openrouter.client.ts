import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AssistantChatMessage, OpenRouterChatCompletionResponse } from './assistant.types';

@Injectable()
export class OpenRouterClient {
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  public async createChatCompletion(messages: AssistantChatMessage[]) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL ?? 'openrouter/free';

    if (!apiKey) {
      throw new InternalServerErrorException('OPENROUTER_API_KEY is not configured.');
    }

    let response: Response;

    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 300,
        }),
      });
    } catch {
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
      model: responseJson.model ?? model,
      usage: responseJson.usage ?? null,
    };
  }
}
