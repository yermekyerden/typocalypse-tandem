import { Injectable } from '@nestjs/common';

import type {
  AssistantChatHistoryMessage,
  AssistantChatSession,
  CreateAssistantChatMessageParams,
} from './assistant-chat-history.types';
import { AssistantChatHistoryRepository } from './assistant-chat-history.repository';

@Injectable()
export class InMemoryAssistantChatHistoryRepository implements AssistantChatHistoryRepository {
  private readonly sessionsByAttemptId = new Map<string, AssistantChatSession>();

  private readonly maxMessagesPerSession = 12;
  private readonly maxActiveSessions = 250;
  private readonly sessionTtlMs = 6 * 60 * 60 * 1000;

  public getOrCreateSession(attemptId: string): AssistantChatSession {
    this.sweepExpiredSessions();

    const existingSession = this.sessionsByAttemptId.get(attemptId);

    if (existingSession) {
      this.touchSession(existingSession);
      return existingSession;
    }

    const nowIso = new Date().toISOString();

    const createdSession: AssistantChatSession = {
      attemptId,
      messages: [],
      summary: null,
      createdAtIso: nowIso,
      lastActivityAtIso: nowIso,
    };

    this.sessionsByAttemptId.set(attemptId, createdSession);
    this.enforceMaxActiveSessions();

    return createdSession;
  }

  public getSession(attemptId: string): AssistantChatSession | null {
    this.sweepExpiredSessions();

    const session = this.sessionsByAttemptId.get(attemptId) ?? null;

    if (!session) {
      return null;
    }

    this.touchSession(session);

    return session;
  }

  public getRecentMessages(attemptId: string, limit: number): AssistantChatHistoryMessage[] {
    this.sweepExpiredSessions();

    const session = this.sessionsByAttemptId.get(attemptId);

    if (!session) {
      return [];
    }

    this.touchSession(session);

    return session.messages.slice(-limit);
  }

  public appendMessage(params: CreateAssistantChatMessageParams): AssistantChatHistoryMessage {
    this.sweepExpiredSessions();

    const session = this.getOrCreateSession(params.attemptId);

    const createdMessage: AssistantChatHistoryMessage = {
      id: this.createMessageId(),
      attemptId: params.attemptId,
      role: params.role,
      content: params.content,
      status: params.status ?? 'completed',
      createdAtIso: new Date().toISOString(),
    };

    session.messages.push(createdMessage);
    this.touchSession(session);
    this.trimSessionMessages(session);

    return createdMessage;
  }

  public clearSession(attemptId: string): void {
    this.sessionsByAttemptId.delete(attemptId);
  }

  private sweepExpiredSessions(): void {
    const now = Date.now();

    for (const [attemptId, session] of this.sessionsByAttemptId.entries()) {
      const lastActivityTime = new Date(session.lastActivityAtIso).getTime();

      if (now - lastActivityTime > this.sessionTtlMs) {
        this.sessionsByAttemptId.delete(attemptId);
      }
    }
  }

  private touchSession(session: AssistantChatSession): void {
    session.lastActivityAtIso = new Date().toISOString();
  }

  private enforceMaxActiveSessions(): void {
    if (this.sessionsByAttemptId.size <= this.maxActiveSessions) {
      return;
    }

    const sessionsOrderedByLastActivity = [...this.sessionsByAttemptId.entries()].sort(
      ([, leftSession], [, rightSession]) =>
        new Date(leftSession.lastActivityAtIso).getTime() -
        new Date(rightSession.lastActivityAtIso).getTime(),
    );

    while (this.sessionsByAttemptId.size > this.maxActiveSessions) {
      const oldestSessionEntry = sessionsOrderedByLastActivity.shift();

      if (!oldestSessionEntry) {
        return;
      }

      const [oldestAttemptId] = oldestSessionEntry;
      this.sessionsByAttemptId.delete(oldestAttemptId);
    }
  }

  private trimSessionMessages(session: AssistantChatSession): void {
    if (session.messages.length <= this.maxMessagesPerSession) {
      return;
    }

    session.messages = session.messages.slice(-this.maxMessagesPerSession);
  }

  private createMessageId(): string {
    return `assistant-history-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
