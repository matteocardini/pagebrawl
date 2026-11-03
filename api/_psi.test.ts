import { describe, expect, it } from 'vitest';
import { extractMetrics, parseTargetUrl } from './_psi';

const good = {
  lighthouseResult: {
    categories: { performance: { score: 0.873 } },
    audits: {
      'largest-contentful-paint': { numericValue: 2100.4 },
      'total-byte-weight': { numericValue: 1_450_000.2 },
      'total-blocking-time': { numericValue: 187.6 },
      'cumulative-layout-shift': { numericValue: 0.04567 },
      'network-requests': { details: { items: new Array(52).fill({}) } },
    },
  },
};

describe('parseTargetUrl', () => {
  it('accepts public http and https urls', () => {
    expect(parseTargetUrl('https://example.com/a?b=1')?.hostname).toBe('example.com');
    expect(parseTargetUrl('http://example.com')?.protocol).toBe('http:');
  });

  it.each([
    undefined,
    '',
    'example.com',
    'ftp://example.com',
    'javascript:alert(1)',
    'https://localhost/',
    'https://app.localhost/',
    'https://intranet/',
    'https://127.0.0.1/',
    'https://[::1]/',
    `https://example.com/${'a'.repeat(2100)}`,
    42,
  ])('rejects %j', (input) => {
    expect(parseTargetUrl(input)).toBeNull();
  });
});

describe('extractMetrics', () => {
  it('reads and rounds the four metrics', () => {
    expect(extractMetrics(good)).toEqual({
      performanceScore: 87,
      lcpMs: 2100,
      totalBytes: 1_450_000,
      requests: 52,
      tbtMs: 188,
      cls: 0.046,
    });
  });

  it('returns null when a field is missing or malformed', () => {
    expect(extractMetrics(null)).toBeNull();
    expect(extractMetrics({})).toBeNull();
    expect(extractMetrics({ lighthouseResult: { ...good.lighthouseResult, categories: { performance: { score: null } } } })).toBeNull();
    const noTbt = structuredClone(good);
    delete (noTbt.lighthouseResult.audits as Record<string, unknown>)['total-blocking-time'];
    expect(extractMetrics(noTbt)).toBeNull();
    const noCls = structuredClone(good);
    delete (noCls.lighthouseResult.audits as Record<string, unknown>)['cumulative-layout-shift'];
    expect(extractMetrics(noCls)).toBeNull();
    const noItems = structuredClone(good);
    noItems.lighthouseResult.audits['network-requests'] = { details: { items: undefined as never } };
    expect(extractMetrics(noItems)).toBeNull();
  });
});
