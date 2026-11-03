import { useCallback, useEffect, useState } from 'react';

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

let cachedSupport: boolean | null = null;

function webglSupported(): boolean {
  cachedSupport ??= supportsWebGL();
  return cachedSupport;
}

const PROBE_DELAY_MS = 2000;

/**
 * The chosen view lives in the app (above the match), is persisted, and never exceeds what WebGL allows.
 * Creating a WebGL context is costly, so it is not probed during first load: the toggle starts enabled and
 * the support is checked shortly after, or right away when a match is about to be shown (`matchActive`).
 */
export function useViewMode(matchActive: boolean) {
  const [probed, setProbed] = useState(false);
  const [stored, setStored] = useState<ViewMode>(readStoredMode);

  useEffect(() => {
    const timer = setTimeout(() => setProbed(true), PROBE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const webgl = probed || matchActive ? webglSupported() : true;
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
