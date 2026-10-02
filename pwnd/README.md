# pwnd

`pwnd` — pronounced “pond” — is the quizbattle and living-pond game prototype.

## Web Beta

The Web Beta is served from [`index.html`](index.html). The quiz uses [`pwnd-engine.js`](pwnd-engine.js); the first local building slice uses [`pond-demo.js`](pond-demo.js). A 10×10 pond with a fixed core allows one 2×2 Solar-Seerose; quiz rewards, placement costs and the placed building are saved together in the browser's existing `pwnd-profile` entry. The flower produces 120 energy/hour (claimable, maximum eight offline hours; solar collection stops when the local energy stock reaches 2,000). Existing quiz-earned energy is not capped retroactively. A quiz attempt is credited once in the local profile; stale tabs and failed writes are reported rather than shown as successful actions.

**This is a same-browser demo, not authenticated or server-authoritative game currency.** Browser storage and the device clock can be changed; concurrently edited tabs are not transactionally serialized, and interrupted quiz rounds do not resume after reload. Never import these values into PvP, league or loot without the server checks in [`docs/quiz-pond-integration-contract.md`](docs/quiz-pond-integration-contract.md).

Run the engine and API tests from the repository root:

```bash
npm run test:pwnd
```

For the quiz → reward → placement → reload → energy-claim browser scenario, start a local static server at the repository root, then run the optional Chromium/Playwright test:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
# In a second terminal (requires Chromium and Python Playwright):
python3 pwnd/test/pond-browser.test.py
```

## Documentation

- [`docs/ideas.md`](docs/ideas.md) — canonical game vision
- [`docs/pond-catalog.md`](docs/pond-catalog.md) — residents, structures, and economy
- [`docs/feasibility-review.md`](docs/feasibility-review.md) — feasibility review
- [`docs/quiz-pond-integration-contract.md`](docs/quiz-pond-integration-contract.md) — local demo and future server transaction boundary

## Godot prototype

The first-person 3D prototype is kept separately at [`../godot/pwnd-prototype/`](../godot/pwnd-prototype/). It is not part of the frozen Web Beta.

## Scope boundary

`pwnd/` contains pwnd-specific web code, deterministic game logic, tests, and design documents. Shared app selection, Vercel configuration, and serverless API infrastructure remain at the repository root.
