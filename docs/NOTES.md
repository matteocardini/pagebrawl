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
- 2026-11-03 — Pinned `three@0.180` / `@types/three@0.180` — fiber 8 with newer three logged a `THREE.Clock` deprecation warning; the milestone requires no console warnings.
- 2026-11-03 — M4 work was done directly on `main` (owner request), after fast-forward merging m1–m3.
- 2026-11-03 — 3D animation timing is view-local (a clock reset on each new `activeRound`, scaled by `speed`) — `PlaybackState` carries no elapsed time; the hit lands 350 ms into a round in both views (`src/views/timing.ts`; the 2D CSS uses the same 350 ms delay, also applied to the energy bar drain in both views).
- 2026-11-03 — Switching view mid-round replays that round's attack animation from its start in the new view; the match state (energy, round, outcome) is unaffected.
- 2026-11-03 — Under reduced motion the 3D view skips hit shake, flash and camera sway (projectile and collapse still show) and the CSS damage text/bars appear without animation.
- 2026-11-03 — `api/_psi.ts` holds the pure API helpers (underscore = not a Vercel route) and the API tests run in Vitest (`api/**/*.test.ts`) — keeps validation and metric extraction testable without a network.
- 2026-11-03 — PSI 401/403 map to `server_error` (our key problem), other non-OK statuses to `analysis_failed`; the PSI call times out at 55 s so the function can answer `timeout` before the 60 s limit.
- 2026-11-03 — M5 was first tested with simulated PSI responses only; once the owner added `PSI_API_KEY`, the handler was run for real: example.com → 200 (8 s), bbc.com → 200 (23 s), unknown domain → 502 `analysis_failed`, IP url → 400. `vercel dev` end-to-end (browser) was not run: it needs a Vercel login/project link.
- 2026-11-03 — The 2D/3D views render the shared `ResultCard` in place of their own winner banners — one screenshot-friendly result for both views.
- 2026-11-03 — "Copy challenge link" falls back to showing the link in a read-only field when the clipboard is denied; "Share" uses `navigator.share` and falls back to copying.
- 2026-11-03 — A challenge link only auto-starts if both URLs validate; otherwise the form is just pre-filled.
- 2026-11-03 — OG image `public/og-image.png` was rendered once with headless Chrome (Press Start 2P); `og:url`/`og:image` use the placeholder domain `page-brawl.vercel.app` until the real domain is known (TODO in `index.html`).
- 2026-11-03 — The WebGL support probe now runs only when the 2D/3D toggle is about to show (`useViewMode(needed)`) and releases its context — creating a context on first load cost ~2.8 s of blocking time in Lighthouse (performance 71 → 100).
- 2026-11-03 — Added `public/robots.txt` (allow all) — without it the SPA fallback served HTML for /robots.txt and Lighthouse SEO flagged it.
- 2026-11-03 — Owner feedback: the 2D/3D toggle is now visible on the first screen. The WebGL probe stays off the critical path: the toggle starts enabled, support is checked 2 s after load or immediately when a match is shown (Lighthouse still 100).
- 2026-11-03 — Owner feedback: every hit now says what the defender lost on (`PAGESPEED SCORE`, `LOAD SPEED (LCP)`, `PAGE WEIGHT`, `REQUESTS`) plus both values, in 2D and 3D. The data only has performance metrics, so there is no SEO round.
- 2026-11-03 — Owner feedback: the 3D pulse was hard to see; it is now larger, with a tail and a shock ring on impact, and the hit lands 600 ms into a round in both views (`--hit-delay` in `tokens.css` mirrors `HIT_DELAY_S`). The move name sits at the bottom of the 3D canvas so it does not cover the damage text.
- 2026-11-03 — Owner decision: 6 rounds instead of 4. Added Freeze Ray (TBT) and Shake Quake (CLS); `MAX_DAMAGE` 35 → 25 so KOs stay about as likely; the earliest KO moves from round 3 to round 4. Rules, worked examples and fixtures in `docs/GAME_RULES.md` were recomputed first and the engine tests follow them.
- 2026-11-03 — Floors 200 ms (TBT) and 0.1 (CLS), Lighthouse's "good" thresholds, keep near-zero metrics from producing huge relative gaps. Other metrics have floor 0 (unchanged behaviour). First version: `a = |x-y| / max(x, y, floor)`; superseded below.
- 2026-11-03 — A live PSI run for bbc.com took 49 s (limit in the function: 55 s). Heavy sites can come close to the timeout; the user sees the `timeout` message if exceeded.
- 2026-11-03 — Relative imports inside `api/` must end in `.js` (`./_psi.js`): the project is `"type": "module"`, so Node ESM on Vercel cannot resolve extensionless paths and the function crashed with FUNCTION_INVOCATION_FAILED on the first deploy. Reproduced locally by compiling `api/` and importing it as native ESM; local Vitest/tsc did not catch it because they resolve extensionless imports.
- 2026-11-03 — Mock mode is now opt-in: only `VITE_USE_MOCK=true` uses fixtures; unset or any other value means real data. Before this the first production deploy silently ran on fixtures (anything but `false` meant mock) — found by playing a match on the live site. A visible "Demo mode" label now shows whenever fixtures are in use.
- 2026-11-03 — Owner played alessiabweddings.com vs gigliocooking.com: 0 ms vs 202 ms of TBT dealt a 31-damage critical, because the first floor rule only helped when both values were under the floor. New rule: each value is raised to the floor before comparing (`cx = max(x, floor)`), so values at or under it are equal and 0 vs 202 ms is a 3-damage scratch. GAME_RULES.md, example 1 (round 5 damage 29 → 27) and example 5 were recomputed first.
