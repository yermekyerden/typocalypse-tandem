import { apiRequest } from '@/api/client';
import type {
  AskAssistantRequest,
  AskAssistantResponse,
  AssistantHistoryResponse,
} from './assistantApi.types';

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

export function getAssistantHistory(
  attemptId: string,
): Promise<AssistantHistoryResponse> {
  return apiRequest<AssistantHistoryResponse>(
    `/assistant/attempts/${attemptId}/history`,
    {
      method: 'GET',
    },
    { requiresAuth: true },
  );
}
