# Mobile-Export-Checkliste

## Aktueller Stand

Das Projekt trägt jetzt explizite Metadaten (`pwnd`, Version `0.1.0`, mobile-first Beschreibung), nutzt die Sensor-Orientierung und den `expand`-Stretch-Modus. Die Safe-Area-Logik ist im HUD vorbereitet. Ein echter Android-/iOS-Build wurde noch nicht behauptet.

Im aktuellen Sandbox-Stand sind nur Godot-Web-Export-Templates installiert. Android- und iOS-Export-Templates beziehungsweise Plattform-SDKs sind hier nicht vorhanden. Deshalb bleibt dieser Schritt eine reproduzierbare Vorbereitung und kein falscher Geräte-Test.

## Vor jedem Export

```bash
godot --headless --path godot/pwnd-prototype --editor --quit
godot --headless --path godot/pwnd-prototype --quit-after 120
godot --headless --path godot/pwnd-prototype --script res://tests/regression_test.gd
```

Alle drei Befehle müssen ohne Parser- oder Regressionfehler durchlaufen. Danach sollte der Export aus Godot heraus mit einem installierten Android- oder iOS-Template erfolgen, nicht aus einem unvollständigen Sandbox-Setup.

## Android-Testschritt

1. Godot Android Export Template passend zu **4.7.2** installieren.
2. Android SDK, Build Tools, JDK und ein Testgerät konfigurieren.
3. Ein Development-APK oder Run-on-Device-Build erzeugen.
4. Auf dem Gerät prüfen: Joystick, Kamera-Zone, Safe Area/Notch, Haptik, Audio-Toggle, Wassergrenze, Boots-Höhe und FPS-Snapshot.
5. Ergebnis mit Gerät, Auflösung, Orientierung und Beobachtung dokumentieren.

## iOS-Testschritt

1. Godot iOS Export Template passend zu **4.7.2** installieren.
2. Auf einem macOS/Xcode-Arbeitsplatz exportieren und signieren.
3. Auf einem realen Gerät dieselben Touch-, Safe-Area- und Performance-Punkte prüfen.
4. Keine Testergebnisse aus dem Editor oder aus einem virtuellen Display als iOS-Nachweis ausgeben.

## Abnahmekriterien für den offenen Geräteschritt

Der Punkt ist erst abgeschlossen, wenn mindestens ein realer Android- oder iOS-Test die Touch-Ziele, Safe Area/Notch, Spieler-/Watenhöhe und Performance dokumentiert. Der lokale Sandbox-Test bleibt wichtig, ersetzt den Gerätetest aber nicht.
