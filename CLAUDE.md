# Page Brawl — project guide for Claude Code

Page Brawl is a web game where two websites fight each other using real performance metrics.
The user enters two URLs, the metrics are fetched (Google PageSpeed Insights), and a turn-based
match plays out. The match can be watched in two interchangeable views: a retro **2D** view and a
low-poly **3D** view, with a toggle to switch between them at any time, even mid-match.

Owner: Matteo Cardini (GitHub: matteocardini). Repo: `page-brawl`. License: MIT.
This is a public portfolio project: code quality, a clean README and a great-looking result matter.

## Read these first, in this order
1. `docs/GAME_RULES.md`  — the exact rules, formulas and worked examples (source of truth for the engine)
2. `docs/ARCHITECTURE.md` — folder layout, types, data flow, API contract, view contract
3. `docs/ROADMAP.md`     — milestones M0–M7 with acceptance criteria. Work one milestone at a time.

If a document and this file disagree, `GAME_RULES.md` wins for game logic, `ARCHITECTURE.md` for structure.

## Commands
```
npm run dev         # Vite dev server
npm run build       # typecheck + production build
npm run preview     # serve the production build
npm run test        # Vitest (run once)
npm run test:watch  # Vitest watch
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
```
Before saying a milestone is done: `npm run typecheck && npm run lint && npm run test && npm run build` must all pass.

## Decisions already made (do not re-open them)
- Package manager: **npm**. Node 20+.
- Stack: **Vite + React 18 + TypeScript (strict)**. 3D with **three + @react-three/fiber + @react-three/drei**.
- State: React state/`useReducer` + context. **No** Redux/Zustand/other state libraries.
- Styling: plain CSS (CSS modules or one global stylesheet with CSS variables). **No** Tailwind, no UI kit.
- Pixel font: `@fontsource/press-start-2p` (self-hosted, no Google Fonts request).
- Tests: Vitest. The engine is fully unit-tested. Views are not required to have tests.
- UI language and README: **English**. Code comments: English. Commit messages: Conventional Commits.
- Data source: Google PageSpeed Insights API v5, `strategy=mobile`, category `performance`.
- Backend: one serverless function (`api/analyze.ts`, Vercel). No database, no auth, no analytics, no cookies.
- Deploy target: Vercel. The API key lives only in the server env var `PSI_API_KEY`, never in client code.
- The 3D view must be **lazy-loaded** (`React.lazy` + `Suspense`) so the 2D experience stays light.
- Mock mode: `VITE_USE_MOCK=true` makes the app use fixtures instead of the API (default in `.env.example`).

## Hard rules
1. **The engine is pure.** Everything in `src/engine` is plain TypeScript: no React, no DOM, no Three.js,
   no `Math.random`, no `Date.now`. Same input → same output, always.
2. **Views contain no game logic.** Both views only render the playback state they receive. Switching
   view must never restart or alter the match.
3. Match state lives **above** the views (in the app/playback layer), so a view switch just re-renders.
4. Never hard-code the API key, never log it, never commit `.env`. Only `.env.example` is committed.
5. Do not add dependencies beyond the stack above without a clear reason; if you add one, say why in the commit body.
6. Respect `prefers-reduced-motion` (no screen shake / flashing when set) and keep the toggle keyboard-accessible
   (`<button aria-pressed>`), with visible focus states.
7. Do not invent features. If something is not in the docs, choose the simplest option, and write it down
   in `docs/NOTES.md` (create it if missing) as one line: date, decision, reason.

## Conventions
- TypeScript strict, no `any`. Prefer small pure functions and named exports.
- File names: `kebab-case.ts` for modules, `PascalCase.tsx` for React components.
- Keep components small. If a component passes ~150 lines, split it.
- Design tokens (CSS variables) must match the palette in `docs/ARCHITECTURE.md`.
- Commit small and often: one logical change per commit, message like `feat(engine): add damage calculation`.
- Work on `main` for M0; from M1 on, use one branch per milestone (`m1-engine`, `m2-view-2d`, …) and tell the
  owner when it is ready to merge. Never force-push, never rewrite history.

## How to work
- Start each session by reading `docs/ROADMAP.md` and finding the first unchecked milestone.
- Implement only that milestone, tick its checkboxes in `docs/ROADMAP.md` as you complete them, and **stop**
  at the end of the milestone with a short summary: what changed, how to run it, what is next.
- If you are blocked by something only the owner can provide (API key, domain, decision), stop and ask in one
  clear question instead of guessing.
