import type { VercelRequest, VercelResponse } from '@vercel/node';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './analyze';

type Reply = { status: number; body: unknown; headers: Record<string, string> };

async function call(url: string | undefined): Promise<Reply> {
  const reply: Reply = { status: 0, body: undefined, headers: {} };
  const res = {
    setHeader: (name: string, value: string) => void (reply.headers[name] = value),
    status: (code: number) => {
      reply.status = code;
      return res;
    },
    json: (body: unknown) => {
      reply.body = body;
      return res;
    },
  };
  await handler({ query: { url } } as unknown as VercelRequest, res as unknown as VercelResponse);
  return reply;
}

const psiOk = {
  lighthouseResult: {
    categories: { performance: { score: 0.5 } },
    audits: {
      'largest-contentful-paint': { numericValue: 3000 },
      'total-byte-weight': { numericValue: 2_000_000 },
      'network-requests': { details: { items: [{}, {}, {}] } },
    },
  },
};

describe('api/analyze', () => {
  beforeEach(() => {
    process.env.PSI_API_KEY = 'test-key';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PSI_API_KEY;
  });

  it('returns metrics with cache headers and sends mobile/performance/key to PSI', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(psiOk)));
    vi.stubGlobal('fetch', fetchMock);
    const reply = await call('https://example.com/');
    expect(reply.status).toBe(200);
    expect(reply.body).toMatchObject({
      url: 'https://example.com/',
      hostname: 'example.com',
      metrics: { performanceScore: 50, lcpMs: 3000, totalBytes: 2_000_000, requests: 3 },
    });
    expect(reply.headers['Cache-Control']).toBe('public, s-maxage=3600, stale-while-revalidate=86400');
    const requested = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requested.searchParams.get('strategy')).toBe('mobile');
    expect(requested.searchParams.get('category')).toBe('performance');
    expect(requested.searchParams.get('key')).toBe('test-key');
  });

  it('rejects an invalid url without calling PSI', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const reply = await call('http://127.0.0.1/');
    expect(reply.status).toBe(400);
    expect(reply.body).toMatchObject({ error: 'invalid_url' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [429, 'rate_limited', 429],
    [500, 'analysis_failed', 502],
    [400, 'analysis_failed', 502],
    [403, 'server_error', 500],
  ])('maps PSI status %i to %s', async (psiStatus, code, status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: psiStatus })));
    const reply = await call('https://example.com/');
    expect(reply.status).toBe(status);
    expect(reply.body).toMatchObject({ error: code });
  });

  it('answers analysis_failed when PSI data is unusable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"lighthouseResult":{}}')));
    expect((await call('https://example.com/')).body).toMatchObject({ error: 'analysis_failed' });
  });

  it('answers timeout when the request is aborted', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('slow', 'TimeoutError')));
    const reply = await call('https://example.com/');
    expect(reply.status).toBe(504);
    expect(reply.body).toMatchObject({ error: 'timeout' });
  });

  it('answers server_error without leaking details, or when the key is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom key=test-key')));
    const reply = await call('https://example.com/');
    expect(reply.status).toBe(500);
    expect(JSON.stringify(reply.body)).not.toContain('test-key');
    delete process.env.PSI_API_KEY;
    expect((await call('https://example.com/')).body).toMatchObject({ error: 'server_error' });
  });
});
