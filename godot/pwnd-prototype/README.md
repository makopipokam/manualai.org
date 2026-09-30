# pwnd — Godot 3D Vertical Slice

Der erste Proof-of-Fun für den begehbaren Teichgarten.

## Starten

```bash
godot --path godot/pwnd-prototype
```

Für eine reine Parser-/Editor-Prüfung:

```bash
godot --headless --path godot/pwnd-prototype --editor --quit
```

## Steuerung

- **WASD:** durch den Garten bewegen
- **Maus:** First-Person-Kamera
- **E:** Entensteg mit Energie bauen
- **F:** nächstes Tier in der Nähe mit Wasser entwickeln
- **Q:** Demo-Quizbelohnung erhalten (+28 Energie, +12 Wasser)
- **Esc:** Mauszeiger freigeben / wieder einfangen

## Aktueller Scope

- kleiner Teich mit Ufer, Flachwasser, Schilf, Seerosen und Steinen
- First-Person-Bewegung
- langsamere Bewegung im flachen Wasser
- Frosch, Fisch und Ente
- einfache Tierreaktionen: ruhig, beobachtet, flieht, neugierig
- Entensteg als erste Energie-Struktur
- Wasserentwicklung für Tiere
- provisorisches HUD

## Bewusste Platzhalter

- Die Q-Taste ersetzt vorerst die Quizaktivität.
- Die Szene nutzt prozedural erzeugte Primitive statt finaler Assets.
- Der Spielstand ist in dieser ersten Szene noch nicht persistent gespeichert.
- Touch-Steuerung und Mobile-Optimierung folgen erst nach dem Proof-of-Fun-Test.

## Nächster Meilenstein

1. tatsächliches Quizfenster als Aktivität einbauen,
2. lokale Speicherung ergänzen,
3. Interaktionsmarkierungen für Tiere und Strukturen hinzufügen,
4. Frosch-Entwicklung mit sichtbaren drei Stufen ausarbeiten,
5. erstes Audio- und Wasserfeedback ergänzen.
