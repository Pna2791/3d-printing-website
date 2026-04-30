# Docker Specification

## Web Dockerfile

- Base image: node:20-bookworm-slim
- Use multi-stage build:
  - deps
  - builder
  - runner
- Install dependencies with `npm ci`
- Build with `npm run build`
- Run with `npm run start`

## Ports
- 3000 exposed

## Best Practices
- Use multi-stage build
- Keep image small
- Use production mode


## Notes
- Tailwind CSS v4 requires Node >= 20
- Alpine (musl) is NOT supported due to native dependency issues (@tailwindcss/oxide)
- Use Debian-based image for compatibility