# pwnd — Design Brief: Der lebendige Teich

## Produktidee

**pwnd wird wie „pond“ ausgesprochen.** Der Spieler baut und bevölkert seinen eigenen Teich. Die Wirtschaft hat zwei klare Ressourcen wie bei einem klassischen Aufbauspiel:

- **Gold = Intelligenzpunkte/IP:** misst die Qualität und Leistung des Spielers.
- **Elixier = Wasser:** wird in Bewohner, Strukturen und Teichentwicklung investiert.

Jede Aktivität kann beide Ressourcen in unterschiedlicher Mischung liefern; Quizduelle und freies Quizzen sind die ersten spielbaren Wege.

## Designrichtung

Eine natürliche, leicht magische Teichwelt: Wasseroberfläche, Schilf, Seerosen, Moos, Steine, Frösche, Libellen und Fische. Die Gestaltung darf hochwertig und spielerisch sein, aber nicht spacey, technisch-kalt oder wie eine Sci-Fi-Kampfarena.

## Welt und Fortschritt

- Der Startscreen ist der Teich-Hub, nicht ein Battle-Menü.
- Gold/IP und Elixier/Wasser werden getrennt und gleichwertig sichtbar angezeigt.
- Bewohner und Teichbereiche verlangen Kombinationen aus Gold und Elixier.
- Quizduell ist der kompetitive Weg: stärkerer Goldgewinn plus Elixier bei guter Leistung.
- Freies Quizzen gegen die AI ist der entspanntere Weg: verlässlicher Elixierfluss plus kleinerer Goldgewinn.
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
2. Gold/IP und Elixier/Wasser,
3. verfügbare Aktivitäten und deren Ressourcenprofil.

Das Quizduell bleibt ein fokussierter eigener Screen. Die spätere Strategie-/Aufbauebene darf im Querformat wachsen, wird aber nicht in den Battle-Screen gedrängt.

## Signatur-Elemente

- ruhige Wasserwellen statt Orbit-Ringe,
- Seerosen und Schilf statt Raumsonden und Scanlines,
- erkennbare Teichbewohner,
- kleine natürliche Bewegungen: Schilf im Wind, Blasen, Wasserkringel, Libellenflug,
- Gold und Elixier fließen nach einer Aktivität sichtbar in den Vorrat.

## Brand Voice

Warm, neugierig, knapp und leicht verspielt. Die AI darf im Quizduell fordern, aber die übergeordnete Welt fühlt sich nicht feindlich an. Der Teich ist ein Ort, den man pflegt und in den man zurückkehren möchte.

## Technische Leitlinie

Die deterministische Engine bleibt vom DOM und von Sprachmodellen getrennt. Die Engine entscheidet über Gold/IP, Elixiergewinn, Kosten, Schaden und Matchzustand; AI-Kommentare liefern nur Charakter. Keine Ressource darf nur durch freie Sprachmodellentscheidung entstehen.
