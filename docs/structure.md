# BKG Monorepo Structure

## Overview

BKG is a Turborepo-based monorepo using pnpm workspaces for managing shared code across multiple applications and packages.

## Directory Layout

```
bkg/
├── apps/
│   ├── web/               # Next.js 15 web application
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── dashboard/
│   │   │   └── components/
│   │   ├── tailwind.config.js
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── jobs/              # BullMQ background worker
│       ├── src/
│       │   └── index.ts
│       └── package.json
│
├── packages/              # Shared packages
│   ├── db/                # Prisma database client
│   │   └── src/
│   ├── ui/                # Shared React UI components
│   │   └── src/
│   ├── contracts/         # TypeScript type definitions
│   │   └── src/
│   ├── validation/        # Zod validation schemas
│   │   └── src/
│   ├── auth/              # Authentication (NextAuth.js)
│   │   └── src/
│   └── config/            # Shared configuration
│       └── src/
│
├── docker-compose.yml     # PostgreSQL, Redis, MinIO services
├── docs/
│   └── structure.md       # This file
├── .eslintrc.js           # Root ESLint configuration
├── tsconfig.base.json     # Shared TypeScript configuration
├── turbo.json             # Turborepo pipeline
└── package.json           # Root workspace config
```

## Shared Packages

| Package | Path | Description |
|---------|------|-------------|
| @bkg/ui | packages/ui | Shared React components |
| @bkg/db | packages/db | Prisma database client |
| @bkg/contracts | packages/contracts | TypeScript interfaces |
| @bkg/validation | packages/validation | Zod schemas |
| @bkg/auth | packages/auth | NextAuth.js integration |
| @bkg/config | packages/config | Environment configuration |

## Running the Monorepo

```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev
```

## External Services

The monorepo relies on three external services managed via docker-compose:

1. **PostgreSQL** (port 5432) - Primary data store
2. **Redis** (port 6379) - Job queue and caching
3. **MinIO** (port 9000/9001) - Object storage

```
docker-compose up -d
```
