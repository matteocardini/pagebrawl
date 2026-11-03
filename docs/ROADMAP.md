# Page Brawl — roadmap

Work **one milestone at a time**. Tick the boxes as you complete them. At the end of each milestone run
`npm run typecheck && npm run lint && npm run test && npm run build`, then stop and summarise.

## M0 — Scaffold
- [x] Vite + React + TypeScript (strict) project created in the repo root (keep the existing `docs/`, `CLAUDE.md`, `README.md`, `LICENSE`, `.gitignore`, `.env.example`)
- [x] Dependencies installed: `three`, `@react-three/fiber`, `@react-three/drei`, `@fontsource/press-start-2p`; dev: `vitest`, `eslint` (+ TS/React plugins), `@types/three`, `@vercel/node`
- [x] npm scripts exactly as listed in `CLAUDE.md`
- [x] Folder structure from `docs/ARCHITECTURE.md` created (empty modules with a short header comment are fine)
- [x] `src/styles/tokens.css` with the palette; app shows a dark placeholder screen with the title "PAGE BRAWL" in the pixel font
- [x] `vercel.json` with the function `maxDuration`
- [ ] First commit pushed to `main` (committed locally; push left to the owner)

## M1 — Engine (branch `m1-engine`)
- [ ] `src/engine/types.ts`, `constants.ts`, `run-match.ts` implementing `docs/GAME_RULES.md` exactly
- [ ] Unit tests: worked examples 1, 2, 3 and 4 from `docs/GAME_RULES.md` (example 4 checks that a KO ends the match early: only 3 rounds in the result); a single block round mixed with normal rounds; the `max = 0` case; a tie-break on `performanceScore`; determinism (same input twice → deep-equal output)
- [ ] 100% of branches in `run-match.ts` covered
- [ ] `src/data/fixtures.ts` with the four fixtures and the stable-hash mapping from hostname

## M2 — 2D view (branch `m2-view-2d`)
- [ ] `use-match.ts` and `use-playback.ts` as described in `docs/ARCHITECTURE.md`
- [ ] `UrlForm` (two inputs, "FIGHT!" button, client-side URL normalisation, validation messages), `ErrorMessage`
- [ ] `fetch-metrics.ts` in mock mode (artificial 1500 ms delay with a themed loading screen)
- [ ] `View2D`: energy bars, fighter names, move labels, damage numbers, crit styling, K.O. banner, finish banner with winner
- [ ] Rematch and Skip buttons; speed toggle (1×/2×)
- [ ] Responsive down to 360 px; reduced-motion respected; focus states visible
- [ ] A complete match can be played end-to-end in the browser with mock data

## M3 — Toggle + empty 3D scene (branch `m3-toggle-3d`)
- [ ] `ViewToggle` (2D / 3D, `aria-pressed`, persisted in `localStorage` with try/catch)
- [ ] `View3D` lazy-loaded with `Suspense` fallback; empty arena (floor, grid, fog, lights) and two towers sized by `totalBytes`
- [ ] Switching views mid-match does **not** restart or desync the match (verify manually and describe how in the summary)
- [ ] WebGL-unavailable fallback: 3D option disabled with a message, app stays on 2D

## M4 — 3D arena and animations (branch `m4-arena-3d`)
- [ ] Attack animation (projectile/pulse) from attacker to defender, hit shake, collapse on KO
- [ ] Energy bars visible in 3D (drei `Html` or 3D meshes), synced with `PlaybackState.energy`
- [ ] Idle camera orbit, fixed framing during rounds, damage/crit text in the scene or overlay
- [ ] Steady 60 fps on a mid-range laptop; `dpr={[1, 1.5]}`; no console warnings
- [ ] The same match plays identically in 2D and 3D (same timing, same outcome)

## M5 — Real data (branch `m5-real-data`)
- [ ] `api/analyze.ts` implementing the contract in `docs/ARCHITECTURE.md` (validation, error codes, cache headers)
- [ ] `fetch-metrics.ts` real mode with friendly error messages; mock mode stays available via `VITE_USE_MOCK=true`
- [ ] Loading screen tolerates 10–30 s analyses (progress animation, no frozen UI), with a "taking longer than usual" message after 20 s
- [ ] README explains how to get a PageSpeed API key and run locally with `vercel dev`
- [ ] Ask the owner for `PSI_API_KEY` if it is not available; do not fake the integration

## M6 — Share screen (branch `m6-share`)
- [ ] Final result card: winner, both fighters' key metrics, finish type (KO/decision/draw), designed to look good in a screenshot
- [ ] "Copy challenge link": URL with `?a=<url>&b=<url>` that pre-fills the form and starts the match when opened
- [ ] Static Open Graph image and meta tags in `index.html` (title, description, `og:image`); dynamic OG image is a stretch goal, do not start it unless asked
- [ ] "Share" button using the Web Share API when available, clipboard fallback

## M7 — Ship (branch `m7-ship`)
- [ ] Favicon, `<title>`, meta description, `lang="en"`
- [ ] Lighthouse mobile on the production build: performance ≥ 90 (2D first load), accessibility ≥ 95
- [ ] README finished: tagline, GIF/video placeholder, live URL placeholder, rules summary, local setup, deploy, credits, license
- [ ] Deploy instructions for Vercel verified (env var `PSI_API_KEY`), project builds from a clean clone
- [ ] Final pass: remove dead code, check `.env` is not tracked, tag `v1.0.0`

## Stretch (only if asked)
- Sound effects with a mute toggle (off by default)
- Dynamic OG image per match
- Extra rounds (CLS, TBT) as an "advanced mode"
- Leaderboard of the heaviest sites (would need a database: out of scope for v1)
