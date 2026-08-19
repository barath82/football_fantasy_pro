# ERRORS.md — Fantasy Analytics Dashboard

## Error Log

### 2026-05-31 — TypeORM upsert with plain objects uses camelCase column names
**What didn't work:** Passing raw plain objects to `repo.upsert(rows as any[], ...)` — TypeORM used camelCase property names (e.g. `seasonId`) as column names instead of the snake_case column names defined in `@Column({ name: '...' })`.
**What worked instead:** `rows.map(r => Object.assign(repo.create(), r)) as any` — `repo.create()` with no args returns a proper entity instance with metadata attached, `Object.assign` copies the row data onto it, and TypeORM correctly maps property names to column names during upsert.
**Note for next time:** Always use `Object.assign(repo.create(), row)` when upserting plain objects. Never pass raw objects directly to upsert, even with `as any[]` cast — the cast bypasses TypeScript but not TypeORM's runtime column resolution.

### 2026-05-31 — TypeORM @ManyToOne without @JoinColumn auto-generates a duplicate FK column
**What didn't work:** Having both `@ManyToOne(() => Season)` (no `@JoinColumn`) and `@Column({ name: 'season_id' }) seasonId` on the same entity. TypeORM auto-generates its own FK column named `seasonId` (camelCase) from the relation, causing the INSERT to include both `season_id` and `seasonId`.
**What worked instead:** Add `@JoinColumn({ name: 'season_id' })` to every `@ManyToOne` that has an explicit `@Column` for the FK. This tells TypeORM to use the named column for the relation's FK instead of auto-generating one.
**Note for next time:** Every `@ManyToOne` must have `@JoinColumn({ name: '...' })` when the entity also declares the FK as a `@Column` with a custom name. Without `@JoinColumn`, TypeORM generates `{propertyName}Id` as an extra column.

### 2026-08-19 — `POST /api/sync/run` OOM-kills the whole dev environment
**What didn't work:** Running a full sync (`SyncService.runFullSync`) in this sandboxed session — it got SIGKILLed (exit 137, OOM) partway through Step 3 ("Per-player stats — 841 API calls, batched"), before it even logged a single progress line for that step. The kill took down *both* the api and web dev processes (same `turbo run dev` process tree), not just the sync request.
**What worked instead:** Nothing yet — didn't retry blindly. Restarted the dev servers to recover; flagged the finding instead of re-running the same expensive call.
**Note for next time:** Don't re-trigger a full sync in this environment without either (a) confirming available container memory headroom first, or (b) checking/reducing the batch concurrency in `syncAllPlayerStats` (`sync.service.ts`) before retrying. Also: `.env`'s `FPL_CURRENT_SEASON=2025-26` is stale — FPL's `bootstrap-static` always returns the live current season regardless of this value, so a "successful" sync right now would still mislabel real 2026-27 data under a "2025-26" season row unless that env var is corrected first.

## Template

### YYYY-MM-DD — [Short description]
**What didn't work:** ...
**What worked instead:** ...
**Note for next time:** ...
