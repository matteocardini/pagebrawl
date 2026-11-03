import type { SiteMetrics } from '../engine/types';

type Fixture = Omit<SiteMetrics, 'url'>;

export const FIXTURES: readonly Fixture[] = [
  { hostname: 'fast.example', performanceScore: 92, lcpMs: 1800, totalBytes: 900_000, requests: 38 },
  { hostname: 'slow.example', performanceScore: 41, lcpMs: 5200, totalBytes: 4_800_000, requests: 140 },
  { hostname: 'average.example', performanceScore: 68, lcpMs: 3100, totalBytes: 2_300_000, requests: 85 },
  { hostname: 'bloated.example', performanceScore: 55, lcpMs: 4200, totalBytes: 7_500_000, requests: 210 },
];

/** FNV-1a: small, stable string hash (no randomness, same result in every runtime). */
function stableHash(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Mock-mode mapping: an exact hostname match uses that fixture, anything else
 * picks a fixture by a stable hash of the hostname. The result keeps the real
 * url and hostname so the fighter shows the name the user typed.
 */
export function fixtureFor(url: string, hostname: string): SiteMetrics {
  const exact = FIXTURES.find((fixture) => fixture.hostname === hostname);
  const picked = exact ?? FIXTURES[stableHash(hostname) % FIXTURES.length];
  if (!picked) throw new Error('No fixtures available');
  return { ...picked, url, hostname };
}
