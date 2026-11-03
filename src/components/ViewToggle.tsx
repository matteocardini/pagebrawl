import type { ViewMode } from '../state/use-view-mode';

type Props = {
  mode: ViewMode;
  webgl: boolean;
  onChange: (mode: ViewMode) => void;
};

export function ViewToggle({ mode, webgl, onChange }: Props) {
  return (
    <div className="view-toggle">
      <div className="view-toggle__group" role="group" aria-label="View">
        <button type="button" className="view-toggle__btn" aria-pressed={mode === '2d'} onClick={() => onChange('2d')}>
          2D
        </button>
        <button
          type="button"
          className="view-toggle__btn"
          aria-pressed={mode === '3d'}
          disabled={!webgl}
          aria-describedby={webgl ? undefined : 'view-toggle-note'}
          onClick={() => onChange('3d')}
        >
          3D
        </button>
      </div>
      {!webgl && (
        <p id="view-toggle-note" className="view-toggle__note">
          3D needs WebGL, which is not available in this browser.
        </p>
      )}
    </div>
  );
}
