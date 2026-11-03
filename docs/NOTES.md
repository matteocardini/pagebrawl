# Decisions log

Format: date — decision — reason.

- 2026-11-03 — `typecheck` runs `tsc -b` (project references) instead of `tsc --noEmit` — the root tsconfig has `files: []`, so a plain `--noEmit` would check nothing.
- 2026-11-03 — React 18 with `@react-three/fiber@8` and `@react-three/drei@9` — fiber 9 / drei 10 require React 19, and CLAUDE.md fixes React 18.
- 2026-11-03 — Added `@vitest/coverage-v8` and `jsdom` as dev dependencies — coverage is needed to enforce the 100% branch rule on `run-match.ts`; jsdom for later hook tests if needed.
- 2026-11-03 — `vitest` runs with `passWithNoTests` — M0 has no tests yet.
- 2026-11-03 — Playback goes intro (1200 ms) → rounds (1600 ms each) → `finished`; the K.O./decision banner is shown while `finished` instead of as an extra 1500 ms stage — `PlaybackState.phase` has no value for it and the simplest option is to keep the contract as documented.
- 2026-11-03 — Views also receive `onSpeedChange` (besides `onSkip`/`onRematch`) and share a `MatchControls` component — the 1×/2× toggle needs a callback and both views must offer the same controls.
- 2026-11-03 — Changing speed mid-round restarts the current stage timer at the new duration — keeps the timer code to one effect.
- 2026-11-03 — `fetchMetrics` in real mode throws a friendly "not connected yet" error until M5 — do not fake the integration.
- 2026-11-03 — Rematch resets to the form with the normalised URLs pre-filled — "keeping the URLs filled in".
- 2026-11-03 — M3 3D view shows a plain HTML name + energy number per side (no bars yet) and a static camera — M4 adds energy bars, orbit and animations; the numbers make desync checks possible now.
- 2026-11-03 — The view mode is stored under `pagebrawl:view`; if WebGL is missing the app forces 2D (ignoring a stored `3d`) without overwriting the stored choice.
- 2026-11-03 — Tests also cover `.tsx` (`ViewToggle.test.tsx`), rendered with `react-dom/server` — avoids a DOM test library.
