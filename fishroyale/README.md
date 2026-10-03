# Fish Royale

**Fish Royale** ist eine eigenständige Browser-App neben `pwnd`: ein kurzes, quizbasiertes Taktikduell in einer Unterwasser-Arena.

## Spielschleife

- Ein Match umfasst höchstens sechs Runden.
- Zu Beginn jeder Runde wird eine feste Quizfrage ohne Timer gestellt. Die drei Spielpläne **Riffwissen**, **Logiklab** und **Mathemeer** haben jeweils eine feste Reihenfolge mit sechs Fragen.
- Eine richtige Antwort gibt drei Taktik-Energie, eine falsche Antwort zwei. Eine falsche Antwort sperrt den Zug nicht.
- Danach wählt man eine von vier immer verfügbaren Karten und eine von drei Spuren.
- Gegnerangriff, Spur, Stärke und Verteidigung sind vor der eigenen Entscheidung sichtbar. Kartentypen folgen einem konstanten Konterkreis.
- Kartenwerte und Spielplan bleiben bei jeder Wiederholung gleich. Es gibt keine Accounts, In-App-Käufe, Evolutions, Beutekisten, Zufallsziehungen, Ranglisten, Serien, tägliche Belohnungen oder Hintergrundfortschritte.
- Das Browser-Spiel speichert weder Verlauf noch Ressourcen. Man kann jederzeit gehen.

## Aufbau

- `index.html` — Einstieg, Quizthemen, Arena, Zugauswertung und Ergebnis
- `fish-royale.css` — responsive Oberfläche und CSS/SVG-artige Arenaillustration
- `engine.js` — reine, deterministische Spiellogik und feste Fragen/Gegnerzüge
- `fish-royale.js` — zugängliche Bedienoberfläche
- `test/engine.test.cjs` — Tests der Fair-Play-Regeln und Kampfauflösung

## Lokal prüfen

Aus dem Repository-Root:

```sh
npm run test:fishroyale
```

Die Anwendung ist statisch und startet unter `/fishroyale/`.
