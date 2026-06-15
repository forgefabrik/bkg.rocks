# BKG Monorepo

Built with Turborepo, pnpm, and TypeScript.

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev

# Build all packages and apps
pnpm build

# Run tests
pnpm test

# Lint codebase
pnpm lint
```

## Structure

- **apps/web** - Next.js 15 application with App Router
- **apps/jobs** - BullMQ worker application
- **packages/db** - Prisma database client and schema
- **packages/ai** - AI provider integrations (OpenRouter)
- **packages/sandbox** - AlmostNode sandbox adapter
- **packages/ui** - Shared React components

## Services

Start local services with docker-compose:

```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, and MinIO.