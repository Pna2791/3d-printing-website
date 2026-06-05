# Development Plan

Status as of June 2026. Checked items are implemented in the current codebase.

## Phase 0: Docker Setup

- [x] Create Dockerfile for Next.js app
- [x] Create docker-compose.yml (`web` + `thumb-service` + optional `local-db`)
- [x] Setup environment variables (`.env.example`, `lib/env.ts`)
- [x] Ensure app runs via Docker with standalone output

## Phase 1: Setup

- [x] Init Next.js project (App Router, TypeScript, Tailwind v4)
- [x] Setup Supabase client (browser, server, middleware, service role)
- [x] Create DB schema (`supabase/migrations/`)
- [x] Seed initial data (`supabase/seed.sql`)

## Phase 2: Public UI

- [x] Landing page (hero, about, enclosed ABS, gallery, contact)
- [x] Material pricing table and pricing modal
- [x] Printer status dashboard (Supabase Realtime)
- [x] Materials guide (`/materials`, `/en/materials`)
- [x] Bilingual VI / EN routes and language switcher
- [x] SEO metadata, JSON-LD, sitemap, and robots.txt

## Phase 3: Admin Panel

- [x] Admin route hub (`/admin`)
- [x] Secret-based login and cookie protection
- [x] Traffic analytics dashboard (`/admin/analytics`)
- [x] Quote request review (`/admin/quotes`)
- [x] Printed gallery management (`/admin/gallery`)
- [ ] Manage printers (CRUD UI — data edited in Supabase today)
- [ ] Manage materials (CRUD UI — data edited in Supabase today)

## Phase 4: STL Quote Feature

- [x] Upload STL (drag-and-drop, up to 50 MB)
- [x] Slice via external FastAPI (`online_slicer`) — filament, time, dimensions
- [x] PNG thumbnail preview via `stl2thumb` FastAPI microservice
- [x] Estimate price from slicer metadata (`lib/pricing.ts`)
- [x] Material selection, quantity, uniform scale, student promo
- [x] Quote checkout submission (`quote_checkout_requests`)
- [x] Bulk RFQ for high-volume orders (`bulk_rfq_requests` + Storage)
- [x] International shipping estimate (USD tiers + exchange-rate API)
- [x] Persist STL and preview to Supabase Storage

## Phase 5: Commerce & Auth (deferred)

Feature flags in `lib/config.ts` keep these off in production today.

- [ ] Enable Supabase Auth (`AUTH_ENABLED`)
- [ ] Enable legacy dimension-based orders (`ORDER_ENABLED`, `POST /api/orders`)
- [ ] Customer order status portal
- [ ] Payment integration

## Phase 6: Production Hardening

- [x] Input validation for checkout and RFQ (`lib/validation.ts`)
- [x] Health check endpoints (`/api/health`, `/api/health/supabase`)
- [ ] Automated tests (API routes, validation helpers)
- [ ] CI pipeline (lint, build, test on push)
- [ ] Email or webhook notifications on quote / RFQ submission
- [ ] Production deployment runbook (hosting choice documented)

## Out of Scope / Not Planned

The following were considered early on but are **not** part of the current stack:

- **Three.js** — previews are static PNG thumbnails, not an interactive 3D viewer
- **Inngest** — slicing is polled synchronously in `POST /api/slicer`; no background job queue
- **Zod** — validation uses hand-written helpers in `lib/validation.ts`
