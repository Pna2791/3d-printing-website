# Project Status Report — NA 3D SHOP (3D Printing Website)

**Report date:** June 5, 2026  
**Project version:** 0.1.0  
**Prepared by:** Codebase scan (automated)

---

## 1. Executive Summary

**NA 3D SHOP** is a bilingual (Vietnamese / English) marketing and quoting website for a 3D printing workshop based in Ho Chi Minh City (Thủ Đức). The site targets students, engineers, and businesses seeking affordable FDM printing (PLA, PETG, PETG-CF, TPU, enclosed ABS) with nationwide COD shipping and instant online STL-based quotes.

The project is **functionally mature for a public launch** in read-only / lead-generation mode. Core customer-facing flows—landing page, live printer status, material pricing, STL upload with slicer-backed price estimation, quote checkout, bulk RFQ, and bilingual navigation—are implemented and wired to **Supabase** (PostgreSQL, Realtime, Storage) plus external **slicer** and **STL thumbnail** microservices. A lightweight **admin panel** covers traffic analytics, quote request review, and gallery management.

Two major commerce features remain **deliberately disabled** via feature flags: authenticated user accounts (`AUTH_ENABLED: false`) and the legacy dimension-based order form (`ORDER_ENABLED: false`). Customers are directed to Zalo / Facebook for offline ordering when those flags are off.

The codebase is well-structured TypeScript with Docker-based deployment (`output: "standalone"`), passes ESLint with no reported errors, and includes 11 Supabase migrations. Documentation in `docs/` is partially **out of date** relative to the implemented system (e.g., planned Three.js / Inngest integrations not present in code).

**Overall assessment:** Production-capable marketing + quoting platform; not yet a full self-service e-commerce storefront.

---

## 2. Tech Stack

### Frontend

| Technology | Version / Notes |
|---|---|
| **Next.js** (App Router) | 15.5.15 — Turbopack for `dev` and `build` |
| **React** | 19.1.0 |
| **TypeScript** | ^5 (strict mode enabled) |
| **Tailwind CSS** | v4 (`@tailwindcss/postcss`) |
| **Framer Motion** | ^12 — animations on quote / landing UI |
| **Lucide React** | Icons throughout |
| **react-dropzone** | STL / file upload on quote page |
| **canvas-confetti** | Grand-opening / quote success effects |
| **recharts** | Admin analytics charts |
| **Geist** fonts | Via `next/font/google` |

### Backend & Data

| Technology | Role |
|---|---|
| **Next.js Route Handlers** | REST API under `app/api/` |
| **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) | PostgreSQL, Row Level Security, Realtime subscriptions, Storage, Auth (prepared but disabled) |
| **Custom validation** (`lib/validation.ts`) | Phone, name, notes — no Zod |
| **server-only** | Guards server-side modules |

### External / Companion Services

| Service | Purpose |
|---|---|
| **online_slicer** (FastAPI) | STL slicing, filament/time/dimension metadata (`SLICER_API_BASE_URL`) |
| **stl2thumb** (Python FastAPI in `stl2thumb/`) | Server-side PNG thumbnail generation from STL buffers |
| **exchangerate.host / frankfurter.app** | Live USD→VND rate for international quote display |

### DevOps & Tooling

| Tool | Notes |
|---|---|
| **Docker** | Multi-stage `Dockerfile` (Node 20 bookworm-slim) |
| **docker-compose.yml** | `web` + `thumb-service` + optional `local-db` profile |
| **ESLint** | `eslint-config-next` 15.5.15 — passes clean |
| **Node** | `>=20.0.0` required |

### Documented but NOT in `package.json`

| Planned (in `docs/`) | Status |
|---|---|
| **Three.js / STLLoader** | Not installed; previews are static PNG thumbnails, not interactive 3D |
| **Inngest** (background jobs) | Not implemented; slicing polls synchronously in Route Handler |
| **Zod** | Not installed; manual validators used instead |
| **Automated tests** | No test framework or test files found |
| **CI/CD** | No `.github/` workflows detected |

---

## 3. Project Structure & Architecture

```
3d-printing-website/
├── app/                    # Next.js App Router — pages & API routes
│   ├── page.tsx            # Vietnamese homepage (/)
│   ├── en/                 # English locale routes (/en, /en/3d-printing-quote, …)
│   ├── bao-gia-in-3d/      # SEO quote page (VI)
│   ├── quote/              # Legacy /quote (noindex, same UI)
│   ├── materials/          # Material comparison guide (VI + EN)
│   ├── admin/              # Protected admin UI (analytics, quotes, gallery)
│   └── api/                # Route Handlers (slicer, orders, rfq, health, admin)
├── components/             # React UI by domain
│   ├── landing/            # Homepage sections
│   ├── quote/              # STL estimator, checkout, RFQ modals
│   ├── nav/                # Header, footer
│   ├── admin/              # Gallery admin client
│   ├── materials/          # Materials guide body
│   ├── orders/             # CreateOrderForm (disabled)
│   ├── pricing/            # Pricing modal
│   └── seo/                # JSON-LD
├── lib/                    # Shared logic
│   ├── supabase/           # Client, server, middleware, service-role, types
│   ├── analytics/          # Page-view tracking & dashboard queries
│   ├── gallery/            # Printed products gallery helpers
│   ├── admin/              # Admin session & quote-request loaders
│   └── pricing.ts, seo.ts, validation.ts, i18n-dictionary.ts, …
├── services/               # Thin data-access layer (Supabase queries)
│   ├── printerService.ts
│   ├── materialService.ts
│   └── workshopService.ts
├── supabase/
│   ├── migrations/         # 11 SQL migrations (schema, RLS, analytics, gallery, RFQ)
│   └── seed.sql
├── stl2thumb/              # Thumbnail microservice (Dockerized FastAPI)
├── public/                 # Static assets (logo, printer photos, printed samples)
├── docs/                   # Architecture, API, product, plan, rules (internal)
├── middleware.ts           # Locale headers, admin auth, analytics tracking
├── docker-compose.yml
└── Dockerfile
```

### Architecture Pattern

- **Server-first:** Homepage and admin pages fetch Supabase data in Server Components (`dynamic = "force-dynamic"`).
- **Client islands:** Realtime printer status, quote estimator, modals, and gallery interactions are Client Components.
- **Bilingual routing:** Vietnamese at root (`/`, `/bao-gia-in-3d`, `/materials`); English under `/en/*`. Locale propagated via `x-app-locale` header set in middleware—not `next-intl`.
- **Feature flags** (`lib/config.ts`): `ORDER_ENABLED`, `AUTH_ENABLED`, `QUOTE_CHECKOUT_ENABLED` gate commerce flows.
- **Admin protection:** Cookie-based secret (`ADMIN_ANALYTICS_SECRET`) — not Supabase Auth.
- **Heavy processing:** STL slicing delegated to external FastAPI; thumbnails via `thumb-service`; results optionally persisted to Supabase Storage.

---

## 4. Current Features Implemented

### Public Website

- [x] **Landing page** (`/`, `/en`) with hero, enclosed ABS section, about, workshop location, contact
- [x] **Printed models gallery** — Supabase `printed_products` + Storage bucket; fallback static images in `public/printed/`
- [x] **Live printer status dashboard** — Supabase Realtime subscription on `printers` table
- [x] **Material pricing preview** — from DB + hardcoded quote rules in `lib/pricing.ts`
- [x] **Pricing modal** — detailed per-gram pricing with student promo comparison
- [x] **Materials guide** — `/materials` and `/en/materials` with SEO metadata
- [x] **Global / international orders section** — shipping region selector with USD estimates
- [x] **Grand opening / student promo bar** — countdown UI (May 1–10 window)
- [x] **Contact section** — email from `workshop_info` table + Zalo / Facebook links
- [x] **Site header / footer** — sticky nav, VI ↔ EN language toggle
- [x] **SEO** — per-page metadata, Open Graph, Twitter cards, canonical URLs, `HomeJsonLd` structured data, keyword targeting for HCM / Thủ Đức

### STL Quote Estimator (`/bao-gia-in-3d`, `/en/3d-printing-quote`, legacy `/quote`)

- [x] Drag-and-drop STL upload (up to 50 MB)
- [x] Integration with **online_slicer** API — enqueue job, poll status, return filament/time/dimensions
- [x] **Static PNG preview** via `stl2thumb` microservice (not interactive 3D viewer)
- [x] Material selection (PLA, PETG, PETG-CF, TPU) with tooltips
- [x] Uniform model scale slider (0.25×–3×) without re-slicing
- [x] Quantity selector with bulk discount tiers
- [x] Student discount promo (time-windowed)
- [x] International shipping estimate (USD, converted via `/api/exchange-rate`)
- [x] **Quote checkout modal** — name + phone submission → `quote_checkout_requests` table (when `QUOTE_CHECKOUT_ENABLED`)
- [x] **Bulk RFQ modal** — orders >500 pcs with file attachments → `bulk_rfq_requests` + Storage
- [x] STL / preview persistence to Supabase Storage (`quote_slice_storage` migration)
- [x] Confetti on successful slice metadata load

### API Endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/slicer` | Upload STL, slice, generate preview, optional storage |
| `GET /api/slicer/preview` | Poll / fetch preview image |
| `POST /api/orders/checkout-quote` | Submit quote checkout request |
| `POST /api/orders` | Legacy dimension-based order (returns 403 when disabled) |
| `POST /api/rfq/bulk-upload` | Bulk RFQ with attachments |
| `GET /api/exchange-rate` | USD→VND rate |
| `GET /api/health` | App health check |
| `GET /api/health/supabase` | Supabase connectivity check |
| `POST /api/admin/login` / `logout` | Admin cookie auth |
| `GET/POST /api/admin/gallery` | Gallery CRUD (service role) |

### Admin Panel (`/admin/*`)

- [x] **Dashboard hub** — links to sub-sections
- [x] **Analytics** — page views (middleware-tracked, hashed IPs), Recharts visualizations
- [x] **Quote requests** — list `quote_checkout_requests` with VND totals, STL links
- [x] **Gallery management** — upload / manage printed product images in Supabase Storage
- [x] **Login / logout** — secret-based cookie gate

### Infrastructure

- [x] Docker multi-stage production build (`standalone` output)
- [x] docker-compose orchestration (`web` + `thumb-service`)
- [x] 11 Supabase migrations with RLS policies
- [x] Middleware: 55 MB body limit for STL uploads, locale headers, analytics, admin guard

---

## 5. Pending / In-Progress Tasks

### Explicitly Disabled (Feature Flags)

| Flag | Current Value | Impact |
|---|---|---|
| `ORDER_ENABLED` | `false` | `POST /api/orders` returns 403; order form shows offline contact CTA |
| `AUTH_ENABLED` | `false` | Supabase Auth session refresh skipped; no user accounts |
| `QUOTE_CHECKOUT_ENABLED` | env-driven (default on) | Can be turned off if service role / migrations not ready |

### Missing vs. Product Vision (`docs/product.md`, `docs/plan.md`)

| Item | Status |
|---|---|
| Admin CRUD for **printers** and **materials** | Not built — data managed directly in Supabase |
| **Interactive 3D STL viewer** (Three.js) | Not implemented — PNG thumbnails only |
| **Inngest** background jobs for heavy STL work | Not implemented — synchronous polling in API route |
| **Zod** schema validation | Not implemented |
| **Automated tests** (unit, integration, E2E) | None found |
| **CI/CD pipeline** | No GitHub Actions or similar |
| **Sitemap / robots.txt** | Not detected as dedicated routes |
| **Payment integration** | Not present |
| **Order status tracking for customers** | Not present (auth disabled) |
| **Email notifications** on quote / RFQ submission | Not detected |

### Documentation Drift

- `docs/plan.md` checkboxes are almost entirely unchecked, but Phases 0–2 and much of Phase 4 are **already done**.
- `docs/architecture.md` references Three.js and Inngest that are not in the codebase.
- `docs/backend.md` references `pricingService.ts` and `stlService.ts` — these files do not exist (logic lives in `lib/pricing.ts` and `app/api/slicer/route.ts`).
- Root `README.md` is still the default `create-next-app` boilerplate.

### Code TODOs

No significant `TODO` / `FIXME` comments were found in source files. The only near-matches are placeholder phone examples in copy (`093xxxxxxx`) and a comment about Supabase hostname patterns in `next.config.ts`.

### Operational Dependencies (External)

- **online_slicer** must be running and reachable at `SLICER_API_BASE_URL` for quote functionality.
- **thumb-service** must be healthy for STL preview images (docker-compose `depends_on` enforces this).
- **Supabase** project with migrations applied, Storage buckets (`gallery`, quote assets, RFQ), and `SUPABASE_SERVICE_ROLE_KEY` for admin/write operations.

---

## 6. Code Quality & Recommendations

### Assessment

| Area | Rating | Notes |
|---|---|---|
| **Type safety** | Good | Strict TypeScript; shared types in `lib/supabase/types.ts` |
| **Architecture** | Good | Clear separation: `app/` pages, `components/`, `lib/`, `services/` |
| **i18n** | Good | Custom dictionary (`lib/i18n-dictionary.ts`); consistent VI/EN paths |
| **SEO** | Good | Rich metadata, JSON-LD, canonical/hreflang on key pages |
| **Security** | Moderate | RLS on DB tables; admin uses shared secret cookie (not role-based RBAC); service role key required server-side |
| **Testing** | Poor | No automated test suite |
| **Documentation** | Moderate | Detailed `docs/` folder but stale vs. implementation; README outdated |
| **Component size** | Moderate | `QuoteEstimatorClient.tsx` (~1,200 lines) is a maintainability hotspot |
| **Linting** | Good | ESLint passes with zero errors |

### Immediate Recommendations (Top 5)

1. **Refresh project documentation**  
   Update `README.md`, `docs/plan.md`, and `docs/architecture.md` to reflect the current stack (slicer + stl2thumb, no Three.js/Inngest). Mark completed phases and document required env vars (`NEXT_PUBLIC_SUPABASE_*`, `SLICER_API_BASE_URL`, `ADMIN_ANALYTICS_SECRET`, etc.).

2. **Add a sitemap and `robots.txt` for SEO**  
   The site already has strong per-page metadata. Generating `app/sitemap.ts` and `app/robots.ts` (Next.js built-ins) would help Google index `/bao-gia-in-3d`, `/materials`, and `/en/*` routes for the 3D printing business keywords already targeted in `lib/seo.ts`.

3. **Introduce automated tests for critical API routes**  
   Priority targets: `POST /api/slicer`, `POST /api/orders/checkout-quote`, `POST /api/rfq/bulk-upload`, and validation helpers in `lib/validation.ts`. Even a small Vitest or Jest suite would reduce regression risk before enabling commerce flags.

4. **Build admin CRUD for printers and materials**  
   Product docs list this as a core admin feature, but only gallery / quotes / analytics exist today. Operators currently must edit Supabase directly to change printer status or material prices—fragile for day-to-day workshop operations.

5. **Decide on commerce path and reduce dead code**  
   Either enable `ORDER_ENABLED` + `AUTH_ENABLED` with Supabase Auth and a customer order portal, or formally deprecate `CreateOrderForm` and `POST /api/orders` to reduce confusion. Separately, consider splitting `QuoteEstimatorClient.tsx` into smaller hooks/components to improve maintainability as quote features grow.

### Additional Improvements (Medium Term)

- Add **email or webhook notifications** when quote checkout or RFQ forms are submitted.
- Evaluate an **interactive STL viewer** (e.g., `@react-three/fiber`) if customers need to inspect geometry before ordering—currently only static thumbnails are shown.
- Set up **CI** (lint + build + optional tests) on push to catch Docker build / env mismatches early.
- Move hardcoded pricing in `lib/pricing.ts` closer to Supabase `pricing_rules` to avoid dual sources of truth (DB vs. code).

---

## Appendix: Database Tables (from migrations)

| Table | Purpose |
|---|---|
| `printers` | Machine name, model, status, build volume |
| `materials` | Material types, colors, density, unit price |
| `pricing_rules` | Per-material volume discounts |
| `workshop_info` | Key-value workshop contact / settings |
| `orders` | User orders (requires auth — unused while disabled) |
| `analytics_page_views` | Traffic tracking |
| `quote_checkout_requests` | STL quote order submissions |
| `bulk_rfq_requests` | High-volume RFQ submissions |
| `printed_products` | Homepage gallery metadata |
| Storage buckets | `gallery`, quote STL/previews, RFQ attachments |

---

*This report was generated from a static analysis of the repository. Runtime behavior (Supabase connectivity, slicer availability) depends on environment configuration in `.env` and deployed services.*
