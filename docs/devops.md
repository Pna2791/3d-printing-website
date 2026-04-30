# DevOps & Docker Setup

## Docker Services

### web
- Next.js app
- Runs on port 3000

### db (optional)
- PostgreSQL
- Used only if not using Supabase cloud

### worker
- Handles background jobs (Inngest)

## Docker Compose

Services should be orchestrated via docker-compose.

## Environment Variables

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- DATABASE_URL

## Rules

- All services must be containerized
- Do NOT rely on local machine setup
- Use `.env` for configuration