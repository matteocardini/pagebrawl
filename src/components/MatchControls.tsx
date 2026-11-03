import type { PlaybackSpeed } from '../state/use-playback';

type Props = {
  finished: boolean;
  speed: PlaybackSpeed;
  onSkip: () => void;
  onRematch: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
};

export function MatchControls({ finished, speed, onSkip, onRematch, onSpeedChange }: Props) {
  return (
    <div className="controls">
      {finished ? (
        <button type="button" className="btn btn--primary" onClick={onRematch}>
          Rematch
        </button>
      ) : (
        <>
          <button
            type="button"
            className="btn"
            aria-pressed={speed === 2}
            onClick={() => onSpeedChange(speed === 1 ? 2 : 1)}
          >
            {speed}×
          </button>
          <button type="button" className="btn" onClick={onSkip}>
            Skip
          </button>
        </>
      )}
    </div>
  );
}
