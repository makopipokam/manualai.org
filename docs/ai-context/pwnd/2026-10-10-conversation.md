# pwnd – Gesprächs- und Projektkontext für zukünftige KIs

**Archivdatum:** 2026-10-10  
**Projekt:** `pwnd`  
**GitHub-Repository:** [`makopipokam/manualai.org`](https://github.com/makopipokam/manualai.org)  
**Archivpfad:** `docs/ai-context/pwnd/2026-10-10-conversation.md`

> Dieses Dokument ist ein bereinigter, öffentlich teilbarer Wiederaufnahme-Kontext. Interne System- und Developer-Anweisungen, Zugangsdaten, Tokens, private Sandbox-Pfade und andere geheime Laufzeitinformationen wurden bewusst nicht aufgenommen.

## Zweck dieses Archivs

Eine zukünftige KI soll aus diesem Dokument nachvollziehen können, was im pwnd-Projekt entschieden, implementiert, geprüft und zuletzt synchronisiert wurde. Das Dokument ersetzt nicht den Quellcode; der aktuelle Code liegt im Repository, insbesondere im Verzeichnis `apps/pwnd/`.

## Nutzeranforderungen und Entscheidungen

Chronologisch zusammengefasst:

1. Der vorhandene pwnd-Prototyp sollte in das bestehende Manus-Webdev-Projekt „pwnd – Pond Strategy“ übertragen werden – einschließlich Engine, Economy, Frontend, Server, Tests und Demo-Daten.
2. Danach sollten Preview und sämtliche Tests geprüft werden.
3. Das langfristige Produktziel wurde klargestellt: ein Strategie-Aufbauspiel im Stil größerer Dorf-/Clan-Aufbauspiele, nicht nur ein kleiner Prototyp.
4. Für die Produktstruktur wurde entschieden, dass Clans künftig als „Dörfer“ gedacht werden.
5. Es wurden nacheinander persistenter Core Loop, serverautoritäre Produktion/Upgrades/Training, Attack Loop, Matchmaking, Liga-/Trophäenprogression, Tageslimits, Gegnerrotation und Verteidigungsberichte geplant bzw. umgesetzt.
6. Anschließend sollte mit einer neuen aktuellen GitHub-Quelle synchronisiert werden.
7. Nach Prüfung wurde festgestellt:
   - `makopipokam/ritter-kunibert` enthält keinen pwnd-Code.
   - `makopipokam/manualai.org` enthält pwnd unter `apps/pwnd/`, allerdings als älteren Quizbattle-/Teichgarten-Stand.
8. Die Nutzerentscheidung lautete ausdrücklich: **`manualai.org/apps/pwnd` vollständig übernehmen und den aktuellen Pond-Strategy-Stand ersetzen.**
9. Am 2026-10-10 wurde zusätzlich freigegeben, den bereinigten Gesprächs- und Projektkontext öffentlich in diesem Repository zu veröffentlichen.

## Sichtbare Gesprächsentscheidungen

Die kurzen Zwischenbestätigungen des Nutzers wurden als Fortschrittsfreigaben behandelt, darunter sinngemäß: „mach das“, „top“, „stark“, „ayo“, „worauf wartest du?“, „perfekt“ und „wat nu?“. Sie bedeuten: eigenständig weiterarbeiten, testen und den nächsten sinnvollen Produkt-/Integrationsschritt ausführen, ohne für jeden Routine-Schritt erneut zu fragen.

## Technischer Verlauf

### 1. Erste pwnd-Übernahme in Manus Webdev

Der ursprüngliche pwnd-Prototyp wurde in ein bestehendes Manus-Webdev-Projekt übertragen. Der Stand enthielt zunächst:

- deterministische Engine
- Economy mit Produktion und Gebäude-Upgrades
- Frontend mit Teich-/Basisansicht
- Node-Server mit Manus-OAuth-Gates
- Tests für Engine, Economy und Server
- Demo-Daten
- Route-Manifest und Preview auf Port 3000

Die statische Preview wurde unter `/pwnd-viz/` bedient. Geschützte Serverquellen und Demo-Daten sollten nicht öffentlich ausgeliefert werden.

### 2. Persistenter serverautoritärer Core Loop

Danach wurde ein persistenter Core Loop ergänzt. Die wesentlichen Entscheidungen:

- Managed-MySQL als persistenter Produktionsmodus
- JSON-Store als isolierter Test-/Fallback-Modus
- Migration für Core-Loop-Tabellen
- serverautoritatives Materialisieren von Produktion aus Serverzeit
- serverseitige Validierung von Ressourcen, Revisionen und Upgrades
- persistente Jobs für Training und Gebäude-Upgrades
- Reload-Resilienz für laufende Jobs

Der Server wurde so erweitert, dass Client-Payloads keine Ressourcen beliebig manipulieren können.

### 3. Attack Loop v1

Der Attack Loop wurde serverseitig ergänzt mit:

- deterministischen Angriffs-Snapshots
- serverseitiger Battle-Simulation
- Beute- und Trophäenverbuchung
- persistierten Replay-Berichten
- Schutzzeit nach Angriffen
- Besitzprüfung für Angriffslisten und Reports
- öffentlicher Replay-Ansicht ohne Offenlegung privater Serverdaten
- additiver Datenbankmigration
- UI für Gegnerauswahl, Angriff und Auswertung

### 4. Matchmaking und Progression v1

Die nächste Erweiterung brachte:

- deterministische Liga-Grenzen
- Trophäenfortschritt
- Tageslimits für Beute
- Gegnerrotation anhand von Trophäen, Teichstufe und Tagesseed
- Cooldowns und Schutzschild-Priorität
- Angriffs- und Verteidigungsberichte mit Richtung und Identitäten
- Ligawechsel und Progressions-Snapshots
- deterministischen Bot-Gegnerpool als sofort spielbare Rotation
- UI für Liga, Trophäen, Gegner und Verteidigungsberichte

Diese Erweiterungen wurden lokal getestet und in der Managed-MySQL-Integration geprüft.

## GitHub-Abgleich und endgültige Nutzerentscheidung

Vor dem Abgleich wurden zwei Repositories geprüft. `ritter-kunibert` war ein separates Audio-/Hardware-Projekt ohne pwnd-Dateien. `manualai.org` enthielt dagegen:

- `apps/pwnd/index.html`
- `apps/pwnd/pwnd-ai-questions.json`
- `api/pwnd-question.js`

Die Nutzerentscheidung war, den alten Pond-Strategy-Frontendstand vollständig durch `manualai.org/apps/pwnd` zu ersetzen.

## Aktueller synchronisierter Stand

Die Übernahme wurde so umgesetzt:

- `apps/pwnd/index.html` ist die maßgebliche pwnd-Oberfläche.
- `apps/pwnd/pwnd-ai-questions.json` wurde mit übernommen.
- Die Oberfläche enthält ein animiertes Teich-Canvas mit Fischen, Seerosen und Wellen.
- Die Quizbattle-Oberfläche enthält den Rotfuchs-Gegner, Natur-/Erde-Fragen und Antwortoptionen.
- Sound kann ein-/ausgeschaltet werden.
- Die Sprache kann zwischen Deutsch und Englisch gewechselt werden.
- Alte, nicht mehr verwendete pwnd-Frontenddateien wurden aus dem synchronisierten Frontend entfernt.
- Das Webdev-Server-Wrapper-Verhalten und die Preview-Konvention bleiben erhalten.
- Das Route-Manifest beschreibt `/` und `/pwnd-viz/` mit dem Titel „pwnd · Quizbattle trifft Teichgarten“.
- Das Favicon wird korrekt über die Preview ausgeliefert.

## Verifikation

Die folgenden Prüfungen waren erfolgreich:

- vollständige `npm test`-Suite
- Syntaxprüfungen der verbliebenen JavaScript-Dateien
- `git diff --check`
- Byte-/SHA-Abgleich von `apps/pwnd/index.html` mit der übernommenen GitHub-Quelle
- Byte-/SHA-Abgleich von `apps/pwnd/pwnd-ai-questions.json` mit der übernommenen GitHub-Quelle
- Health-Endpunkt: HTTP 200
- Route-Manifest: HTTP 200 und gültiges JSON
- pwnd-Preview: HTTP 200
- Favicon: HTTP 200
- Fragenbank: HTTP 200
- nicht mehr vorhandene alte Frontenddateien: erwartungsgemäß 404
- Browser-Preview visuell geprüft
- Browser-Konsole: keine JavaScript-Fehler

Die Preview zeigte:

- „Dein Teichgarten“
- Energie- und Serienanzeige
- animiertes Wasser mit Fischen und Seerosen
- „Ökosystem Stufe 1: Keimender Quell“
- Rotfuchs-KI-Gegner
- Quizfrage zum strukturellen Fundament eines Korallenriffs
- Antwortoptionen und Sound-/Sprachsteuerung

## Git-Stand

Der synchronisierte Stand wurde als Commit veröffentlicht:

- **Commit:** `a93705d31051cb11723605e0b1d3058a6e3701f5`
- **Commit-Titel:** `Sync pwnd from manualai.org`
- Lokaler und Remote-Stand waren nach dem Push identisch.

## Wiederaufnahmehinweise

Eine zukünftige KI sollte:

1. zuerst `apps/pwnd/index.html` und `apps/pwnd/pwnd-ai-questions.json` lesen;
2. den aktuellen `main`-Branch prüfen, bevor Dateien geändert werden;
3. die vorhandene Route `/pwnd-viz/` und das Route-Manifest beibehalten, sofern keine neue Nutzerentscheidung vorliegt;
4. den Quizbattle-/Teichgarten-Stand als aktuelle Produktbasis behandeln – nicht ungefragt den früheren Pond-Strategy-Frontendstand wiederherstellen;
5. bei einer Weiterentwicklung das langfristige Ziel eines Strategie-Aufbauspiels mit Dörfern berücksichtigen;
6. vor Veröffentlichung Tests und Browser-Konsole prüfen;
7. keine privaten Laufzeitwerte, Credentials, internen Projekt-IDs oder Sandbox-Pfade in öffentliche Dokumente aufnehmen.

## Offene Produkt-Richtung

Der aktuelle synchronisierte Stand ist wieder ein kompakter Quizbattle-/Teichgarten-Prototyp. Das langfristige Ziel bleibt ein größeres Strategie-Aufbauspiel. Sinnvolle nächste Produktphasen wären daher – nur nach erneuter Nutzerfreigabe – eine schrittweise Verbindung von Quiz-/Ökosystem-Mechanik mit:

- Dorf-/Clan-Basisaufbau
- Ressourcenproduktion
- Gebäude- und Forschungsbäumen
- Verteidigungsanlagen
- PvE-/PvP-Angriffen
- Liga- und Saisonfortschritt
- persistenter Spieleridentität
- serverautoritativen Aktionen

Dabei sollte die zukünftige KI zuerst klären, ob der Quizbattle-Stand als neue Produktbasis oder als separater Modus des größeren Strategiespiels dienen soll.
