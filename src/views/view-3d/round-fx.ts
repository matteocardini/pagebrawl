import type { MutableRefObject } from 'react';

/** Seconds since the active round started, already scaled by playback speed. Mutated every frame. */
export type RoundClock = MutableRefObject<{ round: number; elapsed: number }>;
