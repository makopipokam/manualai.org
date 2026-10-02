# Quiz–Teich-Integrationsvertrag v0.1

**Status:** Implementierungsgrenze für die spätere Zusammenführung von Quiz-Beta und pwnd-Hauptspiel.

## Ziel

Der Teichzustand des Strategie-Hauptspiels ist die **autoritative Quelle** für Ressourcen, Gebäude, Lagerlimits, Truppen, Liga und Revision. Das Quiz ist eine Aktivität, die über eine geprüfte Transaktion eine begrenzte Belohnung beantragen kann. Das Quiz darf keinen vollständigen Teichzustand aus dem Browser als Wahrheit speichern.

## Gemeinsame Identität

Jede serverseitige Aktion ist an folgende Werte gebunden:

```json
{
  "playerId": "player-…",
  "pondId": "pond-…",
  "pondRevision": 42,
  "rulesetVersion": 2
}
```

- `playerId` wird aus der authentifizierten Sitzung abgeleitet; der Client darf damit keinen fremden Spieler auswählen.
- `pondId` wird serverseitig auf Besitz oder eine ausdrücklich erlaubte Zugriffsrolle geprüft.
- `pondRevision` dient der Konflikterkennung und ersetzt keine Autorisierung.
- `rulesetVersion` wird bei Wirtschafts- und Kampfregeln mitgespeichert.

## Quizversuch

Ein Versuch besitzt eine eigene ID und einen eigenen Lebenszyklus:

```json
{
  "attemptId": "quiz-…",
  "playerId": "player-…",
  "pondId": "pond-…",
  "mode": "free",
  "topicId": "nature",
  "questionSetVersion": "ai-static-48-v1",
  "startedAt": "server-time",
  "status": "active",
  "answers": [],
  "lastSequence": 0
}
```

Erlaubte Statuswerte:

- `active` – Fragen können beantwortet werden;
- `completed` – genau einmal abgerechnet;
- `abandoned` – keine Belohnung oder nach definierter Kulanzregel;
- `invalid` – serverseitig abgelehnt, mit Auditgrund.

## Abschlussaktion

Der künftige Server-Endpunkt soll semantisch einer Aktion wie `POST /api/quiz-attempts/:attemptId/complete` entsprechen. Der Request enthält keine fertigen Ressourcenwerte:

```json
{
  "lastSequence": 8,
  "idempotencyKey": "attempt-…-complete",
  "clientQuestionHashes": ["…"]
}
```

Der Server prüft:

1. Sitzung, `playerId` und Zugriff auf `pondId`;
2. Versuchstatus und Sequenznummern;
3. Frageversion, Antwortdaten und No-Repeat-Regel;
4. Belohnungsgrenzen, Tages-/Aktivitätslimits und Lagerlimits;
5. aktuelle Teichrevision sowie Ruleset-Version;
6. Idempotency-Key gegen doppelte Gutschrift.

Danach schreibt er atomar:

- Kompetenz-/Skillfortschritt des Spielers;
- begrenzte Quizbelohnung in den Teichressourcen;
- `completed`-Status und Ergebnisbericht;
- erhöhte Teichrevision;
- Audit-/Transaktionsereignis.

Eine Wiederholung mit derselben Idempotency-ID liefert dasselbe Ergebnis, erzeugt aber keine zweite Gutschrift.

## Antwort- und Content-Regeln

- Antwortschlüssel für servergewertete, ressourcenrelevante Fragen werden nicht vor der Antwort an den Browser gesendet.
- KI-generierte Fragen dürfen nur nach Schema-, Fakten-, Eindeutigkeits- und Dublettenprüfung wertvolle Ressourcen vergeben.
- Jede Frage erhält `questionId`, `questionSetVersion`, `promptHash`, `topicId`, `skill`, `difficulty` und einen Prüfstatus.
- Innerhalb eines laufenden Versuchs darf eine identische oder promptgleiche Frage nicht erneut erscheinen.
- Wenn ein Pool erschöpft ist, wird eine neue geprüfte Quelle geladen oder der Versuch sauber beendet. Eine bereits beantwortete Frage darf nicht als stiller Fallback erneut erscheinen.

## Frontend-Regel

Die Quiz-Beta darf bis zur Existenz dieses serverseitigen Transaktionsendpunkts weiterhin lokal demonstrieren. Lokale Werte sind als **Demo-/Offline-Zustand** zu kennzeichnen und dürfen nicht automatisch als vertrauenswürdige Hauptspielwährung in PvP, Liga oder Beute übernommen werden.

### Umgesetzter lokaler Vertical Slice (2026-10-02)

Der erste **spielbare Prototyp** verwendet weiterhin ausschließlich den bisherigen Schlüssel `pwnd-profile` in `localStorage`. Bestehende Ressourcen, Upgrades und Entdeckungen werden weitergelesen; das optionale Feld `pondDemo` enthält bis zu drei Produzenten und die IDs bereits abgerechneter Quizversuche. Alte Solar-Spielstände mit `lastClaimAt` werden übernommen. Ein freier oder Duellversuch erhält bei Matchbeginn eine zufällige ID; der Abschluss verändert Ressourcen und ID-Liste in **einem** gespeicherten Profil. Doppelte Abschlüsse desselben laufenden Versuchs werden ignoriert. Beschädigtes JSON wird vor einem Demo-Neustart als `pwnd-profile-recovery` gesichert; veraltete Tabs und gescheiterte Schreibvorgänge zeigen eine Warnung statt eines scheinbar erfolgreichen Baus oder Quizabschlusses. Ein unterbrochener Quizversuch wird noch nicht fortgesetzt; bereits beantwortete Fragen aktualisieren weiterhin das lokale Skillprofil.

Das 10×10-Raster hat einen festen 2×2-Teichkern. Je eine 2×2-Solar-Seerose (120 ⚡/80 💧/20 🌬️/10 ❤️), ein 2×2-Quellbecken (80 ⚡/120 💧/20 🌬️/10 ❤️) und ein 2×2-Schilf-Windrad (100 ⚡/80 💧/120 🌬️/15 ❤️) können kollisionsfrei platziert und kostenlos umgesetzt werden. Sie erscheinen an ihrer entsprechenden Stelle animiert im oberen Teich und erzeugen je 120 Energie, Wasser bzw. Luft pro Stunde. **GDD-v0.2-Boni:** Solar + Quelle mit Footprint-Manhattan-Distanz ≤ 2 gibt +300 ⚡/h; Windrad + Quelle mit Distanz ≤ 3 gibt +120 🌬️/h. Goldene Rasterplätze zeigen die Positionen im Voraus. Beim Platzieren/Umsetzen wird bereits verdiente Produktion mit dem *alten* Bonus im Gebäude zwischengespeichert; der neue Bonus gilt erst ab dann. Diese Bank wird mit der Produktion der neuen Position zusammen abgeholt.

Die Ernte wird bewusst per Button abgeholt; **nur die Produzentenernte** ist pro Zeitintervall auf acht Offline-Stunden und je Ressource auf einen lokalen Vorrat von 2.000 begrenzt. Bei vollem Vorrat werden ganze überschüssige Produktionseinheiten nicht für spätere Ausgaben geparkt; unterhalb der Grenze bleibt eine angebrochene Produktionszeit als Bruchrest erhalten. Bestehende Quizressourcen können über 2.000 liegen und werden nicht nachträglich abgeschnitten. Die Baukosten, Raten und Nachbarschaft entsprechen der GDD-v0.2-Balance, ersetzen aber noch nicht deren vollständige Economy-Engine, Lager- oder Serverzeitregeln. Das Bauen ist wie im GDD von Beginn an möglich, nicht künstlich hinter dem Quiz gesperrt; Quizbelohnungen und Baukosten wirken auf **denselben** lokalen Vorrat.

Das ist eine **Browser-Demo, kein sicherer Account-Spielstand**: Ein Spieler kann `localStorage` oder die Gerätezeit ändern, verschiedene Geräte teilen keinen Zustand, und serverseitige Frageprüfung, Authentifizierung und atomare Datenbanktransaktionen fehlen. Die rein lokale Einmal-Abrechnung verhindert versehentliche doppelte Klicks, nicht Manipulation oder gleichzeitig beginnende Schreibvorgänge aus mehreren Tabs. Veraltete Tabs werden nach Möglichkeit vor einem Überschreiben erkannt; **garantierte Cross-Tab-Serialisierung ist ohne autoritativen Server nicht zugesagt**. Der weitere Vertrag und die Abnahmepunkte unten beschreiben daher nach wie vor das **noch nicht implementierte** produktive Ziel.

Die spätere UI-Antwort soll den aktualisierten Teich-Snapshot zurückgeben:

```json
{
  "attempt": {
    "attemptId": "quiz-…",
    "status": "completed",
    "correctAnswers": 6,
    "totalQuestions": 8
  },
  "pond": {
    "pondId": "pond-…",
    "revision": 43,
    "resources": {
      "energy": 1008,
      "water": 306,
      "air": 138,
      "love": 77
    }
  },
  "transactionId": "txn-…"
}
```

## Trennung der Engines

Die Zusammenführung darf keine globale Namenskollision erzeugen:

- `QuizEngine` – Frageauswahl, Antwortauswertung, Kompetenzprofil;
- `EconomyEngine` – Produktion, Lager, Kosten, Belohnungs- und Transaktionsregeln;
- `BattleEngine` – deterministische 10×10-Kampfsimulation, Seed und Replay-Hash.

Jede Engine führt ihre eigene Versionsnummer. Ein Quizabschluss darf keine `BattleEngine`-Zufallswerte verwenden; ein Kampf darf kein LLM-Ergebnis zur Laufzeit als Simulationszufall verwenden.

## Sicherheits- und Konsistenzgrenze

Ein vollständiges, vom Browser geliefertes `base`-Objekt darf nicht als autoritativer Schreibvorgang für Ressourcen, Gebäudelevel oder Liga akzeptiert werden. Der Server verarbeitet stattdessen typisierte Aktionen wie:

- `claimProduction`;
- `placeBuilding`;
- `upgradeBuilding`;
- `trainUnits`;
- `completeQuizAttempt`;
- `commitBattle`.

Jede Aktion prüft Besitzer, Kosten, Voraussetzungen, Revision, Idempotenz und Ruleset serverseitig. Revision `409` verhindert verlorene Updates, aber nicht die Erzeugung gefälschter Ressourcen; dafür sind diese Aktionsprüfungen zwingend.

## Erste gemeinsame Abnahme

Der erste Vertical Slice gilt als erfolgreich, wenn ein authentifizierter Spieler:

1. einen Teich laden kann;
2. eine Eulenrunde mit acht eindeutigen Fragen spielt;
3. die Belohnung genau einmal gutgeschrieben bekommt;
4. nach Reload denselben Ressourcen- und Skillstand sieht;
5. mit der Belohnung ein zulässiges Gebäude platzieren kann;
6. bei einer manipulierten Belohnung oder einer zweiten Abschlussaktion serverseitig abgelehnt wird.
