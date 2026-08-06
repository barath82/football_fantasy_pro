# Pitchwise Rework — Gamified EPL Predictor

Pivot from expert input forms to a challenge/predictor game layered on top of official EPL fantasy. Design is dark-first, minimalist, typography-led, icons only (no photography), mobile-first, installable as a home-screen shortcut later.

## Design system

- **Palette (dark-first):** near-black background (`--background` ~ oklch(0.14 0 0)), off-white foreground, subtle surface elevation via 2-3 gray steps, single accent (soft lime/green) for positive, muted red for negative. Green/red used only for leaderboard deltas (▲ ▼).
- **Light mode:** mirrored tokens, toggled via `.dark` class on `<html>`; theme toggle in header, persisted to `localStorage`.
- **Typography:** keep a strong display face for headlines + clean grotesque for body. Drop the shouty `text-transform: uppercase` global on headings — minimalist, sentence-case.
- **Layout:** generous whitespace, single-column mobile-first, max-width ~ 640px content, Gutenberg-style stacked blocks separated by thin dividers, no cards with heavy shadows, no gradients, no images.
- **Icons only:** lucide-react throughout (arrows, trophies, formations, chevrons).
- **Interaction:** deep analytics hidden behind row expansion (chevron → smooth collapsible reveal).

## Routes

```
src/routes/
  __root.tsx           # theme provider, header, footer
  index.tsx            # Landing
  challenges.tsx       # Weekly challenge game
  leaderboard.tsx      # Overall + per-challenge boards
  signup.tsx           # FPL / Google / Twitter link (UI only, no auth yet)
```

### 1. Landing (`/`)
- Wordmark + one-line manifesto
- 2-3 short paragraphs explaining the "why"
- Primary CTA button → `/challenges`
- Secondary link → `/leaderboard`

### 2. Challenges (`/challenges`)
Six challenges grouped under three categories, each rendered as a stacked block with base data pre-filled so the user only makes picks:
- **Transfer Guru:** Transfer In (searchable player select), Transfer Out (from a pre-set XI)
- **Differential Guru:** Pick <10% owned to succeed, pick >20% owned to blank
- **Strategy Guru:** Formation selector (pre-set 4-3-3 default, tap to change), Captain pick (from pre-set XI)
- Sticky "Submit picks" bar at bottom on mobile
- Uses mock EPL players + ownership % (no backend yet)

### 3. Sign Up (`/signup`)
- Three buttons: Continue with FPL, Continue with Google, Link Twitter
- No auth wiring — visual only, buttons show a "coming soon" toast
- Small copy explaining why each is needed

### 4. Leaderboard (`/leaderboard`)
- Tabs / segmented control: **The Oracle** (overall) | Transfer | Differential | Strategy
- Each row (minimal view): rank, expert name, weekly prowess score, top move of the week, green/red delta arrow vs last week
- Tap row → expands inline to reveal: per-challenge breakdown, streaks, hit rate, recent picks
- No avatars, no team crests — text + icons only

## Shared shell

- **Header:** wordmark left, theme toggle + minimal nav right (Challenges, Leaderboard, Sign up)
- **Footer:** one line, muted
- **Mobile nav:** header collapses to wordmark + hamburger → simple sheet with the same links

## Technical notes

- Update `src/styles.css`: rewrite tokens for dark-first, add light overrides under `:root` and dark under `.dark` (invert current setup so dark is default), drop uppercase heading rule, swap fonts to something cleaner (e.g. Space Grotesk display + Inter body via `<link>` in `__root.tsx`).
- Add `ThemeProvider` (tiny context) + `ThemeToggle` component; default `dark`, respect `localStorage`.
- Register the 3 new routes; `routeTree.gen.ts` regenerates automatically.
- Mock data lives in `src/lib/mock/` (`experts.ts`, `players.ts`, `leaderboard.ts`).
- Reusable primitives: `ExpandableRow`, `SectionBlock`, `SegmentedTabs`, `ChallengeBlock`, `PlayerPicker`, `FormationPicker`.
- Remove `src/assets/hero-player.jpg` and any image references — icons only.
- Keep it a plain responsive web app (no PWA/service worker) so it can be added to home screen as a shortcut without offline complexity.

## Out of scope (this pass)

- Real auth, real EPL API integration, persistence, private leagues, cricket/IPL, articles feed.
