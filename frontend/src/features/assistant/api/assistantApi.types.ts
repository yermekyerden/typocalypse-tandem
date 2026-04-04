export type AssistantApiUsage = {
  cost?: number;
  totalTokens?: number;
};

export type AskAssistantRequest = {
  question: string;
  locale: string;
};

export type AskAssistantResponse = {
  answer: string;
  model: string;
  usage: AssistantApiUsage | null;
};
