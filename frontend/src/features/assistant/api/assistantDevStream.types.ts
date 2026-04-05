export type AssistantDevStreamScenario =
  | 'success'
  | 'markdown'
  | 'partial_error'
  | 'off_topic'
  | 'slow_success'
  | 'slow_markdown';

export type AssistantDevStreamChunk = {
  text: string;
  delayMs?: number;
};

export type AssistantDevStreamScript =
  | {
      kind: 'complete';
      chunks: AssistantDevStreamChunk[];
      model: string;
    }
  | {
      kind: 'error';
      chunks: AssistantDevStreamChunk[];
      errorMessage: string;
    };
