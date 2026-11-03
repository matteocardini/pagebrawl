# Page Brawl

**Two websites enter. One leaves faster.**

Page Brawl is a tiny browser game where two real websites fight each other using their real performance
metrics. Paste two URLs, watch the match, and find out whose page is the heavyweight champion.
Watch it in retro **2D** or in a low-poly **3D arena**, and switch between them at any time.

<!-- TODO: add a GIF or short video of a match here -->
<!-- TODO: add the live URL here -->

## How a match works

Both sites start with 100 energy. Four rounds, one per metric (data from Google PageSpeed Insights, mobile):

| Round | Move          | Metric                       | Wins                |
|-------|---------------|------------------------------|---------------------|
| 1     | Speed Punch   | Performance score            | higher              |
| 2     | Paint Kick    | Largest Contentful Paint     | lower               |
| 3     | Heavy Slam    | Total page weight            | lower               |
| 4     | Request Combo | Number of network requests   | lower               |

The bigger the gap, the harder the hit; huge gaps are critical hits. Reach 0 energy and it's a K.O.
Otherwise the fighter with more energy wins on decision. The full rules live in [`docs/GAME_RULES.md`](docs/GAME_RULES.md).

## Run it locally

```bash
git clone https://github.com/matteocardini/page-brawl.git
cd page-brawl
npm install
cp .env.example .env.local
npm run dev
```

By default the app runs in **mock mode** (fake sites, no API key needed).

### Using real data

1. Create a PageSpeed Insights API key: in the [Google Cloud console](https://console.cloud.google.com/), create or pick a
   project, enable the **PageSpeed Insights API**, then create an API key under *APIs & Services → Credentials*.
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

A real analysis takes 10–30 seconds. The key only ever lives on the server; the browser calls `/api/analyze?url=...`.

## Tech

Vite · React · TypeScript · three.js with React Three Fiber · Vitest.
The match engine is a pure, fully tested TypeScript module, completely independent from the two views.

## Scripts

`npm run dev` · `npm run build` · `npm run test` · `npm run lint` · `npm run typecheck`

## Deploy

Built for Vercel. Set `PSI_API_KEY` in the project's environment variables and deploy.

## License

MIT © Matteo Cardini
