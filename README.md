# manualAI.org

Repository for two separate applications maintained under the manualAI.org umbrella.

## Applications

| App | Path | Purpose | Entry point |
|---|---|---|---|
| **pwnd** | [`pwnd/`](pwnd/) | Quizbattle and pond-game prototype | [`/pwnd/`](https://app.manualai.org/pwnd/) |
| **mydog** | [`mydog/`](mydog/) | Personality test and dog matching app | [`/mydog/`](https://manualai.org/mydog/) |

The applications have separate HTML, CSS, JavaScript, data, documentation, and tests. Shared Vercel routing and serverless API helpers remain at the repository root because they serve the manualAI.org shell or both applications.

## pwnd

- Web Beta: [`pwnd/index.html`](pwnd/index.html)
- Deterministic engine: [`pwnd/pwnd-engine.js`](pwnd/pwnd-engine.js)
- Tests: `npm run test:pwnd`
- Godot 4 prototype: [`godot/pwnd-prototype/`](godot/pwnd-prototype/)

The existing Web Beta remains frozen. New 3D work belongs to the Godot prototype and its feature branch.

## mydog

- App: [`mydog/index.html`](mydog/index.html)
- Data: [`mydog/data.js`](mydog/data.js)
- PWA assets and service worker: [`mydog/manifest.json`](mydog/manifest.json), [`mydog/sw.js`](mydog/sw.js)

## Shared root infrastructure

- `index.html` — app-selection shell
- `vercel.json` — deployment routes and security headers
- `api/` — shared serverless API handlers
- `package.json` — repository scripts and dependencies

Do not place new app-specific files in the repository root. Add them under `pwnd/` or `mydog/`.
