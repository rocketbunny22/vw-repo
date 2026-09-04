import { describe, expect, it } from 'vitest';
import { readJsonObject } from '@/lib/validation';

function streamedRequest(chunks: string[]): Request {
  const encoder = new TextEncoder();
  return new Request('https://www.vwrepo.com/api/test', {
    method: 'POST',
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    }),
    duplex: 'half',
  } as RequestInit);
}

describe('bounded JSON parsing', () => {
  it('accepts a valid streamed JSON object below the byte limit', async () => {
    await expect(readJsonObject(streamedRequest(['{"value":', '"ok"}']), 32))
      .resolves.toEqual({ value: 'ok' });
  });

  it('rejects a streamed request that exceeds its byte limit without Content-Length', async () => {
    await expect(readJsonObject(streamedRequest(['{"value":"', '1234567890"}']), 16))
      .resolves.toBeNull();
  });

  it('rejects malformed or oversized declared Content-Length values before reading', async () => {
    const malformed = new Request('https://www.vwrepo.com/api/test', {
      method: 'POST',
      headers: { 'content-length': 'not-a-number' },
      body: '{"value":"ok"}',
    });
    const oversized = new Request('https://www.vwrepo.com/api/test', {
      method: 'POST',
      headers: { 'content-length': '100' },
      body: '{"value":"ok"}',
    });

    await expect(readJsonObject(malformed, 32)).resolves.toBeNull();
    await expect(readJsonObject(oversized, 32)).resolves.toBeNull();
  });
});
