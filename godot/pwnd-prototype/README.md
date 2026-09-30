# pwnd — Godot 3D Vertical Slice

Der erste Proof-of-Fun für den begehbaren Teichgarten.

## Starten

```bash
godot --path godot/pwnd-prototype
```

Für eine reine Parser-/Editor-Prüfung:

```bash
godot --headless --path godot/pwnd-prototype --editor --quit
godot --headless --path godot/pwnd-prototype --quit-after 120
```

## Steuerung

- **WASD:** durch den Garten bewegen
- **Maus:** First-Person-Kamera
- **E:** Entensteg mit 60 Energie bauen
- **F:** nächstes Tier in der Nähe mit 20 Wasser entwickeln
- **Q:** echte Quizrunde öffnen
- **Esc:** Mauszeiger freigeben / wieder einfangen

Eine richtig beantwortete Frage gibt **28 Energie und 12 Wasser**. Eine falsche Antwort gibt **8 Energie** als kleine Lernbelohnung. Nach jeder Aktion werden Ressourcen, Tierentwicklung und gebaute Strukturen automatisch in `user://pwnd_save.json` gespeichert und beim nächsten Start geladen.

## Aktueller Scope

Die Szene enthält einen kleinen Teich mit Ufer, Flachwasser, Schilf, Seerosen und Steinen, eine First-Person-Bewegung mit verlangsamtem Waten, Frosch, Fisch und Ente mit einfachen Reaktionen, den Entensteg als erste Energie-Struktur sowie Wasserentwicklung für Tiere.

Das Quiz ist als eingeblendetes Multiple-Choice-Panel umgesetzt. Die Fragen sind zunächst lokal und fest im Prototypen hinterlegt; die Quiz-Engine und ein größerer Fragenkatalog folgen später. Die Szene nutzt weiterhin prozedural erzeugte Primitive statt finaler Assets.

## Persistenz

Der Spielstand wird lokal im Godot-Benutzerverzeichnis gespeichert. Es gibt bewusst noch keinen Cloud-Spielstand und keine Kontoanbindung. Zum Zurücksetzen des lokalen Prototypen kann die Datei `user://pwnd_save.json` gelöscht werden.

## Nächster Meilenstein

Als Nächstes folgen sichtbare Interaktionsmarkierungen, die vollständige dreistufige Frosch-Entwicklung und erstes Audio-/Wasserfeedback. Danach ist der Mobile-Steuerungs- und Performance-Test sinnvoll.
