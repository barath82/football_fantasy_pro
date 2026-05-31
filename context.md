# PROJECT ARCHITECTURAL BRIEF
**System / Stack:** Turborepo, NestJS 11, TypeORM 0.3, PostgreSQL 16, React 19, Vite, Mantine 8, Zustand

## 1. CURRENT REPOSITORY STATE
*   **Active Services:** `apps/api` (:3001), `apps/web` (:5173), `packages/types` (`@fantasy/types`)
*   **Database Config:** Postgres on host port **5433** (10 tables migration-managed, 29k+ rows verified)
*   **Last Successful Build Command:** `npm run dev` (Turbo orchestration with Vite API proxy)

## 2. COMPLETED MILESTONES
*   [DONE] Backend endpoints operational (Sync, Players, Teams, Gameweeks, Fixtures)
*   [DONE] Frontend Screens complete (Player Explorer, Player Detail, GW Explorer, FDR, Team Explorer, Player Comparison)
*   [DONE] Core application runtime bugs resolved and verified clean

## 3. ACTIVE CODE BLOCK CHICKEN-SCRATCH
```typescript
// Core workaround reminder for React Router 7 / Mantine 8 hooks-in-map violation:
// Always call exactly 3 usePlayer hooks at top-level, then pass data as props.
```

## 4. IMMEDIATE NEXT STEPS & OPEN ISSUES
1.  **Next Up:** Add `@Cron` decorator to `@nestjs/schedule` to automate the manual auto-sync cron (~10 lines).
2.  **Asset Patch:** Generate missing manifest icons (`icon-192.png`/`icon-512.png`) to fix the blank PWA install icon.
3.  **UI Polish:** Refactor the FDR grid and wide Mantine data tables for mobile responsiveness.
