# pwnd — unabhängige Zweitprüfung des Godot-Prototyps

Stand: Godot 4.7.2, Branch `feat/pwnd-godot-vertical-slice`, Ausgangscommit `3fe2999`. Prüfung: Quellcode, isolierte Gameplay-Reproduktionen, Editor-/Runtime-Smoke-Test und gerenderte Fenster in 1280×720 sowie simuliertem 720×1280. Keine Änderung an der Web-Beta.

> **Historischer Prüfstand:** Diese Tabelle beschreibt den Zustand bei Commit `3fe2999`, nicht automatisch den aktuellen Branch. Quiz-Fortschritt, durchgesetzte Enten-Habitatregel, Touch-Reset und vertikale Tierbewegung wurden anschließend korrigiert und in `tests/regression_test.gd` abgesichert. Die Hochformat-Quiz-UI wurde danach für ein simuliertes 720×1280-Fenster vergrößert; Weltkollision, Notch-Safe-Area und echter Gerätetest bleiben offen. Aktuelle Prioritäten stehen in [ROADMAP.md](ROADMAP.md).

## Kurzurteil

**Als technische Rohfassung lauffähig, als belastbarer „Proof of Fun“ noch nicht ausreichend verifiziert.** Die Engine startet und rendert eine erkennbare Teichszene. Die bisherigen Headless-Smoke-Tests prüfen aber keine Interaktionen; gezielte Tests reproduzieren Defekte im Quiz, bei Habitat und Bewegung. Ein echter Smartphone-Test fehlt weiterhin. Die frühere Bewertung „technisch stabil“ war zu optimistisch.

## Reproduzierte Befunde — nach Priorität

| Priorität | Befund / Beleg | Wirkung und empfohlene Korrektur |
|---|---|---|
| **P0 · Kernloop** | `quiz_panel.gd:107–110,142–143`: `open_quiz()` erhöht `question_index`, `_next_question()` ruft nur `_render_question()` auf. Integrationstest: `before=1 after=1 same_question=true`. | **„Nächste Frage“ zeigt dieselbe Frage erneut.** Index beim Weitergehen genau einmal erhöhen; Startfrage beim Öffnen nicht überspringen; Regressionstest ergänzen. |
| **P0 · Habitat** | `animal.gd:23–30,141–142` deklariert den Steg als Pflicht für die Ente. `main.gd:479–504` prüft `required_structure()` nicht. Test: `dock_built=false`, Ente steigt auf Stufe 1, **20 Wasser verbraucht**. | Die Voraussetzung ist bislang **nur ein Hinweis**, keine Regel. Entweder vor Upgrade durchsetzen (mit klarer Rückmeldung) oder ausdrücklich als unverbindlichen Habitats-Tipp bezeichnen. Vor Umsetzung Produktregel festhalten. |
| **P1 · Weltphysik** | Weltgeometrie entsteht über `_add_box()` als `MeshInstance3D` (`main.gd:89–97,109–123`); der Integrationstest findet **0 Welt-Kollisionskörper**. `player.gd:77–87` setzt `velocity.y=0`, ohne Schwerkraft oder Bodenkontakt. | Man läuft durch Ufer, Steine und Steg; Gummistiefel bleiben auf fixer Höhe. Für den begehbaren Teich brauchen Boden/Ufer/Hindernisse zweckmäßige Kollisionskörper und eine bewusst definierte Waten-Höhe. |
| **P1 · Mobile-Eingabe** | `mobile_controls.gd:102–130` behält aktive Touch-Indizes und Joystick-Vektor; `main.gd:307–310,332–342` versteckt das Control beim Quiz/Pausieren, ohne den Vektor zu löschen. Test: `JOYSTICK_BEFORE_HIDE=0.623`, `AFTER_HIDE=0.623`. | Nach Rückkehr kann der Spieler **ungewollt weiterlaufen**, falls ein Touch vor dem Verstecken nicht regulär freigegeben wird. Bei Hide/Focusverlust Joystick/Look-Touches zurücksetzen und `move_changed(Vector2.ZERO)` auslösen. |
| **P1 · Tierbewegung** | `animal.gd:106–128` nutzt 3D-Richtungen direkt zum Spieler und addiert sie zur globalen Position, ohne `y` zu fixieren. Test: Fisch von `y=0.16` auf `y=-0.33` in 0,5 s. | Tiere können aus ihrer Habitat-Ebene driften und durch den unsichtbaren Boden bewegen; Richtungsvektoren horizontal projizieren und Höhen pro Spezies erhalten. Fisch außerdem räumlich auf den Teich begrenzen. |
| **P1 · Hochformat-UI** | Simulierter 720×1280-Render bei Basisauflösung 1280×720 und `canvas_items`/`expand`: Quiz-Antwortbutton effektiv ca. **29 Pixel** hoch (52 logische Einheiten × 720/1280), Text winzig; Inhalt konzentriert sich im oberen Drittel. | Für eine hochkant gespielte Quiz-Phase sind Touchziele und Typografie zu klein. Responsives, eigenständig getestetes Portrait-Layout und echte Device-Tests nötig. Eine Sensorsperre oder Rotation allein löst das nicht. |
| **P2 · Bauen** | `_build_dock()` (`main.gd:391–406`) prüft Energie, aber nicht Entfernung oder Blickrichtung; aus Spawnposition `z=5.8` wurde der weit entfernte Steg gebaut (`built=true`). | „Platzieren in 3D“ ist derzeit ein automatisches Freischalten an fester Stelle. Wenn echtes Platzieren zur Vision gehört: Baupunkt anvisieren, Reichweite und Platzierungsvorschau einführen. |
| **P2 · Quiz-Inhalte/Balance** | Alle drei Fragen in `quiz_panel.gd:7–11` haben `answer: 0`. `quiz_panel.gd:133–140` nennt `+28/+12` erneut fest, unabhängig von `main.gd:8–14`. | Belohnungen lassen sich durch immer erste Antwort trivialisieren; Anzeige kann bei Balancing-Änderung falsch werden. Antwortreihenfolge mischen und Werte aus derselben Quelle beziehen. |
| **P2 · Wasserbereich** | `player.gd:68–69`: Waten nur bei `-2.8<z<1.2`, `-5.5<x<5.5`; sichtbare Wasserfläche in `main.gd:90` reicht geometrisch über `-4.8<z<2.2`. | Teile des sichtbaren Wassers zählen nicht als Wasser; Wattiefe/Bewegung und Ripples widersprechen dem Bild. Eine gemeinsame Wassergeometrie-/Bereichsdefinition nutzen. |
| **P2 · Save-Validierung** | `_load_game()` (`main.gd:545–558`) castet geladene Werte direkt; `_ready()` iteriert `range(saved_development)` (`main.gd:68–71`), ohne Begrenzung. | Manipulierte/defekte Save-Dateien können negative Ressourcen oder sehr große Schleifen auslösen. Typen und Grenzen prüfen, Schema-Version und Recovery-Pfad ergänzen. |

## Korrekturen am ersten Prüfbericht

1. **`.import`-Dateien:** Die Korrektur, `pond_ambient.wav.import` einzuchecken und `*.import` nicht global zu ignorieren, entspricht der [Godot-Importdokumentation](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/import_process.html). Die frühere Behauptung, ein Android-Build **würde deshalb zwangsläufig fehlschlagen oder Audio verlieren**, war jedoch nicht nachgewiesen: Godot kann Import-Dateien aus Quellen mit Standardwerten neu erzeugen. Der eigentliche Grund ist die Erhaltung der reproduzierbaren Importparameter.
2. **`orientation="sensor"`:** Erlaubt Rotation, legt **kein separates Portrait-Quiz und keine sichere Notch-Zone** fest. Laut [Godot-Auflösungsleitfaden](https://docs.godotengine.org/en/stable/tutorials/rendering/multiple_resolutions.html) sind Basisausrichtung, Stretch und verankertes GUI gemeinsam zu planen. Das HUD nutzt bisher nur generische Viewport-Ränder, nicht [`DisplayServer.get_display_safe_area()`](https://docs.godotengine.org/en/stable/classes/class_displayserver.html#class-displayserver-method-get-display-safe-area).
3. **„Technisch stabil“ und „spielbar“:** Das waren zu starke Aussagen auf Basis von Parser- und 120-Frame-Smoke-Tests. Die gezielten Tests oben zeigen echte Gameplay-Defekte. Mobile Touch, Haptik, Safe Area und FPS wurden **nicht auf realer Hardware** geprüft.
4. **„Datengetrieben“:** Spezies, Bauwerk und Ökonomie sind zentralisierte Dictionaries **im Code**, kein unabhängig ladbarer Content-Katalog. Das ist ein sinnvoller Zwischenschritt, aber keine externe Content-Pipeline.
5. **Architekturpriorität:** `main.gd` (~570 Zeilen) aufzuteilen ist sinnvoll, aber **Quiz-Fortschritt, Habitat-Entscheidung, Bewegung und Touch-Reset** sind dringender als ein reiner Refactor.

## Was funktioniert und was der Test nicht beweist

- Godot-Editorstart: **Exit 0**, keine Parserfehler.
- Headless-Runtime über 120 Frames: **Exit 0**, aber beim Beenden weiterhin `1 resources still in use` / `2 ObjectDB instances were leaked`; als Shutdown-Warnung weiter untersuchen, nicht mit Feature-Erfolg verwechseln.
- Echte gerenderte Fenster via `xvfb-run`/Mesa: Landschaft 1280×720 und simuliertes Portrait 720×1280 zeichnen Welt und GUI. Die Landschaftsszene zeigt Teich, Tiere und Buttons, wirkt noch sehr hell/schematisch und **nicht biolumineszent**. Der Portrait-Screenshot zeigt winzige Quiz-Touchziele. Simuliertes Portrait ist **kein Gerätetest**.
- Der Steg kostet 60 Energie und die Quiz-Antwort vergibt gemäß aktuellem Code 28/12 oder 8; es gibt weiterhin keine end-to-end Tests für eine vollständige Session und kein Export-Preset im Projekt. Android-/iOS-Build, Notch-Verhalten, Haptik, Akku und reale FPS sind offen.
- Die Web-Beta-Engine `pwnd-engine.js` implementiert separate Quizkampf-/Belohnungsfunktionen; Godot ruft sie nicht auf. Eine **gemeinsame deterministische Regel-Engine** ist noch nicht vorhanden.

## Empfohlene Reihenfolge vor weiterer Content-Erweiterung

1. Quizfrage korrekt weiterschalten und Regressionstest für Start, Weiter, Schließen und Belohnung pro Antwort.
2. Habitatregel als **echte Voraussetzung oder bewusst bloßen Hinweis** festlegen; Code, HUD und Tests daran ausrichten.
3. Touch-Zustand bei Hide/Pause/Quiz zurücksetzen; mobile Ereignisse und Pause/Resume per Test abdecken.
4. Sichtbares Wasser, Weltkollisionen, Spielerhöhe und Tierbewegung konsistent machen.
5. Hochkant-Quiz mit realistischen Touchzielen/Safe Area und Landschaftsspiel getrennt testen; erst dann Android-Export-Preset und Geräte-Build.
6. Anschließend `main.gd` entflechten, Quizfragen/Balance auslagern und weitere Tiere/Strukturen ergänzen.

**Keine Features, Production-Deploys, E-Mails oder Änderungen an der Web-Beta wurden für diese Zweitprüfung vorgenommen.**
