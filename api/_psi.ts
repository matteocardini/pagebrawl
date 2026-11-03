// Pure helpers for api/analyze.ts (the underscore keeps Vercel from exposing this file as a route).

export type ApiMetrics = {
  performanceScore: number;
  lcpMs: number;
  totalBytes: number;
  requests: number;
  tbtMs: number;
  cls: number;
};

export type ErrorCode = 'invalid_url' | 'rate_limited' | 'analysis_failed' | 'timeout' | 'server_error';

export const ERROR_STATUS: Record<ErrorCode, number> = {
  invalid_url: 400,
  rate_limited: 429,
  analysis_failed: 502,
  timeout: 504,
  server_error: 500,
};

const MAX_URL_LENGTH = 2048;

/** Returns the parsed URL, or null when it is missing, malformed, not http(s), local or an IP literal. */
export function parseTargetUrl(raw: unknown): URL | null {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > MAX_URL_LENGTH) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const host = url.hostname;
  if (!host.includes('.') || host === 'localhost' || host.endsWith('.localhost')) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[')) return null;
  return url;
}

type Audit = { numericValue?: unknown; details?: { items?: unknown } };
type PsiResponse = {
  lighthouseResult?: {
    categories?: { performance?: { score?: unknown } };
    audits?: Record<string, Audit | undefined>;
  };
};

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Reads the four game metrics from a PageSpeed Insights v5 response; null when anything is missing. */
export function extractMetrics(body: unknown): ApiMetrics | null {
  const lighthouse = (body as PsiResponse | null)?.lighthouseResult;
  const score = finiteNumber(lighthouse?.categories?.performance?.score);
  const lcp = finiteNumber(lighthouse?.audits?.['largest-contentful-paint']?.numericValue);
  const bytes = finiteNumber(lighthouse?.audits?.['total-byte-weight']?.numericValue);
  const tbt = finiteNumber(lighthouse?.audits?.['total-blocking-time']?.numericValue);
  const cls = finiteNumber(lighthouse?.audits?.['cumulative-layout-shift']?.numericValue);
  const items = lighthouse?.audits?.['network-requests']?.details?.items;
  if (score === null || lcp === null || bytes === null || tbt === null || cls === null || !Array.isArray(items)) {
    return null;
  }
  return {
    performanceScore: Math.round(score * 100),
    lcpMs: Math.round(lcp),
    totalBytes: Math.round(bytes),
    requests: items.length,
    tbtMs: Math.round(tbt),
    cls: Math.round(cls * 1000) / 1000,
  };
}
