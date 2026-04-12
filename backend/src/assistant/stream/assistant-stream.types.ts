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
