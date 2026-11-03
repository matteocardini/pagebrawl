import type { Urls } from './use-match';

/** Builds `<base>?a=<url>&b=<url>`; the base is the page address without query or hash. */
export function buildChallengeLink(base: string, urls: Urls): string {
  const query = new URLSearchParams({ a: urls.a, b: urls.b });
  return `${base}?${query}`;
}

/** Reads `?a=...&b=...`; null unless both are present and non-empty. */
export function parseChallengeParams(search: string): Urls | null {
  const params = new URLSearchParams(search);
  const a = params.get('a')?.trim();
  const b = params.get('b')?.trim();
  return a && b ? { a, b } : null;
}
