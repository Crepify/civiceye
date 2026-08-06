# 🚀 Deploying CivicEye to Vercel

CivicEye is a static Vite SPA — deploying to Vercel takes about 2 minutes.

## Option A — Deploy from GitHub (recommended)

1. Push the project to a GitHub repository (see **[GITHUB_SETUP.md](./GITHUB_SETUP.md)**).
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the repository.
3. Vercel auto-detects **Vite** — no config needed. Verify the settings:

   | Setting          | Value           |
   | ---------------- | --------------- |
   | Framework preset | **Vite**        |
   | Build command    | `npm run build` |
   | Output directory | `dist`          |
   | Install command  | `npm install`   |

4. Click **Deploy**. 🎉

## Option B — CLI deploy

```bash
npm i -g vercel
vercel login
cd civiceye
vercel            # first deploy (answer prompts: Vite detected, dist/)
vercel --prod     # promote to production
```

## Environment variables (important)

After the first deploy:

1. Open the project on Vercel → **Settings → Environment Variables**.
2. Add `VITE_GOOGLE_MAPS_API_KEY` (optional — the app works without it).
3. Redeploy (or the next build picks it up). Because the key is bundled by Vite at build time, **you must trigger a new build after changing it**.

> ⚠️ Keys that start with `VITE_` are exposed to the browser. Restrict your Google key to your Vercel domain (see ENVIRONMENT.md).

## SPA routing (already handled)

Vercel serves `dist/` with a built-in **rewrite-all-to-`index.html`** rule for Vite projects, so deep links like `/report` and `/report/xyz` work directly. (A `vercel.json` is not required, but one is provided below if you want it explicit.)

```json
// vercel.json (optional)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Post-deploy checklist

- [ ] Open `https://<your-app>.vercel.app` → landing loads
- [ ] `/map` renders the fallback map (or Google Maps if key set)
- [ ] Submit a report → appears on `/map` and `/dashboard`
- [ ] Deep-link `/report/CE-1001` → renders (SPA rewrite working)
- [ ] Dark mode toggle persists across reloads

## Other platforms (in a nutshell)

- **Netlify:** build `npm run build`, publish `dist`, add a `/* → /index.html` redirect.
- **Render / Railway:** static site with build `npm run build`, publish dir `dist`.
- **GitHub Pages:** set `base: '/<repo>/'` in `vite.config.ts`, then `npm run build` + push `dist`.
