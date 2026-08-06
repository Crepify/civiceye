# 🐙 Pushing CivicEye to GitHub

## 1. Create a repository

- Go to [github.com/new](https://github.com/new)
- Name it e.g. `civiceye` (public or private — your call)
- Do **not** tick “Add a README” (we have one).

## 2. Push from your machine

```bash
cd civiceye

# (One-time) tell git who you are — if you haven't already
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

git init
git add .
git commit -m "feat: CivicEye — civic issue reporting platform (prototype)"

git branch -M main
git remote add origin https://github.com/<your-username>/civiceye.git
git push -u origin main
```

Authenticate when prompted (browser flow or a [personal access token](https://github.com/settings/tokens)).

## 3. Make sure secrets stay out

`.gitignore` already excludes:

- `node_modules/`, `dist/`
- `.env`, `.env.local`, `.env.*.local`
- OS/editor junk

**Never commit `.env`** — only the template `.env.example` is committed.

## 4. Optional: keep the main branch protected

Settings → Branches → Add rule:

- Require pull request reviews
- Require status checks: `build` (add a GitHub Action, below) if you want CI

## 5. Bonus: CI on every push

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

## 6. Next

- Connect the repo to **Vercel** → see [DEPLOYMENT.md](./DEPLOYMENT.md).
