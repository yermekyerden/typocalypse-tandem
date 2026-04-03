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

  public getOrCreateSession(attemptId: string): AssistantChatSession {
    const existingSession = this.sessionsByAttemptId.get(attemptId);

    if (existingSession) {
      return existingSession;
    }

    const createdSession: AssistantChatSession = {
      attemptId,
      messages: [],
      summary: null,
    };

    this.sessionsByAttemptId.set(attemptId, createdSession);

    return createdSession;
  }

  public getSession(attemptId: string): AssistantChatSession | null {
    return this.sessionsByAttemptId.get(attemptId) ?? null;
  }

  public getRecentMessages(attemptId: string, limit: number): AssistantChatHistoryMessage[] {
    const session = this.sessionsByAttemptId.get(attemptId);

    if (!session) {
      return [];
    }

    return session.messages.slice(-limit);
  }

  public appendMessage(params: CreateAssistantChatMessageParams): AssistantChatHistoryMessage {
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
    this.trimSessionMessages(session);

    return createdMessage;
  }

  public clearSession(attemptId: string): void {
    this.sessionsByAttemptId.delete(attemptId);
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
