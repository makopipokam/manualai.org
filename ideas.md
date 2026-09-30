# pwnd — Design Brief: Der lebendige Teich

## Produktidee

**pwnd wird wie „pond“ ausgesprochen.** Der Spieler baut und bevölkert seinen eigenen Teich. IP ist keine abstrakte Rangzahl, sondern eine spielbare Ressource: **Wasser**. Jede Aktivität kann Wasser in den Teich bringen; Quizduelle sind nur der erste spielbare Weg.

## Designrichtung

Eine natürliche, leicht magische Teichwelt: Wasseroberfläche, Schilf, Seerosen, Moos, Steine, Frösche, Libellen und Fische. Die Gestaltung darf hochwertig und spielerisch sein, aber nicht spacey, technisch-kalt oder wie eine Sci-Fi-Kampfarena.

## Welt und Fortschritt

- Der Startscreen ist der Teich-Hub, nicht ein Battle-Menü.
- Wasser/IP ist die zentrale Ressource und wird groß, ruhig und verständlich angezeigt.
- Bewohner und Teichbereiche werden mit gesammeltem Wasser freigeschaltet und verbessert.
- Quizbattle ist die erste aktive Aktivität: ein Weg, Wasser zu verdienen.
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
2. die Wasserressource,
3. verfügbare Aktivitäten.

Das Quizduell bleibt ein fokussierter eigener Screen. Die spätere Strategie-/Aufbauebene darf im Querformat wachsen, wird aber nicht in den Battle-Screen gedrängt.

## Signatur-Elemente

- ruhige Wasserwellen statt Orbit-Ringe,
- Seerosen und Schilf statt Raumsonden und Scanlines,
- erkennbare Teichbewohner,
- kleine natürliche Bewegungen: Schilf im Wind, Blasen, Wasserkringel, Libellenflug,
- Wasser fließt nach einer Aktivität sichtbar in den Teich.

## Brand Voice

Warm, neugierig, knapp und leicht verspielt. Die AI darf im Quizduell fordern, aber die übergeordnete Welt fühlt sich nicht feindlich an. Der Teich ist ein Ort, den man pflegt und in den man zurückkehren möchte.

## Technische Leitlinie

Die deterministische Engine bleibt vom DOM und von Sprachmodellen getrennt. IP bleibt intern als Rating-/Berechnungswert erhalten, wird im UI aber als Wasserressource dargestellt. Die Spielregeln entscheiden über Wassergewinn, Schaden und Matchzustand; AI-Kommentare liefern nur Charakter.
