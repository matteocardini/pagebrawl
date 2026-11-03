import { fixtureFor } from './fixtures';
import type { SiteMetrics } from '../engine/types';

export const MOCK_DELAY_MS = 1500;

export class FetchMetricsError extends Error {}

/** Fixtures are used only when explicitly asked for; anything else (including unset) means real data. */
export const USING_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_url: "That address doesn't look right. Check it and try again.",
  rate_limited: 'Google is busy, try again in a minute.',
  analysis_failed: "Google couldn't analyze that site. Check the address and try again.",
  timeout: 'The analysis took too long. Try again, or pick a lighter site.',
  server_error: 'Something broke on our side. Try again soon.',
};
const FALLBACK_MESSAGE = 'Something went wrong. Try again.';
const NETWORK_MESSAGE = "Can't reach the server. Check your connection and try again.";

type ApiSuccess = { url: string; hostname: string; metrics: Omit<SiteMetrics, 'url' | 'hostname'> };

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Calls the `/api/analyze` function for one normalised URL and maps failures to friendly messages. */
export async function fetchFromApi(url: string, fetchImpl: typeof fetch = fetch): Promise<SiteMetrics> {
  let response: Response;
  try {
    response = await fetchImpl(`/api/analyze?url=${encodeURIComponent(url)}`);
  } catch {
    throw new FetchMetricsError(NETWORK_MESSAGE);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new FetchMetricsError(FALLBACK_MESSAGE);
  }

  if (!response.ok) {
    const code = (body as { error?: unknown } | null)?.error;
    throw new FetchMetricsError((typeof code === 'string' && ERROR_MESSAGES[code]) || FALLBACK_MESSAGE);
  }

  const data = body as ApiSuccess;
  return { url: data.url, hostname: data.hostname, ...data.metrics };
}

/** Loads the metrics of one normalised URL: fixtures in mock mode, the real API otherwise. */
export async function fetchMetrics(url: string, delayMs = MOCK_DELAY_MS): Promise<SiteMetrics> {
  if (!USING_MOCK) return fetchFromApi(url);
  await wait(delayMs);
  return fixtureFor(url, new URL(url).hostname);
}
