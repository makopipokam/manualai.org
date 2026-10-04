# pidgeons & crows

Ein deutschsprachiges, rundenbasiertes Strategiespiel um die Kontrolle über einen Park. Die Tauben verteidigen ihr Revier gegen eine Krähen-KI.

## Spielen

Dieses Verzeichnis enthält den portablen Godot-Webexport samt Lizenzhinweisen. Öffne `index.html` über einen Webserver (nicht direkt per `file://`). Lokal, vom Repository-Wurzelverzeichnis aus:

```bash
python3 -m http.server 8000
```

Rufe danach `http://localhost:8000/TaubenVSKr%C3%A4hen/` auf. Der bestehende Pfad bleibt `/TaubenVSKrähen/`.

## Regeln

- Klicke **Park verteidigen**, um eine Partie zu starten.
- Wähle eine Taube in einem kontrollierten Gebiet und danach ein grün markiertes Nachbargebiet.
- Jede Taube kann einmal handeln; du hast pro Zug insgesamt zwei Aktionen. Wenn du fertig bist, klicke **Zug beenden**, damit die Krähen-KI ihren Zug ausführt.
- Ein Angriff zieht eine Kraft ab. Nach zwei Treffern wird eine Einheit vertrieben.
- Wer zuerst **vier von fünf Gebieten** kontrolliert, gewinnt. Wenn keine Taube mehr im Park ist, verlieren die Tauben.
- **Pause** oder `Esc` hält die Partie an; am Ende kannst du neu starten.

Es gibt keine Anmeldung, Käufe oder Onlinefunktionen. Die KI und das Match laufen lokal im Browser.
