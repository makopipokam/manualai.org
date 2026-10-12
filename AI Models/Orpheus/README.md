# Orpheus by manualAI

**Orpheus** ist die Arbeitsskizze für ein KI-Ensemble, dessen spezialisierte Modelle gemeinsam ein künstlerisches Werk entwickeln. Die Konzertmetapher beschreibt das Erlebnis: Ein Impuls wird als Partitur verteilt, unterschiedliche KI-Stimmen bringen eigene Klangfarben ein, und eine Komposition führt die Beiträge zu einem gemeinsamen Stück zusammen.

> **Status:** Konzept / MVP-Vorbereitung. Dieser Ordner enthält noch keine lauffähige Multi-Modell-Anwendung und behauptet keine bereits eingerichteten Modell- oder Drittanbieterintegrationen.

## Leitidee

Die Modelle sollen nicht dieselbe Antwort mehrfach erzeugen. Sie bekommen unterscheidbare Aufgaben, dürfen einander produktiv widersprechen und liefern Beiträge, die eine Dirigenten-/Komponisteninstanz kuratiert. Das Ergebnis soll Unterschiede erkennbar bewahren, statt sie zu einer generischen Einheitsstimme zu glätten.

Die Opernhaus-Metapher kann später auch die Nutzerreise prägen:

- **Opernhaus:** das Produkt und seine Oberfläche
- **Ticket:** Zugang zu einer kreativen Sitzung
- **Publikum:** die Person, die einen Impuls mitbringt und das Ergebnis erlebt
- **Ensemble:** austauschbare KI-Modelle und Werkzeuge
- **Dirigent/Komponist:** Orchestrierung, Auswahl, Zusammenführung und Qualitätskontrolle
- **Aufführung:** das veröffentlichte oder exportierte gemeinsame Werk

Geschäftsmodell, Abrechnung und persönliche Konto-/E-Mail-Zuordnungen sind keine Promptdaten und gehören nicht in öffentliche Projektdateien.

## Vorläufige Besetzung

Die Rollen sind **Arbeitshypothesen**, keine verbindliche technische Zuordnung. Anbieter, Modellversionen, API-Zugriff, Kosten, Datenschutz und Qualität müssen vor einer Implementierung geprüft werden.

| Sektion / Rolle | Kandidat | Denkbarer Beitrag | Status / Hinweis |
|---|---|---|---|
| **Dirigent und Komponist** | ManusAI-Orchestrierung | Vergibt Aufgaben, sammelt Stimmen, löst Konflikte und editiert das Gesamtwerk. | Kernrolle; zunächst unabhängig vom Modellanbieter beschreiben. |
| **Klavier – Form und Harmonie** | Claude | Dramaturgie, Struktur, innere Stimmigkeit und Überarbeitung. | Zu evaluieren. |
| **Saxophon – Sprache und Ausdruck** | ChatGPT | Sprachliche Ausarbeitung, Bilder, Varianten und Übergänge. | Zu evaluieren. |
| **Percussion – Reibung und Überraschung** | Grok | Gegenentwürfe, überraschende Assoziationen und produktive Störung. | Zu evaluieren. |
| **Recherche-Sektion** | Perplexity | Faktenrecherche und Quellenhinweise, wenn ein Werk reale Belege braucht. | Optional; Quellen getrennt prüfen und ausweisen. |
| **Weitere Stimmen** | Meta-, Mistral- oder Copilot-Modelle | Alternative Perspektiven, offene Modelle oder Programmierhilfe. | Nur bei konkretem Mehrwert und verfügbarer Schnittstelle. |
| **Eigene Stimme / Gesang** | manualAI, später | Eigene künstlerische Handschrift oder ein eigener Modellbaustein. | Zukunftsvision; nicht als bereits verfügbar darstellen. |
| **Browser / Werkzeug** | Opera | Webzugang oder browserbezogene Werkzeuge. | Ein Browser ist kein KI-Musiker; Funktionen und Berechtigungen separat prüfen. |
| **Offener Kandidat** | Pi Network | Noch keine klar definierte kreative Modellrolle. | Kein KI-Modell. Nur aufnehmen, wenn ein konkreter, geprüfter Zweck entsteht. |

## MVP-Vorschlag

1. **Ein Impuls, drei Stimmen:** Ein Nutzer gibt Thema, Form, Publikum, Ton und Grenzen vor.
2. **Getrennte Aufträge:** Strukturstimme, Ausdrucksstimme und Gegenstimme erhalten denselben Brief, aber unterschiedliche Rollen.
3. **Transparente Beiträge:** Jede Stimme liefert Kernmotiv, Entwurf, eigenständigen Beitrag und offene Fragen.
4. **Kuratorische Komposition:** Die Dirigenteninstanz erstellt das Werk, erhält produktive Widersprüche und kennzeichnet Fakten, Annahmen und Erfindungen.
5. **Aufführung und Rückmeldung:** Titel, Programmnotiz und Ergebnis werden angezeigt; die Person kann überarbeiten lassen oder einzelne Stimmen neu anfordern.
6. **Messbarer Nutzen:** Qualität anhand von Originalität, Kohärenz, erkennbarem Stimmenunterschied, Faktenzuverlässigkeit, Laufzeit und Kosten evaluieren.

Für das erste MVP reichen austauschbare Modelladapter und ein Ensemble mit wenigen Stimmen. Nicht jede Sitzung muss jedes Modell aufrufen. Reale Multi-Modell-Kommunikation sollte nur behauptet werden, wenn die jeweiligen Modelle tatsächlich separat angefragt und ihre Beiträge dem Komponisten übergeben wurden.

## Technische Leitplanken

- Modellzugänge über serverseitige Adapter abstrahieren; API-Schlüssel nie im Browser oder Git-Repository ablegen.
- Nutzerinput, interne Prompts und Modellantworten nur im nötigen Umfang an externe Anbieter senden.
- Vor Anbieterwahl Datenverwendung, Aufbewahrung, Regionen, Kosten, Ratenlimits und Lizenzbedingungen prüfen.
- Quellenangaben der Recherche-Stimme nicht ungeprüft als Wahrheit übernehmen.
- Fehler, ausbleibende Antworten und Modellwechsel transparent behandeln; keine erfundenen Beiträge ergänzen.
- Pro Sitzung Rollen, eingesetzte Anbieter/Modelle und Beitragstransformation nachvollziehbar protokollieren, ohne unnötige personenbezogene Daten zu speichern.

## Offene Recherche- und Produktfragen

- Was genau bedeuten **„Kloper“** und **„Spotify ‘Ben’ API“** im ursprünglichen Briefing? Schreibweise, Produkt und API-Zweck sind bislang nicht eindeutig verifiziert.
- Soll Orpheus zunächst ein internes Kreativwerkzeug, eine öffentliche Web-App oder ein Bestandteil der manualAI-Seite werden?
- Welche Kunstformen sind im ersten MVP tatsächlich erwünscht — Text, Skript, Musikbeschreibung oder Audio?
- Welche Modelle lassen sich mit vertretbaren Kosten und passenden Nutzungsbedingungen per API ansprechen?
- Soll die „Ticket“-Metapher nur die Erzählung/UX erklären oder ein echtes Abrechnungsmodell beschreiben?

## Dateien

- [`MASTER-PROMPT.md`](./MASTER-PROMPT.md) — wiederverwendbare Rollen- und Kompositionsvorlage
