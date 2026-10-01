# pwnd — Godot 3D Vertical Slice

Der erste Proof-of-Fun für den begehbaren Teichgarten. Die Anwendung wird **mobile first** entwickelt und im Querformat als First-Person-Spiel gedacht.

> **Stand nach der Zweitprüfung:** Dies ist eine technische Rohfassung, kein auf Smartphone getesteter Build. Quiz-Fortschritt, Enten-Habitatregel, Touch-Reset und vertikale Tierbewegung sind inzwischen behoben und durch [Regressionstests](tests/regression_test.gd) abgedeckt. Das Hochformat-Quiz wurde im simulierten 720×1280-Fenster verbessert; echte Safe-Area- und Gerätetests sowie Weltkollision bleiben offen. Ursprüngliche Befunde: [REVIEW.md](REVIEW.md).

## Starten

```bash
godot --path godot/pwnd-prototype
```

Für eine reine Parser-/Editor-Prüfung:

```bash
godot --headless --path godot/pwnd-prototype --editor --quit
godot --headless --path godot/pwnd-prototype --quit-after 120
godot --headless --path godot/pwnd-prototype --script res://tests/regression_test.gd
```

## Mobile-Steuerung

Links befindet sich ein virtueller Joystick für die Bewegung. Eine Berührung und Ziehbewegung auf der rechten Bildschirmhälfte steuert die First-Person-Kamera. Die drei großen Aktionsbuttons starten das Quiz, bauen den Entensteg und entwickeln das nächstgelegene Tier. Der große Pause-Button oben rechts öffnet ein eindeutiges Pause-Overlay. Daneben kann der lokale Teichklang über **SOUND ON/OFF** jederzeit ein- oder ausgeschaltet werden; die Auswahl wird im lokalen Spielstand gespeichert. Während der Pause stehen Bewegung, Audio und Welt-Updates still; mit **WEITER** kehrt der Spieler exakt in den Teich zurück. Das Overlay zeigt zusätzlich einen kleinen Diagnose-Snapshot aus FPS, Objektzahl, Viewport-Auflösung, Ausrichtung und erkannter Eingabemethode, damit ein echter Handytest ohne Debug-Konsole erste Performance- und Layout-Probleme sichtbar macht. Das HUD berechnet seine Abstände und Positionen bei jeder Viewport-Größenänderung neu, hält Ressourcen und Meldungen innerhalb sicherer Ränder und zentriert das Fadenkreuz auch auf schmalen oder hohen Handyformaten. Alle interaktiven Flächen sind absichtlich groß genug für Daumenbedienung.

Die Desktop-Steuerung bleibt als Entwicklungsfallback erhalten: **WASD** bewegt, die Maus blickt, **E** baut, **F** entwickelt, **Q** öffnet das Quiz und **Esc** löst beziehungsweise fängt die Maus wieder ein.

Auf Touch-Geräten gibt es bei Aktionen zusätzlich einen kurzen Vibrationsimpuls, sofern das Gerät und die Plattform haptisches Feedback unterstützen. Die Anwendung funktioniert auch vollständig ohne diese Funktion. Der Teich hat außerdem einen sehr leisen, lokal mitgelieferten Ambient-Loop; er wird nach jedem Loop automatisch neu gestartet und belastet keine Netzwerkverbindung.

## Spielschleife

Alle Belohnungen und Kosten liegen jetzt zentral in einer Ökonomie-Tabelle. Eine richtig beantwortete Frage gibt **28 Energie und 12 Wasser**, eine falsche Antwort **8 Energie** als kleine Lernbelohnung. Die Tierentwicklung kostet **20 Wasser pro Stufe** bei maximal drei Stufen. Der Entensteg kostet weiterhin 60 Energie, wobei Kosten, Plattform- und Pfosten-Geometrie, Farben und Enten-Zielposition in der Strukturdefinition liegen. Das HUD meldet die konkreten Beträge zurück, zum Beispiel `+28 Energie und +12 Wasser` oder `−20 Wasser`. Nach jeder Aktion werden Ressourcen, Tierentwicklung und gebaute Strukturen automatisch in `user://pwnd_save.json` gespeichert und beim nächsten Start geladen.

Wenn sich der Spieler einem Tier nähert, erscheint ein zentraler Interaktionshinweis. Frosch, Fisch und Ente verändern bei der Entwicklung sichtbar ihre Farbe und Größe; die drei Entwicklungsstufen bleiben dadurch auch ohne Textlabel erkennbar. Ein entwickelter Frosch beobachtet den Spieler und kehrt nach Abstand wieder in seine Nähe zurück, während ein wilder Frosch flieht. Wasser, Seerosen und Schilf bewegen sich leicht, damit der Teich nicht statisch wirkt. Vor dem Bau des Entenstegs weist der Hinweis **HABITAT: Entensteg für die Ente bauen** auf die datengetriebene Voraussetzung hin; danach bewegt sich die Ente sichtbar zu ihrem neuen Habitat. Die First-Person-Kamera zeigt nun gelbe Gummistiefel, die beim Gehen und Waten leicht wippen. Betritt der Spieler den Teich mit den Gummistiefeln, flieht der Fisch und animierte Ripples zeigen die Wasserbewegung. Die Tierdaten liegen zentral in Speziesdefinitionen: Entwicklungsfarben, Körperform, Position, Skalierung, Fluchtgeschwindigkeit und benötigte Struktur können damit erweitert werden, ohne die Reaktionslogik zu duplizieren.

Die Waten-Erkennung liest jetzt die **sichtbare, animierte Wasserfläche** statt eigener fest codierter Koordinaten. Damit lösen die Gummistiefel-Verlangsamung, Fischreaktion und Ripples auch am fernen und nahen Ende des sichtbaren Teichs aus; außerhalb der Fläche nicht. Das ist eine 2D-Flächenabfrage, noch **keine Wasser- oder Uferkollision**.

## Aktueller Scope

Die Szene enthält einen kleinen Teich mit Ufer, Flachwasser, Schilf, Seerosen und Steinen, eine First-Person-Bewegung mit verlangsamtem Waten, drei Tiere mit Reaktionen, den Entensteg als erste Energie-Struktur, Wasserentwicklung, Interaktionshinweise und ein responsives Multiple-Choice-Quiz.

Das Quiz ist lokal und fest im Prototypen hinterlegt; die Quiz-Engine und ein größerer Fragenkatalog folgen später. Die Szene nutzt weiterhin prozedural erzeugte Primitive statt finaler Assets.

## Persistenz und Testgrenze

Der Spielstand wird lokal im Godot-Benutzerverzeichnis gespeichert. Es gibt bewusst noch keinen Cloud-Spielstand und keine Kontoanbindung. Zum Zurücksetzen des lokalen Prototypen kann die Datei `user://pwnd_save.json` gelöscht werden.

Die aktuelle automatisierte Prüfung umfasst Godot-Editor-Parsing, einen Headless-Runtime-Smoke-Test und gezielte Regressionstests für Quiz-Fortschritt, Antwortzuordnung, Enten-Habitat, Touch-Reset, horizontale Tierbewegung, die Grenzen der sichtbaren Wasserfläche und Hochformat-Quiz-Touchflächen (mindestens 44 Pixel bei simulierten 720×1280). Die Antwortflächen wurden zusätzlich in einem virtuellen Linux-Display gerendert und visuell geprüft. Ein echter Test auf Android/iOS-Hardware steht noch aus; Notches und Betriebssystem-Skalierung sind damit nicht abgedeckt.

## Nächster Meilenstein

Als Nächstes werden Weltkollision, Spielerhöhe und sichere Bildschirmränder für Notches stabilisiert. Erst danach folgen Android-Testbuild und Performance-Messung auf einem realen Telefon.
