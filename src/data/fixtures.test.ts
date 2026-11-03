import { describe, expect, it } from 'vitest';
import { FIXTURES, fixtureFor } from './fixtures';

describe('fixtureFor', () => {
  it('provides the four documented fixtures', () => {
    expect(FIXTURES.map((f) => f.hostname)).toEqual([
      'fast.example',
      'slow.example',
      'average.example',
      'bloated.example',
    ]);
  });

  it('uses the fixture whose hostname matches', () => {
    const site = fixtureFor('https://slow.example/', 'slow.example');
    expect(site).toMatchObject({
      performanceScore: 41,
      lcpMs: 5200,
      totalBytes: 4_800_000,
      requests: 140,
      tbtMs: 1400,
      cls: 0.35,
    });
  });

  it('maps unknown hostnames to a stable fixture, keeping their own name', () => {
    const first = fixtureFor('https://github.com/', 'github.com');
    const second = fixtureFor('https://github.com/', 'github.com');
    expect(first).toEqual(second);
    expect(first.hostname).toBe('github.com');
    expect(FIXTURES.some((f) => f.performanceScore === first.performanceScore)).toBe(true);
  });
});
