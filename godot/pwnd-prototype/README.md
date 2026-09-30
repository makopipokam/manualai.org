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

Links befindet sich ein virtueller Joystick für die Bewegung. Eine Berührung und Ziehbewegung auf der rechten Bildschirmhälfte steuert die First-Person-Kamera. Die drei großen Aktionsbuttons starten das Quiz, bauen den Entensteg und entwickeln das nächstgelegene Tier. Alle interaktiven Flächen sind absichtlich groß genug für Daumenbedienung.

Die Desktop-Steuerung bleibt als Entwicklungsfallback erhalten: **WASD** bewegt, die Maus blickt, **E** baut, **F** entwickelt, **Q** öffnet das Quiz und **Esc** löst beziehungsweise fängt die Maus wieder ein.

Auf Touch-Geräten gibt es bei Aktionen zusätzlich einen kurzen Vibrationsimpuls, sofern das Gerät und die Plattform haptisches Feedback unterstützen. Die Anwendung funktioniert auch vollständig ohne diese Funktion.

## Spielschleife

Eine richtig beantwortete Frage gibt **28 Energie und 12 Wasser**. Eine falsche Antwort gibt **8 Energie** als kleine Lernbelohnung. Der Entensteg kostet 60 Energie, die Tierentwicklung kostet 20 Wasser pro Stufe. Nach jeder Aktion werden Ressourcen, Tierentwicklung und gebaute Strukturen automatisch in `user://pwnd_save.json` gespeichert und beim nächsten Start geladen.

Wenn sich der Spieler einem Tier nähert, erscheint ein zentraler Interaktionshinweis. Frosch, Fisch und Ente verändern bei der Entwicklung sichtbar ihre Farbe und Größe; die drei Entwicklungsstufen bleiben dadurch auch ohne Textlabel erkennbar. Ein entwickelter Frosch beobachtet den Spieler und kehrt nach Abstand wieder in seine Nähe zurück, während ein wilder Frosch flieht. Wasser, Seerosen und Schilf bewegen sich leicht, damit der Teich nicht statisch wirkt. Nach dem Bau des Entenstegs bewegt sich die Ente sichtbar zu ihrem neuen Habitat. Betritt der Spieler den Teich mit den Gummistiefeln, flieht der Fisch und animierte Ripples zeigen die Wasserbewegung.

## Aktueller Scope

Die Szene enthält einen kleinen Teich mit Ufer, Flachwasser, Schilf, Seerosen und Steinen, eine First-Person-Bewegung mit verlangsamtem Waten, drei Tiere mit Reaktionen, den Entensteg als erste Energie-Struktur, Wasserentwicklung, Interaktionshinweise und ein responsives Multiple-Choice-Quiz.

Das Quiz ist lokal und fest im Prototypen hinterlegt; die Quiz-Engine und ein größerer Fragenkatalog folgen später. Die Szene nutzt weiterhin prozedural erzeugte Primitive statt finaler Assets.

## Persistenz und Testgrenze

Der Spielstand wird lokal im Godot-Benutzerverzeichnis gespeichert. Es gibt bewusst noch keinen Cloud-Spielstand und keine Kontoanbindung. Zum Zurücksetzen des lokalen Prototypen kann die Datei `user://pwnd_save.json` gelöscht werden.

Die aktuelle automatisierte Prüfung umfasst Godot-Editor-Parsing und einen Headless-Runtime-Smoke-Test. Ein echter Test auf Android/iOS-Hardware steht noch aus; dafür werden im nächsten Schritt Exportprofil, Safe-Area-Prüfung und Performance-Messung ergänzt.

## Nächster Meilenstein

Als Nächstes folgen animierte Touch-Rückmeldungen, ein erster Android-Testbuild und die Performance-Prüfung auf einem realen Telefon. Danach wird die Steuerung anhand des Playtests feinjustiert.
