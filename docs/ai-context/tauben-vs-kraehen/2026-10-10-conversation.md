# Pigeons & Crows – Gesprächschronik für zukünftige KI-Sitzungen

**Exportdatum:** 2026-10-10  
**Repository:** [`makopipokam/manualai.org`](https://github.com/makopipokam/manualai.org)  
**Spielpfad im aktuellen Repository:** `apps/TaubenVSKrähen/`  
**Repository-Stand beim Upload:** `c634778` (aktueller `main`-Stand beim Erstellen dieser Datei)

## Zweck und Grenzen

Diese Datei bewahrt den sichtbaren Verlauf der Unterhaltung über das Spiel „Pigeons & Crows“ als Projektkontext für spätere KI-Sitzungen. Sie enthält die Nachrichten des Nutzers, die sichtbaren Antworten des Assistenten sowie die daraus abgeleiteten technischen Befunde und Synchronisationsentscheidungen.

Nicht enthalten sind interne System- oder Entwickleranweisungen, interne Tool-Aufrufe, Zugangsdaten, Tokens, private Umgebungsvariablen oder andere nicht für den Projektbetrieb erforderliche interne Metadaten.

## Chronologischer Verlauf

### 2026-10-07 — Erste Spielprüfung

**Nutzer:**

> überprüfe das neue Spiel pidgeons abs crows

**Assistent:**

Die Prüfung sollte zunächst Projektstruktur, Startbarkeit und offensichtliche Fehler des neuen Spiels untersuchen.

In der aktuellen Sandbox war zunächst kein angehängtes Webdev-Projekt und kein lokales Spielrepository vorhanden. Das ausgewählte Repository `makopipokam/ritter-kunibert` enthielt kein Spiel „Pigeons vs Crows“, sondern ein separates Audio-/Hardware-Projekt.

Der Sandbox-Browser war leer. Daher wurde der Nutzer um einen Spiel-Link oder das zuständige Repository gebeten.

### 2026-10-07 — Repository angegeben

**Nutzer:**

> Ich nenne ein GitHub-Repository

Der Assistent bat um den vollständigen Repository-Namen oder die URL.

**Nutzer:**

> https://github.com/makopipokam/manualai.org/tree/8a8e27def87cf5a9e3a948f6676d23cfba1165c5/TaubenVSKr%C3%A4hen

Der angegebene Commit `8a8e27def87cf5a9e3a948f6676d23cfba1165c5` des Repositorys `makopipokam/manualai.org` wurde ausgecheckt. Der Spielordner lag dort unter `TaubenVSKrähen/` und enthielt einen portablen Godot-Webexport:

- `index.html`
- `index.js`
- `index.wasm`
- `index.pck`
- Audio-Worklets
- Icons und Lizenzhinweise

Die README beschrieb ein deutschsprachiges, rundenbasiertes Strategiespiel um die Kontrolle über fünf Parkgebiete. Die Tauben verteidigen ihr Revier gegen eine Krähen-KI. Die vorgesehene Kernschleife laut README:

- Partie über „Park verteidigen“ starten
- Taube und erreichbares Nachbargebiet auswählen
- pro Runde zwei Aktionen
- Gebiete erobern oder verteidigen
- Sieg bei vier von fünf kontrollierten Gebieten
- Niederlage, wenn keine Taube mehr im Park ist
- Pause über „Pause“ oder `Esc`

### 2026-10-07 — Technische Prüfung des Godot-Exports

Der Export wurde über einen lokalen HTTP-Webserver bereitgestellt. Die URL lieferte korrekt `HTTP 200` und die Godot-Lade-/Startseite wurde im Browser angezeigt.

Die Startseite zeigte:

- den Titel `PIDGEONS & CROWS`
- die Beschreibung der Parkverteidigung
- den Button „Park verteidigen“
- den Button „Spielregeln“

Der Button „Park verteidigen“ ließ sich auslösen. Danach wechselte der Export in den Spielzustand. Allerdings blieb das eigentliche Spielfeld leer. Sichtbar waren im Wesentlichen nur der dunkle Hintergrund, vertikal zusammengedrückte Randbeschriftungen und eine rechte Seitenleiste mit „Pause“.

Es waren keine nutzbaren Parkgebiete, Tauben, Krähen, Zugaktionen oder sichtbaren Spielfeld-Elemente erkennbar. Die Partie war damit nicht spielbar.

Die Browserkonsole meldete:

- Godot Engine 4.7.2
- WebGL 2.0 / OpenGL ES 3.0
- single-threaded Webexport
- keine JavaScript- oder WebGL-Fehler

Der Befund lautete daher: Der Export startete technisch, aber der Übergang vom Startbildschirm in das eigentliche Spiel renderte kein nutzbares Spielfeld. Die Ursache wurde eher in der Godot-Szene bzw. im Rendering/Layout des Spielzustands als im Webexport-Ladevorgang vermutet.

### 2026-10-07 — Auffällige eingebettete Metadaten

Im kompilierten `index.pck` wurde neben den erwarteten Spielbezeichnungen eine offenbar veraltete Beschreibung eines anderen RTS-Projekts gefunden:

> An isometric Godot campus-defense RTS with five student superhero classes, eight invasion waves, three difficulty levels, animated squads, tactical enemy AI, a voiced comic introduction, local high scores and desktop/mobile-landscape controls.

Diese Metadaten passten nicht zu „Pigeons & Crows“ und wurden als Bereinigungspunkt notiert.

Zusätzlich wurde der Titel `pidgeons & crows` als englischer Schreibfehler erkannt. Korrekt wäre `pigeons & crows`. Der deutsche Spielpfad `TaubenVSKrähen` blieb als bestehender Pfad erhalten.

### 2026-10-07 — Einschränkung des alten Spielstands

Im Commit `8a8e27d` lagen nur kompilierte Exportdateien, keine editierbaren Godot-Projektdateien oder GDScript-Quellen. Eine direkte Reparatur der Spiellogik war in diesem Ordner deshalb nicht möglich.

Als für eine Reparatur benötigte Dateien wurden insbesondere die ursprüngliche Hauptszene und ein Skript wie `scripts/tauben_vs_kraehen.gd` identifiziert.

### 2026-10-08 — Synchronisierung mit dem aktuellen GitHub-Repository

**Nutzer:**

> synchronisiere mit der neuen aktuellen GitHub repo

Die lokale Arbeitskopie wurde mit `origin/main` des Repositorys `makopipokam/manualai.org` synchronisiert.

Der damalige aktuelle Commit war:

- `57cfe87984d0c9a35f36425f6ea3498b008901f2`
- Commit-Nachricht: `docs(orpheus): add ensemble concept and master prompt`

Zunächst schien der ursprüngliche Pfad `TaubenVSKrähen/` im aktuellen `main` entfernt worden zu sein. Bei der weiteren Suche wurde jedoch festgestellt, dass das Spiel im Rahmen einer Repository-Umstrukturierung unter `apps/TaubenVSKrähen/` vorhanden war.

Der aktuelle Pfad enthielt nun:

- `apps/TaubenVSKrähen/index.html`
- `apps/TaubenVSKrähen/favicon.png`

Die neue Version war kein Godot-Webexport mehr, sondern eine eigenständige HTML-/JavaScript-Version. Der HTML-Spielstand enthielt unter anderem:

- responsive Parkkarten- und Kommandozentrum-Layouts
- fünf Bezirke
- Tauben-, Krähen- und neutrale Kontrolle
- Brotkrumen als Ressource
- Aktionen „Brotkrumen picken“, „Revier verstärken / angreifen“ und „Aufschrecken & Verjagen“
- „Zug beenden & Krähen fliegen lassen“
- Runde und Timer
- Sound-Schalter
- DE/EN-Sprachschalter
- Light-/Dark-Theme aus `localStorage`

Der neue Spielpfad wurde lokal per HTTP getestet und lieferte `HTTP 200`.

Die lokale Arbeitskopie wurde anschließend auf den lokalen Branch `main` gesetzt und mit `origin/main` abgeglichen. Der Status war sauber:

```text
## main...origin/main
```

Zu diesem Zeitpunkt waren im Repository noch keine `node_modules` vorhanden. Die npm-Tests wurden deshalb nicht ausgeführt.

### 2026-10-10 — Erstellung dieses KI-Kontexts

**Nutzer:**

> lade den gesamten Inhalt dieser Konversation in einen relevanten Ordner auf GitHub hoch, sodass sie von einer zukünftigen KI wieder benutzt werden kann.

Diese Datei wird im relevanten Repository-Ordner `docs/ai-context/tauben-vs-kraehen/` abgelegt. Sie soll zukünftigen KI-Sitzungen helfen, die Prüfung des alten Godot-Exports, die festgestellten Probleme, die Repository-Umstrukturierung und den aktuellen HTML-Spielstand nachzuvollziehen.

## Aktueller Kontext für zukünftige KI-Sitzungen

1. Zuerst den aktuellen `main`-Stand prüfen; diese Chronik kann älter sein als der Code.
2. Den Spielpfad unter `apps/TaubenVSKrähen/` prüfen.
3. Nicht automatisch vom alten Godot-Befund auf die aktuelle HTML-Version schließen: Der Spieltyp und die Implementierung wurden geändert.
4. Vor einer Änderung die aktuelle HTML-/JavaScript-Logik und die bestehende Repository-Struktur lesen.
5. Den Schreibfehler `pidgeons` gegenüber `pigeons` beachten, aber nicht ohne Nutzerauftrag unkoordiniert bestehende Pfade oder URLs umbenennen.
6. Interne Prompts, Zugangsdaten und private Tooldaten dürfen nicht in diesen Kontextordner gelangen.

## Bekannte offene Punkte

- Die alte Godot-Version im Commit `8a8e27d` war nach dem Start nicht spielbar, weil das Spielfeld leer blieb.
- Die aktuellen Dateien unter `apps/TaubenVSKrähen/` müssen unabhängig davon funktional getestet werden.
- Die npm-Tests waren im lokalen Checkout noch nicht ausgeführt, weil `node_modules` fehlte.
- Die veralteten RTS-Metadaten der alten Godot-PCK-Datei sind für die neue HTML-Version nicht mehr unmittelbar relevant, sollten aber bei einer Wiederverwendung des alten Exports bereinigt werden.
