# Amrita Bengaluru pilot branch

This branch contains the single brand-scoped chatbot, campus route guards and
pages, supplied floor-plan assets, room catalog, route editor/history, and an
authority reply review prototype.

## Deployment setup

- Apply `supabase/schema.sql`, then `supabase/campus_routes.sql` and
  `supabase/authority_responses.sql`. The last migration installs the atomic
  admin review RPC used by the staff panel.
- Configure the server variables in `ENVIRONMENT.md`. Campus chat verifies
  bearer sessions using `SUPABASE_URL` / `SUPABASE_ANON_KEY` (the existing
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` variables also work server-side).
- Inbound email provider integration is deferred. The prototype stores replies
  for review; keyword matches do not automatically resolve reports. Provider
  sender authentication and fix-evidence validation still need implementation.

## Remaining pilot work

- Verify every room label and floor image against the supplied PDFs. The 24
  views preserve the source visuals, but generated room coordinates and legacy
  faculty seat coordinates are not verified indoor geometry.
- Implement calibrated room entrances, corridors, stairs/lifts, accessible
  indoor routing and Google Maps metric calibration. Outdoor graph reachability
  checks do not establish physical route accuracy.
- Route editing currently covers outdoor edges, publication history, and
  loading an old version as a draft. Node editing, durable drafts, concurrency
  controls and a complete audit workflow remain pending.
- Complete backend campus isolation, including the existing anonymous food
  hygiene endpoint and related report/review/storage policies. The campus food
  hygiene page currently submits text only.
- Verify migrations and mail delivery against staging, and exercise the
  authenticated UI in a browser before production deployment.

## Checks

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run typecheck
npm run lint
npm run build
node --test tests/authority-workflow.test.mjs
```
