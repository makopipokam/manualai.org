# pwnd Godot-Prototyp — Vollständige Prüfung

Stand: Branch `feat/pwnd-godot-vertical-slice`, 18 Commits, 1100 Zeilen GDScript.

## 1. Zusammenfassung

Der Prototyp ist technisch stabil und erfüllt das Ziel eines spielbaren First-Person-Vertical-Slice. Editor-Parsing und Headless-Runtime laufen fehlerfrei. Die Architektur ist für einen Prototypen angemessen, hat aber drei strukturelle Schwächen, die vor dem ersten echten Mobile-Build behoben werden sollten.

Bewertung: **tragfähig, aber noch nicht build-reif für Mobile.**

## 2. Gefundene Defekte

### 2.1 Behoben in diesem Durchlauf

| Defekt | Schweregrad | Auswirkung | Fix |
|---|---|---|---|
| `*.import` war repository-weit ignoriert | hoch | Godot benötigt Import-Metadaten für Export-Builds. Ein Android-/iOS-Export hätte fehlgeschlagen oder das Audio verloren. Die Regel galt zudem für das gesamte Repository, nicht nur für Godot. | Regel entfernt, `pond_ambient.wav.import` eingecheckt |
| Keine Handheld-Orientierung konfiguriert | mittel | Trotz Mobile-First-Anspruch fehlte jede Orientierungs- und Aspect-Einstellung. Verhalten auf echten Geräten wäre undefiniert gewesen. | `window/handheld/orientation="sensor"` und `window/stretch/aspect="expand"` ergänzt |
| Entensteg-Kosten doppelt hinterlegt | niedrig | Der Interaktionshinweis enthielt die Zahl 60 fest im Text, obwohl die Strukturdefinition die Kosten bereits zentral hält. Eine Balancing-Änderung hätte widersprüchliche Angaben erzeugt. | Hinweis liest jetzt aus `STRUCTURE_DEFINITIONS` |

### 2.2 Offen, bewusst nicht in diesem Durchlauf behoben

| Befund | Schweregrad | Empfehlung |
|---|---|---|
| `main.gd` umfasst 570 Zeilen und verantwortet Welt, HUD, Ökonomie, Audio, Pause, Ripples und Persistenz | mittel | Vor weiteren Features in mindestens `world`, `hud` und `game_state` aufteilen. Jetzt noch günstig, später teuer. |
| Interaktionsradius `3.2` an zwei Stellen fest kodiert | niedrig | In die Ökonomie- oder Konfigurationstabelle aufnehmen |
| Kein Export-Preset für Android/iOS vorhanden | hoch für den nächsten Schritt | `export_presets.cfg` anlegen; benötigt Android-SDK beziehungsweise Xcode-Umgebung |
| Quizfragen fest im UI-Skript hinterlegt | mittel | Fragen in eine Datendatei auslösen, damit der Katalog wachsen kann |
| Keine automatisierten Logiktests | mittel | Ökonomie- und Reaktionsregeln als reine Funktionen testbar machen |

## 3. Architekturbewertung

**Gut gelöst**

- Datengetriebene Spezies- und Strukturdefinitionen sind sauber getrennt
- Ökonomie liegt zentral in `ECONOMY_RULES`
- Der Wasser-Zustand des Spielers wird über eine einzige Methode geteilt, statt mehrfach berechnet
- Mobile-Steuerung ist vom Spielerskript entkoppelt
- Persistenz ist schlank und deterministisch

**Risikobereiche**

- Die Szene wird vollständig prozedural im Code erzeugt. Das ist für einen Prototypen effizient, verhindert aber visuelles Arbeiten im Editor und wird mit wachsendem Inhalt unhandlich.
- Es gibt keine Trennung zwischen Spielzustand und Darstellung. Ein späterer Server- oder Cloud-Sync wäre derzeit aufwendig.
- Die Web-Beta (`pwnd-engine.js`) und der Godot-Prototyp definieren Regeln getrennt. Die geplante gemeinsame Regel-Engine ist damit noch nicht erreicht.

## 4. Mobile-Reifegrad

| Bereich | Status |
|---|---|
| Touch-Steuerung | implementiert |
| Responsives HUD | implementiert |
| Pause und Audio-Schalter | implementiert |
| Diagnose-Overlay | implementiert |
| Orientierung konfiguriert | jetzt ergänzt |
| Export-Preset | fehlt |
| Test auf echtem Gerät | ausstehend |
| Safe-Area mit Notch geprüft | ausstehend |
| Performance auf echter Hardware | ausstehend |

Der Prototyp ist **mobile-vorbereitet, aber nicht mobile-verifiziert**. Alle bisherigen Aussagen zur Handytauglichkeit beruhen auf Headless-Tests in der Sandbox.

## 5. Empfohlene nächste Schritte

1. `main.gd` in drei Skripte aufteilen, solange es günstig ist
2. Quizfragen in eine separate Datendatei auslagern
3. Export-Preset für Android anlegen
4. Erster echter Geräte-Build und Playtest
5. Danach erst weitere Inhalte ergänzen

## 6. Testgrenze

Geprüft wurde:

- Godot-Editor-Parsing
- Headless-Runtime-Smoke-Test
- Git-Hygiene und Diff-Prüfung
- statische Code-Durchsicht

Nicht geprüft wurde:

- tatsächliches Spielgefühl
- Verhalten auf echten Smartphones
- Performance unter Last
- Grafikqualität
