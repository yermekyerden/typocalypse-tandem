export type AssistantStreamStartEvent = {
  type: 'start';
  attemptId: string;
};

export type AssistantStreamDeltaEvent = {
  type: 'delta';
  delta: string;
};

export type AssistantStreamCompleteEvent = {
  type: 'complete';
  answer: string;
  model: string;
};

export type AssistantStreamErrorEvent = {
  type: 'error';
  message: string;
};

export type AssistantStreamEvent =
  | AssistantStreamStartEvent
  | AssistantStreamDeltaEvent
  | AssistantStreamCompleteEvent
  | AssistantStreamErrorEvent;

export type StreamAssistantRequest = {
  question: string;
  locale: string;
};

export type StreamAssistantHandlers = {
  onStart?: (event: AssistantStreamStartEvent) => void;
  onDelta: (event: AssistantStreamDeltaEvent) => void;
  onComplete: (event: AssistantStreamCompleteEvent) => void;
  onError: (event: AssistantStreamErrorEvent) => void;
};
