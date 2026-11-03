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
};
```

Fighters are called **A** (first URL) and **B** (second URL).

## Constants

| Name              | Value | Meaning                                            |
|-------------------|-------|----------------------------------------------------|
| `START_ENERGY`    | 100   | Energy of each fighter at the start                |
| `MAX_DAMAGE`      | 35    | Damage of a round at 100% advantage                |
| `MIN_DAMAGE`      | 3     | Minimum damage when a round is won by any margin   |
| `CRIT_THRESHOLD`  | 0.6   | Advantage at or above which the hit is critical    |
| `CRIT_MULTIPLIER` | 1.25  | Damage multiplier for critical hits                |

## Rounds

There are always **4 rounds**, in this fixed order. Each round is one "move" based on one metric.

| # | Move id        | Label           | Metric             | Winner of the round        |
|---|----------------|-----------------|--------------------|----------------------------|
| 1 | `speed-punch`  | Speed Punch     | `performanceScore` | higher value wins          |
| 2 | `paint-kick`   | Paint Kick      | `lcpMs`            | lower value wins           |
| 3 | `heavy-slam`   | Heavy Slam      | `totalBytes`       | lower value wins           |
| 4 | `request-combo`| Request Combo   | `requests`         | lower value wins           |

## Round resolution

For each round, with metric values `x` (fighter A) and `y` (fighter B):

1. If `x === y` → **block**: `attacker = null`, `damage = 0`, `crit = false`. No energy changes.
2. Otherwise the round winner is the **attacker**; the other fighter is the **defender**.
3. Advantage: `a = |x − y| / max(x, y)`. If `max(x, y) === 0`, treat as a block (step 1).
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

A = `fast.example`: score 92, LCP 1800 ms, 900 000 bytes, 38 requests
B = `slow.example`: score 41, LCP 5200 ms, 4 800 000 bytes, 140 requests

| Round | Winner | a      | crit | damage | Energy after (A / B) |
|-------|--------|--------|------|--------|----------------------|
| 1     | A      | 0.5543 | no   | 19     | 100 / 81             |
| 2     | A      | 0.6538 | yes  | 29     | 100 / 52             |
| 3     | A      | 0.8125 | yes  | 36     | 100 / 16             |
| 4     | A      | 0.7286 | yes  | 32     | 100 / 0              |

Result: `winner = 'A'`, `finish = 'KO'`, 4 rounds, B at 0 energy.

## Worked example 2 — draw (use as a unit test)

Two sites with identical metrics: all four rounds are blocks, energies stay 100 / 100,
tie-break on `performanceScore` is equal → `winner = 'draw'`, `finish = 'draw'`.

## Worked example 3 — decision (use as a unit test)

A: score 80, LCP 2000, 1 000 000 bytes, 50 requests
B: score 70, LCP 2200, 1 100 000 bytes, 60 requests

- R1: A wins, a = 10/80 = 0.125 → raw 4.375 → damage 4. B 96.
- R2: A wins, a = 200/2200 = 0.0909 → raw 3.18 → damage 3. B 93.
- R3: A wins, a = 100 000/1 100 000 = 0.0909 → raw 3.18 → damage 3. B 90.
- R4: A wins, a = 10/60 = 0.1667 → raw 5.83 → damage 6. B 84.

Result: `winner = 'A'`, `finish = 'decision'`, energies 100 / 84.

## Worked example 4 — early KO at round 3 (use as a unit test)

A: score 90, LCP 500 ms, 100 000 bytes, 10 requests
B: score 9, LCP 5000 ms, 1 000 000 bytes, 100 requests

Every round has `a = 0.9` → critical → damage 39. B energy: 61, 22, 0.
Result: **3 rounds only**, `winner = 'A'`, `finish = 'KO'`, B at 0 energy.
(The earliest possible KO is round 3: the maximum damage in one round is 44, so two rounds can never reach 100.)

## Fixtures for mock mode (`src/data/fixtures.ts`)

Provide at least these four sites so the app works without the API:

| hostname        | score | LCP ms | bytes     | requests |
|-----------------|-------|--------|-----------|----------|
| `fast.example`  | 92    | 1800   | 900 000   | 38       |
| `slow.example`  | 41    | 5200   | 4 800 000 | 140      |
| `average.example` | 68  | 3100   | 2 300 000 | 85       |
| `bloated.example` | 55  | 4200   | 7 500 000 | 210      |

In mock mode the URL-to-fixture mapping is: if the hostname matches a fixture, use it; otherwise pick a
fixture by a stable hash of the hostname, so the same URL always gives the same result.
