# manualAI — Applications Directory (`/apps`)

This directory houses all 10 independent, modular web applications and games created for manualAI. Each subfolder is a fully self-contained application with its own entry point, logic, and styling.

```
apps/
├── pwnd/             # 01. Pond Ecosystem Quiz Battle & AI Strategy
├── mydog/            # 02. Dog Breed Compatibility Profiler (30 questions)
├── mycat/            # 03. Feline Character & Archetype Analyzer (18 profiles)
├── fishroyale/       # 04. Deep Reef Turn-Based Tactic Card Duel
├── TaubenVSKrähen/   # 05. Urban District Strategy (Pigeons vs. Crows)
├── biomancer/        # 06. Legion TD Adaptation (Bio-lane defense, King reactor & mercenary income)
├── riftvanguard/     # 07. Hero Line Wars Adaptation (Portal defense, hero action & creep sends)
├── malltd/           # 08. Shopping Mall TD Adaptation (Open-maze kiosks & shopper hordes)
├── citadelwars/      # 09. Castle Wars Adaptation (Dual fortress barracks & siege warfare)
└── celestialarena/   # 10. Angel Arena Adaptation (Hero brawler, jungle creeps, stat tomes & pit duels)
```

---

## Overview of App Subfolders

### Part 1: Core manualAI Experiences
1. **`pwnd/`**
   - **Type**: Interactive Pond Simulation & Quiz Strategy
   - **Entrypoint**: `apps/pwnd/index.html`
   - **Key Assets**: `pwnd-ai-questions.json`

2. **`mydog/`**
   - **Type**: Lifestyle & Personality Profiler (Canine)
   - **Entrypoint**: `apps/mydog/index.html`
   - **Features**: 30-question interactive test, audio synthesis, match engine.

3. **`mycat/`**
   - **Type**: Lifestyle & Character Profiler (Feline)
   - **Entrypoint**: `apps/mycat/index.html`
   - **Features**: 18 archetype cards, filter tabs, sound synthesis.

4. **`fishroyale/`**
   - **Type**: Turn-Based Reef Card Duel
   - **Entrypoint**: `apps/fishroyale/index.html`
   - **Features**: 6-round strategy match, energy management, zero RNG loot.

5. **`TaubenVSKrähen/`**
   - **Type**: Turn-Based Urban Strategy
   - **Entrypoint**: `apps/TaubenVSKrähen/index.html`
   - **Features**: 5 park districts, turn timer, territory conquer mechanics.

---

### Part 2: Tactical Warcraft III Custom Game Adaptations
6. **`biomancer/`** (Legion TD Adaptation)
   - **Entrypoint**: `apps/biomancer/index.html`
   - **Features**: Grid unit placement, lane combat, King Core Reactor defense, mercenary sends, income cycle.

7. **`riftvanguard/`** (Hero Line Wars Adaptation)
   - **Entrypoint**: `apps/riftvanguard/index.html`
   - **Features**: Direct hero controls, active spell cooldowns, portal defense, 10s income timer, automated creep tug-of-war.

8. **`malltd/`** (Shopping Mall TD Adaptation)
   - **Entrypoint**: `apps/malltd/index.html`
   - **Features**: Open 18x12 grid mazing, Espresso bar / Clearance rack / Segway security towers, BFS dynamic pathfinding.

9. **`citadelwars/`** (Castle Wars Adaptation)
   - **Entrypoint**: `apps/citadelwars/index.html`
   - **Features**: Left vs. Right castle clash, 4 buildable barracks, automated 12s wave march, commander meteor/haste spells.

10. **`celestialarena/`** (Angel Arena Adaptation)
    - **Entrypoint**: `apps/celestialarena/index.html`
    - **Features**: Top-down WASD hero combat, neutral jungle camps, stat tome shop, scheduled 1v1 pit duels.

---

## Standalone Deployment
Every application can be deployed as its own Google AI Studio project simply by setting `apps/<app-name>/index.html` as the root `index.html`. See `STANDALONE_APPS_GUIDE.md` for full instructions.
