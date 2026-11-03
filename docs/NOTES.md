# Decisions log

Format: date — decision — reason.

- 2026-11-03 — `typecheck` runs `tsc -b` (project references) instead of `tsc --noEmit` — the root tsconfig has `files: []`, so a plain `--noEmit` would check nothing.
- 2026-11-03 — React 18 with `@react-three/fiber@8` and `@react-three/drei@9` — fiber 9 / drei 10 require React 19, and CLAUDE.md fixes React 18.
- 2026-11-03 — Added `@vitest/coverage-v8` and `jsdom` as dev dependencies — coverage is needed to enforce the 100% branch rule on `run-match.ts`; jsdom for later hook tests if needed.
- 2026-11-03 — `vitest` runs with `passWithNoTests` — M0 has no tests yet.
