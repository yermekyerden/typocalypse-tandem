import type { Response } from 'express';
import type { AssistantStreamEvent } from './assistant-stream.types';

export class AssistantStreamWriter {
  constructor(private readonly response: Response) {}

  public start(): void {
    this.response.status(200);
    this.response.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    this.response.setHeader('Cache-Control', 'no-cache, no-transform');
    this.response.setHeader('Connection', 'keep-alive');
    this.response.flushHeaders?.();
  }

  public write(event: AssistantStreamEvent): void {
    this.response.write(`${JSON.stringify(event)}\n`);
  }

  public end(): void {
    this.response.end();
  }
}
