# Coding Rules

## General
- Use TypeScript strictly
- Follow clean architecture
- Modular code

## Frontend
- Use Server Components by default
- Tailwind CSS only
- Responsive design

## Backend
- Use Supabase (no custom backend unless necessary)
- Apply RLS for all tables

## Realtime
- Use Supabase subscriptions for live updates

## STL Processing
- Use Three.js STLLoader
- Avoid blocking UI
- Move heavy tasks to background jobs

## Constraints
- DO NOT change architecture unless explicitly instructed

## Docker Rules
- All code must run inside Docker
- Do NOT assume localhost environment
- Use environment variables for all configs
- Use service names instead of localhost

## Node & Runtime Rules
- Node version must be >= 20
- Use Debian-based images (bookworm), NOT Alpine
- Ensure compatibility with Tailwind CSS v4

## Environment Rules
- NEXT_PUBLIC_* variables:
  - must be available at build time AND runtime
- DATABASE_URL:
  - must NEVER be used in client-side code
  - must NOT be passed as build arg
- Docker / Compose:
  - changing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env` requires a **full image rebuild** (`docker compose build --no-cache web`) so the client bundle matches SSR