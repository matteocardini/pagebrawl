import { useCallback, useRef, useState } from 'react';
import { fetchMetrics } from '../data/fetch-metrics';
import { runMatch } from '../engine/run-match';
import type { MatchResult } from '../engine/types';

export type Urls = { a: string; b: string };

export type MatchState =
  | { status: 'idle' }
  | { status: 'loading'; urls: Urls }
  | { status: 'ready'; urls: Urls; result: MatchResult }
  | { status: 'error'; urls: Urls; message: string };

/** Orchestrates input → loading → result. Playback of the result lives in usePlayback. */
export function useMatch(initialUrls: Urls = { a: '', b: '' }) {
  const [state, setState] = useState<MatchState>({ status: 'idle' });
  const [lastUrls, setLastUrls] = useState<Urls>(initialUrls);
  const latestRun = useRef(0);

  const start = useCallback(async (urls: Urls) => {
    const run = ++latestRun.current;
    setLastUrls(urls);
    setState({ status: 'loading', urls });
    try {
      const [metricsA, metricsB] = await Promise.all([fetchMetrics(urls.a), fetchMetrics(urls.b)]);
      if (run !== latestRun.current) return;
      setState({ status: 'ready', urls, result: runMatch(metricsA, metricsB) });
    } catch (error) {
      if (run !== latestRun.current) return;
      const message = error instanceof Error ? error.message : 'Something went wrong. Try again.';
      setState({ status: 'error', urls, message });
    }
  }, []);

  /** Back to the form, keeping the URLs filled in. Also cancels a pending request. */
  const reset = useCallback(() => {
    latestRun.current++;
    setState({ status: 'idle' });
  }, []);

  return { state, lastUrls, start, reset };
}
