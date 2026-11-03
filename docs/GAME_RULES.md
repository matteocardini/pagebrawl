# Page Brawl — game rules (source of truth for `src/engine`)

The engine takes the metrics of two sites and returns a full, deterministic match result.
No randomness. Same input → same output.

## Input

```ts
type SiteMetrics = {
  url: string;               // full URL as entered
  hostname: string;          // used as the fighter's name
  performanceScore: number;  // 0–100, higher is better   (PSI performance category score × 100)
  lcpMs: number;             // Largest Contentful Paint in ms, lower is better
  totalBytes: number;        // total page weight in bytes, lower is better
  requests: number;          // number of network requests, lower is better
  tbtMs: number;             // Total Blocking Time in ms, lower is better
  cls: number;               // Cumulative Layout Shift (unitless), lower is better
};
```

Fighters are called **A** (first URL) and **B** (second URL).

## Constants

| Name              | Value | Meaning                                            |
|-------------------|-------|----------------------------------------------------|
| `START_ENERGY`    | 100   | Energy of each fighter at the start                |
| `MAX_DAMAGE`      | 25    | Damage of a round at 100% advantage                |
| `MIN_DAMAGE`      | 3     | Minimum damage when a round is won by any margin   |
| `CRIT_THRESHOLD`  | 0.6   | Advantage at or above which the hit is critical    |
| `CRIT_MULTIPLIER` | 1.25  | Damage multiplier for critical hits                |

## Rounds

There are always **6 rounds**, in this fixed order. Each round is one "move" based on one metric.

| # | Move id         | Label           | Metric             | Winner of the round | Floor |
|---|-----------------|-----------------|--------------------|---------------------|-------|
| 1 | `speed-punch`   | Speed Punch     | `performanceScore` | higher value wins   | 0     |
| 2 | `paint-kick`    | Paint Kick      | `lcpMs`            | lower value wins    | 0     |
| 3 | `heavy-slam`    | Heavy Slam      | `totalBytes`       | lower value wins    | 0     |
| 4 | `request-combo` | Request Combo   | `requests`         | lower value wins    | 0     |
| 5 | `freeze-ray`    | Freeze Ray      | `tbtMs`            | lower value wins    | 200   |
| 6 | `shake-quake`   | Shake Quake     | `cls`              | lower value wins    | 0.1   |

The **floor** is the metric's Lighthouse "good" threshold. Before two values are compared, each is raised to the
floor: anything at or under it counts as *equal to the floor*. It keeps tiny absolute differences on metrics that sit
near zero (TBT, CLS) from counting as huge relative gaps: 0 ms vs 202 ms of blocking time is not a 100% advantage,
and 10 ms vs 20 ms is not even a hit, because both are "good". A floor of 0 changes nothing.

## Round resolution

For each round, with metric values `x` (fighter A) and `y` (fighter B):

1. Let `cx = max(x, floor)` and `cy = max(y, floor)` (the compared values; with floor 0 they are `x` and `y`).
   If `cx === cy` → **block**: `attacker = null`, `damage = 0`, `crit = false`. No energy changes.
2. Otherwise the round winner is the **attacker**; the other fighter is the **defender**.
3. Advantage: `a = |cx − cy| / max(cx, cy)`. (`max(cx, cy)` is never 0 here: if both were 0 the round was a block.)
4. `raw = a × MAX_DAMAGE`. If `a ≥ CRIT_THRESHOLD` → `crit = true` and `raw = raw × CRIT_MULTIPLIER`.
5. `damage = max(MIN_DAMAGE, Math.round(raw))`.
6. Defender energy = `max(0, energy − damage)`. The reported `damage` is the computed value, even if
   the defender's energy was clamped at 0.
7. If a defender reaches 0 energy → **KO**: the match ends immediately. Remaining rounds are not played
   (they do not appear in the result).

## End of the match

- **KO**: the fighter that reached 0 energy loses. `finish = 'KO'`.
- If both fighters are alive after round 4 → **decision**: the fighter with more energy wins.
  `finish = 'decision'`.
- Equal energy → tie-break on `performanceScore` (higher wins), still `finish = 'decision'`.
- Still equal → `winner = 'draw'`, `finish = 'draw'`.

## Output

```ts
type FighterId = 'A' | 'B';
type MoveId = 'speed-punch' | 'paint-kick' | 'heavy-slam' | 'request-combo';

type Round = {
  index: number;                  // 1-based
  moveId: MoveId;
  label: string;
  metricKey: 'performanceScore' | 'lcpMs' | 'totalBytes' | 'requests';
  valueA: number;
  valueB: number;
  attacker: FighterId | null;     // null = block
  damage: number;                 // 0 for blocks
  crit: boolean;
  energyAfter: Record<FighterId, number>;
};

type MatchResult = {
  fighters: Record<FighterId, SiteMetrics>;
  rounds: Round[];
  winner: FighterId | 'draw';
  finish: 'KO' | 'decision' | 'draw';
};
```

Public API of the engine: `runMatch(a: SiteMetrics, b: SiteMetrics): MatchResult`.

## Worked example 1 — KO (use as a unit test)

A = `fast.example`: score 92, LCP 1800 ms, 900 000 bytes, 38 requests, TBT 120 ms, CLS 0.02
B = `slow.example`: score 41, LCP 5200 ms, 4 800 000 bytes, 140 requests, TBT 1400 ms, CLS 0.35

| Round | Winner | a      | crit | damage | Energy after (A / B) |
|-------|--------|--------|------|--------|----------------------|
| 1     | A      | 0.5543 | no   | 14     | 100 / 86             |
| 2     | A      | 0.6538 | yes  | 20     | 100 / 66             |
| 3     | A      | 0.8125 | yes  | 25     | 100 / 41             |
| 4     | A      | 0.7286 | yes  | 23     | 100 / 18             |
| 5     | A      | 0.8571 | yes  | 27     | 100 / 0              |

Result: `winner = 'A'`, `finish = 'KO'`, 5 rounds (round 6 is not played), B at 0 energy.

## Worked example 2 — draw (use as a unit test)

Two sites with identical metrics: all six rounds are blocks, energies stay 100 / 100,
tie-break on `performanceScore` is equal → `winner = 'draw'`, `finish = 'draw'`.

## Worked example 3 — decision (use as a unit test)

A: score 80, LCP 2000, 1 000 000 bytes, 50 requests, TBT 300, CLS 0.12
B: score 70, LCP 2200, 1 100 000 bytes, 60 requests, TBT 350, CLS 0.15

- R1: A wins, a = 10/80 = 0.125 → raw 3.125 → damage 3. B 97.
- R2: A wins, a = 200/2200 = 0.0909 → raw 2.27 → minimum damage 3. B 94.
- R3: A wins, a = 100 000/1 100 000 = 0.0909 → raw 2.27 → damage 3. B 91.
- R4: A wins, a = 10/60 = 0.1667 → raw 4.17 → damage 4. B 87.
- R5: A wins, a = 50/max(300, 350, 200) = 0.1429 → raw 3.57 → damage 4. B 83.
- R6: A wins, a = 0.03/max(0.12, 0.15, 0.1) = 0.2 → raw 5 → damage 5. B 78.

Result: `winner = 'A'`, `finish = 'decision'`, energies 100 / 78.

## Worked example 4 — early KO at round 4 (use as a unit test)

A: score 90, LCP 500 ms, 100 000 bytes, 10 requests, TBT 50, CLS 0.01
B: score 9, LCP 5000 ms, 1 000 000 bytes, 100 requests, TBT 2000, CLS 0.9

Rounds 1–4 have `a = 0.9` → critical → damage 28. B energy: 72, 44, 16, 0.
Result: **4 rounds only**, `winner = 'A'`, `finish = 'KO'`, B at 0 energy.
(The earliest possible KO is round 4: the maximum damage in one round is 31 — `a = 1`, 25 × 1.25 = 31.25 → 31 —
so three rounds can never reach 100.)

## Worked example 5 — the floor (use as a unit test)

All values are compared after being raised to the floor (200 ms for TBT, 0.1 for CLS):

- TBT 10 ms vs 20 ms: both become 200 → **block** (both are "good").
- TBT 0 ms vs 202 ms: 200 vs 202 → `a = 2 / 202 = 0.0099` → raw 0.25 → minimum damage 3, no crit.
- TBT 0 ms vs 2000 ms: 200 vs 2000 → `a = 0.9` → critical → damage 28.
- CLS 0.05 vs 0.15: 0.1 vs 0.15 → `a = 0.05 / 0.15 = 0.3333` → raw 8.33 → damage 8, no crit.
- CLS 0 vs 0.5: 0.1 vs 0.5 → `a = 0.8` → critical → damage 25.

## Fixtures for mock mode (`src/data/fixtures.ts`)

Provide at least these four sites so the app works without the API:

| hostname        | score | LCP ms | bytes     | requests |
|-----------------|-------|--------|-----------|----------|
| `fast.example`  | 92    | 1800   | 900 000   | 38       |
| `slow.example`  | 41    | 5200   | 4 800 000 | 140      |
| `average.example` | 68  | 3100   | 2 300 000 | 85       |
| `bloated.example` | 55  | 4200   | 7 500 000 | 210      |

The fixtures also carry TBT and CLS:

| hostname          | TBT ms | CLS  |
|-------------------|--------|------|
| `fast.example`    | 120    | 0.02 |
| `slow.example`    | 1400   | 0.35 |
| `average.example` | 450    | 0.12 |
| `bloated.example` | 900    | 0.25 |

In mock mode the URL-to-fixture mapping is: if the hostname matches a fixture, use it; otherwise pick a
fixture by a stable hash of the hostname, so the same URL always gives the same result.
