# pwnd Godot Prototype Roadmap

## M0 — Proof-of-Fun-Grundgerüst (implementiert; Spielgefühl nicht verifiziert)

- [x] Godot 4 project
- [x] First-person movement
- [x] small pond, shore, shallow water
- [x] frog, fish, duck reaction states
- [x] energy HUD
- [x] water-only animal development
- [x] energy-based duck dock construction
- [x] headless editor and runtime smoke tests

## M1 — Playable loop (implemented; regression fixes required)

- [x] real multiple-choice quiz activity
- [x] correct and incorrect answer rewards
- [x] save/load energy, water, built structures, and animal development
- [x] automatic local save after meaningful actions
- [x] clear feedback when energy or water is spent
- [x] interaction prompts near animals and construction sites
- [x] visible three-stage color and scale feedback for animal development

## M2 — Mobile-first foundation (implemented; device verification pending)

- [x] virtual joystick for movement
- [x] touch-drag camera look area
- [x] on-screen action buttons (thumb suitability on device not verified)
- [x] portrait quiz panel with larger text and touch targets (simulated 720×1280: answer and next buttons ≥44px)
- [x] desktop keyboard/mouse fallback
- [x] optional haptic feedback on supported touch devices
- [x] large mobile pause button with deterministic resume
- [x] local mobile sound toggle with persisted preference
- [x] responsive HUD with viewport-safe margins
- [x] pause-overlay FPS and object-count snapshot
- [x] pause-overlay viewport, orientation, and input-mode diagnostics
- [ ] Android/iOS device export and hands-on test
- [ ] safe-area verification on a notched phone
- [ ] performance profile on a real phone

## Stabilisierung vor weiterer Inhaltserweiterung — Priorität laut unabhängiger Zweitprüfung

- [x] **P0:** „Nächste Frage“ wechselt wirklich zur nächsten Frage; Regressionstest ergänzt
- [x] **P0:** Enten-Habitatregel ist eine echte Voraussetzung; ohne Steg wird kein Wasser verbraucht
- [x] **P1:** Touch-/Joystick-Zustand beim Verstecken, Pausieren und Quizstart zurückgesetzt
- [x] **P1:** Vertikale Tierbewegung gestoppt; horizontale Reaktionen getestet
- [x] **P1:** Statische Weltkollision für Boden, Ufersteine und Entensteg ergänzt und getestet
- [x] **P1:** Gummistiefel-Sohle an Boden-/Wasserhöhe ausgerichtet und automatisiert geprüft
- [ ] **P1:** Spieler-/Watenhöhe unter realen Bewegungs- und Gerätebedingungen feinjustieren
- [x] **P1:** Portrait-Quiz und Touchziele im simulierten 720×1280-Fenster geprüft
- [ ] **P1:** Safe Area/Notch und Touch-Bedienung auf einem realen Gerät prüfen
- [x] **P2:** Sichtbare Wasserfläche ist die gemeinsame Grenze für Waten, Fischreaktion und Ripples (inklusive Rotationstest)
- [x] **P2:** Bau-Reichweite und Save-Validierung konsistent machen

Siehe [REVIEW.md](REVIEW.md) für reproduzierte Befunde und Testgrenzen.

## M3 — Emotional slice (initial pass)

- [x] duck uses the dock
- [x] frog returns to the player after development
- [x] fish reacts to boots and ripples
- [x] visible rubber boots with walking and wading bob
- [x] reeds, lilies, and water receive simple animation
- [x] first low-volume pond ambient loop

## M4 — Content foundation

- [x] initial data-driven animal definitions for frog, fish, and duck
- [x] initial data-driven structure definition for the duck dock
- [x] initial habitat prerequisite metadata and interaction hint
- [x] centralized deterministic economy rules with explicit reward feedback
- [ ] deterministic reward engine shared with the web beta
- [ ] first three quiz activity types

## Out of scope until the core loop is proven

- online PvP
- accounts and cloud saves
- Spotify or AI-DJ integration
- open world
- breeding simulation
- seasons and weather simulation
