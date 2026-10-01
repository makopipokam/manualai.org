# pwnd

`pwnd` — pronounced “pond” — is the quizbattle and living-pond game prototype.

## Web Beta

The frozen Web Beta is served from [`index.html`](index.html). It uses the deterministic engine in [`pwnd-engine.js`](pwnd-engine.js) and the styles/scripts in this directory.

Run the engine tests from the repository root:

```bash
npm run test:pwnd
```

## Documentation

- [`docs/ideas.md`](docs/ideas.md) — canonical game vision
- [`docs/pond-catalog.md`](docs/pond-catalog.md) — residents, structures, and economy
- [`docs/feasibility-review.md`](docs/feasibility-review.md) — feasibility review

## Godot prototype

The first-person 3D prototype is kept separately at [`../godot/pwnd-prototype/`](../godot/pwnd-prototype/). It is not part of the frozen Web Beta.

## Scope boundary

`pwnd/` contains pwnd-specific web code, deterministic game logic, tests, and design documents. Shared app selection, Vercel configuration, and serverless API infrastructure remain at the repository root.
