# pwnd

`pwnd` — pronounced “pond” — is the quizbattle and living-pond game prototype.

## Web Beta

The Web Beta is served from [`index.html`](index.html). The quiz uses [`pwnd-engine.js`](pwnd-engine.js); the local strategy slice uses [`pond-demo.js`](pond-demo.js). A 10×10 pond with a fixed 2×2 core allows one each of the 2×2 Solar-Seerose (energy), Quellbecken (water) and Schilf-Windrad (air). Each produces 120 of its resource/hour; collection is manual, capped at eight offline hours per accrual interval and a local stock of 2,000 **for producer output only**. Existing quiz-earned resources are not capped retroactively.

Footprint Manhattan distance matters: solar + spring within two cells adds 300 energy/hour; reed + spring within three adds 120 air/hour. Golden grid cells preview each bonus. Placing or moving a building banks its **previously earned** production at the old rate before changing adjacency, so bonuses never apply retroactively. One of each producer can be placed; an existing producer can be moved for free. Quiz rewards, placement costs, accrued production and the three buildings are saved together in the existing browser `pwnd-profile` entry. A quiz attempt is credited once in the local profile; stale tabs and failed writes are reported rather than shown as successful actions.

**This is a same-browser demo, not authenticated or server-authoritative game currency.** Browser storage and the device clock can be changed; concurrently edited tabs are not transactionally serialized, and interrupted quiz rounds do not resume after reload. Never import these values into PvP, league or loot without the server checks in [`docs/quiz-pond-integration-contract.md`](docs/quiz-pond-integration-contract.md).

Run the engine and API tests from the repository root:

```bash
npm run test:pwnd
```

For the two quizzes → three buildings → both bonuses → move → collect energy/water/air → reload browser scenario, start a local static server at the repository root, then run the optional Chromium/Playwright test:

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
