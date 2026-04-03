import { InMemoryAssistantChatHistoryRepository } from './in-memory-assistant-chat-history.repository';

describe('InMemoryAssistantChatHistoryRepository', () => {
  let repository: InMemoryAssistantChatHistoryRepository;

  beforeEach(() => {
    repository = new InMemoryAssistantChatHistoryRepository();
  });

  it('creates a session on first access', () => {
    const session = repository.getOrCreateSession('attempt-1');

    expect(session).toEqual({
      attemptId: 'attempt-1',
      messages: [],
      summary: null,
    });
  });

  it('returns only recent messages for the requested limit', () => {
    repository.appendMessage({
      attemptId: 'attempt-1',
      role: 'user',
      content: 'message-1',
    });

    repository.appendMessage({
      attemptId: 'attempt-1',
      role: 'assistant',
      content: 'message-2',
    });

    repository.appendMessage({
      attemptId: 'attempt-1',
      role: 'user',
      content: 'message-3',
    });

    const recentMessages = repository.getRecentMessages('attempt-1', 2);

    expect(recentMessages).toHaveLength(2);
    expect(recentMessages[0]?.content).toBe('message-2');
    expect(recentMessages[1]?.content).toBe('message-3');
  });

  it('keeps only the last 12 messages in a session', () => {
    for (let index = 1; index <= 14; index += 1) {
      repository.appendMessage({
        attemptId: 'attempt-1',
        role: index % 2 === 0 ? 'assistant' : 'user',
        content: `message-${index}`,
      });
    }

    const session = repository.getSession('attempt-1');

    expect(session).not.toBeNull();
    expect(session?.messages).toHaveLength(12);
    expect(session?.messages[0]?.content).toBe('message-3');
    expect(session?.messages.at(-1)?.content).toBe('message-14');
  });

  it('clears a session completely', () => {
    repository.appendMessage({
      attemptId: 'attempt-1',
      role: 'user',
      content: 'message-1',
    });

    repository.clearSession('attempt-1');

    expect(repository.getSession('attempt-1')).toBeNull();
  });
});
