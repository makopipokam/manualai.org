# ManualAI Orchestra

**Status:** Konzept / Musiker-Auswahl. Noch keine externen Modell- oder Musikdienste verbunden.

## Idee

ManualAI soll ein Ensemble von KI-Modellen orchestrieren, die künstlerisch miteinander kommunizieren. Nicht die Liste der verfügbaren Modelle ist das Werk, sondern ihr gemeinsamer, nachvollziehbarer kreativer Prozess und dessen ausgespielter Output.

Die Leitmetapher ist ein Opernabend: Ein Zuhörer kauft ein Ticket, betritt den Konzertsaal, erlebt verschiedene Stimmen und Instrumente und geht mit Inspiration hinaus, die er anschließend in eigene Arbeit umsetzt.

## Rollen in der Metapher

- **Opernhaus:** Produkt- und Aufführungsschicht; Ticketing oder Einnahmen sind zunächst Konzept, kein implementierter Zahlungsfluss.
- **Zuhörer:** die Person oder der Agent, der das Werk erlebt und daraus eigene Arbeit entwickelt.
- **Komponist / Dirigent:** ManualAI / das geplante System „Orpheus“; es wählt Stimmen aus, gibt Thema und Form vor und fügt Beiträge zu einem Werk zusammen.
- **Musiker:** tatsächlich aufrufbare KI-Modelle bzw. Modell-APIs mit klar unterscheidbaren kreativen Rollen.
- **Bühne / Wiedergabe:** Ausgabe als Text, strukturierter Inhalt oder – falls später gewünscht und zulässig – Audio. Ein Musik- oder Wiedergabedienst ist nicht automatisch ein KI-Musiker.

## Arbeitszyklus (Entwurf)

1. Der Komponist erhält Thema, Absicht, Form und Grenzen des Werks.
2. Die ausgewählten Modelle erzeugen zunächst eigenständige Motive.
3. Einzelne Stimmen reagieren aufeinander – etwa durch Variation, Kontrast, Kritik oder Ergänzung.
4. Der Komponist wählt und arrangiert die Beiträge; Herkunft und Reihenfolge der Beiträge bleiben nachvollziehbar.
5. Das Stück wird in der vereinbarten Form ausgegeben. Der Zuhörer entscheidet, wie er die Inspiration in Arbeit übersetzt.

## Prinzipien für die Musiker-Auswahl

Ein Kandidat gilt erst als **Musiker**, wenn es einen zulässigen, dokumentierten und praktisch nutzbaren Aufrufweg für ManualAI gibt. Eine Chat-App, ein Browser, ein Abonnement, ein Wallet oder ein Audiokatalog ist nicht automatisch eine Modell-API. Verbraucher-Abonnement und Entwickler-API sind getrennte Zugänge.

Vor einer Anbindung prüfen wir:

- API-Zugang, Authentifizierung, Limits und Kosten;
- Nutzungsbedingungen für Orchestrierung, Weitergabe und Speicherung der Beiträge;
- tatsächlichen Mehrwert als eigene Stimme statt bloßer Markenvielfalt;
- Umgang mit privaten Eingaben und Modell-Outputs;
- ob ein Browser-, Recherche-, Audio- oder Zahlungsdienst besser als Infrastruktur statt als Musiker einsortiert wird.

## Datenschutz und Sicherheit

Dieses öffentliche Repository enthält keine persönlichen Konto-E-Mail-Adressen, Passwörter, API-Schlüssel, OAuth-Tokens oder Wallet-Daten. Zugangsdaten gehören in geschützte Laufzeit-Konfiguration. Ein Ticket- oder Krypto-Zahlungsfluss wird nicht ohne gesonderte Produktentscheidung und Prüfung umgesetzt.

## Aktueller Stand

Die Besetzung in [`musicians.md`](./musicians.md) ist die **erste Rollen-Skizze des Projektinhabers**, keine Bestätigung, dass die genannten Dienste eine nutzbare API oder passende Nutzungsrechte bieten. Offizielle Anbieter-Dokumentation und die genaue Produktidentität sind vor der Auswahl zu prüfen. Offene Punkte stehen in [`open-questions.md`](./open-questions.md).
