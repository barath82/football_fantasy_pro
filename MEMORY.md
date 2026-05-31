# MEMORY.md — Fantasy Analytics Dashboard

## Project Decisions

### 2026-05-31 — Initial Architecture
**Decided:** Turborepo monorepo with apps/api (NestJS) + apps/web (React + Vite) + packages/types
**Why:** Single repo simplifies cross-package type sharing and coordinated builds. Turborepo adds build caching without Nx's complexity overhead.
**Rejected:** Nx (too much config for current team size), npm workspaces alone (no build orchestration)

**Decided:** Mantine as frontend component library
**Why:** Ships a DataTable that suits heavy filtering/sorting dashboards; faster to get functional UI than building on Tailwind from scratch.
**Rejected:** shadcn/ui + Tailwind (more control but more setup), MUI (heavier bundle)

**Decided:** NestJS in-memory cache (CacheModule) for FPL API responses initially
**Why:** Zero infrastructure, sufficient for single-instance MVP. Swappable to Redis via the same CacheModule abstraction.
**Rejected:** Redis upfront (adds Docker service complexity before it's needed)

**Decided:** Hybrid implementation start — scaffold + DB schema first, review, then build modules
**Why:** DB schema is the hardest thing to change later; schema review before building features avoids costly migrations.

### 2026-05-31 — Data Source Confirmed
**Decided:** FPL API 2025-26 season as primary data source
**Confirmed:** 38 finished gameweeks, 841 players, 20 teams available at bootstrap-static
**Fallback:** 2024-25 season (not needed)

### 2026-05-31 — Tech Stack
- Frontend: React 18 + TypeScript + Vite + Mantine + TanStack Query + Zustand
- Backend: NestJS + TypeScript + TypeORM + PostgreSQL
- Monorepo: Turborepo + npm workspaces
- DB Migrations: TypeORM migrations
- Local Dev: Docker Compose (PostgreSQL only)

## Session Summaries

### Session 1 — 2026-05-31
**Worked on:** Project scaffolding — monorepo setup, NestJS skeleton, React skeleton, PostgreSQL schema, Docker Compose
**Completed:** Full project scaffold with DB schema
**In progress:** N/A (scaffold phase done, pending review)
**Decisions made:** All architecture decisions above
**Next session priorities:**
1. FPL data ingestion service (bootstrap-static + fixtures + event live + element-summary)
2. NestJS modules: players, gameweeks, fixtures, sync
3. React pages: Player Explorer, Gameweek Explorer
4. Gameweek selector / season replay context
