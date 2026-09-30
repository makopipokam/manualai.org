# pwnd — Design Brief: Der lebendige Teich

## Produktidee

**pwnd wird wie „pond“ ausgesprochen.** Der Spieler baut und bevölkert seinen eigenen Teich. Die Wirtschaft hat zwei klare Ressourcen wie bei einem klassischen Aufbauspiel:

- **Energie = Intelligenzpunkte/IP:** gibt der Spieler aus, um Tiere anzulocken, Strukturen zu bauen und neue Orte zu erschließen.
- **Wasser:** wird in Bewohner, Strukturen und Teichentwicklung investiert, damit sie wachsen und bessere Effekte geben.

Jede Aktivität kann beide Ressourcen in unterschiedlicher Mischung liefern; Quizduelle und freies Quizzen sind die ersten spielbaren Wege.

### Der Kernkreislauf

```text
Quizzen / Aktivität
        ↓
Energie erhalten
        ↓
Tier anlocken oder Struktur bauen
        ↓
Wasser investieren
        ↓
Bewohner, Pflanzen und Gebäude verbessern
        ↓
Neue Aktivitäten und stärkere Ressourcenwege
```

## Designrichtung

Eine natürliche, leicht magische Teichwelt: Wasseroberfläche, Schilf, Seerosen, Moos, Steine, Frösche, Libellen und Fische. Die Gestaltung darf hochwertig und spielerisch sein, aber nicht spacey, technisch-kalt oder wie eine Sci-Fi-Kampfarena.

## Welt und Fortschritt

- Der Startscreen ist der Teich-Hub, nicht ein Battle-Menü.
- Energie/IP und Wasser werden getrennt und gleichwertig sichtbar angezeigt.
- Bewohner und Teichbereiche werden mit Energie erschlossen; Wasser verbessert sie danach.
- Energie ist die aktive Handlung: anlocken, bauen, platzieren, erkunden.
- Wasser ist die Entwicklung: füttern, pflegen, erweitern, aufwerten.
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
