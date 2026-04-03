export type AssistantChatRole = 'system' | 'user' | 'assistant';

export type AssistantChatMessage = {
  role: AssistantChatRole;
  content: string;
};

export type AssistantUsage = {
  cost?: number;
  totalTokens?: number;
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

export type AssistantAttemptStatus = 'in_progress' | 'completed' | 'abandoned';

export type BuildAssistantMessagesContext = {
  mission: AssistantMissionContext;
  currentWorkingDirectory: string;
  attemptStatus: AssistantAttemptStatus;
  steps: AssistantAttemptStepContext[];
  question: string;
};

export type AssistantAttemptContext = {
  missionId: string;
  currentCwd: string;
  status: AssistantAttemptStatus;
  steps: AssistantAttemptStepContext[];
};

export type AssistantAttemptLookupResult = {
  attempt: AssistantAttemptContext;
};

export type AssistantMissionLookupResult = AssistantMissionContext & {
  id: string;
};

export type AssistantCompletionResult = {
  answer: string;
  model: string;
  usage: AssistantUsage | null;
};

export type AssistantConversationRole = 'user' | 'assistant';

export type AssistantChatMessageStatus = 'completed' | 'failed';

export type AssistantChatHistoryMessage = {
  id: string;
  attemptId: string;
  role: AssistantConversationRole;
  content: string;
  status: AssistantChatMessageStatus;
  createdAtIso: string;
};

export type AssistantChatSession = {
  attemptId: string;
  messages: AssistantChatHistoryMessage[];
  summary: string | null;
};

export type CreateAssistantChatMessageParams = {
  attemptId: string;
  role: AssistantConversationRole;
  content: string;
  status?: AssistantChatMessageStatus;
};
