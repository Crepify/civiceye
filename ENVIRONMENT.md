# 🔑 Environment variables & Google Maps API setup

## Variables

All env vars are consumed **at build time** through `import.meta.env` (Vite convention). They must be prefixed with `VITE_` to be exposed to the client bundle.

| Variable                   | Required | Default                                                 | Purpose                                                                                                                 |
| -------------------------- | -------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `VITE_GOOGLE_MAPS_API_KEY` | No       | _(empty)_                                               | Enables real Google Maps. Without it the app uses the built-in fallback vector map.                                     |
| `VITE_APP_URL`             | No       | `window.location.origin`                                | Base URL baked into the QR “scan & upload” link (set it to your production domain, e.g. `https://civiceye.vercel.app`). |
| `VITE_AUTHORITIES`         | No       | `BBMP Ward 42,BWSSB,BESCOM,Traffic Police,Forest Dept.` | Comma-separated mock agencies (dashboard assignment).                                                                   |

### Setup steps

```bash
cp .env.example .env     # then edit .env
```

---

## 🗺️ Getting a Google Maps API key (step by step)

1. **Create/select a project** at [console.cloud.google.com](https://console.cloud.google.com/).

2. **Enable APIs**
   - _APIs & Services → Library_
   - Enable **Maps JavaScript API** (required for the map).
   - Optional but recommended: **Places API** (autocomplete) and **Geocoding API** (address lookup).

3. **Create the key**
   - _APIs & Services → Credentials → + Create credentials → API key_
   - Copy the key, e.g. `AIzaSyB...`.

4. **Restrict the key** (strongly recommended)
   - Click the key → _Application restrictions → HTTP referrers_
   - Add: `http://localhost:*`, `https://localhost:*`, `https://your-app.vercel.app/*`
   - Under _API restrictions_, allow only the three APIs above.

5. **Wire it up**

   ```env
   # .env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyB...
   VITE_APP_URL=https://civiceye.vercel.app
   ```

6. **Restart** the dev server (`npm run dev`) or redeploy on Vercel — the key is inlined at build time.

> 💡 **No-key fallback:** leave the key empty and the app still works — `MapView` renders the built-in vector map (`FallbackMapView`) with the same markers, clustering, heatmap and interactions. This is intentional so judges/demo machines never hit a blank map.

## Server-only authority workflow variables

These variables are used by Vercel API routes and must **not** be prefixed with
`VITE_` or exposed to the browser:

| Variable | Purpose |
| --- | --- |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP delivery for authority and resolution emails. |
| `SMTP_FROM` | CivicEye sender address. |
| `AMRITA_SMTP_FROM` | Optional Amrita Eye sender address, for example `Amrita Eye <alerts@blr.amrita.edu>`. |
| `AMRITA_REPLY_EMAIL` | Amrita reply-to and campus authority inbox fallback; defaults to `info@blr.amrita.edu`. |
| `AUTHORITY_EMAIL_<ID>` | Optional server-side override for an allow-listed authority inbox. |
| `EMAIL_WEBHOOK_SECRET` | Shared secret used by the resolution-notification route. |
| `AUTHORITY_INBOUND_SECRET` | Shared secret sent by the selected inbound email provider to `/api/authority-inbound`. |
| `SUPABASE_URL` | Supabase URL for the inbound authority webhook. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key for normalising authority replies. Never expose it to Vite. |
| `AMRITA_NETWORK_IPS` | Comma-separated campus public egress IPv4 addresses used by `/api/network-context`. |
| `AMRITA_NETWORK_CIDRS` | Optional comma-separated campus public IPv4 CIDRs, for example `203.0.113.0/24`. |

The inbound route expects a provider-normalised POST body containing `from`,
`subject`, `text`, a `CE-XXXXXXXX` report reference, and preferably `messageId`
for deduplication. Supply the secret in `x-authority-webhook-secret`.
It stores replies for admin review; email wording alone never resolves a case.
Provider sender-authentication and automated evidence validation remain pending.
Apply `supabase/schema.sql`, `supabase/authority_responses.sql` (including the
atomic review RPC), and `supabase/campus_routes.sql` before enabling these tools.

The browser cannot read the Wi-Fi SSID. When `AMRITA_NETWORK_IPS` or
`AMRITA_NETWORK_CIDRS` is configured with the campus network's public egress
address, CivicEye calls `/api/network-context` and offers a one-time Amrita Eye
switch prompt. If the variables are empty, the prompt stays disabled.

## 🔐 Security notes

- `VITE_*` vars are public by design — never put server secrets there.
- Key restrictions (referrers + API restrictions) protect you from quota abuse even though the key ships in the bundle.
- The Geocoding/Places calls are **not** made in this prototype — location naming uses a local mock (`src/services/geocodeService.ts`). Swap `mockReverseGeocode` for `google.maps.Geocoder` to go live.
