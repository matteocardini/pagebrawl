import { describe, expect, it } from 'vitest';
import { FetchMetricsError, fetchFromApi } from './fetch-metrics';

const reply = (status: number, body: unknown) => async () => new Response(JSON.stringify(body), { status });

describe('fetchFromApi', () => {
  it('flattens the API payload into SiteMetrics and encodes the url', async () => {
    let requested = '';
    const fetchImpl = async (input: RequestInfo | URL) => {
      requested = String(input);
      return new Response(
        JSON.stringify({
          url: 'https://example.com/',
          hostname: 'example.com',
          metrics: { performanceScore: 87, lcpMs: 2100, totalBytes: 1_450_000, requests: 52 },
          fetchedAt: '2026-11-03T09:30:00.000Z',
        }),
      );
    };
    const site = await fetchFromApi('https://example.com/?a=1&b=2', fetchImpl as typeof fetch);
    expect(requested).toBe('/api/analyze?url=https%3A%2F%2Fexample.com%2F%3Fa%3D1%26b%3D2');
    expect(site).toEqual({
      url: 'https://example.com/',
      hostname: 'example.com',
      performanceScore: 87,
      lcpMs: 2100,
      totalBytes: 1_450_000,
      requests: 52,
    });
  });

  it.each([
    [429, 'rate_limited', 'Google is busy, try again in a minute.'],
    [502, 'analysis_failed', "Google couldn't analyze that site. Check the address and try again."],
    [504, 'timeout', 'The analysis took too long. Try again, or pick a lighter site.'],
    [400, 'invalid_url', "That address doesn't look right. Check it and try again."],
    [500, 'server_error', 'Something broke on our side. Try again soon.'],
    [500, 'mystery', 'Something went wrong. Try again.'],
  ])('maps %i %s to a friendly message', async (status, error, message) => {
    await expect(fetchFromApi('https://example.com/', reply(status, { error, message: 'raw' }) as typeof fetch)).rejects.toThrow(message);
  });

  it('reports a network failure and an unreadable response', async () => {
    const offline = async () => {
      throw new TypeError('Failed to fetch');
    };
    await expect(fetchFromApi('https://example.com/', offline as typeof fetch)).rejects.toThrow(/Can't reach the server/);
    const html = async () => new Response('<html>', { status: 502 });
    await expect(fetchFromApi('https://example.com/', html as typeof fetch)).rejects.toBeInstanceOf(FetchMetricsError);
  });
});
