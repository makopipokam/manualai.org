# Manus Webdev snapshot

This directory contains a source snapshot of the `pwnd` Manus Webdev project at accepted checkpoint `d7008117d04a10e712c1078549cc8751ff77842f` (2026-10-03). The standalone project files remain together here, including its Express API, database migrations, static frontend, deterministic shared game rules, question content, and tests.

The existing GitHub site app at `/apps/pwnd/` is preserved. This snapshot is **not wired into the main site's runtime or routes**: it expects its own Express server at the site root (`/api`, `/shared`, `/assets`) and managed runtime/database configuration. It can be run independently from this directory with Node 22 and pnpm:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm test
corepack pnpm dev
```

Runtime credentials are supplied by the standalone deployment environment; no `.env` or credential values are included in this snapshot.
