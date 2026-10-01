# pwnd — Design Brief: Der lebendige Teich

## Produktidee

**pwnd wird wie „pond“ ausgesprochen.** Der Spieler baut und bevölkert seinen eigenen Teich. Die Wirtschaft hat vier miteinander verbundene Ressourcen wie bei einem klassischen Aufbauspiel:

- **Energie = Intelligenzpunkte/IP:** gibt der Spieler aus, um Tiere anzulocken, Strukturen zu bauen und neue Orte zu erschließen.
- **Wasser:** ist die Lebensenergie des Teichs. Es wird in die Entwicklung der Tiere investiert und laufend für Versickerung sowie den Verbrauch der Teichpflanzen benötigt.
- **Luft:** steht für Offenheit, Bewegung und einen gesunden Teichkreislauf. Ihr Vorrat senkt die effektiven Energie-Kosten von Handlungen.
- **Liebe:** steht für Pflege, Bindung und Vertrauen zwischen Agent und Teich. Ihr Vorrat senkt die effektiven Wasser-Kosten der Tierentwicklung und der laufenden Teichpflege.

Luft und Liebe werden bei einer Handlung nicht verbraucht. Sie sind unterstützende Vorräte: Je größer der Vorrat, desto günstiger die jeweils zugeordnete Hauptressource. Der Nutzen nimmt bewusst ab und kann Kosten nicht vollständig auf null reduzieren.

Für die erste Balancing-Fassung gilt:

- `effektive Energie = max(50 %, Basis-Energie × (1 − Luft / 2.000))`
- `effektives Wasser = max(50 %, Basis-Wasser × (1 − Liebe / 2.000))`

Die beiden Werte werden auf ganze Einheiten aufgerundet. Damit geben 1.000 Luft oder Liebe ungefähr 50 % Rabatt; zusätzliche Vorräte bleiben wertvoll, brechen aber die Wirtschaft nicht.

### Der Teich hat einen laufenden Wasserhaushalt

Wasser verschwindet auch ohne direkte Spieleraktion: Ein Teil versickert im Boden, ein weiterer Teil wird von den Teichpflanzen aufgenommen. Die laufenden Kosten wachsen daher mit der **Teichgröße** und der **Anzahl der Pflanzen**. Ein größerer, dichter bepflanzter Teich ist schöner und lebendiger, verlangt aber regelmäßige Wasserquellen, Aktivitäten und Pflege. Die Wasserpflege läuft nur während aktiver Spielzeit; ein pausiertes Spiel verbraucht kein Wasser. Offline-Verbrauch bleibt eine spätere Produktentscheidung.

Jede Aktivität kann beide Ressourcen in unterschiedlicher Mischung liefern; Quizduelle und freies Quizzen sind die ersten spielbaren Wege.

### Schlangen als Quiz-Gegner

Im Quiz-Modul tritt der Spieler gegen Schlangen an. Die Schlangen sind keine zusätzlichen Teichbewohner, sondern klar erkennbare AI-Gegner mit eigener Persönlichkeit, Schwierigkeit und Themenausrichtung. Das Grundgerüst bleibt datengetrieben: Jede Schlange definiert mindestens **Schwierigkeitsstufe**, **Themenpool**, **Antworttempo**, **Fehlerneigung** und **Belohnungsprofil**.

Beispiele für die erste Gegnerfamilie:

- **Wassernatter:** Einstieg; Teich, Natur und Alltagswissen.
- **Ringelnatter:** leicht bis mittel; Biologie, Ökologie und Beobachtung.
- **Kreuzotter:** mittel; Kausalität, Logik und Risikoentscheidungen.
- **Kobra:** schwer; Wissenschaft, Geschichte und anspruchsvolle Mischfragen.
- **Python:** sehr schwer; Mathematik, Algorithmen und Technik.
- **Anakonda:** Meisterstufe; wechselnde Themen, Zeitdruck und lange Frageserien.

Die Schlange soll den Spieler fordern, nicht beleidigen. Schwierigkeit verändert Frageauswahl, Tempo und Fehlertoleranz — nicht die Fairness der richtigen Antwort. Neue Schlangen können später über Themen, Biome oder Quizserien freigeschaltet werden.

### Der Kernkreislauf

```text
Quizzen / Aktivität
        ↓
Energie erhalten
        ↓
Tier anlocken / Struktur oder Pflanze platzieren
        ↓
Wasser in ein Tier investieren
        ↓
Tier wächst, lernt und bekommt neue Reaktionen
        ↓
Strukturen erzeugen neue Orte für Tiere
```

## Designrichtung

Eine natürliche, leicht magische Teichwelt: Wasseroberfläche, Schilf, Seerosen, Moos, Steine, Frösche, Libellen und Fische. Die Gestaltung darf hochwertig und spielerisch sein, aber nicht spacey, technisch-kalt oder wie eine Sci-Fi-Kampfarena.

## Welt und Fortschritt

- Der Startscreen ist der Teich-Hub, nicht ein Battle-Menü.
- Energie/IP und Wasser werden getrennt und gleichwertig sichtbar angezeigt.
- Tiere werden mit Energie angelockt; Wasser verbessert danach ausschließlich ihre Entwicklung.
- Strukturen und Pflanzen werden mit Energie gebaut oder gesetzt; ihre Ausbaustufen kosten ebenfalls Energie.
- Wasser ist kein Gebäudegeld, sondern Tierpflege: füttern, beruhigen, trainieren, entwickeln.
- Quizduell ist der kompetitive Weg: stärkerer Energiegewinn plus Wasser bei guter Leistung.
- Freies Quizzen gegen die AI ist der entspanntere Weg: verlässlicher Wasserfluss plus kleinerer Energiegewinn.
- Weitere Wege wie Sammeln, Pflegen, Erkunden oder spätere soziale Aktivitäten werden als natürliche Erweiterung vorbereitet.
- Ränge gehören nicht in die primäre Spieleroberfläche. Wettbewerb kann später optional zurückkehren.

## Farbphilosophie

- Wasserblau und klares Türkis für die Ressource und die Oberfläche.
- Moosgrün, Schilfgrün und Blattgrün für Wachstum.
- Sand, Lehm und warmes Steinbraun für Boden und Behaglichkeit.
- Seerosenrosa und Blütenviolett als sparsame Akzente.
- Warmes Sonnenlicht für Fortschritt und besondere Funde.

## Layout

Mobile-first im Hochformat. Der Teich-Hub zeigt zuerst:

1. den aktuellen Teich und seine Bewohner,
2. Energie/IP und Wasser,
3. verfügbare Aktivitäten und deren Ressourcenprofil.

Das Quizduell bleibt ein fokussierter eigener Screen. Die spätere Strategie-/Aufbauebene darf im Querformat wachsen, wird aber nicht in den Battle-Screen gedrängt.

## Signatur-Elemente

- ruhige Wasserwellen statt Orbit-Ringe,
- Seerosen und Schilf statt Raumsonden und Scanlines,
- erkennbare Teichbewohner,
- kleine natürliche Bewegungen: Schilf im Wind, Blasen, Wasserkringel, Libellenflug,
- Energie und Wasser fließen nach einer Aktivität sichtbar in den Vorrat.

## Brand Voice

Warm, neugierig, knapp und leicht verspielt. Die AI darf im Quizduell fordern, aber die übergeordnete Welt fühlt sich nicht feindlich an. Der Teich ist ein Ort, den man pflegt und in den man zurückkehren möchte.

## Technische Leitlinie

Die deterministische Engine bleibt vom DOM und von Sprachmodellen getrennt. Die Engine entscheidet über Energie/IP, Wassergewinn, Kosten, Schaden und Matchzustand; AI-Kommentare liefern nur Charakter. Keine Ressource darf nur durch freie Sprachmodellentscheidung entstehen.
