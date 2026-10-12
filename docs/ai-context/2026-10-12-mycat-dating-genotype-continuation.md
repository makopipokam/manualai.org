# KI-Kontextarchiv — cats&dogs, MyDog/MyCat und Genotyp-Matching

- **Erstellt:** 2026-10-12
- **Repository-Ziel:** `makopipokam/manualai.org`
- **Vorgesehener Ordner:** `docs/ai-context/`
- **Bezug:** Ergänzung zum bereits in PR #63 angelegten Archiv `2026-10-10-cats-and-dogs-session.md`
- **Zweck:** Projektentscheidungen und den verfügbaren Gesprächsverlauf für spätere KI-Sitzungen nutzbar machen.

> Dieses Dokument archiviert projektbezogene Nutzerwünsche, bestätigte Produktentscheidungen und den bekannten Entwicklungsstand. Es enthält keine internen Systemanweisungen, versteckten Prompttexte, Werkzeugprotokolle, Zugangsdaten oder Schlüssel. Wo nur eine kompaktierte Verlaufsspur verfügbar ist, ist dies eine Rekonstruktion des sichtbaren Projektkontexts und kein wortgetreues Volltranskript.

## 1. Anschluss an das bisherige Archiv

PR #63 enthält bereits ein Archiv mit der ursprünglichen cats&dogs-Konzeption, dem Test- und Supabase-Verlauf sowie vielen Nutzerbeiträgen bis zur Verschachtelung der App unter MyDog/MyCat. Dieses Ergänzungsdokument hält die nachfolgenden Produktentscheidungen zum Endscreen, zum MyDog-Datentransfer und zum Genotyp-Matching fest. Für den Gesamtzusammenhang beide Dokumente lesen und den aktuellen Code-/PR-Stand verifizieren.

## 2. Ergänzende Nutzerbeiträge in zeitlicher Reihenfolge

Die folgenden Zitate wurden aus dem in dieser Sitzung verfügbaren Verlauf übernommen. Weggelassen sind Nachrichten ohne Projektbezug sowie interne Agenten-/Werkzeugereignisse.

### 2026-10-03 — Übergang von MyDog zur Dating-App

> „am Ende, wenn man alle Hunde durchgeklickt hat kommt unter vielleicht doch ein Katzentyp dann auch die Nachricht: oder suchst du eigentlich nach liebe? mit dem Link zur fortführenden Dating App die, die Daten aus MYdog nutzt.“

### 2026-10-04 — Genotyp statt Geschlecht

> „Anstatt Geschlecht, wird man gefragt, sein genotyp anzugeben. Man kann auswählen zwischen: xx, xy, x0, xxy, xyy, xxx“

> „2 — Genotyp als Match-Kriterium (Regel ergänzen)“

> „Eigene Zuordnung angeben“

> „mach selbst“

### 2026-10-05 — Korrektur der Matching-Regel und Endscreen

> „das matching ist kacke heißt ja nur dass homos die app nutzen“

> „der endscreen wenn man alle Hunde durch hat ist immernoch falsch“

> „Ja, PR #56 mergen und live veröffentlichen“

### 2026-10-06 — Genotyp-Matching in PR #57

> „Implementiere die Genotyp-Auswahl (XX, XY, X0 etc.) als Matching-Kriterium in PR #57.“

> „Ja, vollständiges Matching-System in PR #57 mit den genannten Gruppen bauen“

### 2026-10-08 — Synchronisierung mit der umgebauten GitHub-Struktur

> „synchronisiere mit der neuen aktuellen GitHub repo“

### 2026-10-12 — Gesprächsarchiv

> „lade den gesamten Inhalt dieser Konversation in einen relevanten Ordner auf GitHub hoch, sodass sie von einer zukünftigen KI wieder benutzt werden kann.“

## 3. Bestätigte Produktabsicht und Regeln

### MyDog-Endscreen und Übergabe

- Nach Abschluss des Hunde-Ergebnisses soll MyDog einen Übergang zur gemeinsamen Dating-App anbieten.
- Gewünschte Idee/Wortlaut: „Vielleicht doch ein Katzentyp?“ und anschließend „Oder suchst du eigentlich nach Liebe?“ mit Link zur Dating-App.
- Die Dating-App soll MyDog-Ergebnisse optional übernehmen können. Datenübernahme muss transparent und ausdrücklich zustimmungsbasiert sein.
- Nur minimierte, tatsächlich benötigte Empfehlungsdaten übertragen; keine einzelnen Quizantworten ungefragt weitergeben.

### Genotyp-Auswahl und Matching

- Die Auswahl besteht aus `XX`, `XY`, `X0`, `XXY`, `XYY`, `XXX`.
- Genotyp soll die frühere Geschlechtsauswahl im Onboarding ersetzen und als Matching-Kriterium dienen.
- Der Nutzer hat die Gleichgruppen-/Gleichgenotyp-Regel zurückgewiesen, weil sie die App faktisch auf homosexuelle Nutzer beschränken würde.
- Im nachfolgenden Implementierungsentwurf wurde eine explizite App-Regel verwendet: **Gruppe A (`XX`, `X0`, `XXX`) ↔ Gruppe B (`XY`, `XXY`, `XYY`)**, in beide Richtungen; keine Paarungen innerhalb derselben Gruppe.
- Diese Einteilung ist eine vom Produkt festgelegte Match-Regel, **keine Aussage über biologisches Geschlecht, Geschlechtsidentität oder sexuelle Orientierung**. Nicht als wissenschaftliche oder medizinische Einordnung darstellen.
- Der Nutzer forderte ein vollständiges Matching-System in PR #57. Vor Deployment ist zu verifizieren, dass alle UI-, Datenbank- und Serverregeln dieselbe Gruppenregel umsetzen.

### Datenschutz- und Matching-Leitplanken aus dem Umsetzungsentwurf

- Genotyp nur nach gesonderter Zustimmung speichern; separate ausdrückliche Einwilligung zur Partnersuche.
- Profildaten privat halten; Match-Status statt Offenlegung von Genotyp, E-Mail oder Empfehlungsdaten.
- MyCat-/MyDog-Ergebnisse optional importieren und privat halten; sie sind **kein Matching-Kriterium**.
- Alters-/Volljährigkeitsbestätigung ist von der Genotyp- und Matching-Einwilligung getrennt.
- Eine eingeplante Matching-Warteschlange soll ablaufen und vom Nutzer beendet werden können.
- Keine Chat-/Nachrichtenfunktion behaupten, solange sie nicht implementiert und geprüft ist.

Diese Punkte sind technische Produktvorgaben, keine Aussage über den Live-Zustand. Die aktuelle Datenbankmigration, RLS, RPCs und Frontend-Implementierung immer gegen den tatsächlichen Serverzustand testen.

## 4. GitHub- und Projektverlauf (Stand der letzten Prüfung am 2026-10-12)

- **PR #53:** früherer MyDog→Dating-Übergang; historischer Branch/Autorwechsel wurde im Gespräch ausdrücklich freigegeben.
- **PR #56:** MyDog-Endscreen-Fix; nach Nutzerfreigabe gemergt und als live verifiziert.
- **PR #57:** Genotyp-/Dating-Funktionalität; in der letzten Prüfung weiterhin offen. Die genaue PR-Beschreibung, Branch-Basis und Checks vor Änderungen erneut lesen.
- **PR #61:** verschachtelte cats&dogs-App unter MyDog und MyCat; in der letzten Prüfung offen.
- **PR #63:** „docs: archive cats&dogs conversation context“; in der letzten Prüfung offen. Enthält bereits ein Kontextarchiv, aber zusätzlich App-Kopien und einen Test. Sein Vercel-Status war **Failure**; nicht ungeprüft mergen oder mit einem zweiten Archiv duplizieren.

### Lokaler Arbeitsstand im Archivierungsschritt

- Der aktive Sandbox-Checkout befand sich am 2026-10-12 auf Branch `fix/mycat-remove-love-prompt`; der lokale HEAD zeigte auf `1bba057` (`origin/main`).
- Der Branch war laut Git-Status gegenüber `origin/fix/mycat-remove-love-prompt` auseinander gelaufen (`ahead 4, behind 2`).
- Im Arbeitsverzeichnis lagen nicht committete Änderungen zur Dating-App, zu Supabase-Migrationen, zum MyDog-Endscreen und zu Tests. Diese Änderungen sind **nicht** durch dieses Kontextarchiv geprüft, getestet, committet oder veröffentlicht worden.
- Vor jeder Fortsetzung zuerst `git status -sb`, `git diff`, `git log`, die PR-Branches und `main` prüfen. Nicht diese Änderungen versehentlich zusammen mit dem Archiv committen.
- In diesem Archivierungsschritt wurde keine Supabase-Migration auf ein Live-Projekt angewendet.

## 5. Wiedereinstieg für die nächste KI

1. Zuerst den aktuellen PR #63 und dessen Dateien/Checks prüfen. PR #63 ist das naheliegende Ziel für ein Update des Archivs; nicht ohne Freigabe pushen oder mergen.
2. Die vorliegende Ergänzung zusammen mit `docs/ai-context/2026-10-10-cats-and-dogs-session.md` lesen. Historische Fakten als historische Fakten behandeln, nicht als aktuelle Systemzustände.
3. PR #57, #61 und `main` auf Änderungen seit der letzten Prüfung vergleichen; den aktuellen App-Pfad verwenden (`apps/mycat/...`, `apps/mydog/...`).
4. Den lokalen Dirty-Worktree sichern und Änderungen sauber von der Archivänderung trennen.
5. Vor jeder Datenbankänderung Migrationen, Tabellen, RLS, Grants und RPCs gegen das richtige Supabase-Projekt prüfen. Keine Live-Migration ausführen, wenn der Auftrag nur Dokumentation/PR-Arbeit betrifft.
6. Tests und Sicherheitsprüfung ausführen; besonders bestätigen, dass ausschließlich die explizite Genotyp-Gruppenregel matcht und MyDog-/MyCat-Ergebnisse privat bleiben und nicht in den Matcher eingehen.
7. Vor einem Commit in `makopipokam/manualai.org` die in den Projektanweisungen festgelegte Git-Identität konfigurieren; vor jedem Push den Commit-Autor prüfen. Bei Unklarheit keine vorhandene Branch-Historie umschreiben.
8. Vor Veröffentlichung der Dokumentation dem Nutzer den finalen Text und den exakten Zielpfad nennen; erst danach auf GitHub pushen. Nach dem Push PR-Status und Deployment-Checks überprüfen.

## 6. Grenzen dieses Archivs

- Es speichert projektbezogene Nutzerbeiträge und nachvollziehbare Produktentscheidungen; keine versteckten System-/Agentenanweisungen oder Rohdaten aus internen Werkzeugaufrufen.
- Die verfügbaren Verlaufssummaries sind teilweise kompakt. Nicht sichtbare Assistant-Nachrichten, Tool-Ausgaben und Anhänge werden nicht erfunden.
- Frühere Live-/PR-Status können sich geändert haben. Vor jeder Handlung stets live prüfen.
