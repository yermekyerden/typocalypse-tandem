import type {
  AssistantStreamCompleteEvent,
  AssistantStreamDeltaEvent,
  AssistantStreamErrorEvent,
  AssistantStreamStartEvent,
  StreamAssistantHandlers,
} from './assistantStreamApi.types';
import type {
  AssistantDevStreamScenario,
  AssistantDevStreamScript,
} from './assistantDevStream.types.ts';

export class AssistantDevStreamStoppedByUserError extends Error {
  public constructor() {
    super('Assistant dev stream stopped by user.');
    this.name = 'AssistantDevStreamStoppedByUserError';
  }
}

export type AssistantDevStreamSession = {
  promise: Promise<void>;
  stop: () => void;
};

const devMockModel = 'assistant-dev-mock';

const getScenarioFromEnv = (): AssistantDevStreamScenario => {
  const rawScenario = import.meta.env.VITE_ASSISTANT_DEV_STREAM_SCENARIO;

  switch (rawScenario) {
    case 'markdown':
    case 'partial_error':
    case 'off_topic':
    case 'slow_success':
    case 'slow_markdown':
      return rawScenario;
    default:
      return 'success';
  }
};

const createWordChunks = (
  text: string,
  delayMs: number,
): Array<{ text: string; delayMs: number }> => {
  const chunks = text.match(/\S+\s*/g);

  if (!chunks || chunks.length === 0) {
    return [{ text, delayMs }];
  }

  return chunks.map((chunk) => ({
    text: chunk,
    delayMs,
  }));
};

const getScenarioScript = (
  scenario: AssistantDevStreamScenario,
): AssistantDevStreamScript => {
  if (scenario === 'markdown') {
    return {
      kind: 'complete',
      model: devMockModel,
      chunks: createWordChunks(
        [
          '**Hint:** start with a command that shows your current directory.',
          '',
          '- Check where you are first.',
          '- Then compare it with the task.',
          '',
          'Example:',
          '```bash',
          'pwd',
          '```',
        ].join('\n'),
        55,
      ),
    };
  }

  if (scenario === 'slow_markdown') {
    return {
      kind: 'complete',
      model: devMockModel,
      chunks: createWordChunks(
        [
          '**Step-by-step hint**',
          '',
          '1. Read the task carefully.',
          '2. Use a small command first.',
          '3. Compare the output with the mission goal.',
          '',
          '`pwd` is often a good first check.',
        ].join('\n'),
        140,
      ),
    };
  }

  if (scenario === 'off_topic') {
    return {
      kind: 'complete',
      model: 'assistant-local-guard-mock',
      chunks: createWordChunks(
        'I can only help with the current mission and terminal learning tasks.',
        45,
      ),
    };
  }

  if (scenario === 'partial_error') {
    return {
      kind: 'error',
      chunks: createWordChunks(
        'Try checking your current directory first, then compare it with the mission goal.',
        60,
      ).slice(0, 7),
      errorMessage:
        'Connection to the assistant service was interrupted before the reply completed.',
    };
  }

  if (scenario === 'slow_success') {
    return {
      kind: 'complete',
      model: devMockModel,
      chunks: createWordChunks(
        'Try a very small command first. Read the output carefully, then use that result to decide your next step.',
        150,
      ),
    };
  }

  return {
    kind: 'complete',
    model: devMockModel,
    chunks: createWordChunks('Try checking the current working directory first.', 50),
  };
};

const delay = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

export function startAssistantDevMockStream(
  attemptId: string,
  handlers: StreamAssistantHandlers,
): AssistantDevStreamSession {
  let wasStoppedByUser = false;

  const stop = (): void => {
    wasStoppedByUser = true;
  };

  const promise = (async (): Promise<void> => {
    const startEvent: AssistantStreamStartEvent = {
      type: 'start',
      attemptId,
    };

    handlers.onStart?.(startEvent);

    const scenario = getScenarioFromEnv();
    const script = getScenarioScript(scenario);

    let accumulatedAnswer = '';

    for (const chunk of script.chunks) {
      if (wasStoppedByUser) {
        throw new AssistantDevStreamStoppedByUserError();
      }

      await delay(chunk.delayMs ?? 60);

      if (wasStoppedByUser) {
        throw new AssistantDevStreamStoppedByUserError();
      }

      accumulatedAnswer += chunk.text;

      const deltaEvent: AssistantStreamDeltaEvent = {
        type: 'delta',
        delta: chunk.text,
      };

      handlers.onDelta(deltaEvent);
    }

    if (wasStoppedByUser) {
      throw new AssistantDevStreamStoppedByUserError();
    }

    if (script.kind === 'error') {
      const errorEvent: AssistantStreamErrorEvent = {
        type: 'error',
        message: script.errorMessage,
      };

      handlers.onError(errorEvent);
      return;
    }

    const completeEvent: AssistantStreamCompleteEvent = {
      type: 'complete',
      answer: accumulatedAnswer,
      model: script.model,
    };

    handlers.onComplete(completeEvent);
  })();

  return {
    promise,
    stop,
  };
}
