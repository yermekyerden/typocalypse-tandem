import { InMemoryAssistantChatHistoryRepository } from './in-memory-assistant-chat-history.repository';

describe('InMemoryAssistantChatHistoryRepository', () => {
  let repository: InMemoryAssistantChatHistoryRepository;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-05T10:00:00.000Z'));
    repository = new InMemoryAssistantChatHistoryRepository();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a session on first access', () => {
    const session = repository.getOrCreateSession('attempt-1');

    expect(session).toMatchObject({
      attemptId: 'attempt-1',
      messages: [],
      summary: null,
      createdAtIso: '2026-04-05T10:00:00.000Z',
      lastActivityAtIso: '2026-04-05T10:00:00.000Z',
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

  it('refreshes last activity timestamp when a session is accessed', () => {
    const session = repository.getOrCreateSession('attempt-1');

    expect(session.lastActivityAtIso).toBe('2026-04-05T10:00:00.000Z');

    jest.setSystemTime(new Date('2026-04-05T10:05:00.000Z'));

    const refreshedSession = repository.getSession('attempt-1');

    expect(refreshedSession).not.toBeNull();
    expect(refreshedSession?.lastActivityAtIso).toBe('2026-04-05T10:05:00.000Z');
  });

  it('refreshes last activity timestamp when a message is appended', () => {
    repository.getOrCreateSession('attempt-1');

    jest.setSystemTime(new Date('2026-04-05T10:10:00.000Z'));

    repository.appendMessage({
      attemptId: 'attempt-1',
      role: 'user',
      content: 'message-1',
    });

    const session = repository.getSession('attempt-1');

    expect(session).not.toBeNull();
    expect(session?.lastActivityAtIso).toBe('2026-04-05T10:10:00.000Z');
  });

  it('expires a session after the ttl window passes without activity', () => {
    setRepositoryConfig({
      sessionTtlMs: 1_000,
    });

    repository.getOrCreateSession('attempt-1');

    jest.setSystemTime(new Date('2026-04-05T10:00:01.001Z'));

    expect(repository.getSession('attempt-1')).toBeNull();
  });

  it('keeps a session alive when it is touched before ttl expiration', () => {
    setRepositoryConfig({
      sessionTtlMs: 1_000,
    });

    repository.getOrCreateSession('attempt-1');

    jest.setSystemTime(new Date('2026-04-05T10:00:00.800Z'));
    expect(repository.getSession('attempt-1')).not.toBeNull();

    jest.setSystemTime(new Date('2026-04-05T10:00:01.500Z'));
    expect(repository.getSession('attempt-1')).not.toBeNull();
  });

  it('evicts the least recently active sessions when max active sessions is exceeded', () => {
    setRepositoryConfig({
      maxActiveSessions: 2,
    });

    repository.getOrCreateSession('attempt-1');

    jest.setSystemTime(new Date('2026-04-05T10:00:01.000Z'));
    repository.getOrCreateSession('attempt-2');

    jest.setSystemTime(new Date('2026-04-05T10:00:02.000Z'));
    repository.getSession('attempt-1');

    jest.setSystemTime(new Date('2026-04-05T10:00:03.000Z'));
    repository.getOrCreateSession('attempt-3');

    expect(repository.getSession('attempt-1')).not.toBeNull();
    expect(repository.getSession('attempt-2')).toBeNull();
    expect(repository.getSession('attempt-3')).not.toBeNull();
  });

  function setRepositoryConfig(params: {
    sessionTtlMs?: number;
    maxActiveSessions?: number;
  }): void {
    const mutableRepository = repository as unknown as {
      sessionTtlMs: number;
      maxActiveSessions: number;
    };

    if (params.sessionTtlMs !== undefined) {
      mutableRepository.sessionTtlMs = params.sessionTtlMs;
    }

    if (params.maxActiveSessions !== undefined) {
      mutableRepository.maxActiveSessions = params.maxActiveSessions;
    }
  }
});
