# bun-webapp

A full-stack web app template using Bun, Elysia, SQLite, and Svelte 5 (or Vue 3).

```bash
bun create jaguart/bun-webapp my-app
cd my-app
bun bin/seed-user.ts --name "Your Name" --email you@example.com --password secret
bun run dev
```

`bun create` runs `create.ts` automatically after scaffolding, which:
- prompts for app name, description, author, and homepage
- updates `package.json` and resets the version to `0.0.1`
- copies `.env.example` → `.env`
- initialises the SQLite database

> If you fork this template, update `repository` in `package.json` to point at your own repo.

## Stack

- **Runtime / bundler / test runner**: [Bun](https://bun.sh)
- **HTTP framework**: [Elysia](https://elysiajs.com)
- **Database**: SQLite via `bun:sqlite`
- **Default UI**: Svelte 5 (built by Vite)
- **Alternate UI**: Vue 3 (CDN, plain JS)
- **Linter / formatter**: Biome

## Quick start

```bash
bun bin/seed-user.ts --name "Your Name" --email you@example.com --password secret
bun run dev      # API :3000  +  Vite HMR :5173
```

To re-run setup at any time (e.g. after cloning directly): `bun run setup`

## Scripts

| Script | What it does |
|--------|-------------|
| `bun run setup` | First-run: prompts for metadata, copies `.env`, inits DB |
| `bun run dev` | Backend `--watch` + Vite dev server |
| `bun run app` | Run with current `.env` (no Vite) |
| `bun run prod` | Set `NODE_ENV=production`, run app |
| `bun run build` | Type-check API + build UI → `public/` |
| `bun run build:ui` | Build UI only → `public/` |
| `bun run bump` | Test + bump version + commit + tag + archive |
| `bun run deploy user@server env` | Stage + rsync + install + restart |
| `bun run init-db` | Create DB and run all migrations |
| `bun run reset-db` | Wipe all data, re-run migrations |
| `bun run test` | Unit tests |
| `bun run test:integration` | Integration tests (in-memory DB) |
| `bun run test:all` | All tests |
| `bun run ui:svelte` | Set UI flavour → Svelte + build |
| `bun run ui:vue` | Set UI flavour → Vue 3 + copy to `public/` |
| `bun run systemd` | Symlink and enable the systemd service |
| `bun run nginx` | Symlink nginx config to sites-enabled |

## Project layout

```
src/
  index.ts          main entry point
  config.ts         environment + config bag
  api/              api route handlers
  app/              request logger, static file plugin
  infra/            logger, SQLite store, sessions, ACL, date utils
  model/            data-layer (todos, users)
  db/               sequential migration scripts
  cmd/              app-specific CLI scripts
  public-svelte5/   Svelte 5 SPA source
  public-vue3/      Vue 3 CDN app (plain HTML+JS)
  system/           systemd service + nginx config example
bin/                infrastructure scripts (build, bump, deploy, …)
test/
  unit/             pure-function tests
  integration/      full HTTP round-trip tests (in-memory SQLite)
public/             built UI assets served by Elysia static plugin
doc/                design notes
var/                SQLite database files (gitignored)
```

## Release workflow

```bash
bun run build                          # type-check + build UI
bun run bump                           # test, bump version, commit, tag, archive
bun run deploy user@server production  # rsync to server, install, restart
```

`bump` archives a production snapshot to `dist/`. `deploy` stages a fresh copy from
the committed working tree and syncs it to `/srv/<app-name>` on the server.

## First server setup

```bash
# on server, after first deploy
bun run init-db                        # create var/ and run migrations
bun bin/seed-user.ts --name "Name" --email you@example.com --password secret
bun run systemd                        # link + enable src/system/bun-webapp.service
bun run nginx                          # link + test src/system/my-app.example.nginx
sudo systemctl restart nginx
```

## Auth model

Cookie-based sessions (`httpOnly`, `secure`, `sameSite=lax`, 7-day expiry).
Capabilities are a semicolon-separated string on the user row, e.g. `admin;editor`.
The `admin` capability bypasses per-user data isolation on the todos routes.
