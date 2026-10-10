# manualAI — Standalone Google AI Studio App Creation Guide

In Google AI Studio, every applet is an independent workspace with its own dedicated sandbox container and live URL. Applets are created at the account level through the Google AI Studio interface.

All 10 apps are neatly organized into the `/apps` directory. Below is the directory map and quick setup instructions for launching any of the manualAI experiences as its own standalone Google AI Studio app.

---

## Part 1: Core manualAI Experiences

### 1. pwnd (Pond Ecosystem Quiz Battle)
- **Directory**: `/apps/pwnd/`
- **Main Files**:
  - `apps/pwnd/index.html`: Interactive pond ecosystem, quiz mechanics, sound synthesizer, and UI.
  - `apps/pwnd/pwnd-ai-questions.json`: Local question and scenario bank.
  - `api/pwnd-question.js`: Backend handler for adaptive dynamic questions.
- **Standalone Launch in Google AI Studio**:
  1. Click **Create App** in Google AI Studio.
  2. Set `index.html` as the root entry point (copy `/apps/pwnd/index.html` to root `/index.html`).
  3. Include `pwnd-ai-questions.json` and optional AI backend in `server.js` or `api/`.

---

### 2. MyDog (Dog Breed Personality Explorer)
- **Directory**: `/apps/mydog/`
- **Main Files**:
  - `apps/mydog/index.html`: Self-contained interactive quiz, scoring engine, audio synthesizer, and breed database.
- **Standalone Launch in Google AI Studio**:
  1. Click **Create App** in Google AI Studio.
  2. Copy `/apps/mydog/index.html` directly as the root `/index.html`.
  3. Fully functional as a zero-dependency static app or with Node/Express.

---

### 3. MyCat (Feline Character Profile Analyzer)
- **Directory**: `/apps/mycat/`
- **Main Files**:
  - `apps/mycat/index.html`: Self-contained personality test, sound generation, profile builder, and animations.
- **Standalone Launch in Google AI Studio**:
  1. Click **Create App** in Google AI Studio.
  2. Copy `/apps/mycat/index.html` as the root `/index.html`.
  3. Operates standalone in browser with zero external runtime dependencies.

---

### 4. Fish Royale (Deep Reef Strategy Card Battle)
- **Directory**: `/apps/fishroyale/`
- **Main Files**:
  - `apps/fishroyale/index.html`: Turn-based card duel, reef simulation, sound synthesis, and state machine.
- **Standalone Launch in Google AI Studio**:
  1. Click **Create App** in Google AI Studio.
  2. Copy `/apps/fishroyale/index.html` as the root `/index.html`.
  3. Runs entirely in the client with localStorage persistence.

---

### 5. TaubenVSKrähen (Pigeons vs. Crows Urban Strategy)
- **Directory**: `/apps/TaubenVSKrähen/`
- **Main Files**:
  - `apps/TaubenVSKrähen/index.html`: Tactical territory grid, turn timer, AI opponent, procedural sound effects.
  - `apps/TaubenVSKrähen/favicon.png`: Dedicated retro bird badge.
- **Standalone Launch in Google AI Studio**:
  1. Click **Create App** in Google AI Studio.
  2. Copy `/apps/TaubenVSKrähen/index.html` as the root `/index.html` and copy `favicon.png`.
  3. Runs immediately without build steps or complex configurations.

---

## Part 2: Adapted Warcraft 3 Custom Games

### 6. Biomancer Garrison (Legion TD Adaptation)
- **Directory**: `/apps/biomancer/`
- **Main Files**:
  - `apps/biomancer/index.html`: Full game logic (grid lane builder, 4 bio-unit types, 15 enemy swarm waves, King Reactor, mercenary income cycle, Web Audio sound effects).
- **Standalone Launch in Google AI Studio**:
  1. Click **Create App** in Google AI Studio.
  2. Copy `/apps/biomancer/index.html` as the root `/index.html`.
  3. Run preview — the game runs 100% self-contained.

---

### 7. Rift Vanguard (Hero Line Wars Adaptation)
- **Directory**: `/apps/riftvanguard/`
- **Main Files**:
  - `apps/riftvanguard/index.html`: Top-down hero control (WASD/Arrows + Q/W/E/R abilities), dual lane portal defense, 10-second income payout, mercenary creep queue.
- **Standalone Launch in Google AI Studio**:
  1. Click **Create App** in Google AI Studio.
  2. Copy `/apps/riftvanguard/index.html` as the root `/index.html`.
  3. Run preview — zero build tools needed.

---

### 8. MegaMall Rush TD (Shopping Mall TD Adaptation)
- **Directory**: `/apps/malltd/`
- **Main Files**:
  - `apps/malltd/index.html`: 18x12 open tile mazing grid, BFS live pathfinding, 4 specialized kiosk towers (Espresso, Clearance, Segway, Perfume), 12 customer hordes.
- **Standalone Launch in Google AI Studio**:
  1. Click **Create App** in Google AI Studio.
  2. Copy `/apps/malltd/index.html` as the root `/index.html`.
  3. Run preview.

---

### 9. Citadel Dominion (Castle Wars Adaptation)
- **Directory**: `/apps/citadelwars/`
- **Main Files**:
  - `apps/citadelwars/index.html`: Left vs. Right castle battlefield, 4 production barracks (Iron Guard, Falcon Archers, Gryphons, Catapults), 12-second wave pulse, commander tactical spells (Meteor, Aegis Shield, Haste Aura).
- **Standalone Launch in Google AI Studio**:
  1. Click **Create App** in Google AI Studio.
  2. Copy `/apps/citadelwars/index.html` as the root `/index.html`.
  3. Run preview.

---

### 10. Celestial Colosseum (Angel Arena Adaptation)
- **Directory**: `/apps/celestialarena/`
- **Main Files**:
  - `apps/celestialarena/index.html`: Full arena brawler, WASD movement, neutral monster jungle camps, stat tome shop (Power, Agility, Arcane), scheduled 1v1 pit duels.
- **Standalone Launch in Google AI Studio**:
  1. Click **Create App** in Google AI Studio.
  2. Copy `/apps/celestialarena/index.html` as the root `/index.html`.
  3. Run preview.

---

## Summary Table

| App | Subfolder | Category | Original Source / Theme |
|---|---|---|---|
| **pwnd** | `/apps/pwnd/` | Quiz & Ecosystem | Pond Quiz Strategy |
| **MyDog** | `/apps/mydog/` | Profiler | 30-Question Dog Match |
| **MyCat** | `/apps/mycat/` | Profiler | 18 Feline Personalities |
| **Fish Royale** | `/apps/fishroyale/` | Card Tactics | 6-Round Reef Strategy |
| **TaubenVSKrähen** | `/apps/TaubenVSKrähen/` | Board Tactics | Park District Conquest |
| **Biomancer Garrison** | `/apps/biomancer/` | Tactical TD | Legion TD |
| **Rift Vanguard** | `/apps/riftvanguard/` | Action Line Wars | Hero Line Wars |
| **MegaMall Rush TD** | `/apps/malltd/` | Open Mazing TD | Shopping Mall TD |
| **Citadel Dominion** | `/apps/citadelwars/` | Auto-Battler Clash | Castle Wars |
| **Celestial Colosseum** | `/apps/celestialarena/` | Hero Arena | Angel Arena |

---

## cats&dogs in MyDog und MyCat

Die Dating-App ist in beiden bestehenden Tierwelten als verschachtelte, eigenständige App verfügbar:

- **MyDog-Pfad:** `/apps/mydog/cats&dogs/` — erreichbar über `/apps/mydog/cats%26dogs/`
- **MyCat-Pfad:** `/apps/mycat/cats&dogs/` — erreichbar über `/apps/mycat/cats%26dogs/`

Beide Einstiege enthalten dieselbe selbstständige `index.html` mit Persönlichkeitstest, Tierzuweisung, Testmodus, Feedback-Bubble sowie Katzen- und Hunde-Begegnungen. Die Kopien werden durch einen automatisierten Test byte-identisch gehalten.

Für eine lokale oder statische Vorschau genügt es, den jeweiligen Ordner als Webroot zu verwenden. Der Pfad muss bei direkten URL-Aufrufen wegen des kaufmännischen Und-Zeichens URL-kodiert werden (`%26`).
