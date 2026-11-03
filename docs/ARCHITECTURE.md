# Page Brawl — architecture

## Folder layout

```
page-brawl/
├─ api/
│  └─ analyze.ts              # Vercel serverless function (PageSpeed Insights proxy)
├─ docs/                      # these documents
├─ public/
├─ src/
│  ├─ engine/                 # PURE TypeScript, fully unit-tested
│  │  ├─ constants.ts
│  │  ├─ types.ts
│  │  ├─ run-match.ts
│  │  └─ run-match.test.ts
│  ├─ data/
│  │  ├─ fixtures.ts          # fake sites for mock mode
│  │  └─ fetch-metrics.ts     # real API client or mock, chosen by VITE_USE_MOCK
│  ├─ state/
│  │  ├─ use-match.ts         # orchestration: input → loading → result
│  │  └─ use-playback.ts      # plays the result round by round (timers)
│  ├─ views/
│  │  ├─ view-2d/             # retro 2D view
│  │  └─ view-3d/             # React Three Fiber view (lazy-loaded)
│  ├─ components/             # shared UI: UrlForm, ViewToggle, ResultCard, ErrorMessage, Logo
│  ├─ styles/
│  │  └─ tokens.css           # CSS variables (palette, spacing, font)
│  ├─ App.tsx
│  └─ main.tsx
├─ .env.example
├─ vercel.json
└─ package.json
```

## Data flow

```
UrlForm ──► useMatch.start(urlA, urlB)
              │  fetchMetrics(urlA), fetchMetrics(urlB)   (in parallel)
              ▼
         runMatch(metricsA, metricsB)  ──►  MatchResult   (instant, pure)
              ▼
         usePlayback(result)  ──►  PlaybackState   (advances over time)
              ▼
     ┌────────────────┬────────────────┐
     │   View2D       │    View3D      │   ← same props, only one mounted at a time
     └────────────────┴────────────────┘
```

### App phases
`idle → loading → playing → finished` (and `error`). A "Rematch" button returns to `idle` keeping the URLs
filled in. The view toggle is available in every phase after `idle`.

### Playback state (the contract between state and views)

```ts
type PlaybackState = {
  result: MatchResult;
  currentRound: number;            // 0 = before round 1, n = round n has just been played
  phase: 'intro' | 'round' | 'finished';
  energy: Record<FighterId, number>;   // energy shown now (after currentRound)
  activeRound: Round | null;       // the round being animated, null in intro/finished
  speed: 1 | 2;                    // playback speed multiplier
};
```

Both views receive exactly this (`<View2D playback={...} />`, `<View3D playback={...} />`) plus
`onSkip`/`onRematch` callbacks. A view **never** computes damage or winners.

`usePlayback` details:
- Intro: 1200 ms ("FIGHT!"), then each round lasts 1600 ms (divided by `speed`), then a final 1500 ms
  KO/decision banner before `finished`.
- It owns the timers. Switching the view only unmounts/mounts the view component; playback keeps running.
- `prefers-reduced-motion`: keep the same timing but views must disable shake/flash effects.
- Provide `skip()` which jumps to `finished`.

## Views

### 2D (retro)
- Pixel font `Press Start 2P`, two energy bars on top (drain with CSS transition), fighter names, current move
  label ("PAINT KICK!"), floating damage numbers ("-29 CRIT!"), a big "K.O." on KO.
- Fighters are drawn with CSS/SVG pixel-style blocks (no image assets required). A "tower" or "page window"
  icon per fighter is fine. Hit effect = brief flash + small shake (disabled under reduced motion).

### 3D (React Three Fiber)
- Low-poly arena: dark floor with a subtle grid, soft fog, two lights (cyan and pink rim light).
- Each fighter is a **tower** whose height reflects page weight:
  `height = lerp(2, 8, clamp(log10(totalBytes / 100_000) / 2, 0, 1))`  (100 kB → 2, 10 MB → 8).
- Attack animation: the attacker's tower fires a glowing projectile/pulse to the defender; on hit the
  defender shakes and an energy bar (3D or HTML overlay via drei `Html`) drains. KO = defender collapses.
- Slow orbiting camera while idle; a fixed framing during rounds. Use `drei` helpers sparingly.
- Must run at a steady 60 fps on a mid-range laptop and degrade gracefully on mobile (lower DPR:
  `dpr={[1, 1.5]}`), no post-processing in v1.
- The component is loaded with `React.lazy` and shows a small "Loading arena…" fallback.

### Toggle
`ViewToggle` is a segmented control (2D / 3D) with `aria-pressed`, keyboard focusable, state stored in the app
component (and in `localStorage` under `pagebrawl:view`, wrapped in try/catch).

## Palette and tokens (`src/styles/tokens.css`)

```
--bg:        #0a0e1f;   /* near-black navy */
--bg-2:      #131033;
--violet:    #7c3aed;
--cyan:      #22d3ee;
--pink:      #ec4899;
--text:      #e6e9ff;
--muted:     #8b93c9;
--danger:    #f43f5e;
--font-pixel: 'Press Start 2P', monospace;
--font-ui:    system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
```
Fighter A uses cyan, fighter B uses pink. Backgrounds echo the author's LinkedIn cover: dark gradient,
soft violet/cyan glows, faint dot grid.

## API contract — `GET /api/analyze?url=<encoded url>`

Success `200`:
```json
{
  "url": "https://example.com/",
  "hostname": "example.com",
  "metrics": { "performanceScore": 87, "lcpMs": 2100, "totalBytes": 1450000, "requests": 52 },
  "fetchedAt": "2026-11-03T09:30:00.000Z"
}
```
Errors (`{ "error": "<code>", "message": "<human readable>" }`):
| status | code             | when                                                   |
|--------|------------------|--------------------------------------------------------|
| 400    | `invalid_url`    | missing, not http/https, no valid hostname, too long   |
| 429    | `rate_limited`   | PageSpeed quota/rate limit reached                     |
| 502    | `analysis_failed`| PageSpeed returned an error or unusable data           |
| 504    | `timeout`        | analysis took longer than the function limit           |
| 500    | `server_error`   | anything else (never leak internals or the API key)    |

### Server implementation notes
- Call `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` with params
  `url`, `strategy=mobile`, `category=performance`, `key=process.env.PSI_API_KEY`.
- Extract from `lighthouseResult`:
  - `categories.performance.score` × 100 → `performanceScore` (round to integer)
  - `audits['largest-contentful-paint'].numericValue` → `lcpMs` (round)
  - `audits['total-byte-weight'].numericValue` → `totalBytes` (round)
  - `audits['network-requests'].details.items.length` → `requests`
- Missing field → `analysis_failed`.
- Validate the URL: only `http:`/`https:`, max 2048 chars; if the user omits the scheme on the client, add `https://`.
  Reject `localhost` and IP-literal hostnames.
- Set `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` on success.
- `vercel.json`: set `maxDuration` for `api/analyze.ts` to 60 seconds (PageSpeed can take 10–30 s; verify the
  current plan limits and adjust if the platform caps it lower).
- The client calls the API twice in parallel (one URL each), so each function call handles a single URL.
- Client messages: map each error code to a friendly sentence in `fetch-metrics.ts`
  (e.g. rate_limited → "Google is busy, try again in a minute").

## Environment variables

`.env.example` (committed):
```
# Server only (Vercel project settings, never prefixed with VITE_)
PSI_API_KEY=

# Client: use fixtures instead of the real API
VITE_USE_MOCK=true
```

## Quality bar
- Lighthouse performance of the 2D-only first load ≥ 90 on mobile (the 3D chunk is lazy-loaded).
- No console errors/warnings in dev or production builds.
- Works on current Chrome, Safari and Firefox; layout usable down to 360 px width.
- WebGL unavailable → show the 2D view and disable the 3D option with a tooltip/message instead of crashing.
