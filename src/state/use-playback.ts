import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FighterId, MatchResult, Round } from '../engine/types';

export type PlaybackSpeed = 1 | 2;

export type PlaybackState = {
  result: MatchResult;
  currentRound: number;
  phase: 'intro' | 'round' | 'finished';
  energy: Record<FighterId, number>;
  activeRound: Round | null;
  speed: PlaybackSpeed;
};

export const INTRO_MS = 1200;
export const ROUND_MS = 1600;

const START_ENERGY: Record<FighterId, number> = { A: 100, B: 100 };

/**
 * Plays a MatchResult over time. Owns the timers, so unmounting a view
 * never interrupts the match. `step` 0 is the intro, 1..n are rounds,
 * n + 1 is finished.
 */
export function usePlayback(result: MatchResult) {
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const lastStep = result.rounds.length + 1;

  useEffect(() => {
    if (step >= lastStep) return;
    const duration = step === 0 ? INTRO_MS : ROUND_MS;
    const timer = setTimeout(() => setStep(step + 1), duration / speed);
    return () => clearTimeout(timer);
  }, [step, speed, lastStep]);

  const skip = useCallback(() => setStep(lastStep), [lastStep]);

  const playback = useMemo<PlaybackState>(() => {
    const currentRound = Math.min(step, result.rounds.length);
    const played = result.rounds[currentRound - 1];
    return {
      result,
      currentRound,
      phase: step === 0 ? 'intro' : step >= lastStep ? 'finished' : 'round',
      energy: played ? played.energyAfter : START_ENERGY,
      activeRound: step >= 1 && step < lastStep ? (played ?? null) : null,
      speed,
    };
  }, [result, step, speed, lastStep]);

  return { playback, skip, setSpeed };
}
