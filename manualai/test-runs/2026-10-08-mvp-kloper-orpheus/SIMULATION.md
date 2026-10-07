# Simulationsprotokoll – ManualAI Studio MVP

**Datum:** 2026-10-08
**Modus:** Offline-Mock; keine echte Anthropic- oder andere Provideranfrage.
**Umfang:** 3 Testideen, jeweils Kloper → Orpheus; insgesamt 6 abgefangene Modellaufrufe.
**Modell:** Die API-Konfiguration wurde aus dem Anwendungscode gelesen; Providerantworten waren festgelegte Test-Fixtures. Die Ausgaben unten sind keine echten Modellantworten.

## Technische Beobachtungen

- Alle drei simulierten Requests endeten mit HTTP 200.
- Die Reihenfolge Kloper vor Orpheus wurde für jeden Lauf geprüft.
- Für jeden Orpheus-Aufruf wurden sowohl die Originalidee als auch Klopers Partitur im Request nachgewiesen.
- Die API lieferte die erwartete Rollenfolge `Kloper → Orpheus`.
- Aufrufreihenfolge: `Kloper → Orpheus → Kloper → Orpheus → Kloper → Orpheus`.
- Netzwerkzugriff und Redis-Limiter wurden in diesem Prozess ersetzt/deaktiviert; es wurden keine Provider-, Redis-, Konto-, Wallet- oder Zahlungsdienste angesprochen.
- Diese Simulation prüft Ablauf und Übergabe, nicht Live-Verfügbarkeit, kreative Qualität, tatsächliche Laufzeit, Tokenverbrauch, Kosten oder Deployment-Secrets.

## Simulierte Durchläufe

### Lauf 1

**Ausgangsidee:** Eine verlassene Bahnhofsuhr beginnt jeden Morgen eine Minute früher zu gehen. Schreibe noch keine fertige Geschichte; finde heraus, welches menschliche Motiv darin steckt.

**Kloper – Partitur (Fixture):**

Zentrales Motiv: Zeit als Erinnerung, die sich nicht mehr an den gemeinsamen Takt hält. Spannung: Die Uhr misst nicht den Bahnhof, sondern die Sehnsucht einer Person nach jemandem, der nicht zurückkehrt. Richtungen für Orpheus: eine wartende Reinigungskraft entdeckt die Abweichung; oder jede verlorene Minute wird zu einem kleinen, unerzählten Abschied.

**Orpheus – Werk (Fixture):**

Jeden Morgen ging die Bahnhofsuhr eine Minute vor. Mara bemerkte es zuerst, weil sie immer zu früh kam. Sie stellte die Uhr zurück, doch am nächsten Tag war sie wieder voraus.

Nach einer Woche hörte sie auf, sie zu korrigieren. In dieser einen Minute begann der Bahnsteig zu atmen: ein Koffer wurde abgestellt, ein Abschied noch einmal ausgesprochen, ein Zug blieb einen Augenblick länger im Licht.

Mara verstand, dass die Uhr nicht die Zeit verlor. Sie hielt etwas fest, das längst abgefahren war.

### Lauf 2

**Ausgangsidee:** Ein Garten wächst durch die Risse eines verlassenen Parkhauses. Entwickle daraus eine überraschende Spannung zwischen Fürsorge und Kontrolle.

**Kloper – Partitur (Fixture):**

Zentrales Motiv: Leben findet einen Weg durch die Infrastruktur, die es ordnen sollte. Spannung: Pflege lässt wachsen, Kontrolle will Wachstum in Grenzen halten. Richtungen für Orpheus: eine Hausmeisterin beginnt heimlich Beete anzulegen; oder der Garten bildet die vergessene Karte einer Stadt unter dem Beton.

**Orpheus – Werk (Fixture):**

Zuerst war es nur ein Blatt, das durch den Riss neben Stellplatz 18 drückte. Dann kam Regen. Dann kamen Kinder mit Samen in ihren Jackentaschen.

Der Hausmeister zog Kreidelinien um jedes neue Beet. Er wollte wissen, wo der Garten endete. Die Pflanzen hielten sich nicht an seine Karte. Sie wuchsen unter den Pfeilen hindurch und legten sich an die Wände, als lauschten sie dort einer verborgenen Quelle.

Eines Morgens ließ er die Kreide liegen. Zum ersten Mal sah der Beton nicht aus wie eine Grenze, sondern wie ein Dach, das jemand für das Leben gebaut hatte.

### Lauf 3

**Ausgangsidee:** Eine Bibliothek sammelt Bücher, die noch niemand geschrieben hat. Was könnte in ihrem ersten Band stehen?

**Kloper – Partitur (Fixture):**

Zentrales Motiv: Ungeschriebene Möglichkeiten werden gesammelt, bevor sie Wirklichkeit werden. Spannung: Wem gehört eine Geschichte, die noch niemand erzählt hat? Richtungen für Orpheus: ein leeres Buch beginnt, Leserinnen und Leser zu beschreiben; oder die Bibliothekarin findet darin die Geschichte, die sie selbst nie zu schreiben wagte.

**Orpheus – Werk (Fixture):**

Der erste Band war leer, bis auf den Titel: „Für später“.

Die Bibliothekarin stellte ihn ins oberste Regal. Jeden Abend war eine neue Seite darin. Keine Worte, nur feine Druckstellen, als hätte jemand auf einem Blatt darüber geschrieben. Sie legte Papier daneben und rieb mit dem Bleistift darüber.

So erschienen die Umrisse einer Tür, ein halber Satz und schließlich eine Frage: „Was würdest du erzählen, wenn du nicht wüsstest, wer es liest?“

Am Morgen nahm sie den Bleistift mit nach Hause.

## Ergebnis und nächster Schritt

**Offline-Ablauf: bestanden.** Für einen echten MVP-Live-Test muss eine berechtigte Person zunächst die serverseitige Anthropic-Konfiguration der Zielumgebung prüfen. Anschließend sind dieselben drei Ideen einmal mit dem echten Provider auszuführen und die tatsächliche Laufzeit, Provider-Metadaten, Fehler und Qualität getrennt zu protokollieren. Die optionalen Musiker sind in diesem MVP-Lauf nicht beteiligt.
