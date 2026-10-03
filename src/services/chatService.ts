export type ChatRole = 'user' | 'assistant';

export interface ChatRequestMessage {
  role: ChatRole;
  content: string;
}

interface ChatStreamOptions {
  signal?: AbortSignal;
  onText?: (text: string) => void;
}

interface ChatErrorPayload {
  error?: unknown;
  code?: unknown;
}

/** An error returned by the chat endpoint or caused by an invalid stream. */
export class ChatServiceError extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(message: string, options: { code?: string; status?: number } = {}) {
    super(message);
    this.name = 'ChatServiceError';
    this.code = options.code;
    this.status = options.status;
  }
}

export function isChatAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function getErrorMessage(payload: unknown, fallback: string): { message: string; code?: string } {
  if (!payload || typeof payload !== 'object') return { message: fallback };
  const body = payload as ChatErrorPayload;
  return {
    message: typeof body.error === 'string' && body.error.trim() ? body.error : fallback,
    code: typeof body.code === 'string' ? body.code : undefined,
  };
}

async function readHttpError(response: Response): Promise<ChatServiceError> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  const { message, code } = getErrorMessage(payload, `Chat request failed (${response.status}).`);
  return new ChatServiceError(message, { code, status: response.status });
}

/**
 * POST a deliberately narrow, user-authored conversation to the backend and
 * consume its Server-Sent Events response. Only a `done` event makes the
 * response eligible for use by the UI; partial text is supplied to onText
 * for display but is never persisted by this service.
 */
export async function streamChat(
  messages: ChatRequestMessage[],
  { signal, onText }: ChatStreamOptions = {},
): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) throw await readHttpError(response);
  if (!response.body) {
    throw new ChatServiceError('The assistant response ended before it could be read.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let eventData: string[] = [];
  let completed = false;

  const dispatchEvent = () => {
    if (eventData.length === 0) return;

    const rawData = eventData.join('\n');
    eventData = [];

    let payload: unknown;
    try {
      payload = JSON.parse(rawData);
    } catch {
      throw new ChatServiceError('The assistant returned an invalid stream event.');
    }

    if (!payload || typeof payload !== 'object') {
      throw new ChatServiceError('The assistant returned an invalid stream event.');
    }

    const event = payload as { type?: unknown; text?: unknown; message?: unknown; code?: unknown };
    if (event.type === 'content') {
      if (typeof event.text !== 'string') {
        throw new ChatServiceError('The assistant returned invalid content.');
      }
      onText?.(event.text);
      return;
    }

    if (event.type === 'done') {
      completed = true;
      return;
    }

    if (event.type === 'error') {
      throw new ChatServiceError(
        typeof event.message === 'string' && event.message.trim()
          ? event.message
          : 'The assistant could not complete this response.',
        { code: typeof event.code === 'string' ? event.code : undefined },
      );
    }

    throw new ChatServiceError('The assistant returned an unknown stream event.');
  };

  const processLine = (line: string) => {
    if (line.startsWith(':')) return;
    if (line.startsWith('data:')) {
      eventData.push(line.slice(5).replace(/^ /, ''));
      return;
    }
    if (line === '') dispatchEvent();
  };

  try {
    while (!completed) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        processLine(line);
        if (completed) break;
      }
    }

    // A final event may not have a trailing blank line. Process it before
    // deciding whether the stream ended cleanly, while still requiring done.
    if (!completed) {
      buffer += decoder.decode();
      if (buffer) processLine(buffer);
      if (eventData.length > 0) dispatchEvent();
    }
  } finally {
    reader.releaseLock();
  }

  if (!completed) {
    throw new ChatServiceError('The assistant response ended before it was complete.');
  }
}
