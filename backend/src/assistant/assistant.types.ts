export type AssistantChatRole = 'system' | 'user' | 'assistant';

export type AssistantChatMessage = {
  role: AssistantChatRole;
  content: string;
};

export type OpenRouterUsage = {
  cost?: number;
  total_tokens?: number;
};

export type OpenRouterError = {
  message?: string;
};

export type OpenRouterChoiceMessage = {
  role?: string;
  content?: string;
};

export type OpenRouterChoice = {
  message?: OpenRouterChoiceMessage;
};

export type OpenRouterChatCompletionResponse = {
  model?: string;
  choices?: OpenRouterChoice[];
  usage?: OpenRouterUsage;
  error?: OpenRouterError;
};

export type AssistantMissionContext = {
  title: string;
  shortDescription: string;
  allowedCommands?: string[];
};

export type AssistantExecutionErrorContext = {
  message?: string;
};

export type AssistantExecutionContext = {
  error?: AssistantExecutionErrorContext;
};

export type AssistantStepTraceContext = {
  execute?: AssistantExecutionContext;
};

export type AssistantStepValidationContext = {
  type: string;
};

export type AssistantAttemptStepContext = {
  stepIndex: number;
  inputLine: string;
  exitCode: number;
  validation: AssistantStepValidationContext;
  trace: AssistantStepTraceContext;
};

export type BuildAssistantMessagesContext = {
  mission: AssistantMissionContext;
  currentWorkingDirectory: string;
  attemptStatus: string;
  steps: AssistantAttemptStepContext[];
  question: string;
};
