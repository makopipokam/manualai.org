# pwnd

`pwnd` — pronounced “pond” — is the quizbattle and living-pond game prototype.

## Web Beta

The Web Beta is served from [`index.html`](index.html). The quiz uses [`pwnd-engine.js`](pwnd-engine.js); the local strategy slice uses [`pond-demo.js`](pond-demo.js). A 10×10 pond with a fixed 2×2 core allows one each of the 2×2 Solar-Seerose (energy), Quellbecken (water) and Schilf-Windrad (air). Each produces 120 of its resource/hour; collection is manual, capped at eight offline hours per accrual interval and a local stock of 2,000 **for producer output only**. Existing quiz-earned resources are not capped retroactively.

Footprint Manhattan distance matters: solar + spring within two cells adds 300 energy/hour; reed + spring within three adds 120 air/hour. Golden grid cells preview each bonus. Placing or moving a building banks its **previously earned** production at the old rate before changing adjacency, so bonuses never apply retroactively. One of each producer can be placed; an existing producer can be moved for free. Quiz rewards, placement costs, accrued production and the three buildings are saved together in the existing browser `pwnd-profile` entry. A quiz attempt is credited once in the local profile; stale tabs and failed writes are reported rather than shown as successful actions.

**This is a same-browser demo, not authenticated or server-authoritative game currency.** Browser storage and the device clock can be changed; concurrently edited tabs are not transactionally serialized, and interrupted quiz rounds do not resume after reload. Never import these values into PvP, league or loot without the server checks in [`docs/quiz-pond-integration-contract.md`](docs/quiz-pond-integration-contract.md).

## Optional online pond (server-side foundation)

[`online.html`](online.html) is a deliberately **separate** authenticated pond. It reuses the existing manualAI Supabase E-Mail-OTP login and public publishable client key, with a dedicated additive schema in [`migrations/`](migrations/) and no new service-role key in browser code. Two authenticated, `SECURITY DEFINER` RPCs own the state and actions: `pwnd_get_pond()` and `pwnd_pond_action(kind,type,x,y,revision)`. All wallet changes, placement validation, bonuses, row locking and the eight-hour production time calculation occur in PostgreSQL. `auth.uid()` fixes the owner; RLS and revoked table grants block browser writes. New online accounts start with an independent 1,000 ⚡ / 500 💧 / 300 🌬️ / 100 ❤️ balance to let them try all three buildings. A stale revision is rejected. The previous local quiz profile is neither overwritten nor imported as online currency.

The online pond currently **does not credit quiz rewards**; the owl and fox quizzes still use their local demo state. The next step is a server-verified question/answer/attempt transaction, not trusting the existing browser answers. Changing the device clock does not change online production. Signing out of this Supabase project signs out of other manualAI apps using the same login in this browser.

The optional mocked-auth/mobile browser check is `python3 pwnd/test/online-browser.test.py` after starting a static server at repository root on port 4173. For a read-only test of deployed assets, use `PWND_ONLINE_URL=https://app.manualai.org/pwnd/online.html python3 pwnd/test/online-browser.test.py`: the test intercepts the auth library in an isolated browser and never creates a real account or writes to the live database. It verifies OTP screens, separate balances, three buildings, both bonuses, claim, move, reload and logout.

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
