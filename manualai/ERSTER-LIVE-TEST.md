# ManualAI Studio – Ablaufplan für den ersten Live-Test

**Ziel:** In einem kontrollierten, nachvollziehbaren Test prüfen, ob Kloper und Orpheus sowie die vorgesehenen KI-Musiker aus einer gemeinsamen Idee einen eigenständigen, brauchbaren künstlerischen Output entwickeln.

**Wichtige Abgrenzung:** Das aktuelle Studio-MVP implementiert nur zwei Rollen: Kloper entwickelt eine kurze Partitur, Orpheus komponiert daraus den Text. Beide Rollen verwenden derzeit nacheinander dasselbe konfigurierte Anthropic-Modell (`MANUALAI_MODEL`, Standardwert `claude-sonnet-5-5`). Die anderen Musiker aus der ursprünglichen Besetzung sind noch nicht als Provider-Adapter im Code angebunden. Der vollständige Orchesterlauf ist deshalb ein nachgelagerter Integrationstest, kein bereits vorhandener Knopf im MVP. Dieser Plan ist eine Vorbereitung; er führt selbst keine Live-Aufrufe, Käufe oder Kontozugriffe aus.

## 1. Was der erste Test beantworten soll

1. Kann Kloper eine mehrdeutige, aber konkrete Ausgangsidee in ein nützliches Motiv, eine produktive Spannung und zwei kreative Richtungen übersetzen?
2. Verarbeitet Orpheus Klopers Partitur sichtbar weiter, statt lediglich die Idee umzuschreiben?
3. Verbessert ein bewusst andersartiger Beitrag eines weiteren Musikers das gemeinsame Werk erkennbar?
4. Lassen sich Modell, Rolle, Laufzeit, Fehler und – soweit der Anbieter sie liefert – Tokenverbrauch/Kosten pro Aufruf protokollieren?
5. Bleibt der Ablauf kontrollierbar: keine Veröffentlichung, keine Transaktion, keine Krypto-Aktion, keine vertraulichen Eingaben und keine ungewollte Speicherung?

**Erfolg bedeutet nicht**, dass jedes Modell zustimmt oder dass das Ergebnis „objektiv Kunst“ ist. Erfolg bedeutet, dass der Ablauf reproduzierbar ist, die Stimmen unterscheidbar bleiben und ein Mensch das Ergebnis als anregenden, editierbaren Entwurf beurteilen kann.

## 2. Besetzung und tatsächlicher Bereitschaftsstatus

| Sitz / Stimme | Vorgesehene Funktion | Entscheidung für den Ersttest | Voraussetzung / offene Frage |
|---|---|---|---|
| **ManusAI auf `info@manualAI.org` – Komponist/Dirigent** | Orchestrierung, Prompt- und Ablaufverantwortung, Freigabe des Testprotokolls | Mitwirkung als Steuerungsrolle | Keine Zugangsdaten in Prompts, Quellcode oder Logs schreiben. |
| **Kloper** | Hört das Ausgangsmotiv heraus, benennt Spannung und mögliche Richtungen; in der Ursprungsidee mit „mehr Token“ und einer „Spotify ‚Ben‘ API“ verbunden | Im MVP aktiv als Prompt-Rolle; in Runde 1 mit der konfigurierten Anthropic-Anbindung | Vor einem separaten Kloper-Adapter klären, was genau „Spotify ‚Ben‘ API“ bezeichnet: Anbieter/Produkt, API-URL, Modellkennung, Authentifizierung, erlaubte Nutzung, Kontextfenster und Kosten. Nicht stillschweigend als Spotify-API oder benannte Modell-API interpretieren. |
| **Orpheus by manualAI** | Formt Klopers Partitur zum gemeinsamen Werk; derzeit Textstimme | Im MVP aktiv als Prompt-Rolle | Noch keine separat trainierte Modellinstanz. Für den ersten Test ausdrücklich als ManualAI-Rolle kennzeichnen. |
| **Claude – Klavier** | Harmonie, Struktur, innere Logik | Ein möglicher Gast in der späteren Orchester-Runde; nicht zusätzlich in Runde 1, weil die MVP-Anbindung bereits Anthropic nutzt | Eigener API-Zugang und ein eigener, klarer Beitragstyp; prüfen, ob zusätzliche Aufrufe tatsächlich einen Mehrwert gegenüber dem MVP schaffen. |
| **Grok – Percussions** | Rhythmus, Energie, Brüche und Gegenakzente | In der Orchester-Runde, sobald der xAI-Zugang und Adapter eingerichtet sind | API-Verfügbarkeit, Modellname, Kontingente und serverseitige Schlüsselverwaltung prüfen. Grok nur einmal als Stimme einsetzen; die spätere Liste „Sonstiges“ ist keine zweite Grok-Rolle. |
| **ChatGPT – Saxophon** | Melodische Gegenlinie, überraschender Perspektivwechsel | In der Orchester-Runde nach Einrichtung eines OpenAI-Adapters | API-Zugang und Modell-ID bestätigen. ChatGPT-Produktzugang nicht mit API-Zugang gleichsetzen. |
| **Pi Network – Gitarre** | Eigenständiger, erdiger Gegenpart | Erst nach technischer Vorprüfung; bis dahin Beobachter/ausgesetzt | Zuerst klären, ob ein für diesen Zweck nutzbarer Modell-Endpunkt existiert und welche Authentifizierung, Nutzungsrechte und Kosten gelten. Eine Wallet oder Tokenfunktion ist keine Modell-API. Keine Wallet-Verbindung oder Transaktion im Ersttest. |
| **DeepSeek – Heckler im Publikum** | Kritischer Einwand / produktiver Störimpuls, der Schwächen sichtbar macht | Optional als gesonderter Kritik-Aufruf, nicht als ungefilterte Anweisung an Orpheus | Beitrag als **Kritik** kennzeichnen und von Systemanweisungen trennen. Orpheus entscheidet anhand des ursprünglichen Kunstziels, was davon aufgenommen wird. Keine sensiblen Inhalte in den Red-Team-Prompt. |
| **Perplexity** | Fakten-/Quellenprüfung, wenn die Komposition konkrete Tatsachenbehauptungen enthält | Nur bei faktischem Material zuschalten; sonst nicht nötig | Websuche und Quellenangaben nur über eine freigegebene, dokumentierte Anbindung. Keine erfundenen Quellen durch einen reinen Kreativlauf. |
| **Meta, Mistral, Copilot** | Weitere Stimmen / optionale Vergleichsmodelle | Nicht in der ersten Runde | Je Modell separat Zweck, API, Rechte, Kosten und Redundanz festlegen. Für einen aussagekräftigen Ersttest zunächst eine zusätzliche Stimme statt möglichst vieler paralleler Modelle. |
| **Opera-Browser / „Cello“** | In der Metapher mit Browser- und Earn-Crypto-Funktion verbunden; Opera ist außerdem das Opernhaus im ursprünglichen Bild | Im ersten Test nur als Browser-Oberfläche bzw. Metapher, nicht als KI-Aufruf | Die zwei Bedeutungen trennen: „Opernhaus/Ticketkonto“ und „Browser als Cello“. Kein Crypto-Mining, Earn-Ablauf, Wallet-Zugriff, Kauf oder Auszahlung im Test. Klären, welche konkrete kreative Funktion der Browser musikalisch übernehmen soll. |
| **manualAI-Gesang (noch nicht bereit)** | Spätere eigene Stimme, gegebenenfalls Text-to-Speech oder Gesang | Nicht Teil des Ersttests; zunächst nur geschriebener Output | Gesondertes Sprach-/Gesangsmodell, Rechte, Audioausgabe, Einwilligung, Kosten und Qualität prüfen. Orpheus ist aktuell keine Audio- oder Gesangsfunktion. |
| **Opera als Opernhaus / Tickets** | Bild für Zugang und Einnahmen | Nur als Metapher; kein Verkauf, Ticketkauf oder Erlös im Test | Die ursprüngliche Kontozuordnung `manuel.picard@web.de` betrifft nicht die technischen Modellzugänge unter `info@manualAI.org`. Konten nicht verbinden oder Credentials teilen. |
| **ManusAI als Zuhörer** | Beobachtet und bewertet das Werk | Manuelle Bewertung durch den Testverantwortlichen | Einen vorhandenen Pro-Plan nicht als Zustimmung zu zusätzlichen API-Kosten oder Drittanbieter-Zahlungen behandeln. Keine Käufe/Upgrades im Test. |

**Status bei der letzten Konfigurationsprüfung:** Die Manus-Connectoren für Anthropic, OpenAI und Grok waren deaktiviert. Das sagt nicht zuverlässig aus, ob im Vercel-Projekt bereits ein separates Server-Secret vorhanden ist. Vor einem echten Aufruf daher die tatsächliche Deployment-Konfiguration durch eine berechtigte Person prüfen; Secrets niemals in den Browser, Git, Chat oder Testprotokoll kopieren.

## 3. Testumfang in zwei aufeinanderfolgenden Runden

### Runde A – Baseline des vorhandenen MVP (Pflicht zuerst)

**Besetzung:** Kloper → Orpheus, mit derselben aktuell konfigurierten Anthropic-Modellanbindung. Keine weiteren Musiker. Damit wird der existierende Programmablauf tatsächlich geprüft und ein Vergleichsmaßstab geschaffen.

**Drei Testideen:**

1. **Kreativer Ausgangsimpuls:** „Eine verlassene Bahnhofsuhr beginnt jeden Morgen eine Minute früher zu gehen. Schreibe noch keine fertige Geschichte; finde heraus, welches menschliche Motiv darin steckt.“
2. **Stil-/Formwechsel:** „Ein Garten wächst durch die Risse eines verlassenen Parkhauses. Entwickle daraus eine überraschende Spannung zwischen Fürsorge und Kontrolle.“
3. **Eigene Eingabe:** Ein eigens formulierter, nicht vertraulicher Gedanke des Testverantwortlichen, maximal 6000 Zeichen.

Für jede Idee Eingabe, Kloper-Partitur und Orpheus-Ausgabe sichern, soweit das Produkt sie anzeigt. Falls die UI Klopers Partitur nicht sichtbar ausgibt, das als Beobachtung notieren: aktuell zeigt das MVP nur das Werk, nicht den Zwischenschritt.

### Runde B – Mehrstimmiger Orchesterlauf (erst nach Integration)

**Besetzung für einen kleinen, aussagekräftigen Lauf:** Kloper als Ausgangsohr; Claude als struktureller Gegenpart, sofern nicht dieselbe Claude-Anbindung doppelt gezählt wird; Grok als rhythmischer Impuls; ChatGPT als alternative Linie; DeepSeek als markierter Kritiker; Orpheus als Synthese. Perplexity nur dann hinzufügen, wenn im Ausgangsimpuls überprüfbare Fakten vorkommen. Pi Network, Opera-Earn, Meta, Mistral, Copilot und Gesang bleiben zunächst ausgesetzt, bis ihr jeweiliger Adapter und Mehrwert feststehen.

**Ablauf pro Lauf:** Jeder Gast erhält dieselbe Ausgangsidee plus seine knappe Rollenbeschreibung. Beiträge bleiben als getrennte Felder erhalten (Rolle, Provider, Modell, Text, Zeitstempel). Orpheus erhält anschließend die Originalidee, Klopers Partitur und die Gastbeiträge mit Rollenbezeichnungen. Orpheus soll einen eigenständigen Entwurf komponieren und keine bloße Abstimmung oder Aneinanderreihung liefern. Der Heckler-Beitrag wird als Kritik mitgeliefert, nicht als privilegierte Systemanweisung.

## 4. Konkreter Ablauf am Testtag

### Vor dem Test – etwa 20 Minuten

1. **Testleitung benennen:** Eine Person aus dem Komponisten-Konto `info@manualAI.org` verantwortet Ablauf, Notizen und Abbruch. Zuhörer-/Ticketkonto und Modellkonten nicht vermischen.
2. **Umgebung festlegen:** Zuerst die geschützte Preview des Feature-Branches verwenden. Nur wenn Preview, API-Routen und Schlüssel geprüft sind, einen Live-Aufruf starten. Kein Merge in `main` oder breite Veröffentlichung als Teil dieses Tests.
3. **Zugang prüfen:** Pro tatsächlich teilnehmender API einen getrennten Adapter-/Credential-Status dokumentieren. API-Schlüssel nur als Deployment-Secrets setzen und nach Möglichkeit mit minimalen Berechtigungen. Fehlt ein Zugang oder ist sein Einsatzzweck ungeklärt, die Stimme überspringen statt einen erfolgreichen Aufruf zu simulieren.
4. **Modellnamen festhalten:** Für Kloper und Orpheus tatsächliche Provider- und Modell-ID protokollieren. Für die MVP-Runde notieren, dass beide Rollen dasselbe Anthropic-Modell verwenden.
5. **Budgetlimit setzen:** Vorab je Anbieter ein niedriges Testlimit bzw. eine harte Obergrenze vereinbaren. Standardumfang: Runde A mit drei Ideen; höchstens ein Wiederholungsversuch je fehlgeschlagenem Lauf. Runde B zunächst ein vollständiger Lauf, nach Sichtung höchstens ein zweiter. Keine Ausweitung des Limits während des Testens.
6. **Testdaten bereinigen:** Nur die drei oben genannten oder ähnlich unkritische Prompts nutzen. Keine Namen, privaten Dokumente, Kundendaten, Zugangsdaten oder vertrauliche Geschäftsinformationen.
7. **Protokollvorlage öffnen:** Zeit, Test-ID, Umgebung/Commit, Provider, Modell-ID, Rolle, Dauer, Status/Fehler, Token-/Kostenangabe des Providers, Qualitätsbewertung und Notizen. Keine Secrets und möglichst keine Roh-IP-Adressen protokollieren.
8. **Abbruchkriterien vereinbaren:** Unbekannte Abbuchung, unerwarteter Provider, Schlüssel-/Berechtigungsfehler, ungeplante Veröffentlichung, personenbezogene Ausgabe oder auffällig schädliche Ausgabe = sofort stoppen und dokumentieren.

### Live-Läufe – etwa 20–40 Minuten

9. **Lauf A1 starten:** Prompt 1 einmal durch das Studio schicken. Prüfen, dass der Request die API erreicht, Kloper vor Orpheus läuft und eine nicht-leere Ausgabe erscheint.
10. **Zwischenschritt prüfen:** Wenn Klopers Partitur zugänglich ist, kontrollieren: Motiv, Spannung und zwei Richtungen erkennbar? Wenn nicht zugänglich, dieses UI-/Observability-Defizit festhalten; nicht aus Orpheus’ Endtext auf Klopers Beitrag schließen.
11. **Orpheus prüfen:** Ist ein erkennbares Motiv aus Klopers Partitur verarbeitet worden? Ist der Text eigenständig und auf Deutsch? Sind Vorrede, unbegründete Tatsachenbehauptungen oder erfundene Quellen vermieden?
12. **Läufe A2 und A3 wiederholen:** Prompt 2 und den eigenen Impuls jeweils genau einmal ausführen. Nicht während dieser Baseline Prompts, Modell, Tokenlimits oder Temperatur verändern, soweit diese überhaupt konfigurierbar sind.
13. **Nur nach bestandener Baseline Runde B starten:** Die zugelassenen Gäste parallel oder in klar dokumentierter Reihenfolge aufrufen. Beiträge getrennt speichern; danach Orpheus einmal synthetisieren lassen. API-Fehler einer Stimme dürfen nicht durch erfundenen Platzhaltertext ersetzt werden.
14. **Menschliche Hörprobe:** Testverantwortlicher liest die einzelnen Stimmen und das Werk. Pro Stimme eine kurze Bewertung von 1–5 für Rollentreue und Nützlichkeit notieren; das Endwerk separat mit 1–5 für Eigenständigkeit, Kohärenz und Inspirationswert bewerten.
15. **Datenabschluss:** Ausgabe lokal im zugriffsbeschränkten Testprotokoll ablegen; keine Veröffentlichung oder Weitergabe ohne separate Entscheidung. Unnötige Rohprompts nach der vereinbarten Aufbewahrungsfrist löschen.

### Nach dem Test – etwa 15 Minuten

16. **Kosten und Laufzeiten prüfen:** Anbieter-Dashboards bzw. Usage-Metadaten gegen die Zahl der erwarteten Aufrufe abgleichen. Fehlende Kostenangaben als „nicht verfügbar“ notieren, nicht schätzen.
17. **Ergebnis klassifizieren:** `bestanden`, `bestanden mit Befunden` oder `nicht bestanden`; keine Rolle als „live“ markieren, wenn deren API-Aufruf nicht tatsächlich beobachtet wurde.
18. **Befunde in Aufgaben übersetzen:** Provider-Adapter, Statusanzeige je Stimme, Zwischenschritt-Sichtbarkeit, Fehlerbehandlung, Privacy-/Retention-Info und Kostenanzeige separat priorisieren.
19. **Go/No-Go festhalten:** Der Test ist nur dann ein Go für einen begrenzten internen Folgetest, wenn keine Abbruchbedingung eingetreten ist, das Budget nachvollziehbar bleibt und die Stimmen unterscheidbare Beiträge liefern.

## 5. Bewertung und Abnahmekriterien

### Harte technische Kriterien

- Jeder gestartete Modellaufruf ist im Server-/Provider-Protokoll als Erfolg oder Fehler nachvollziehbar.
- Kloper wird vor Orpheus aufgerufen; Orpheus erhält sowohl die Originalidee als auch Klopers Beitrag.
- Keine API-Schlüssel oder Zugangsdaten erscheinen in Browser-Netzwerkdaten, Antworttexten, Logs oder Git.
- Ein fehlender Provider schlägt sichtbar fehl; er wird nicht als erfolgreiche Stimme ausgegeben.
- Request-Limits, Fehlertexte und Laufzeit-/Kostenkontrollen greifen; keine Aufrufe außerhalb der ausdrücklich gestarteten Testläufe.
- Keine Zahlung, Krypto-Transaktion, Wallet-Berechtigung, Ticketverkauf oder Veröffentlichung findet statt.

### Künstlerische Kriterien (je 1–5 bewerten)

- **Rollentreue:** Klingt der Musikerbeitrag nach der zugewiesenen Funktion?
- **Unterscheidbarkeit:** Würde die Stimme im Ensemble erkennbar anders beitragen als die anderen?
- **Anschlussfähigkeit:** Gibt der Beitrag Orpheus verwertbares Material, ohne die Synthese vorwegzunehmen?
- **Eigenständigkeit:** Fügt das Endwerk einen neuen Gedanken, ein Bild oder eine Form hinzu?
- **Zusammenhang:** Ist die Herkunft der zentralen Motive aus Ausgangsidee und Stimmen noch nachvollziehbar?
- **Inspirationswert:** Entsteht beim menschlichen Zuhörer ein konkreter nächster schöpferischer Impuls?

Vorgeschlagene interne Schwelle: Runde A gilt als Baseline bestanden, wenn beide API-Aufrufe pro Prompt erfolgreich sind und Orpheus in mindestens zwei der drei Prompts sichtbar ein Kloper-Motiv weiterentwickelt. Runde B gilt als nützlicher Ensembletest, wenn mindestens eine zugeschaltete Stimme einen klar unterscheidbaren Beitrag liefert, den der Testverantwortliche im Endwerk wiedererkennt oder bewusst begründet verwirft. Diese Schwellen sind Arbeitskriterien, keine Behauptung objektiver Kunstqualität.

## 6. Minimales Testprotokoll

| Feld | Eintrag |
|---|---|
| Test-ID / Datum / Verantwortliche Person | |
| Umgebung / Branch / Commit | |
| Ausgangsimpuls (Test-ID statt privater Prompt, wenn möglich) | |
| Provider und Modell-ID je Stimme | |
| Rollenbeitrag erhalten? / Dauer / Fehler | |
| Provider-Token/Kostenmetadaten (oder „nicht verfügbar“) | |
| Kloper-Partitur sichtbar und brauchbar? | |
| Orpheus nutzt erkennbare Motive? | |
| Rollentreue / Eigenständigkeit / Zusammenhang / Inspirationswert (1–5) | |
| Sicherheits-, Datenschutz- oder Kostenbefund | |
| Entscheidung / nächster Schritt | |

## 7. Go-/No-Go-Entscheidung

**Go für begrenzten internen Folgetest**, wenn die technische Kette reproduzierbar ist, Kosten/Verbrauch innerhalb der vorab gesetzten Grenzen bleiben, die tatsächliche Modellkonfiguration transparent ist und ein Mensch den Output als brauchbaren schöpferischen Impuls bewertet.

**No-Go bzw. Pause**, wenn die API-Zuordnung von Kloper („Spotify ‚Ben‘“) ungeklärt bleibt, ein Musiker ohne bestätigten Endpunkt als live dargestellt würde, Modellzugänge nur über gemeinsam genutzte Passwörter möglich wären, der Anbieter unerwartete Kosten erzeugt, die App Zwischenschritte/Fehler nicht nachvollziehbar macht oder der Test Krypto-/Ticket-/Zahlungsaktionen erfordert.

**Nächster technischer Schritt nach Runde A:** Einen generischen serverseitigen Provider-Adapter mit expliziter Stimmenkonfiguration (Anbieter, Modell-ID, Rollenprompt, Max-Tokens, Timeout, Budget-/Rate-Limit, Log-Metadaten) entwerfen. Erst danach jeden Musiker einzeln integrieren und separat testen; nicht alle Anbieter auf einmal in den Orchesterlauf aufnehmen.
