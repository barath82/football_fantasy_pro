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

### 2026-08-06 — Pivot to Pitchwise (gamified predictor)
**Decided:** Product pivot from the content-intelligence hub to "Pitchwise" — a challenge/predictor game layered on the official EPL fantasy game (Transfer Guru, Differential Guru, Strategy Guru challenges; Oracle = combined leaderboard). Spec: `lovable_plan.md` (design/routes), `content.md` (page copy).
**Why:** User's own product direction change, not a technical decision — same React/Vite platform retained, UI direction changes.

**Decided:** Built the new UI in a new `apps/web/src/predictor/` tree (own Tailwind-scoped design system under a `.pw` root class, dark-first with light toggle, react-router routes), wired at `/`, `/challenges`, `/leaderboard`, `/signup`. Old content-hub code (`components/hub/`, `pages/hub/`) preserved as-is, moved to `/legacy-hub/*` routes, not deleted or linked from nav.
**Why:** User asked to reuse what's applicable but committed to a full UI change; additive-and-isolated build lets old work be salvaged/compared without risk, per user's explicit "don't touch/delete without confirmation" rule. (Approach chosen from 3 options presented; user picked "new code additive, swap default route to new landing" over leaving new work at a side path or rewriting hub/* in place.)
**Rejected:** In-place rewrite of `hub/*` (would require deleting a lot of existing work up front); leaving new routes at a non-default path (slower to actually see the new direction live).
**Note:** Legacy hub's internal links (e.g. `Link to="/explore"`) were written for the old root-level paths and are now stale under `/legacy-hub/*` — not fixed, since that tree is unlinked/kept only for salvage. Flagging for whenever it's revisited.

**Decided:** Real data reused where possible — challenge player pickers (Transfer, Differential) hit the existing `/players` API (real names + live ownership %) via the existing `usePlayers` hook, not mock data. Gameweek number/deadline pulled from the real `/gameweeks` API's `is_current`/`is_next` flags (added `isCurrent`/`isNext` to the API response and a new `useCurrentGameweek` hook), with a text placeholder ("Gameweek —" / "Preseason") shown while loading or before a gameweek is flagged current.
**Rejected:** Hardcoding "Gameweek 14" from content.md's placeholder copy as static text (per user: build the real plumbing now, not just the visual placeholder).
**Still mock (explicitly out of scope this pass, per lovable_plan.md):** the pre-set XI for Transfer Out/Captain pickers (`predictor/mock/presetSquad.ts`) and all leaderboard/expert data (`predictor/mock/experts.ts`) — no scoring backend or FPL-team-linking exists yet. Squad/expert names are fictional placeholders.

### 2026-08-19 — Rebrand: Pitchwise → FantasyBrahma
**Decided:** Adopted the "FantasyBrahma" identity wholesale, sourced from a Lovable-generated reference dropped in `tmp_changes/fantasybrahma_changes_aug11/`: new name/wordmark, saffron accent (`oklch(0.74 0.17 55)` dark / `oklch(0.66 0.19 50)` light, replacing the green accent), a custom "guru" SVG icon set (`predictor/components/guru-icons.tsx`, ported as-is — pure SVG, no framework dependency), "The Oracle" leaderboard tab renamed "The Brahma", sticky/blurred header, footer disclaimer ("Not affiliated with the Premier League or Fantasy Premier League"), per-page browser titles.
**Why:** User's explicit direction after reviewing the reference (asked directly: "Yes, adopt FantasyBrahma fully").
**Rejected:** Adopting the reference's actual codebase/framework (TanStack Start + TanStack Router + Tailwind v4 + Bun) — incompatible with this repo's React 18 + react-router-dom + Tailwind v3 + npm stack; ported the design intent into our existing `predictor/` tree instead, same pattern as the original `lovable_plan.md` port. Also rejected downgrading the Challenges player picker to the reference's static mock-list `<select>` — kept our real `/api/players`-backed searchable picker (user's explicit call).
**New color token:** `--pw-up` added (green) — previously "positive" reused the accent color, which no longer works now that accent is saffron, not green. `--pw-negative` (red) unchanged.
**Bug found and fixed during verification:** `useCurrentGameweek` crashed the entire predictor UI (blank screen) on a non-array `/gameweeks` response — no `Array.isArray` guard. Fixed in `hooks/useGameweeks.ts`. Surfaced by an unrelated process squatting on ports 3001/5433 during this session, but the missing guard was a real pre-existing fragility regardless of cause.

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
