# pwnd — Godot 3D Vertical Slice

Der erste Proof-of-Fun für den begehbaren Teichgarten. Die Anwendung wird **mobile first** entwickelt und im Querformat als First-Person-Spiel gedacht.

## Starten

```bash
godot --path godot/pwnd-prototype
```

Für eine reine Parser-/Editor-Prüfung:

```bash
godot --headless --path godot/pwnd-prototype --editor --quit
godot --headless --path godot/pwnd-prototype --quit-after 120
```

## Mobile-Steuerung

Links befindet sich ein virtueller Joystick für die Bewegung. Eine Berührung und Ziehbewegung auf der rechten Bildschirmhälfte steuert die First-Person-Kamera. Die drei großen Aktionsbuttons starten das Quiz, bauen den Entensteg und entwickeln das nächstgelegene Tier. Alle interaktiven Flächen sind absichtlich groß genug für Daumenbedienung und liegen innerhalb der Bildschirmränder.

Die Desktop-Steuerung bleibt als Entwicklungsfallback erhalten: **WASD** bewegt, die Maus blickt, **E** baut, **F** entwickelt, **Q** öffnet das Quiz und **Esc** löst beziehungsweise fängt die Maus wieder ein.

## Spielschleife

Eine richtig beantwortete Frage gibt **28 Energie und 12 Wasser**. Eine falsche Antwort gibt **8 Energie** als kleine Lernbelohnung. Der Entensteg kostet 60 Energie, die Tierentwicklung kostet 20 Wasser pro Stufe. Nach jeder Aktion werden Ressourcen, Tierentwicklung und gebaute Strukturen automatisch in `user://pwnd_save.json` gespeichert und beim nächsten Start geladen.

## Aktueller Scope

Die Szene enthält einen kleinen Teich mit Ufer, Flachwasser, Schilf, Seerosen und Steinen, eine First-Person-Bewegung mit verlangsamtem Waten, Frosch, Fisch und Ente mit einfachen Reaktionen, den Entensteg als erste Energie-Struktur, Wasserentwicklung für Tiere und ein responsives Multiple-Choice-Quiz.

Das Quiz ist lokal und fest im Prototypen hinterlegt; die Quiz-Engine und ein größerer Fragenkatalog folgen später. Die Szene nutzt weiterhin prozedural erzeugte Primitive statt finaler Assets.

## Persistenz und Testgrenze

Der Spielstand wird lokal im Godot-Benutzerverzeichnis gespeichert. Es gibt bewusst noch keinen Cloud-Spielstand und keine Kontoanbindung. Zum Zurücksetzen des lokalen Prototypen kann die Datei `user://pwnd_save.json` gelöscht werden.

Die aktuelle automatisierte Prüfung umfasst Godot-Editor-Parsing und einen Headless-Runtime-Smoke-Test. Ein echter Test auf Android/iOS-Hardware steht noch aus; dafür werden im nächsten Schritt Exportprofil, Safe-Area-Prüfung und Performance-Messung ergänzt.

## Nächster Meilenstein

Als Nächstes folgen sichtbare Interaktionsmarkierungen, die vollständige dreistufige Frosch-Entwicklung, Wasser-/Touch-Feedback sowie ein erster Android-Testbuild. Danach wird die Performance auf einem realen Telefon geprüft.
