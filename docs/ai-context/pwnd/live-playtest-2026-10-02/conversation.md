# pwnd – Gesprächsarchiv: Live-Spieltest und GitHub-Synchronisierung

**Archiviert am:** 2026-10-12
**Gesprächszeitraum:** 2026-10-02 bis 2026-10-12
**Repository:** [`makopipokam/manualai.org`](https://github.com/makopipokam/manualai.org)
**Archivzweck:** Wiederverwendbarer Kontext für spätere KI-Sitzungen.

> **Historischer Stand:** Der große Live-Spieltest wurde am 2026-10-02 gegen Commit `6188851` ausgeführt. Zu diesem Zeitpunkt lag die getestete Anwendung noch unter `/pwnd/`. Seitdem wurde das Repository stark umgebaut. Beim Archivexport war `main` auf `8e31a74` (`feat(pwnd): integrate rebuild and AI context`), einschließlich einer neuen `apps/pwnd/rebuild/`-Implementierung. Die alten Testergebnisse sind historische Befunde, keine Aussage über den heutigen Code. Vor einer Änderung immer den aktuellen Code und Teststand prüfen.

## Datenschutz und Umfang

Dieses Archiv bewahrt den für die Projektarbeit relevanten, sichtbaren Gesprächsverlauf, die Nutzerentscheidungen und den vollständigen damaligen Testbericht. Interne System-/Developer-Anweisungen, Tool-Aufrufe, Zugangsdaten, Tokens, private Sandbox-Pfade und nicht erforderliche Laufzeitdaten sind nicht enthalten.

## Chronologischer Verlauf

### 2026-10-02 — Geteilter pwnd-Chat und Ausgangslage

**Nutzer:**

> https://manus.im/share/h8TLxgfiu957uCPFNHLA6N

**Assistent – sichtbare Fortschrittsmeldungen:**

> I'll open the shared Manus link to see what it contains.
>
> The page is rendered dynamically, so I'll open it in the browser to read the replay.
>
> The link is a replay of your "pwnd-quizbattler" task (game at app.manualai.org/pwnd). I'll pull the full conversation history and check the current state of the live game and code access.
>
> Your GitHub account has the private repo `makopipokam/manualai.org` (last updated today, matching the deploy in the replay). I'll clone it and review the recent history and the live site.
>
> Live site is up and the repo matches the replay. I'll run the existing test suite quickly so I can give you an accurate status.

**Assistent:**

> Ich habe mir deinen geteilten Chat „pwnd-quizbattler“ angesehen und den aktuellen Stand geprüft:
>
> - **Live:** [app.manualai.org/pwnd](https://app.manualai.org/pwnd/) und der [Online-Teich](https://app.manualai.org/pwnd/online.html) liefen beide (HTTP 200).
> - **Code:** Das Repo `makopipokam/manualai.org` war geklont. Der damalige letzte Commit war `6188851` („reveal shadow owl and clarify passive pond bonuses“).
> - **Tests:** Engine-, Teich-, Fragen-API- und Online-Vertragstests (`npm run test:pwnd`) liefen durch.
> - **Offener Punkt:** Das große „+“ / „×“ auf dem Ergebnisbildschirm und „+1 Wissen“ im freien Quiz waren noch ungeklärt und nicht geändert.

### 2026-10-02 — Auftrag: das Live-Spiel gründlich testen

**Nutzer:**

> Das ganze Live-Spiel gründlich durchtesten und Fehler melden (freies Quiz, Fuchsduell, Teich, Speichern)

**Assistent – sichtbare Fortschrittsmeldungen:**

> Playwright und Chromium sind vorhanden. Jetzt prüfe ich die Live-Fragen-API direkt (KI vs. Archiv-Fallback, Fehlerfälle).

> KI-Fragen funktionieren live im freien Quiz (~6 s), das Duell lieferte aber einen Archiv-Fallback. Ich nehme ein paar Stichproben, um Fallback-Quote, Dauer und Wiederholungen zu messen.

> Live-Stand ist identisch mit dem Repo. Ich starte die vorhandenen Browser-Regressionstests (lokal und, wo möglich, gegen live).

> Harness läuft. Ich starte jetzt die Live-Runden (freies Quiz und Duell mit echter KI-API) im Hintergrund und werte parallel die ersten Ergebnisse aus.

**Ergebnis:** Der vollständige detaillierte Bericht einschließlich Prioritäten, Testmethodik und Screenshots liegt in [`report.md`](report.md). Die Befunde gelten für den historischen Commit `6188851`.

Kurzfassung der damaligen Hauptbefunde:

1. Das Duell lief weiter, obwohl der Fuchs 0 HP erreicht hatte.
2. Im Live-Duell kamen nur 3 von 10 Fragen über die KI; die übrigen waren Archiv-Fallbacks. Der vermutete JSON-Parsing-Fehler war eine Hypothese, nicht durch Vercel-Logs bestätigt.
3. Fragen wiederholten sich über mehrere Runden. Ohne KI waren bei zwei Quizläufen zum gleichen Thema 8 von 8 Fragen gleich.
4. Energie diente zugleich als Währung und Elo-Wertung; bei höherem Kontostand konnten selbst Siege Energie kosten.
5. Das Upgrade „Libellenblick“ hatte laut Test keine Wirkung; bei zwei weiteren Upgrades wichen Beschreibung und Verhalten voneinander ab.
6. Auf schmalen Mobilansichten wurden lange Wörter abgeschnitten, Hover ließ Antworten scheinbar ausgewählt wirken, und die Quiz-Kopfzeile überlappte.
7. Das Speichern und die Teichproduktion funktionierten in den geprüften Szenarien; es gab keine JavaScript-Fehler.

### 2026-10-02 — Bitte um Vorschläge

**Nutzer:**

> Gieb mir Vorschläge

**Assistent:**

> **1. Kleine, sichtbare Fehler zuerst:** Duell bei 0 HP beenden; Libellenblick funktionsfähig machen oder vorerst entfernen; Handy-Layout und Touch-Hover korrigieren; Texte bereinigen.
>
> **2. KI-Fragen verlässlicher und schneller machen:** Duell-Antwort auf gültiges JSON absichern, Fehlergründe protokollieren, nächste Frage vorab laden und Archiv-Fallback kenntlich machen.
>
> **3. Wiederholungen reduzieren:** Bereits gestellte Fragen über mehrere Runden speichern, Fragenbestand pro Thema vergrößern und sinngleiche Fragen besser erkennen.
>
> **4. Energie und Wertung trennen:** Energie als Spielwährung behalten und eine separate Wertung für Spielstärke/Gegnerauswahl verwenden.
>
> Empfohlene Reihenfolge: mit den kleinen, klaren Fehlern beginnen, danach die Duell-KI verbessern und die größeren Änderungen separat testen.

Es wurde in diesem Gespräch keine Implementierung der vorgeschlagenen Korrekturen beauftragt.

### 2026-10-08 — Synchronisierung mit der aktuellen GitHub-Quelle

**Nutzer:**

> synchronisiere mit der neuen aktuellen GitHub repo

**Assistent – Ergebnis:**

> Der lokale Branch `main` wurde per Fast-Forward mit GitHub synchronisiert. Der damalige Zielstand war `57cfe87` (`docs(orpheus): add ensemble concept and master prompt`), 15 Commits voraus gegenüber der zuvor lokalen Arbeitskopie. `npm test` bestand mit 55 Tests; das Arbeitsverzeichnis war sauber.
>
> Hinweis: Das Repository hatte pwnd in `apps/pwnd/` verschoben; der frühere Ordner `pwnd/` war nicht mehr vorhanden.

**Nachricht zum Testserver:**

> Der gestoppte Prozess war nur der lokale Testserver aus der vorherigen Prüfung. Er wird für die Git-Synchronisierung oder die Tests nicht mehr benötigt; die Live-Seite ist davon nicht betroffen.

### 2026-10-12 — Dieses Archiv in GitHub ablegen

**Nutzer:**

> lade den gesamten Inhalt dieser Konversation in einen relevanten Ordner auf GitHub hoch, sodass sie von einer zukünftigen KI wieder benutzt werden kann.

**Assistent:**

> Ich sammle den sichtbaren Gesprächsverlauf samt Testbericht, prüfe die passende Ablagestruktur im aktuellen Repository und lege das Archiv anschließend als nachvollziehbaren GitHub-Commit ab.
>
> GitHub hat inzwischen neun weitere Commits, darunter bereits einen neuen pwnd-KI-Kontext. Ich ziehe diesen Stand zuerst vor und richte das Gesprächsarchiv an der vorhandenen Struktur aus, statt eine parallele Ablage anzulegen.

**Assistent – Vorgehen:**

Die bestehende Struktur `docs/ai-context/` wurde geprüft und dieses Archiv wird dort unter `docs/ai-context/pwnd/live-playtest-2026-10-02/` abgelegt. Der GitHub-Stand wurde vor dem Export aktualisiert. Aktuelle `main`-Basis beim Archivexport: `8e31a74` (`feat(pwnd): integrate rebuild and AI context`). Die separate Datei [`report.md`](report.md) enthält den vollständigen damaligen Bericht; Bildbelege liegen im Unterordner `bilder/`.

## Nutzerseitige Git-Regel für dieses Repository

Für Commits im Repository `makopipokam/manualai.org` ist vor dem ersten Commit einer Aufgabe global zu setzen:

```sh
git config --global user.name makopipokam
git config --global user.email info@manualai.org
```

Vor jedem Push den tatsächlichen Autor des letzten Commits prüfen:

```sh
git log -1 --format='%ae'
```

## Hinweise für zukünftige KI-Sitzungen

1. Zuerst [`docs/ai-context/README.md`](../../README.md) und die aktuellen pwnd-Übergabedokumente lesen.
2. Danach `git status`, Branch und aktuellen Commit prüfen. Der Code auf dem aktuellen `main` ist maßgeblich.
3. Dieses Playtest-Archiv und [`report.md`](report.md) als **historische Ergebnisse für Commit `6188851`** behandeln. Die dort genannten Pfade (`pwnd.js`, `api/pwnd-question.js` als Teil des alten Stands, `/pwnd/` und alter Testumfang) können vom aktuellen Neuaufbau abweichen.
4. Vor jeder Übernahme eines alten Fix-Vorschlags zuerst die entsprechende aktuelle Implementierung unter `apps/pwnd/` bzw. `apps/pwnd/rebuild/` untersuchen und Regressionstests für den aktuellen Stand ausführen.
5. Die vermutete Ursache des Duell-JSON-Problems war nicht bestätigt; sie darf nicht als erwiesene Ursache weitergegeben werden.
6. Keine internen Prompts, Geheimnisse, Tokens oder privaten Laufzeitdaten in das Repository übernehmen.
