# 🏗️ CivicEye — Architecture

## 1. Big picture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser (React 18 SPA)                                      │
│                                                              │
│  Pages ──► Components ──► Context (state) ──► Services ──► Mock "API" │
│  (router)      (UI)          (stores)          (logic)       │
└──────────────────────────────────────────────────────────────┘
        │                                   │
        │                           ┌───────▼────────┐
        │                           │ reports.json   │  (100 seeded)
        │                           │ localStorage   │  (runtime deltas)
        │                           └────────────────┘
        │
        ├──► Google Maps JS API   (only if VITE_GOOGLE_MAPS_API_KEY set)
        └──► Fallback vector map  (SVG engine — always available)
```

The app is deliberately **service-oriented**: pages never talk to storage directly; they call `reportService` through the `ReportsContext`, so a real REST backend can replace the mock layer without touching a single screen.

## 2. Data flow

1. **Seeding** — `scripts/generate-reports.mjs` writes `src/data/reports.json` (100 reports, deterministic PRNG, clustered around Bengaluru neighbourhoods).
2. **Hydration** — `reportService` reads `localStorage` (`civiceye:reports:v1`) if present, else the JSON seed, into an in-memory array.
3. **Mutations** — votes, confirms, status changes, new reports go through `reportService.*` which updates memory **and** persists to `localStorage`.
4. **Propagation** — `ReportsContext` re-reads the service and every page re-renders from one source of truth.

### Domain model (`src/types`)

```ts
Report {
  id, title, description,
  coordinates: { lat, lng }, locationName,
  category: CategoryId, severity: Severity,
  status: 'pending' | 'verified' | 'in-progress' | 'resolved' | 'rejected',
  image, upvotes, downvotes, votes, confirms, rejects,
  date, verified, author, assignedTo?
}
```

**Auto-verification rule:** `confirms >= 3` ⇒ `verified = true` and status → `verified` (implemented in `reportService.confirm`).

## 3. State management (contexts)

| Context                | Responsibility                                                                  |
| ---------------------- | ------------------------------------------------------------------------------- |
| `ThemeProvider`        | `light`/`dark`, persists to localStorage, syncs `html.dark`.                    |
| `ToastProvider`        | Global toast queue with progress bars (accessible via `useToast`).              |
| `ReportsProvider`      | Wraps `reportService`; exposes CRUD + domain actions; all pages read from here. |
| `NotificationProvider` | In-app notification bell store.                                                 |

Providers are composed in `context/AppProviders.tsx` with an explicit order (Toast must wrap toast consumers).

## 4. The map — two engines, one API

`MapView` is the single entry point used by every page. It resolves a status via `useGoogleMapsStatus()`:

- **`ready`** → `GoogleMapView`
  - Built with `@googlemaps/js-api-loader` (lazy, once).
  - Clustered markers via `@googlemaps/markerclusterer` (`GridAlgorithm`, custom SVG cluster + severity pin renderers).
  - Severity heatmap via `google.maps.visualization.HeatmapLayer` (typed through a small adapter because the API is deprecated in the type defs).
  - Info windows render the shared React `MapPopup` via `createRoot`.
  - Dark-mode styling reapplied on theme change.
- **`fallback`** → `FallbackMapView`
  - Pure SVG engine: equirectangular projection, deterministic stylised city (roads/parks generated once), grid clustering, heatmap circles, drag-pan/wheel-zoom, click-to-select, click-to-drop-pin.
  - Zero config — this is what demo machines see by default.
- Both share the floating **zoom + locate** controls in `MapView`.

### Why fallback at all?

A hackathon demo must never show a grey box. The fallback guarantees the full experience (markers, clustering, heatmap, popups, pin-drop) even with no key, no network, or an invalid key — and `GoogleMapView` takes over automatically the moment a valid key exists.

## 5. The report wizard (6 steps)

```
Category → Photo (QR / camera / upload) → AI Analysis → Location → Details → Review
```

- **QR sync** (`services/syncService.ts`): desktop creates a session id and shows a QR to `{origin}/report?session=…`. The phone captures a photo, publishes it via `BroadcastChannel` (same device) and a simulated cloud relay (storage + poll). The desktop receives it and continues. Deterministic and offline-safe.
- **AI analysis** (`services/aiAnalysisService.ts`): staged progress animation (~4.3 s), then a **deterministic mock model** — hash of the photo seeds a PRNG that scores all 12 categories, picks the top, computes confidence, severity, detected objects, description and GPS timestamp. Same photo ⇒ same result, like a real model.
- **Location** (`services/geoService.ts`): `navigator.geolocation` with graceful fallback to manual pin-drop; area name from `mockReverseGeocode` (nearest seeded neighbourhood).

## 6. Authorities dashboard

Pure derived state from `useReports()` — no extra store:

- KPIs (`open / pending / verified / resolved`)
- Category breakdown (animated bars), severity donut (SVG arcs), weekly trend (real date bucketing)
- Hotspots (top neighbourhoods by count/critical)
- Recent table with **Resolve / Assign-to-agency / Reject**
- **Generate report** → plain-text ward report downloaded via Blob (`utils/download.ts`)
- **Report to authority** → modal simulation with staged sending + confetti success (reusable `ReportToAuthority` component)

## 7. Design system

- **Tokens** in `tailwind.config.js`: brand `primary` (indigo) + emerald accents, `glass`, `card`, `btn-*`, `chip`, `input-base`, `skeleton`, `text-gradient` etc. defined once in `styles/index.css` via `@layer components`.
- **Motion language**: page transitions in `App.tsx`, scroll reveals via `Reveal`, layout animations via `AnimatePresence`, micro-interactions (hover lift, tap scale, pulse rings, confetti sparks) throughout.
- **Accessibility**: semantic landmarks, `aria-*` on interactive controls, focus-visible rings, `prefers-reduced`-friendly animations (Framer Motion defaults), keyboard-closable modals/drawers, `aria-live` toast region.

## 8. Testing / extending

- **Swap in a real backend:** implement `reportService` methods against your API (keep the same signatures) — zero page changes.
- **Real Google Maps:** add `VITE_GOOGLE_MAPS_API_KEY` (see ENVIRONMENT.md).
- **Real AI:** replace `analyzePhoto` with a call to any vision API; the UI contract (`AnalysisResult`) is unchanged.
- **New category:** add to `CategoryId`, `CATEGORIES`, `CATEGORY_ICONS`, `OBJECT_POOL`, and the generator pools — everything else adapts automatically.
