# System Architecture

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Data & auth** | Supabase — PostgreSQL, Row Level Security, Realtime, Storage, Auth (prepared, currently disabled) |
| **API layer** | Next.js Route Handlers under `app/api/` |
| **STL slicing** | External FastAPI service (`online_slicer`) — filament, print time, dimensions |
| **STL thumbnails** | FastAPI microservice (`stl2thumb/`, Compose service `thumb-service`) |
| **Validation** | Custom helpers in `lib/validation.ts` (no schema library) |
| **Analytics** | Middleware page-view tracking + Recharts admin dashboard |
| **Deployment** | Docker multi-stage build, `docker-compose` orchestration |

## High-level Architecture

```
Browser
   │
   ▼
Next.js (web) ─────────────────────────────────────┐
   │                                                │
   ├── Server Components ──► Supabase (PostgREST)   │
   ├── Client Components ──► Supabase Realtime      │
   ├── POST /api/slicer ──► online_slicer (FastAPI)│
   ├── POST /api/slicer ──► thumb-service (FastAPI) │
   └── Admin / checkout ──► Supabase (service role)  │
                                                     │
Supabase: PostgreSQL + Storage + Realtime ◄──────────┘
```

## Key Design Principles

- **Server-first** — marketing pages fetch Supabase data in Server Components (`force-dynamic` where env matters).
- **Realtime-first UI** — printer status uses Supabase Realtime subscriptions on the client.
- **Strong typing** — shared types in `lib/supabase/types.ts`; strict TypeScript.
- **Minimal custom backend** — business logic in Route Handlers and `lib/`; no separate Node API server.
- **Feature flags** — `lib/config.ts` gates orders, auth, and quote checkout.
- **Bilingual routing** — Vietnamese at `/`, English under `/en/*`; locale via `x-app-locale` middleware header.

## Data Flow

### Public pages (homepage, materials)

1. Server Component calls `services/*` helpers.
2. Supabase returns printers, materials, workshop info, gallery metadata.
3. Client islands subscribe to Realtime for live printer status.

### STL quote (`/bao-gia-in-3d`, `/en/3d-printing-quote`)

1. User uploads STL via `react-dropzone` in `QuoteEstimatorClient`.
2. `POST /api/slicer` forwards the file to `online_slicer`, polls job status, and optionally calls `thumb-service` for a PNG preview.
3. Pricing is computed in `lib/pricing.ts` from slicer metadata (filament length, material, quantity, scale).
4. Checkout or bulk RFQ submissions write to Supabase via service-role Route Handlers.

### Admin (`/admin/*`)

1. Middleware checks `ADMIN_ANALYTICS_SECRET` cookie.
2. Server pages load analytics, quote requests, or gallery data using the service role key.

## Deployment Architecture (Docker)

Compose services:

| Service | Role |
|---|---|
| **web** | Next.js standalone server (port 3000) |
| **thumb-service** | STL → PNG thumbnail FastAPI (port 8887) |
| **db** | Optional local Postgres (`local-db` profile only; production uses Supabase cloud) |

**External dependency:** `online_slicer` is not defined in this repo's Compose file. Point `SLICER_API_BASE_URL` at a running slicer instance (host port, shared Docker network, or `host.docker.internal`).

### Container strategy

- Multi-stage `Dockerfile` (deps → builder → runner) on `node:20-bookworm-slim`.
- `NEXT_PUBLIC_*` passed as Docker **build args** and **runtime environment** (must match).
- `DATABASE_URL` is runtime-only — never a build arg, never sent to the browser.
- Services communicate over the Compose `app` bridge network.

### Networking notes

- From `web` container to host slicer: `http://host.docker.internal:8888` (Compose `extra_hosts`).
- From `web` to thumbnails: `http://thumb-service:8887` (same Compose network).
- To attach `online_slicer` on a shared external network, set `SLICER_API_BASE_URL=http://slicer-service:8000`.

## Folder Layout

```
app/           Routes, layouts, API handlers, sitemap/robots
components/    React UI (landing, quote, admin, nav)
lib/           Supabase, pricing, SEO, validation, analytics, env
services/      printerService, materialService, workshopService
supabase/      Migrations, seed
stl2thumb/     Thumbnail microservice source
middleware.ts  Locale headers, admin guard, analytics, auth refresh (when enabled)
```

## SEO

- Per-route `metadata` exports with Open Graph, Twitter cards, and hreflang alternates.
- `app/sitemap.ts` and `app/robots.ts` expose indexable public routes; `/admin/*`, `/quote`, and `/api/*` are excluded from indexing.
