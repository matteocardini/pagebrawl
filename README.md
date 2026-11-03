# Page Brawl

**Two websites enter. One leaves faster.**

Page Brawl is a tiny browser game where two real websites fight each other using their real performance
metrics. Paste two URLs, watch the match, and find out whose page is the heavyweight champion.
Watch it in retro **2D** or in a low-poly **3D arena**, and switch between them at any time, even mid-match.

<!-- TODO: add a GIF or short video of a match here, e.g. ![A Page Brawl match](docs/page-brawl.gif) -->

**Live:** <!-- TODO: add the production URL here -->

## How a match works

Both sites start with 100 energy. Four rounds, one per metric (data from Google PageSpeed Insights, mobile):

| Round | Move          | Metric                       | Wins                |
|-------|---------------|------------------------------|---------------------|
| 1     | Speed Punch   | Performance score            | higher              |
| 2     | Paint Kick    | Largest Contentful Paint     | lower               |
| 3     | Heavy Slam    | Total page weight            | lower               |
| 4     | Request Combo | Number of network requests   | lower               |

The bigger the gap, the harder the hit (up to 35 damage); a gap of 60% or more is a critical hit (×1.25).
Reach 0 energy and it's a **K.O.** and the match ends on the spot. Otherwise the fighter with more energy wins
on **decision**; ties go to the higher performance score, and a perfect tie is a draw.
The full rules and worked examples live in [`docs/GAME_RULES.md`](docs/GAME_RULES.md).

After a match you can copy a **challenge link** (`?a=<url>&b=<url>`): whoever opens it sees the same
fight start automatically.

## Run it locally

Requires Node 20+.

```bash
git clone https://github.com/matteocardini/page-brawl.git
cd page-brawl
npm install
cp .env.example .env.local
npm run dev
```

By default the app runs in **mock mode** (four fake sites, no API key needed): `fast.example`, `slow.example`,
`average.example`, `bloated.example`. Any other address maps to one of them, always the same one.

### Using real data

1. Create a PageSpeed Insights API key: in the [Google Cloud console](https://console.cloud.google.com/), create or
   pick a project, enable the **PageSpeed Insights API**, then create an API key (APIs & Services → Credentials)
   and restrict it to that API.
2. Put it in `.env.local` (never commit it):
   ```
   PSI_API_KEY=your-key
   VITE_USE_MOCK=false
   ```
3. Run the app with the Vercel CLI so the `/api/analyze` function is served next to the frontend:
   ```bash
   npx vercel dev
   ```
   (`npm run dev` only serves the frontend, so use it with `VITE_USE_MOCK=true`.)

A real analysis takes 10–30 seconds. The key only ever lives on the server; the browser calls
`/api/analyze?url=...`, which is documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Tech

Vite · React 18 · TypeScript (strict) · three.js with React Three Fiber · Vitest.
The match engine (`src/engine`) is a pure, fully tested TypeScript module, completely independent from the two
views. Match state lives above the views, so switching 2D/3D never restarts or alters the match. The 3D view is
lazy-loaded, so the 2D first load stays small.

## Scripts

| Command             | What it does                    |
|---------------------|---------------------------------|
| `npm run dev`       | Vite dev server                 |
| `npm run build`     | Typecheck + production build    |
| `npm run preview`   | Serve the production build      |
| `npm run test`      | Vitest, run once                |
| `npm run test:watch`| Vitest in watch mode            |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript, no emit             |

## Deploy (Vercel)

1. Import the repository in Vercel (framework preset: **Vite**; build command `npm run build`, output `dist`).
2. In *Project Settings → Environment Variables* add `PSI_API_KEY` (server only, no `VITE_` prefix). Leave
   `VITE_USE_MOCK` unset (or `false`) in production.
3. Deploy. `vercel.json` sets the `/api/analyze` function to a 60 second `maxDuration`; if your plan caps it lower,
   lower it too (the function itself gives up after 55 s with a `timeout` error).
4. Replace the placeholder domain `page-brawl.vercel.app` in `index.html` (`og:url`, `og:image`, `twitter:image`)
   with your real one.

## Credits

Pixel font [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) (self-hosted via Fontsource).
Performance data from [Google PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about).
Built with [three.js](https://threejs.org/) and [React Three Fiber](https://docs.pmnd.rs/react-three-fiber).

## License

MIT © Matteo Cardini
