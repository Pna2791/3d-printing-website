# System Architecture

## Tech Stack
- Frontend: Next.js 15 (App Router)
- Backend: Supabase (PostgreSQL + Realtime + Auth)
- Styling: Tailwind CSS
- 3D Processing: Three.js (STLLoader)
- Background Jobs: Inngest

## High-level Architecture
Client (Next.js)
    ↓
Supabase (DB + Auth + Realtime)
    ↓
Background Jobs (Inngest)

## Key Design Principles
- Server-first architecture
- Realtime-first UI
- Strong typing (TypeScript)
- Minimal custom backend logic

## Data Flow
1. Client requests data via Server Components
2. Supabase returns data
3. Realtime subscription updates UI instantly
4. Heavy jobs handled async via Inngest


## Deployment Architecture (Dockerized)

Services:
- web: Next.js application
- db: PostgreSQL (optional if not using Supabase cloud)
- worker: background job processor (Inngest)

All services run in Docker containers using docker-compose.

## Container Strategy
- Each service runs independently
- Environment variables injected via `.env`
- Volumes used for persistence (if self-host DB)

## Networking
- Services communicate via internal Docker network
- API base URL uses service name (e.g., http://web:3000)