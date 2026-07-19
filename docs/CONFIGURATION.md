# Configuration

Environment variables are read from `.env` (local / Docker Compose) or from GitHub
Secrets/Variables (CI builds). Copy `.env.example` to `.env` to get started — never
commit production values.

## `NEXT_PUBLIC_TEXT_SLICER_URL`

### Purpose

Public URL of the Text Slicer quotation tool for the "Dịch vụ in chân chữ 3D"
(3D Text Printing / channel letter) service. The landing page's **"Open Text Slicer"**
CTA button navigates to this URL, so customers can upload a file and get an automatic
quote.

The value is read in exactly one place — `config/urls.ts` (`TEXT_SLICER_URL` /
`resolveTextSlicerUrl()`) — and components import from there instead of touching
`process.env`. Because it is a `NEXT_PUBLIC_*` variable, it is **inlined into the
client bundle at `next build` time**.

Resolution order:

1. `NEXT_PUBLIC_TEXT_SLICER_URL`, when set, always wins.
2. In **development** with the variable unset, the URL is auto-detected in the
   browser as `<current hostname>:8000` (same machine as the dev server), so no
   IP is hardcoded anywhere.
3. In **production** with the variable unset, a warning is logged and the CTA
   button is rendered disabled (no crash).

### Development example

Leave unset for auto-detection, or override explicitly:

```bash
NEXT_PUBLIC_TEXT_SLICER_URL=http://192.168.1.7:8000
```

### Production example

Set as a GitHub repository **Variable** (`NEXT_PUBLIC_TEXT_SLICER_URL`) so CI passes
it as a Docker build arg, and mirror it in the production server's `.env` for SSR at
runtime (see the "NEXT_PUBLIC appears twice" rule in `docker-compose.yml`):

```bash
NEXT_PUBLIC_TEXT_SLICER_URL=https://text.na-3d.shop
```

> Note: like all `NEXT_PUBLIC_*` variables in this repo, changing the value requires a
> rebuild of the web image (`docker compose build --no-cache web`) — the runtime
> environment value alone only affects server-rendered output.

## Other variables

See `.env.example` for the full list (Supabase keys, analytics, `DATABASE_URL`,
`SLICER_API_BASE_URL`, stl2thumb settings) and `docs/rules.md` / `docs/devops.md` for
the environment rules that apply to them.
