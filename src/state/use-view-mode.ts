import { useCallback, useMemo, useState } from 'react';

export type ViewMode = '2d' | '3d';

const STORAGE_KEY = 'pagebrawl:view';

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    // hand the probe context back right away; the real one is created by the 3D view
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

function readStoredMode(): ViewMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === '3d' ? '3d' : '2d';
  } catch {
    return '2d';
  }
}

/**
 * The chosen view lives in the app (above the match), is persisted, and never exceeds what WebGL allows.
 * `needed` is false on the first screen: creating a WebGL context is costly, so it is only probed
 * once the 2D/3D toggle is about to be shown.
 */
export function useViewMode(needed: boolean) {
  const webgl = useMemo(() => !needed || supportsWebGL(), [needed]);
  const [stored, setStored] = useState<ViewMode>(readStoredMode);
  const mode: ViewMode = webgl ? stored : '2d';

  const setMode = useCallback((next: ViewMode) => {
    setStored(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage can be blocked (private mode); the choice then lasts for this visit only */
    }
  }, []);

  return { mode, setMode, webgl };
}
