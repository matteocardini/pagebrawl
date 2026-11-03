import { fixtureFor } from './fixtures';
import type { SiteMetrics } from '../engine/types';

export const MOCK_DELAY_MS = 1500;

export class FetchMetricsError extends Error {}

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Loads the metrics of one normalised URL: fixtures in mock mode, the API otherwise (M5). */
export async function fetchMetrics(url: string, delayMs = MOCK_DELAY_MS): Promise<SiteMetrics> {
  if (!useMock) {
    throw new FetchMetricsError('Real data is not connected yet. Set VITE_USE_MOCK=true to play with fixtures.');
  }
  await wait(delayMs);
  return fixtureFor(url, new URL(url).hostname);
}
