# Bringing up a new FantasyBrahma server

Ops runbook for standing up a brand-new server. Follow in order — each phase
assumes the previous one finished cleanly. Written from a real deployment;
the pitfalls at the end are real bugs we hit, not hypotheticals.

**Assumptions**
- Target: brand-new Ubuntu server, t3.micro (1 vCPU / 1 GB RAM)
- Domain: DNS A record already pointed at the server's public IP
- Access: SSH in as a sudo-capable user
- Also needed: Google Cloud Console access, to register OAuth credentials

---

## 1. Check memory / swap

A t3.micro has 1 GB RAM — tight once Postgres, the API, and nginx are all
running. Most images already ship a swapfile; confirm rather than assume.

```bash
# check what's already there
free -h
swapon --show

# only if swapon --show is empty:
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

> **Gotcha:** if `fallocate -l 2G /swapfile` fails with `Text file busy`,
> don't fight it — use `dd` instead, as above. It works on every filesystem.

## 2. Install Postgres — native, not Docker

Deliberate call: Docker's daemon alone costs ~100–200 MB of RAM sitting
idle, on a box with under 500 MB to spare. One Postgres instance for one
app doesn't need container isolation to earn that cost.

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
psql --version
```

## 3. Create the database

The app's migrations expect the `uuid-ossp` extension already present —
create it explicitly rather than hoping the app user has permission to.

```bash
sudo -u postgres psql -c "CREATE USER fantasy_user WITH PASSWORD 'choose-a-real-password';"
sudo -u postgres psql -c "CREATE DATABASE fantasy_db OWNER fantasy_user;"
sudo -u postgres psql -d fantasy_db -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
```

> **Verify:** note whatever password you set here — it goes into `.env` as
> `DB_PASSWORD` in phase 6, exactly matching.

## 4. Install Node.js

Needs 20+, per the repo's own `engines` field.

```bash
node -v 2>/dev/null && npm -v 2>/dev/null   # check first

# if missing or too old:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 5. Checkout the code

```bash
git clone https://github.com/<you>/football_fantasy_pro.git
cd football_fantasy_pro
```

## 6. Configure environment

Two separate `.env` files. Both are git-ignored — copy from the checked-in
examples.

```bash
cp .env.example .env
echo "VITE_API_URL=https://yourdomain.com" > apps/web/.env

# generate a real secret, don't reuse one from another deploy:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Root `.env` — what changes for production**

| Key | Value |
|---|---|
| `NODE_ENV` | `production` — but only *after* phase 12 (HTTPS); the login cookie requires it, see pitfalls |
| `PORT` | a port nothing else on this box is already using — check with `sudo ss -tlnp` |
| `CORS_ORIGIN` | `https://yourdomain.com` |
| `DB_PORT` | `5432` — native Postgres default |
| `DB_PASSWORD` | whatever you set in phase 3, exactly |
| `API_URL` | `https://yourdomain.com` — same origin as the frontend; nginx proxies `/api` under it (phase 11) |
| `JWT_SECRET` | the freshly generated value above |
| `GOOGLE_CLIENT_ID` / `SECRET` | from phase 13 — leave blank for now, comes back to this |

## 7. Install dependencies

```bash
npm ci
```

> **Gotcha:** if a later step fails with `Cannot find module 'ts-node'`,
> check `echo $NODE_ENV` in your shell — if it's `production`, npm silently
> skipped devDependencies. Fix: `npm install --include=dev`.

## 8. Run database migrations

```bash
cd apps/api
npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts
cd ../..
```

## 9. Build both apps

```bash
npm run build
```

Produces `apps/api/dist` (run by pm2) and `apps/web/dist` (served as
static files by nginx).

## 10. Start the API with pm2

```bash
sudo npm install -g pm2   # if not already installed

cd apps/api
pm2 start dist/main.js --name fantasybrahma-api
pm2 save
pm2 startup   # then run the sudo command it prints, so pm2 survives a reboot
```

> **Verify:** `curl http://localhost:$PORT/api/gameweeks` should respond
> (an empty array or a 404 about "no current season" is fine at this
> point — data comes in phase 14).

## 11. nginx — serve the frontend, proxy the API

One block per domain, appended to the shared config. Back up first if this
box already serves other sites from the same file.

```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak.$(date +%Y%m%d)

sudo tee -a /etc/nginx/sites-available/default > /dev/null <<'EOF'

server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    root /home/ubuntu/football_fantasy_pro/apps/web/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo nginx -t   # must say "syntax is ok" before reloading
sudo systemctl reload nginx
```

> **Verify:** `curl -o /dev/null -w "%{http_code}\n" http://yourdomain.com/` → `200`

## 12. SSL via certbot

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --redirect
```

Certbot rewrites the block from phase 11 in place — splits it into a `443
ssl` block plus an HTTP→HTTPS redirect stub. Don't hand-write that redirect
yourself.

> **Gotcha:** if it fails with `NXDOMAIN` for the `www` subdomain, that DNS
> record was never created. Either add it, or just drop
> `-d www.yourdomain.com` for now — add it later with `--expand`.

Once HTTPS is live, go back and set `NODE_ENV=production` in `.env`, then
`pm2 restart fantasybrahma-api`. The login cookie requires HTTPS to be set
at all — doing this before SSL exists silently breaks login.

## 13. OAuth credentials for this domain

Credentials are locked to specific redirect URLs — you can't reuse a set
registered for a different domain.

- **Google Cloud Console** → APIs & Services → Credentials → your OAuth
  client → add `https://yourdomain.com/api/auth/google/callback` under
  **Authorized redirect URIs**

> **Gotcha:** there are two similar-looking fields on that form.
> **Authorized JavaScript origins** wants a bare origin, no path
> (`https://yourdomain.com`) — it'll reject anything with a path. The full
> callback URL, path included, goes in **Authorized redirect URIs** instead.

Paste the Client ID / Secret into `.env`, restart pm2.

## 14. Sync real FPL data

Migrations create empty tables. The app has nothing to show until this
runs once.

```bash
curl -X POST "http://localhost:$PORT/api/sync/run?scope=bootstrap"
sleep 5
curl "http://localhost:$PORT/api/sync/logs?limit=3"   # look for status: success
```

> **Gotcha:** always use `?scope=bootstrap`. Omitting it (or
> `scope=full`) fetches detailed historical stats for every player —
> hundreds of extra API calls, memory-heavy enough to OOM-kill a t3.micro.
> Bootstrap-only gets real players, teams, and gameweek deadlines, which is
> everything the app needs to run.

## 15. Final checklist

- `https://yourdomain.com` loads the app, styled correctly
- `https://yourdomain.com/api/gameweeks` returns real gameweek data
- "Continue with Google" reaches Google's real consent screen, not a blank page
- A completed login shows your avatar in the header
- `pm2 list` shows the API as `online`, not `errored`

---

## Pitfalls worth knowing before you hit them

Every one of these actually happened during a real deployment — not a
hypothetical list.

**1. Double-refresh needed to see a new deploy**
Was caused by an old PWA service worker aggressively caching the app
shell. Removed from the project entirely as of 2026-08-20 — no longer
applicable on current code, noted here in case an older checkout is ever
revived.

**2. Login redirect goes blank, no error**
Check the browser console for *"No routes matched location /api/..."* —
that specific message means something served the SPA shell instead of
proxying to the API. Usually the nginx `location /api/` block, or (on old
checkouts) the PWA service worker's navigation fallback.

**3. "It looks smaller/cramped in production"**
Before assuming a build bug, compare computed styles directly (dev tools →
element → computed), not just by eye — browser zoom level and window
width both change how identical CSS *reads* without changing a single
pixel value.

**4. `grep` on `dist/index.html` finds nothing**
Expected — it's an empty shell for a client-rendered app. Component class
names live in the JS bundle, not the HTML. Check the live page's computed
styles instead of grepping build output for UI-level changes.
