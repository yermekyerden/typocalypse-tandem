import { apiRequest } from '@/api/client';
import type { AskAssistantRequest, AskAssistantResponse } from './assistantApi.types';

export function askAssistant(
  attemptId: string,
  question: string,
  locale: string,
): Promise<AskAssistantResponse> {
  const requestBody: AskAssistantRequest = {
    question,
    locale,
  };

  return apiRequest<AskAssistantResponse>(
    `/assistant/attempts/${attemptId}`,
    {
      method: 'POST',
      body: JSON.stringify(requestBody),
    },
    { requiresAuth: true },
  );
}
