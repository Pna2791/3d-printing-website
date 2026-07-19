# AI_CONTEXT

Concise context for AI agents editing this repo. Full detail:
`docs/ARCHITECTURE.md`, `docs/DEPENDENCIES.md`, `docs/DEPLOYMENT.md`.
Items that can't be verified from files are marked **UNKNOWN**.

## Project purpose
`3d-printing-website` = **NA 3D SHOP**, a bilingual (VI at `/`, EN at `/en/*`)
marketing + **instant STL quoting** site for a 3D‑printing workshop in Thủ Đức, HCMC.
Live at `https://na-3d.shop`. Users upload an STL, get filament/time/dimension‑based
pricing + a PNG preview, and submit checkout / bulk‑RFQ requests. `/admin/*` shows
analytics, quote requests, and a gallery manager.

## High-level architecture
- **Next.js 15 App Router + React 19 + TypeScript**, `output: "standalone"`, Node ≥ 20.
- Pages **and** API live in `app/` (Route Handlers under `app/api/*`).
- Data via **Supabase** (Postgres/PostgREST/Realtime/Storage; Auth prepared but off).
- Two containers ship from this repo: `web` (Next.js, :3000) and `thumb-service`
  (`stl2thumb/`, FastAPI STL→PNG, :8887). Optional `db` (postgres) behind `local-db`.
- STL slicing is an **external** FastAPI (`SLICER_API_BASE_URL`, `/v1/slice`,
  `/v1/status/{id}`, `/v1/tasks/{id}`) — **not in this repo (repo UNKNOWN)**.
- Public routing: Cloudflare *(inferred)* → Traefik (external `proxy` network) → `web`.

## Runtime flow
1. Browser → Cloudflare → Traefik (`Host(na-3d.shop)`) → `web:3000`.
2. Server Components / `services/*` read Supabase; client islands use Supabase Realtime.
3. Quote: `POST /api/slicer` → save STL to Storage (service role, best‑effort) →
   `POST {slicer}/v1/slice` → poll status (1s, 180s cap) → in parallel `POST
   {thumb}/generate` → save preview PNG → return metadata + `preview_image`.
4. `/admin/*` gated by `ADMIN_ANALYTICS_SECRET` cookie in `middleware.ts`.

## Service dependencies
- **Hard runtime:** Supabase (data/admin/storage), external STL slicer (quoting only),
  Traefik + `proxy` network (public reach), Cloudflare *(inferred, edge/TLS)*.
- **Soft:** `thumb-service` (previews → `null` if down); Supabase Storage writes (skipped
  if `SUPABASE_SERVICE_ROLE_KEY` absent).
- **Build:** `NEXT_PUBLIC_*` are inlined into the client bundle at build **and** must
  match at runtime (SSR). Node ≥ 20 + Debian (glibc) — Tailwind v4 forbids Alpine.
- **Siblings (NOT called by this repo):** `Text-Slicer` (`text.na-3d.shop`, DXF slicer),
  `monitoring` (Prometheus/Grafana), `infra` (Traefik/proxy/Cloudflare), `printer_re`.

## Infrastructure assumptions
- Prebuilt **GHCR** images only in production: `ghcr.io/pna2791/3d-printing-website-{web,thumb}:sha-<commit>` (never `latest`).
- **Zero build on prod**, **no git clone on prod**, **no inbound SSH**. Deploys run via a
  **self‑hosted GitHub runner** (`self-hosted, macOS, ARM64, production`) that pulls + `up -d`.
- CI (`.github/workflows/deploy.yml`) on push to **`master`**: `checks` → `build`
  (buildx amd64+arm64, push) → `deploy` (`scripts/deploy.sh` on host).
- `deploy.sh`: `pull` → `up -d --wait` → `/api/health` probe → on failure **auto‑rollback**
  to `.last_successful_tag`. Never touches `.env`; never removes volumes.
- Prod layout: `~/na-3d-prod/{infra,3d-printing-website,text-slicer}`; deploy dir default
  `/Users/creator/na-3d-prod/3d-printing-website`. CI overwrites only
  `docker-compose.prod.yml` + `deploy.sh`.
- Supabase migrations are **manual** (`scripts/apply-supabase-sql.sh` / SQL editor),
  never run by CI.

## Files an AI should read before making changes
- `docs/ARCHITECTURE.md`, `docs/DEPENDENCIES.md`, `docs/DEPLOYMENT.md` (this set).
- `lib/env.ts` — env contract + server/client boundaries (source of truth for config).
- `lib/config.ts` — feature flags (`ORDER_ENABLED`, `AUTH_ENABLED`, `QUOTE_CHECKOUT_ENABLED`).
- `middleware.ts` — locale headers, `/admin` guard, analytics.
- `next.config.ts` — standalone output, image remotePatterns, `middlewareClientMaxBodySize`.
- `app/api/slicer/route.ts` — the core quote pipeline (slicer + thumbnail + storage).
- `docker-compose.prod.yml`, `Dockerfile`, `scripts/deploy.sh`, `.github/workflows/deploy.yml`.
- `lib/pricing.ts`, `lib/supabase/*`, `services/*` for data/pricing logic.
- Existing design notes: `docs/rules.md`, `docs/devops.md`, `docs/docker.md`, `README.md`.

## Files an AI should NEVER modify automatically
- **`.env`** — real secrets; never edit, echo, commit, or generate. `deploy.sh` requires it.
- **`package-lock.json`** — change only via the package manager, not by hand.
- **`supabase/migrations/*.sql` already applied** — never rewrite history; add a new,
  later‑timestamped migration instead.
- **`.last_successful_tag`** (on server) — managed by `deploy.sh` only.
- **Named volumes** (`postgres_data`) — never delete.
- Do not add `build:` to `docker-compose.prod.yml`, and do not use `:latest` for prod.
- Do not turn `DATABASE_URL` into a Docker build arg or read it client‑side.
- `push_image.sh` targets Docker Hub and is legacy — do not wire it into CI.

## Common pitfalls
- **`NEXT_PUBLIC_*` drift:** changing them without rebuilding leaves the client bundle
  stale vs SSR → rebuild image (`docker compose build --no-cache web`). A runtime warning
  is logged by `warnIfPublicSupabaseUrlDiffersFromBuild()`.
- **Alpine:** breaks Tailwind v4 native deps — keep `node:20-bookworm-slim`.
- **Large STL uploads:** must stay under the 50 MB route cap; middleware body limit is
  55 MB (`next.config.ts`). Don't lower these inconsistently.
- **Deploy branch:** only `master` deploys; other branches (e.g. `link-service`) don't.
- **Storage silently skipped** if `SUPABASE_SERVICE_ROLE_KEY` missing — features look
  "working" but nothing persists.
- **`proxy` network is external** — deploy fails if the infra stack isn't up first.
- **Slicer endpoint is external** — `SLICER_UNAVAILABLE` usually means the slicer, not
  this app, is down.
- **macOS bash 3.2** on the runner — no bash‑4 features in deploy scripting.

## Coding conventions (inferred from the repo)
- **TypeScript strict**; path alias `@/*`; ESLint via `eslint-config-next` (CI runs
  `npm run lint` + `tsc --noEmit` — both must pass).
- **Server Components by default**; client components are explicit islands
  (`components/**/*Client.tsx`, `PrinterStatusLive`, etc.).
- **All env access goes through `lib/env.ts`** with `typeof window` guards; server‑only
  modules use `import "server-only"`. Never log secret values (helpers expose presence/
  length only).
- **Business logic in `lib/`**, thin Supabase reads in `services/`, API in `app/api/*`.
- **Bilingual:** VI at root, EN under `app/en/*`; locale via `x-app-locale` header set in
  middleware (no `next-intl` rewriting). Some UI strings/comments are Vietnamese.
- **Feature‑flag gated** commerce/auth (`lib/config.ts`); when off, users are pointed to
  Zalo/Facebook (`OFFLINE_ORDER_CONTACT`).
- **Defensive API handlers:** return structured JSON `{ ok, code, error }` with proper
  HTTP status; degrade gracefully instead of crashing.
- **DB:** RLS‑guarded tables; public read‑only + service‑role writes. Tables: `printers`,
  `materials`, `pricing_rules`, `workshop_info`, `orders`, `page_views`,
  `quote_checkout_requests`, `bulk_rfq_requests`, `printed_products`.
- **Comments explain intent/constraints**, not narration (see `Dockerfile`, compose files).
