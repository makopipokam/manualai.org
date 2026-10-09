# pwnd-Neuaufbau: Gesprächsarchiv und KI-Übergabe

**Stand:** 10. Oktober 2026
**Projekt:** pwnd – Pond Strategy
**GitHub-Repository:** `makopipokam/manualai.org` (öffentlich)
**Zweck:** Gesprächsentscheidungen, Produktanforderungen und den aktuellen technischen Übergabestand so festhalten, dass eine spätere KI ohne erneutes Rekonstruieren weiterarbeiten kann.

> Dieses Archiv fasst die für das Projekt relevanten, nutzerseitig sichtbaren Teile des geteilten Replay-Verlaufs und dieser Unterhaltung zusammen. Es enthält keine internen Tool-Protokolle, Zugangsdaten oder Geheimnisse. Teile der älteren Replay-Nachrichten waren im gespeicherten Auszug abgeschnitten; solche Stellen sind als sinngemäß bzw. unvollständig gekennzeichnet.

## 1. Gesprächsverlauf und Entscheidungen

### Früherer pwnd-Task (Replay vom 2. Oktober)

Der geteilte Replay-Link [pwnd – Manus](https://manus.im/share/e4G3ZsSbNA6RkxaAa6V2PD) endet in der Arbeit an **Matchmaking & Progression v1**. Das Replay hielt fest, dass die Basis und der Angriffspfad bereits getestet waren und noch ein kleiner deterministischer Bot-Pool ergänzt werden sollte. Als verbindliche Regeln nannte es:

- 6 Angriffe je UTC-Tag
- höchstens 2.500 Loot-Einheiten je UTC-Tag
- 4 Stunden Cooldown je Ziel
- Matchmaking nach Trophäen und Teichstufe
- tägliche, reproduzierbare Gegnerrotation
- Ligen, Tageszähler, Schutzfilter und Verteidigungsberichte
- deterministischer Bot-Pool, damit das Matchmaking auch bei wenigen echten Spielern funktioniert
- „Dörfer“ als spätere soziale Ebene; Dörfer sind der pwnd-Begriff für Clans

Im sichtbaren Replay-Verlauf standen außerdem unter anderem diese Nutzeräußerungen (Schreibweise wie im Replay):

- „was passiert hier?“
- „what's cooking?“
- „okay, du weißt schon, dass es langfristig so ein Strategie Aufbauspisl wie z.B CoC werden soll oder?“
- „wie willst du weiterarbeiten?“
- „hört sich gut an, mach das“
- „Clans werden \"dörfer\"“
- „worauf wartest du?“

Das Replay enthält zwei längere Startaufträge zum Fortsetzen des bestehenden Manus-Webdev-Projekts und Übertragen des vorhandenen Prototyps; die gespeicherte Textansicht schneidet deren Ende ab. Der konkrete genehmigte Arbeitsplan ist deshalb zusätzlich unten dokumentiert.

### Fortsetzung und Neuaufbau

Am 2. Oktober wurde versucht, das ursprüngliche Manus-Webdev-Projekt fortzusetzen; es war in diesem Kontext nicht zugänglich. Der vorhandene Prototyp im GitHub-Repository wurde als Ausgangsbasis untersucht. Die Auswahl des Nutzers lautete:

> „3 – Neu aufbauen ab dem GitHub-Prototyp“

Ein erster mehrdeutiger Eintrag lautete „pipipi/“. Daraus wurde **keine** dauerhafte Produktanforderung abgeleitet. Anschließend bestätigte der Nutzer den ausgearbeiteten Plan ausdrücklich:

> „Plan passt – bitte loslegen“

Der Plan beschrieb einen serverautoritativen Neuaufbau: portierte Quiz-Engine und Teichökonomie, Login, persistenter Spielstand, vollständiger Angriffspfad und Matchmaking & Progression v1. Die Clan-ähnliche Sozialebene sollte später kommen und in pwnd „Dörfer“ heißen.

### Parallele Session und maßgeblicher Arbeitsstand

Während der Fortsetzung wurde festgestellt, dass eine weitere Session dasselbe Projekt und dieselbe verwaltete Datenbank bearbeitete. Um konkurrierende Änderungen zu vermeiden, wurde nach Nutzerentscheidung hier gestoppt:

> „Die andere Session macht weiter – stopp hier“

Daher gilt für spätere Arbeit: **Nicht** den isolierten Branch `wip/rebuild-sandbox-b` als neuesten oder maßgeblichen Spielstand behandeln. Für den späteren GitHub-Transfer wurde der projektweite, akzeptierte Manus-Webdev-Stand verwendet, nicht dieser abgebrochene Sandbox-Branch.

### Synchronisierung und GitHub-Transfer

Am 8. Oktober bat der Nutzer:

> „synchronisiere mit der neuen aktuellen GitHub repo“

Nach Prüfung der auseinanderentwickelten Repositories wählte der Nutzer am 9. Oktober:

> „3 – Manus-Webdev-pwnd zu GitHub übertragen“

Der Manus-Webdev-Quellstand wurde als eigenständiger Snapshot unter `apps/pwnd/webdev/` im aktuellen GitHub-Repository abgelegt. Die bereits vorhandene GitHub-App `apps/pwnd/index.html` blieb unangetastet. Der Transfer ist im offenen [Pull Request #62](https://github.com/makopipokam/manualai.org/pull/62) auf Branch `feat/pwnd-webdev-snapshot-20261009`.

Zum Transfer gehörte folgende Abgrenzung: Der Snapshot ist **nicht** in die Root-API, die Live-Routen oder das Deployment der Hauptseite integriert. Er ist ein eigenständiges Express-/Datenbankprojekt und muss separat betrieben bzw. später bewusst integriert werden.

Am 10. Oktober bat der Nutzer darum, den Gesprächsinhalt für künftige KI wiederverwendbar im GitHub-Repository abzulegen:

> „lade den gesamten Inhalt dieser Konversation in einen relevanten Ordner auf GitHub hoch, sodass sie von einer zukünftigen KI wieder benutzt werden kann.“

## 2. Genehmigter Produktumfang

### Kernspiel

- Mobile-first Aufbau- und Strategiespiel um einen lebendigen Teich; langfristige Referenz ist ein Strategie-Aufbauspiel wie Clash of Clans.
- Der Teich ist der Hub. Quizzen liefert Ressourcen; Gebäude produzieren Ressourcen; Truppen und Verteidigung ermöglichen Angriffe.
- Die Regeln sind serverautoritativ. Der Client zeigt an und sendet Aktionen, ist aber nicht die Autorität für Belohnungen, Antwortschlüssel, Angriffe oder Tageslimits.
- Quizmodi: freies Quiz mit der Schatten-Eule und Duelle gegen drei Füchse.
- Serverpersistenz und Manus-Login; deterministische Kampfberechnung und überprüfbare Replays.
- Der ursprüngliche Plan enthielt vier Ressourcen. Der spätere akzeptierte Manus-Checkpoint und dessen README führen **Honig als fünfte Ressource** ein. Bei weiteren Änderungen ist der aktuelle Code-/Checkpoint-Stand maßgeblich; diese Abweichung vom frühen Plan nicht stillschweigend zurückdrehen.

### Matchmaking & Progression v1

- 6 Angriffe pro UTC-Tag
- Loot-Obergrenze: 2.500 Einheiten pro UTC-Tag
- 4-Stunden-Cooldown pro Angreifer-Ziel-Paar
- Gegnerauswahl über Trophäen und Teichstufe, mit Schutzfiltern und täglicher deterministischer Rotation
- Trophäen, Ligen und Ligatabelle
- Tageszähler und Verteidigungsberichte einschließlich gelesener/ungelesener Zustände
- Kleiner deterministischer Bot-Pool zur Sicherstellung spielbarer Gegnerrotation
- Dörfer sind eine spätere Phase, nicht Teil von v1

## 3. Technische Übergabe

### Maßgeblicher Manus-Webdev-Snapshot

- Manus-Projekt: `pwnd – Pond Strategy`
- Zu GitHub übertragener akzeptierter Quell-Checkpoint: `d7008117d04a10e712c1078549cc8751ff77842f` (3. Oktober 2026)
- GitHub-Transfer-Commit: `3bf37fbd9c66fcca1cf2a16621e24fa6c3bb6f85`
- GitHub-Pfad: `apps/pwnd/webdev/`
- Transfer-Branch: `feat/pwnd-webdev-snapshot-20261009`
- Pull Request: [#62](https://github.com/makopipokam/manualai.org/pull/62), beim Archivieren **offen und nicht gemergt**

Der Snapshot enthält 60 Dateien des Webdev-Checkpoints plus `TRANSFER-NOTES.md` mit Ausführungs- und Integrationshinweisen. Der Dateiabgleich gegen den Checkpoint war vollständig. Es wurden keine `.env`-Dateien oder eingebetteten Zugangsdaten übernommen.

### Wichtige Module im Snapshot

- `shared/`: deterministische Quiz-, Wirtschafts-, Kampf-, Progressions- und Bot-Regeln
- `server/`: Express-Server, Manus-Auth, Datenbankzugriff, Migrationen, Quiz-/Teich-/Kampf-/Berichtsdienste und API-Routen
- `public/`: Vanilla-JS-Frontend, Stile, Assets und Routenmanifest
- `content/questions.json`: serverseitiger Fragenpool
- `test/unit/`: Engine- und Regeltests
- `test/api/`: Integrationstests für die verwaltete Datenbank
- `docs/`: Plan, Produktideen, Katalog, Machbarkeitsprüfung und Integrationsvertrag

### Verifikation beim Transfer

- Auf dem exportierten Quell-Checkpoint lief `pnpm test`: **20 Tests bestanden, 0 fehlgeschlagen**.
- Der Abgleich der exportierten Dateien gegen den Snapshot war vollständig: 60/60 Dateien identisch; nur die ergänzende Übergabenotiz wurde zusätzlich erstellt.
- Eine Suche nach typischen hartcodierten Zugangsdaten fand im Snapshot keine Treffer.
- API-Integrationstests gegen die Datenbank wurden im Transferdurchlauf nicht erneut ausgeführt.

### Repository-Regeln für künftige Änderungen

- Git-Commit-Identität im Repository `makopipokam/manualai.org` vor dem ersten Commit einer Aufgabe setzen: `git config --global user.name makopipokam` und `git config --global user.email info@manualai.org`.
- Vor jedem Push den letzten Commit-Autor mit `git log -1 --format='%ae'` prüfen.
- Änderungen am GitHub-Repository als normale Branch-/PR-Arbeit behandeln; Manus-Webdev bleibt eigenständige Quelle, solange keine ausdrückliche Verbindung/Umstellung vorgenommen wurde.
- Keine Geheimnisse, Schlüssel oder `.env`-Dateien in GitHub einchecken.

## 4. Aktueller Zustand und nächste Schritte

1. [Pull Request #62](https://github.com/makopipokam/manualai.org/pull/62) prüfen und nach gewünschtem Review mergen. Bis dahin ist der Snapshot im Feature-Branch, nicht auf `main`.
2. Wenn die neue Version live unter `/apps/pwnd/` laufen soll, zuerst eine bewusste Integrationsentscheidung treffen: Die bestehende GitHub-PWND-Seite und Root-API sind eine andere Architektur. Das bloße Vorhandensein von `apps/pwnd/webdev/` schaltet sie nicht live.
3. Für eigenständigen Betrieb die Anweisungen in `apps/pwnd/webdev/TRANSFER-NOTES.md` und `apps/pwnd/webdev/README.md` beachten. Laufzeitkonfiguration und Datenbankverbindung müssen separat bereitgestellt werden; keine Zugangsdaten aus einer anderen Session übernehmen.
4. Vor weiteren Feature-Arbeiten den tatsächlich aktuellen GitHub-Branch und PR-Status erneut abrufen. Der Status in diesem Dokument beschreibt den 10. Oktober 2026.

## 5. Nutzeräußerungen dieser Fortsetzung (wörtlich)

1. `https://manus.im/share/e4G3ZsSbNA6RkxaAa6V2PD`
2. `3 – Neu aufbauen ab dem GitHub-Prototyp`
3. `pipipi/`
4. `Plan passt – bitte loslegen`
5. `Die andere Session macht weiter – stopp hier`
6. `synchronisiere mit der neuen aktuellen GitHub repo`
7. `3 – Manus-Webdev-pwnd zu GitHub übertragen`
8. `lade den gesamten Inhalt dieser Konversation in einen relevanten Ordner auf GitHub hoch, sodass sie von einer zukünftigen KI wieder benutzt werden kann.`
