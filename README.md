# NA 3D SHOP — 3D Printing Website

Bilingual (Vietnamese / English) marketing and quoting site for a 3D printing workshop in Ho Chi Minh City (Thủ Đức). Customers can view live printer availability, compare materials, upload STL files for instant slice-based quotes, and submit checkout or bulk RFQ requests.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org) (App Router, React 19, TypeScript) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Database & backend** | [Supabase](https://supabase.com) — PostgreSQL, Realtime, Storage, Auth (prepared) |
| **STL slicing** | External **FastAPI** service (`online_slicer`) via `POST /api/slicer` |
| **STL thumbnails** | **FastAPI** microservice in `stl2thumb/` (`thumb-service` in Docker) |
| **UI libraries** | Framer Motion, Lucide React, react-dropzone, Recharts (admin analytics) |
| **Deployment** | Docker multi-stage build (`output: "standalone"`), optional `docker-compose` |

Heavy STL work is delegated to companion FastAPI services. The Next.js app polls the slicer synchronously in Route Handlers and generates PNG previews via the thumbnail service — there is no in-browser 3D viewer.

## Project Structure

```
app/              Pages (VI at root, EN under /en) and API Route Handlers
components/       UI by domain (landing, quote, nav, admin, …)
lib/              Supabase clients, pricing, SEO, validation, analytics
services/         Thin Supabase data-access (printers, materials, workshop)
supabase/         SQL migrations and seed data
stl2thumb/        Thumbnail FastAPI microservice
docs/             Internal architecture and product notes
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- A **Supabase** project with migrations applied (`supabase/migrations/`)
- **online_slicer** running and reachable at `SLICER_API_BASE_URL`
- **thumb-service** running for STL preview images (included in `docker-compose.yml`)

### Local development (Node)

```bash
cp .env.example .env
# Fill in Supabase and slicer URLs (see Environment Variables below)

npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker (recommended for production parity)

```bash
cp .env.example .env
# Set NEXT_PUBLIC_* before build — they are baked into the client bundle

docker compose build
docker compose up
```

The `web` service listens on port `3000` (override with `WEB_PORT`). The `thumb-service` container is started automatically. Apply Supabase migrations against your cloud project (or use the optional `local-db` Compose profile for vanilla Postgres tooling only).

After changing any `NEXT_PUBLIC_*` value, rebuild the web image:

```bash
docker compose build --no-cache web
```

## Environment Variables

Copy `.env.example` to `.env`. Variables marked **(public)** are inlined into the client bundle at build time and must also be set at runtime for SSR.

### Required

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon key (browser + SSR) |
| `SLICER_API_BASE_URL` | server | Base URL of the Na `online_slicer` FastAPI (no trailing slash) |

### Required for admin, quote checkout, gallery, and RFQ

| Variable | Scope | Purpose |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | server | Bypasses RLS for admin APIs, checkout, gallery uploads, bulk RFQ storage |

### Recommended (production)

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Canonical origin for SEO, sitemap, Open Graph (e.g. `https://na-3d.shop`) |
| `ADMIN_ANALYTICS_SECRET` | server | Protects `/admin/*` with an HttpOnly cookie |
| `STL2THUMB_SERVICE_URL` | server | Thumbnail microservice URL (Compose default: `http://thumb-service:8887`) |
| `ANALYTICS_IP_SALT` | server | Salt for hashed IP addresses in traffic analytics |
| `ANALYTICS_ALLOWED_HOSTS` | server | Comma-separated hosts allowed for analytics collection |

### Optional

| Variable | Scope | Default / notes |
|---|---|---|
| `NEXT_PUBLIC_QUOTE_CANONICAL_URL` | public | Override canonical URL for the quote page |
| `NEXT_PUBLIC_QUOTE_CHECKOUT_ENABLED` | public | Set `false` to disable quote checkout UI and API |
| `NEXT_PUBLIC_TEXT_SLICER_URL` | public | Text Slicer tool URL — see [Text Slicer URL](#text-slicer-url) |
| `DATABASE_URL` | server | Direct Postgres URL for `psql` / migrations (never client-side) |
| `STL2THUMB_MODE` | server | `auto` \| `http` \| `off` — thumbnail generation behaviour |
| `STL2THUMB_MATERIAL_PRESET` | server | `emerald` \| `blue` \| `grey` |
| `STL2THUMB_THUMB_SIZE` | server | `768` |
| `STL2THUMB_TIMEOUT_MS` | server | `120000` |
| `STL2THUMB_RECALC_NORMALS` | server | `1` / `true` to recalculate STL normals before render |
| `VNDUSD_RATE` | server | Fallback USD→VND rate when exchange API is unavailable (`25500`) |
| `WEB_PORT` | Compose | Host port for `web` (`3000`) |
| `THUMB_SERVICE_PORT` | Compose | Host port for `thumb-service` (`8887`) |
| `POSTGRES_*` | Compose | Credentials for optional `local-db` profile |

See `.env.example` for commented examples and Docker networking notes.

### Text Slicer URL

`NEXT_PUBLIC_TEXT_SLICER_URL` is the public URL of the **Text Slicer** quotation tool
for the 3D Text Printing (channel letter) service. The landing page's
**"Open Text Slicer"** button navigates to it. The value is read in one place —
`config/urls.ts` (`TEXT_SLICER_URL`) — never directly from `process.env` in components.

No hostname must be set for the button to work. Resolution order:

1. `NEXT_PUBLIC_TEXT_SLICER_URL`, when set and non-empty, always wins.
2. **Development** (env unset): auto-detects the browser hostname on port 8000
   (e.g. `http://localhost:3000` → `http://localhost:8000`).
3. **Production** (env unset): falls back to `https://text.na-3d.shop`.

The CTA is **never** disabled for a missing env var.

Optional development override (skip auto-detect):

```bash
NEXT_PUBLIC_TEXT_SLICER_URL=http://192.168.1.7:8000
```

Production example:

```bash
NEXT_PUBLIC_TEXT_SLICER_URL=https://text.na-3d.shop
```

As with every `NEXT_PUBLIC_*` variable, the value is inlined into the client bundle at
`next build` time — rebuild after changing it (`docker compose build --no-cache web`).

## Feature Flags

Configured in `lib/config.ts`:

| Flag | Default | Effect |
|---|---|---|
| `ORDER_ENABLED` | `false` | Legacy dimension-based order form and `POST /api/orders` |
| `AUTH_ENABLED` | `false` | Supabase Auth session refresh in middleware |
| `QUOTE_CHECKOUT_ENABLED` | `true` | Quote checkout modal and `POST /api/orders/checkout-quote` (disable via env) |

When orders/auth are off, customers are directed to Zalo and Facebook for offline contact.

## Scripts

```bash
npm run dev      # Next.js dev server (Turbopack)
npm run build    # Production build (standalone)
npm run start    # Start production server
npm run lint     # ESLint
```

## Public Routes

| Vietnamese | English |
|---|---|
| `/` | `/en` |
| `/bao-gia-in-3d` | `/en/3d-printing-quote` |
| `/materials` | `/en/materials` |

Legacy `/quote` is kept for old links (`noindex`). Admin lives under `/admin/*` (not indexed).

SEO metadata routes: `/sitemap.xml`, `/robots.txt` (generated by `app/sitemap.ts` and `app/robots.ts`).

## Documentation

| Doc | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | System design and deployment topology |
| [docs/plan.md](docs/plan.md) | Development phases and completion status |
| [docs/product.md](docs/product.md) | Product overview and user flows |
| [docs/api.md](docs/api.md) | API surface (partially aspirational) |
| [docs/docker.md](docs/docker.md) | Docker image specification |
| [PROJECT_STATUS_REPORT.md](PROJECT_STATUS_REPORT.md) | Snapshot of project health and gaps |

## Database

Apply migrations in order from `supabase/migrations/` against your Supabase Postgres instance. Seed data is in `supabase/seed.sql`. Storage buckets (`gallery`, quote assets, RFQ attachments) must exist in the Supabase dashboard or via migration SQL.

## License

Private — NA 3D SHOP internal project.
