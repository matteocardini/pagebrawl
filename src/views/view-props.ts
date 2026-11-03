import type { PlaybackSpeed, PlaybackState } from '../state/use-playback';

/** The contract between the playback layer and any view. Views only render this. */
export type ViewProps = {
  playback: PlaybackState;
  onSkip: () => void;
  onRematch: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
};
