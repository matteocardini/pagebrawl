import { describe, expect, it } from 'vitest';
import { buildChallengeLink, parseChallengeParams } from './challenge-link';

describe('challenge link', () => {
  it('round-trips urls containing query strings', () => {
    const urls = { a: 'https://a.example/?x=1&y=2', b: 'https://b.example/path' };
    const link = buildChallengeLink('https://pagebrawl.example/', urls);
    expect(link.startsWith('https://pagebrawl.example/?a=')).toBe(true);
    expect(parseChallengeParams(new URL(link).search)).toEqual(urls);
  });

  it('returns null when a parameter is missing or empty', () => {
    expect(parseChallengeParams('')).toBeNull();
    expect(parseChallengeParams('?a=example.com')).toBeNull();
    expect(parseChallengeParams('?a=example.com&b=%20')).toBeNull();
  });

  it('accepts addresses without a scheme', () => {
    expect(parseChallengeParams('?a=a.com&b=b.com')).toEqual({ a: 'a.com', b: 'b.com' });
  });
});
