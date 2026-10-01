# pwnd — Godot 3D Vertical Slice

Der erste Proof-of-Fun für den begehbaren Teichgarten. Die Anwendung wird **mobile first** entwickelt und im Querformat als First-Person-Spiel gedacht.

> **Stand nach der Zweitprüfung:** Dies ist eine technische Rohfassung, kein auf Smartphone getesteter Build. Quiz-Fortschritt, Enten-Habitatregel, Touch-Reset, vertikale Tierbewegung und statische Kollisionen für Boden, Ufer, Steine und Entensteg sind inzwischen behoben bzw. ergänzt und durch [Regressionstests](tests/regression_test.gd) abgedeckt. Das Hochformat-Quiz wurde im simulierten 720×1280-Fenster verbessert; der HUD nutzt jetzt die verfügbare Display-Safe-Area mit Desktop-/Headless-Fallback. Echte Safe-Area- und Gerätetests sowie eine feinere Spieler-/Watenhöhe bleiben offen. Ursprüngliche Befunde: [REVIEW.md](REVIEW.md).

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

Links befindet sich ein virtueller Joystick für die Bewegung. Eine Berührung und Ziehbewegung auf der rechten Bildschirmhälfte steuert die First-Person-Kamera. Die drei großen Aktionsbuttons starten das Quiz, bauen den Entensteg und entwickeln das nächstgelegene Tier. Der große Pause-Button oben rechts öffnet ein eindeutiges Pause-Overlay. Daneben kann der lokale Teichklang über **SOUND ON/OFF** jederzeit ein- oder ausgeschaltet werden; die Auswahl wird im lokalen Spielstand gespeichert. Während der Pause stehen Bewegung, Audio und Welt-Updates still; mit **WEITER** kehrt der Spieler exakt in den Teich zurück. Das Overlay zeigt zusätzlich einen kleinen Diagnose-Snapshot aus FPS, Objektzahl, Viewport-Auflösung, Ausrichtung und erkannter Eingabemethode, damit ein echter Handytest ohne Debug-Konsole erste Performance- und Layout-Probleme sichtbar macht. Das HUD und die komplette mobile Kontrollschicht berechnen ihre Positionen bei jeder Viewport-Größenänderung neu und nutzen `DisplayServer.get_display_safe_area()` mit einem sicheren Vollviewport-Fallback, wenn Desktop oder Headless keine Safe-Area liefern. Ressourcen, Meldungen, Autosave-Hinweis, Fadenkreuz, Pause-/Sound-Buttons, Aktionsbuttons und Bewegungshinweis bleiben dadurch innerhalb der berechneten Ränder. Alle interaktiven Flächen sind absichtlich groß genug für Daumenbedienung.

Auch die visuelle Ruheposition des Joysticks wird aus derselben Safe-Area berechnet. Neue Bewegungs- oder Kamera-Touches, die außerhalb dieses Bereichs beginnen, werden ignoriert; ein bereits aktiver Touch darf weiterhin sauber loslassen, auch wenn der Finger den Rand verlässt.

Das Pause-Overlay verwendet ebenfalls ein festes, responsives Panel innerhalb der Safe-Area. Dadurch kann die Inhaltsgröße im Hochformat den **WEITER**-Button nicht mehr aus dem sichtbaren Bereich drücken; der Button bleibt mindestens 58 Pixel hoch.

Der Regressionstest prüft zusätzlich den kompletten Zustandswechsel: globale SceneTree-Pause, Spielerphysik, mobile Controls und Overlay-Sichtbarkeit werden gemeinsam pausiert und beim Resume wiederhergestellt.

Die Desktop-Steuerung bleibt als Entwicklungsfallback erhalten: **WASD** bewegt, die Maus blickt, **E** baut, **F** entwickelt, **Q** öffnet das Quiz und **Esc** löst beziehungsweise fängt die Maus wieder ein.

Auf Touch-Geräten gibt es bei Aktionen zusätzlich einen kurzen Vibrationsimpuls, sofern das Gerät und die Plattform haptisches Feedback unterstützen. Die Anwendung funktioniert auch vollständig ohne diese Funktion. Der Teich hat außerdem einen sehr leisen, lokal mitgelieferten Ambient-Loop; er wird nach jedem Loop automatisch neu gestartet und belastet keine Netzwerkverbindung.

## Spielschleife

Alle Belohnungen und Kosten liegen jetzt zentral in einer Ökonomie-Tabelle. Eine richtig beantwortete Frage gibt **28 Energie und 12 Wasser**, eine falsche Antwort **8 Energie** als kleine Lernbelohnung. Die Tierentwicklung kostet **20 Wasser pro Stufe** bei maximal drei Stufen. Der Entensteg kostet weiterhin 60 Energie, wobei Kosten, Bau-Reichweite, Plattform- und Pfosten-Geometrie, Farben und Enten-Zielposition in der Strukturdefinition liegen. Das HUD meldet die konkreten Beträge zurück, zum Beispiel `+28 Energie und +12 Wasser` oder `−20 Wasser`. Nach jeder Aktion werden Ressourcen, Tierentwicklung und gebaute Strukturen automatisch in `user://pwnd_save.json` gespeichert und beim nächsten Start geladen; negative, übergroße oder falsch typisierte Werte werden beim Laden auf sichere Grenzen zurückgeführt.

Wenn sich der Spieler einem Tier nähert, erscheint ein zentraler Interaktionshinweis. Frosch, Fisch und Ente verändern bei der Entwicklung sichtbar ihre Farbe und Größe; die drei Entwicklungsstufen bleiben dadurch auch ohne Textlabel erkennbar. Ein entwickelter Frosch beobachtet den Spieler und kehrt nach Abstand wieder in seine Nähe zurück, während ein wilder Frosch flieht. Wasser, Seerosen und Schilf bewegen sich leicht, damit der Teich nicht statisch wirkt. Vor dem Bau des Entenstegs weist der Hinweis **HABITAT: Entensteg für die Ente bauen** auf die datengetriebene Voraussetzung hin; danach bewegt sich die Ente sichtbar zu ihrem neuen Habitat. Die First-Person-Kamera zeigt nun gelbe Gummistiefel, die beim Gehen und Waten leicht wippen. Betritt der Spieler den Teich mit den Gummistiefeln, flieht der Fisch und animierte Ripples zeigen die Wasserbewegung. Die Tierdaten liegen zentral in Speziesdefinitionen: Entwicklungsfarben, Körperform, Position, Skalierung, Fluchtgeschwindigkeit und benötigte Struktur können damit erweitert werden, ohne die Reaktionslogik zu duplizieren.

Die Waten-Erkennung liest jetzt die **sichtbare, animierte Wasserfläche** statt eigener fest codierter Koordinaten. Damit lösen die Gummistiefel-Verlangsamung, Fischreaktion und Ripples auch am fernen und nahen Ende des sichtbaren Teichs aus; außerhalb der Fläche nicht. Das ist eine 2D-Flächenabfrage und keine eigene Wasserflächenkollision; die festen Ufer-/Hinderniskollisionen sind separat umgesetzt.

Boden, Ufersteine und der Entensteg besitzen jetzt eigene `StaticBody3D`-Boxkollisionen. Der Spieler bleibt dadurch auf dem Boden und wird von den Hindernissen gestoppt; Wasser, Seerosen und Schilf bleiben absichtlich durchquerbar. Die gelben Gummistiefel liegen nun mit ihrer Sohle nahe der Wasseroberfläche und bleiben über dem Boden; die Beziehung wird im Regressionstest geprüft.

Der Entensteg kann nur noch innerhalb seiner datengetriebenen Bau-Reichweite errichtet werden; ein zu weiter Bauversuch verbraucht keine Energie. Regressionstests prüfen sowohl die Reichweite als auch die Begrenzung von Ressourcen, Tierstufen und unbekannten Save-Feldern.

## Aktueller Scope

Die Szene enthält einen kleinen Teich mit Ufer, Flachwasser, Schilf, Seerosen und Steinen, eine First-Person-Bewegung mit verlangsamtem Waten, drei Tiere mit Reaktionen, den Entensteg als erste Energie-Struktur, Wasserentwicklung, Interaktionshinweise und ein responsives Multiple-Choice-Quiz.

Das Quiz ist lokal und fest im Prototypen hinterlegt; die Quiz-Engine und ein größerer Fragenkatalog folgen später. Die Szene nutzt weiterhin prozedural erzeugte Primitive statt finaler Assets.

## Persistenz und Testgrenze

Der Spielstand wird lokal im Godot-Benutzerverzeichnis gespeichert. Es gibt bewusst noch keinen Cloud-Spielstand und keine Kontoanbindung. Zum Zurücksetzen des lokalen Prototypen kann die Datei `user://pwnd_save.json` gelöscht werden.

Das Projekt ist für die nächste mobile Exportstufe vorbereitet: Version und Beschreibung sind in `project.godot` gesetzt, die Sensor-Orientierung und der `expand`-Stretch bleiben aktiv, und die reproduzierbare [Mobile-Export-Checkliste](MOBILE_EXPORT_CHECKLIST.md) trennt lokale Prüfungen klar von echten Android-/iOS-Gerätetests. Im aktuellen Sandbox-Setup sind keine Android-/iOS-Export-Templates installiert.

Die aktuelle automatisierte Prüfung umfasst Godot-Editor-Parsing, einen Headless-Runtime-Smoke-Test und gezielte Regressionstests für Quiz-Fortschritt, Antwortzuordnung, Enten-Habitat, Touch-Reset, horizontale Tierbewegung, die Grenzen der sichtbaren Wasserfläche, statische Weltkollisionen, die Gummistiefel-/Wasserhöhe, alle Safe-Area-Ränder und Hochformat-Quiz-Touchflächen (mindestens 44 Pixel bei simulierten 720×1280). Die Antwortflächen wurden zusätzlich in einem virtuellen Linux-Display gerendert und visuell geprüft. Ein echter Test auf Android/iOS-Hardware steht noch aus; Notches und Betriebssystem-Skalierung sind damit nicht abschließend verifiziert.

## Nächster Meilenstein

Die Safe-Area-Integration ist im HUD vorbereitet. Als Nächstes folgen Android-Testbuild, Notch-/Touch-Prüfung und Performance-Messung auf einem realen Telefon.
