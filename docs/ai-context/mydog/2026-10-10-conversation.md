# MyDog / MyCat – Gesprächs- und Projektkontext für zukünftige KI-Sitzungen

**Archivdatum:** 2026-10-10  
**Repository:** [`makopipokam/manualai.org`](https://github.com/makopipokam/manualai.org)  
**Archivpfad:** `docs/ai-context/mydog/2026-10-10-conversation.md`  
**Repository-Stand beim Export:** `12e35df` (`docs: archive pwnd conversation context`)

> Dieses Dokument ist ein bereinigter, öffentlich teilbarer Wiederaufnahme-Kontext. Es bewahrt die sichtbaren Nutzerentscheidungen, die technischen Ergebnisse und die offenen Punkte dieser Gesprächsreihe. Interne System-/Developer-Anweisungen, Tool-Protokolle, Zugangsdaten, Tokens, private Schlüssel, Passphrasen, private Sandbox-Pfade und nicht notwendige Laufzeitdaten sind bewusst ausgeschlossen.

## 1. Zweck und wichtigste Projektgrenze

MyDog ist ein mobiles Hunde-Persönlichkeits- und Rassenprofil-Projekt von manualAI. MyCat ist die entsprechende Katzen-App. `pwnd` ist ein getrenntes Projekt und darf bei MyDog-/MyCat-Arbeiten nicht verändert werden, außer der Nutzer fordert eine gemeinsame Repository-Struktur ausdrücklich an.

Die ursprüngliche MyDog-Version war eine mobile-first Vanilla-HTML/CSS/JS-PWA mit 30 Fragen, lokalen Ergebnissen, Favoriten, 18 Hunderassen, lokalen Fotos, Chat aus Datenprofilen, Teilen und Android-TWA-Vorbereitung.

**Wichtiger aktueller Strukturhinweis:** Der aktuelle `main`-Stand enthält inzwischen den neuen Einstiegspunkt `apps/mydog/index.html`. Die frühere umfangreiche PWA-Struktur unter dem historischen Root-Pfad `mydog/` ist im aktuellen `main` nicht mehr vollständig vorhanden; dort liegen aktuell nur noch einzelne Test-/Preflight-Dateien. Eine zukünftige KI muss deshalb zuerst den aktuellen `main`-Tree und offene Pull Requests prüfen, bevor sie alte Pfade oder frühere Releases weiterverwendet.

## 2. Nutzerentscheidungen und Produktvision

### MyDog

- MyDog soll mobile-first, ruhig, übersichtlich und für eine spätere Android-TWA geeignet sein.
- Die App soll 30 kurze Persönlichkeitstest-Fragen verwenden.
- Die Ergebnisse sind spielerische Orientierung, keine tiermedizinische, verhaltensbiologische oder sonstige fachliche Beratung.
- Die Nutzerin bzw. der Nutzer soll Hunde nacheinander entdecken können, Favoriten speichern und den Test später fortsetzen oder erneut machen können.
- Nach allen verfügbaren Rassen soll ein klarer Abschluss erscheinen; die Formulierung „Vielleicht doch ein Katzentyp?“ wurde als gewünschtes MyDog-Ende etabliert.
- Der Designstil soll ruhig, hochwertig und editorial wirken: Forest-/Sand-/Coral-Akzente, gute mobile Lesbarkeit, Safe-Area-Unterstützung und kein unnötiger Dark-Mode.
- Bilder sollen zum jeweils angezeigten Hund gehören, lokal bzw. zuverlässig geladen werden und beim Wechsel nicht veraltet beim falschen Hund stehen bleiben.
- Die Sterne müssen verständlich als Eignungsbewertung erklärt werden; rote bzw. alarmierende Favoritenfarben wurden mehrfach vermieden.
- Die Startseiten-Plakette soll mit der MyCat-Plakette visuell zusammenpassen. In der früheren PWA-Plakette wurde das echte MyDog-App-Icon statt einer separaten Inline-Hundegrafik als sinnvoller Angleichungspunkt identifiziert.

### MyCat und gemeinsamer Dating-Übergang

- MyCat ist die Katzen-Entsprechung zu MyDog und wurde als bereit bezeichnet.
- Am MyCat-Endscreen soll der Satz **„Oder willst du eigentlich nur liebe?“** erscheinen.
- Darunter soll der Link **„Zur Dating-App“** zur Dating-App unter `/mycat/cats&dogs/` führen.
- MyDog erhielt später einen eigenen Übergang zu `cats&dogs`: Nach allen Hunderassen zeigt der Endscreen eine Dating-CTA und kann ein aggregiertes Persönlichkeitsprofil lokal weitergeben.
- Rohantworten des MyDog-Fragebogens sollen bei diesem Übergang nicht übertragen werden.

## 3. Ursprünglicher MyDog-Funktionsumfang

Die umfangreiche historische PWA enthielt bzw. sollte enthalten:

- 30 Fragen mit fünfstufiger Likert-Auswahl und OCEAN-/Big-Five-Auswertung.
- Lokales Speichern von Antworten, Fortschritt, Ergebnis und Favoriten.
- Wiederaufnahme eines unterbrochenen Tests.
- „Test neu machen“, ohne gespeicherte Ergebnisse ungewollt zu verlieren.
- 18 gerankte Hunderassen.
- Nach jedem Vorschlag „Nächster Hund“ und Favoriten-Speicherung.
- Favoriten-Übersicht.
- Alle Rassen anzeigen, danach Abschlussbildschirm.
- Rassespezifische Profilinformationen und spielerische, unterscheidbare Gesprächsstimmen.
- Kein Live-Generative-AI-Chat: Antworten kommen lokal aus strukturierten Rasseprofilen; bei Gesundheitsfragen neutral und sicher formulieren und bei Dringlichkeit an Tierärztinnen/Tierärzte verweisen.
- Selbst gehostete, optimierte WebP-Fotos statt unzuverlässiger externer Hotlinks.
- Fotoquellen-/Lizenznachweise in einer separaten Informationsseite.
- Teilen eines Ergebnisses und Erzeugen eines anpassbaren PNG-Share-Bildes.
- PWA-Service-Worker mit App-Shell- und begrenztem Fotocaching sowie Offline-Verhalten.

## 4. Wichtige Korrekturen aus dem sichtbaren Verlauf

- Veraltete bzw. falsche Hundefotos wurden durch ein versioniertes Set lokaler WebP-Bilder ersetzt.
- Beim Hundwechsel musste verhindert werden, dass kurz das Bild des vorherigen Hundes sichtbar bleibt.
- Die Share-PNG-Erzeugung wurde unter der Produktions-CSP korrigiert.
- Die Textantworten im Rasse-Chat wurden auf konkrete Fragen verbessert; generische Antworten wie „Ich bin ein toller Hund“ bei Toilettenfragen sollten nicht mehr vorkommen.
- Die Chatstimmen sollten stärker zur jeweiligen Persönlichkeit passen.
- Der Zusatztext unter dem Katzentyp-Ende wurde entfernt bzw. die Abschlussansicht bewusst kurz gehalten; spätere gemeinsame Dating-Übergänge sind davon getrennt zu beurteilen.
- Dark Mode wurde in der historischen PWA entfernt, weil der Kontrast und die Lesbarkeit nicht ausreichend waren.
- Die Startseite sollte keine großen Hundebilder zeigen; die rassespezifischen Bilder gehören zu den Ergebnissen.
- Der Begriff „perfekter Match“ wurde vermieden, weil mehrere Vorschläge möglich sind.

## 5. Datenschutz, Impressum und PICARD

Der Nutzer stellte klar, dass MyDog über die PICARD-Lederwaren-Zentrale betrieben werden soll.

Für die historische MyDog-PWA wurde deshalb eine company-spezifische Datenschutz- und Impressumsseite erstellt. Als verifizierte offizielle Angaben wurden aus dem PICARD-Impressum verwendet:

- **PICARD Lederwaren GmbH & Co. KG**
- **Friedensstraße 22, D-63179 Obertshausen, Deutschland**
- allgemeiner Kontakt über die im offiziellen Impressum veröffentlichte PICARD-Adresse
- Datenschutzkontakt/DPO gemäß dem zum Zeitpunkt der Erstellung geprüften offiziellen PICARD-Impressum

Die offiziellen PICARD-Seiten enthielten teilweise abweichende E-Mail-Varianten. Eine zukünftige KI darf die Kontaktangaben nicht eigenmächtig ändern, sondern muss vor einer neuen rechtlichen Veröffentlichung die aktuell offizielle PICARD-Quelle bzw. die Freigabe der PICARD-Rechts-/Datenschutzstelle prüfen.

Die Datenschutzinformation sollte realistisch nur tatsächliche Verarbeitung beschreiben:

- lokale Speicherung von Antworten, Fortschritt, Ergebnis und Favoriten im Browser;
- technische Zugriffs- und Hostingdaten beim Abruf über Vercel;
- keine Nutzerkonten, kein serverseitiges Ergebnisarchiv, keine Kontakte-Uploads und keine behauptete Live-KI, wenn die konkrete App das nicht implementiert;
- optionale externe Teilen-Aktionen nur nach ausdrücklicher Nutzeraktion;
- PWA-/Service-Worker-Caching und Löschmöglichkeit durch Browser-/App-Datenlöschung;
- Betroffenenrechte nach DSGVO und Beschwerderecht bei der zuständigen Aufsicht;
- Hinweis, dass die Seite vor offizieller Veröffentlichung durch PICARD Legal/Datenschutz freigegeben werden muss.

## 6. Android-/Google-Play-Stand der historischen PWA

Für die historische PWA wurde ein Android-TWA-Release vorbereitet:

- Package: `org.manualai.mydog`
- target SDK: 36
- min SDK: 23
- signiertes AAB/APK wurde privat gebaut und unabhängig geprüft;
- private Keystores, Passphrasen und Zertifikatsmaterial gehören nicht in dieses Archiv und dürfen nicht committed oder geteilt werden;
- Digital Asset Links benötigen den Play-App-Signing-Fingerprint, nicht nur den Upload-Key-Fingerprint;
- ein echter Android-Gerätetest war im damaligen Arbeitsstand noch offen;
- Google-Play-Closed-Test, Data-Safety-Erklärung und weitere Play-Console-Angaben waren externe Release-Gates.

Ein bestandener statischer Android-Preflight ist **nicht** gleichbedeutend mit einer vollständigen Play-Veröffentlichungsfreigabe.

## 7. Aktueller GitHub-Stand am 2026-10-10

Der aktuelle `main`-Stand wurde vor diesem Export frisch von GitHub synchronisiert. Relevante Beobachtungen:

- `apps/mydog/index.html` ist der aktuell sichtbare neue MyDog-App-Einstiegspunkt.
- Dieser neue Einstiegspunkt ist eine kompakte eigenständige HTML-App mit eingebettetem CSS/JavaScript, 30 Fragen, DE/EN-Schalter, Sound-Schalter und Ergebnisliste.
- Die historische umfangreiche PWA-Dateistruktur ist im aktuellen `main` nicht vollständig unter `mydog/` vorhanden. Nicht annehmen, dass frühere Pfade wie `mydog/script.js`, `mydog/data.js` oder die früheren 108 Fotodateien aktuell noch im `main` liegen.
- Die historische MyDog- und MyCat-Entwicklung wurde über mehrere Pull Requests geführt. Vor weiterer Arbeit PR- und Branch-Status über GitHub prüfen.
- Die vorhandene allgemeine Chronik liegt unter [`docs/ai-context/conversation-2026-10.md`](../conversation-2026-10.md).
- Dieser dedizierte MyDog/MyCat-Handoff liegt unter `docs/ai-context/mydog/`.

## 8. Arbeitsregeln für zukünftige KI-Sitzungen

1. Zuerst `git fetch --all --prune` und den aktuellen `origin/main` prüfen.
2. Die aktuelle Struktur unter `apps/`, `mydog/`, `mycat/` und offene Pull Requests vergleichen.
3. Niemals private Schlüssel, Passphrasen, API-Schlüssel, Tokens oder private Laufzeitpfade in das Repository schreiben.
4. `pwnd` und MyDog/MyCat als getrennte Produktbereiche behandeln.
5. Bei Änderungen am aktuellen `apps/mydog` nicht automatisch alte historische PWA-Dateien zurückkopieren.
6. Vor rechtlichen Änderungen die aktuellen PICARD-Quellen und die tatsächliche Implementierung prüfen; rechtliche Texte von PICARD Legal/Datenschutz freigeben lassen.
7. Nach Codeänderungen relevante Tests aus dem aktuellen Repository ausführen und nur tatsächlich geprüfte Ergebnisse behaupten.
8. Eine Produktionsveröffentlichung nicht mit einem lokalen Test, Preview, GitHub-Commit oder Vercel-Konfigurationsstand verwechseln.
9. Bei widersprüchlichen historischen Anforderungen den aktuellen Nutzerwunsch und den aktuellen Code höher gewichten als alte Gesprächsnotizen.

## 9. Kurz-Wiedereinstieg

Wenn eine zukünftige KI die Arbeit fortsetzen soll:

```text
Lies zuerst docs/ai-context/README.md, docs/ai-context/conversation-2026-10.md und dieses Dokument. Prüfe danach den aktuellen origin/main-Tree. Der aktuelle MyDog-Einstiegspunkt liegt unter apps/mydog/index.html; die umfangreiche frühere PWA unter mydog/ ist historisch und möglicherweise nicht mehr vollständig im main. Prüfe offene PRs, bevor du Dateien änderst. Bewahre die Trennung von MyDog, MyCat und pwnd, schreibe keine Secrets ins Repository und teste jede Änderung.
```
