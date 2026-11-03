import { useCallback, useState } from 'react';

export type ViewMode = '2d' | '3d';

const STORAGE_KEY = 'pagebrawl:view';

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
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

/** The chosen view lives in the app (above the match), is persisted, and never exceeds what WebGL allows. */
export function useViewMode() {
  const [webgl] = useState(supportsWebGL);
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
