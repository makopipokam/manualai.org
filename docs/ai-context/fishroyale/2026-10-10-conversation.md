# Gesprächsarchiv: Fish Royale und pwnd

- **Archivdatum:** 2026-10-10
- **Projekt:** `manualAI` (`CrHyUAsZ3GmJxLAvLfh7FC`)
- **Repository:** `makopipokam/ritter-kunibert`
- **Branch zum Archivzeitpunkt:** `main`
- **Primärer Arbeitsfokus:** `apps/fishroyale/`
- **Verwandte Anwendung:** `apps/pwnd/`
- **Zweck:** Übergabe des verfügbaren Gesprächskontexts an zukünftige KI-Agenten.

## Nutzung durch zukünftige KI-Agenten

1. Zuerst `apps/README.md`, `STANDALONE_APPS_GUIDE.md` und diese Datei lesen.
2. Für Fish Royale bei `apps/fishroyale/index.html` beginnen.
3. Für pwnd bei `apps/pwnd/index.html` und `apps/pwnd/pwnd-ai-questions.json` beginnen.
4. Vor Änderungen `git status`, `git log -5 --oneline` und die aktuelle Struktur prüfen.
5. Fish Royale und pwnd getrennt behandeln: Beide Verzeichnisse existieren parallel.
6. Die frühere Root-Struktur (`pwnd/`) nicht wiederherstellen; die aktuelle Struktur liegt unter `apps/`.

## Aktueller Repository-Zustand

Zum Zeitpunkt des Archivs wurde verifiziert:

- `apps/fishroyale/index.html` ist vorhanden.
- `apps/pwnd/index.html` und `apps/pwnd/pwnd-ai-questions.json` sind vorhanden.
- Der Arbeitsbaum war sauber und mit `origin/main` synchronisiert.
- Für Fish Royale war der letzte relevante Refactor-Commit `1bba057` (`chore: refactor project structure and server setup`).
- Ein früherer Repository-Testlauf meldete **55 von 55 Tests bestanden**.
- Ein verwaister lokaler Python-Cache unter dem alten Root-Pfad `pwnd/` wurde entfernt; versionierte Dateien waren davon nicht betroffen.

## Wichtige Dateien und Infrastruktur

- `apps/fishroyale/index.html` — Einstiegspunkt des taktischen Riff-Quizspiels.
- `apps/pwnd/index.html` — Einstiegspunkt des Quizbattle-/Teichgarten-Spiels.
- `apps/pwnd/pwnd-ai-questions.json` — statischer Fragenpool/Fallback für pwnd.
- `api/pwnd-question.js` — serverlose Funktion für adaptive KI-Fragen bei pwnd.
- `apps/README.md` — Übersicht der modularisierten Anwendungen.
- `STANDALONE_APPS_GUIDE.md` — Hinweise für eigenständige App-Deployments.
- `server.js` — lokaler/zentraler Serverkontext.
- `test/` — Repository-Tests.

Technologien und Dienste:

- HTML, CSS und Vanilla JavaScript
- Node.js und Vercel Functions
- Python/Playwright für Browser-End-to-End-Tests
- GitHub und Vercel
- Supabase für persistente Daten und RLS-geschützte Online-Speicherung
- Anthropic API für dynamische/adaptive Fragen bei pwnd

## Gesprächskontext und Anforderungen

Der folgende Abschnitt enthält die im übernommenen Kontext verfügbaren Benutzeranforderungen in ihrer ursprünglichen Reihenfolge.

### Ursprüngliche Benutzeranforderungen

1. „checke den pwnd-quizbattler auf app.manualai.org/pwnd besonders das freie Quizzen und Fortschrittsicherung.“
2. „Teste auch die anderen Modi (z.B. Duell oder Kampagne) auf ähnliche Persistenzfehler.“
3. „ändere das Ressourcensystem zu Energie, Wasser, Luft und liebe“
4. „ist es upgedated und bereit zum testen?“
5. „löse dass die vercel api blocked meldet“
6. „testbereit?“
7. „OK es gibt immer ich keinen Unterschied zwischen dem freien Quizzen und dem Quizduell. auch müssen mehr fragen eingearbeitet werden, dann entferne die Gegnerauswahl von unten und mache sie nachdem man quizzduell ausgewählt hat. dann verwandelt die 3 quizzgegner in 3 verschiedene Schlangenarten. beim freien Quizzen spielt man gegen eine gruselige Eule angelehnt an Avatar Herr der Elemente Eule von was Shi tong“
8. „uuh nicht gegen Schlangen sonder füchse“
9. „beim freien Duellen sucht man sich eine von 3 zufälligen Themen. Dann beginnt die Eule dazu fragen zu stellen. das Ziel der Eule ist es die schwächen des Spielers zu erkennen und daraufhin gezielt Fragen dazu stellen“
10. „mach nochmal einen grundlegenden check“
11. „die Eule soll sich an dein Skill Level anpassen. dazu müssen per KI generierte fragen mit antwort möglichkeiten kommen. es sollte keine Frage zweimal vorkommen beim spielen“
12. „okay mach eine tiefere Analyse, dieses Spiel soll irgendwann Teil des Hauptspiels pwnd (Strategie aufbauspiel im CoC style, siehe den Chat \"pwnd\" im selben Projekt) werden“
13. „ok mach das“
14. „in der Wachstumskarte die Ressourcen Namen durch Symbole ersetzen“
15. „beim Fuchsgegner die Icons an den Gegner anpassen“
16. „anstatt Duell gegen \"Fuchsname\" mache ein los Symbol. dann soll es zu einem coolen Screen führen der je nach Gegner anders ist der einen Countdown von 3 runterzählt bevor es losgeht“
17. „das selbe bei freiem quizzen“
18. „das ui vom freien Quizzen mit der Eule verfeinern: keine unnötigen Texte in kleiner grauen Schrift. und anstatt \"Karte\" sag einfach \"formuliert Frage\" und \"Antwort sperren\" macht auch keinen Sinn“
19. „der los knopf ist kacke“
20. „passe in der Wachstumskarte so an, dass das Herzsymbol nicht alleine ist. und auch den Text der Ressourcen mit den 4 Symbolen ersetzen anstatt \"Elemente\", \"Ressourcen\" du hast einfach nur so Symbole bei den füchsen hinzugefügt , das ist kacke. mach einfach 3 verschiedene füchse auch hier den kleinen grauen Text weg machen der Play knopf bei los ist unnötig“
21. „Die Sachen sollen dann in dem Teich ganz oben erscheinen, und einer Animation folgen. die füchse müssen auch die Antworten analysieren und die Fragen dementsprechend mit KI erstellen. es muss sichergestellt werden dass der Spieler immer in der \"Zone of proximal development bleibt\" der Text unten beim Fuchs-duell soll sich bei jeder Frage anpassen“
22. „wo finde ich das, bei anthropic? auch kannst du ausstellen, dass mir vercel E-Mails schickt?“
23. „wie kann ich den key anzeigen lassen, oder muss ich einen neuen erstellen?“
24. „what's cooking?“
25. „hab's ausgemacht“
26. „ja nice, wat nun“
27. „gut“
28. „Zuerst lokale spielbare Demo“
29. „ok geil“
30. „ok mach das“
31. „wat nu?“
32. „gut“
33. „die rote Nachricht während der Frage, soll dahin wo der Gegner denkt, also auf den nächsten Screen. die dortige rote Nachricht, \"der Fuchs wertet aus\" weg machen“
34. „Der Text bei Bauplatz unten: Check ich nicht ganz. und auch das was unter Produktion abholen ist, was ist das überhaupt. scheint komisch, das scheint vorzuschlagen, dass je nachdem wo das Windrad ist, es mehr oder weniger produziert, ah jetzt Check ichs es ist ein passiver effekt.“
35. „wenn man freies Quizzen wählt, kommt die animierte Eule aus dem Schatten und präsentiert dir drei Themen. Text Brauch man net. auch den Hinweis unter los nicht. auch hier, wie bei füchsen die Nachricht zum denk-screen. aber eigentlich ist es geil, diese Nachricht zu lesen, dass die füchse und die Eule deine Antwort beobachten. das erhöht das Engagement. lass es drin“
36. „was bedeutet das + oben nach der gegebenen Antwort?“
37. „mach weiter“
38. „synchronisiere mit der neuen aktuellen GitHub repo“

## Zusammengefasste Umsetzung aus dem übernommenen Verlauf

### pwnd

- Vier Ressourcen eingeführt: **Energie, Wasser, Luft und Liebe**.
- Adaptives KI-Fragensystem mit Anthropic-Backend und statischem Fallback mit 48 Fragen.
- **Shadow Owl** als kostenloser Quizgegner.
- Drei unterschiedliche Fuchsgegner für Duelle.
- Drei zufällige Themen im freien Quizmodus.
- Anpassung an Skill-Level und erkannte Schwächen.
- Vermeidung bereits gestellter Fragen innerhalb einer Spielsession.
- Lokale spielbare Teichgarten-Demo mit drei Gebäudetypen, Nachbarschaftsboni und Offline-Produktion.
- Servergestützter Online-Teich mit Supabase, Persistenz und RLS-Schutz.
- UI-Überarbeitung: klare „RICHTIG/FALSCH“-Aktionen statt missverständlicher Plus-/Minus-Symbole.
- Gegner- und Eulen-Analysephase mit kontextabhängigen Texten.
- Countdown-/Startscreen je nach Gegner.
- Animationen für neu gewonnene Gegenstände im oberen Teichbereich.
- Überarbeitung der Wachstumskarte und der Ressourcenanzeige.

### Fish Royale

- Fish Royale ist die aktuelle Fokus-App dieses Gesprächs.
- Einstiegspunkt: `apps/fishroyale/index.html`.
- Beschreibung: taktische, riff-/meeresthematische Quiz-Arena mit sechs Runden.
- Die Anwendung ist von pwnd getrennt und darf nicht mit dem pwnd-Teichgarten verwechselt werden.

## Wichtige Korrektur des Arbeitsfokus

Im weiteren Gespräch wurde klargestellt:

> „das hier sollte aber eigentlich Apps/fishroyale sein“

Daraus folgt für zukünftige Agenten:

- Wenn sich „dieses Projekt“, „dieser Arbeitsstand“ oder der aktuelle Fokus auf die taktische Riff-Quiz-Arena bezieht, ist **`apps/fishroyale/`** gemeint.
- **`apps/pwnd/`** bleibt als separate Anwendung bestehen und ist nur relevant, wenn ausdrücklich vom Teichgarten, den vier Ressourcen, Füchsen oder der Shadow Owl gesprochen wird.
- Die Schreibweise im Repository ist kleingeschrieben: `apps/fishroyale/`, nicht `Apps/fishroyale/`.

## Archivierungsgrenzen

Dieses Archiv basiert auf dem vollständigen Gesprächskontext, der der aktuellen Sitzung als übernommene Zusammenfassung einschließlich der dort enthaltenen wörtlichen Benutzeranforderungen zur Verfügung stand. Nicht mehr verfügbare UI-/Browser-Nachrichten, Binäranhänge oder nicht im übernommenen Kontext enthaltene Zwischenantworten konnten nicht rekonstruiert werden. Die Datei ist deshalb bewusst mit Herkunft, Struktur und Grenzen versehen, damit zukünftige KI-Agenten die Informationen zuverlässig einordnen können.
