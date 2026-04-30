# syntax=docker/dockerfile:1
# Multi-stage production build (see docs/docker.md).
# Node 20 + glibc image: Tailwind CSS v4 (@tailwindcss/oxide) requires Node >= 20 and
# resolves native optional deps reliably on linux-x64-gnu (Alpine/musl optional often missing).

FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_*: build-time only here (Compose must pass build.args). Inlined into the client bundle.
# Do NOT add DATABASE_URL as ARG/ENV in this Dockerfile (runtime-only; see docs/rules.md).
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

# Runtime `NEXT_PUBLIC_*` for SSR must come from the orchestrator (e.g. docker-compose `environment`)
# or `docker run -e ...`. They should match the build args used for `next build`.

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
