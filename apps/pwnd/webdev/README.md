# pwnd – Pond Strategy

Ein Teich-Aufbauspiel mit Quiz-Duellen und Angriffen auf andere Teiche.
Jede Spielregel liegt **serverautoritativ** in `shared/` und wird vom Express-Server durchgesetzt;
der Browser ist eine dünne Ansicht über der API.

## Spielüberblick

| Ebene | Inhalt |
| --- | --- |
| **Teich** | 10×10-Raster, Kern in der Mitte, vier Produzenten, Nachbarschaftsboni, Reiherwacht, Truppenlager |
| **Quiz** | Freies Quiz (8 Runden) und Duelle gegen Schatten-Eule, Rotfuchs, Polarfuchs und Fennek |
| **Strategie** | Gegnersuche nach Trophäen, Aufstellung am Rand, deterministische Schlacht, Beute, Ligen |

### Fünf Ressourcen

| Ressource | Quelle | Verwendung |
| --- | --- | --- |
| ⚡ Energie | Solar-Seerose | Gebäude, Freischaltungen |
| 💧 Wasser | Quellbecken | Gebäude, Truppen |
| 🌬️ Luft | Schilfmühle | Gebäude, Upgrades |
| ❤️ Liebe | Quiz | Bewohner einladen, Truppen; **nicht plünderbar** |
| 🍯 Honig | Bienenwiese + Quiz-Combos | Truppenausbildung, Reiherwacht; plünderbar |

Honig ist die fünfte und letzte Ressource: ohne Honig keine Truppen, also kein Angriff.

## Projektstruktur

```
server/            Express-API, Migrationen, Dienste (pond, quiz, strategy, questions, counters)
shared/            Regelwerk als UMD-Module: economy, quiz-engine, battle-engine, progression, bots
public/            Statisches Frontend (index.html, js/*.js, pwnd.css, strategy.css)
content/           Server-seitiger Fragenpool
test/unit/         Regeltests ohne Datenbank
test/api/          Integrationstests gegen die verwaltete Datenbank
docs/              Plan und Arbeitsnotizen
```

`shared/` wird von Node (`require`) **und** vom Browser (`window.Pwnd*`) geladen, damit Vorschauen
im Client und die Berechnung auf dem Server dieselben Formeln benutzen.

## Entwicklung

```bash
pnpm install
node server/migrate.mjs     # Schema anlegen/aktualisieren (läuft auch beim Start)
pnpm dev                    # Server auf 0.0.0.0:3000
pnpm test                   # Regeltests
pnpm test:api               # Integrationstests (benötigt DATABASE_URL)
```

Benötigte Umgebung: `DATABASE_URL`, `MANUS_API_URL`/`MANUS_API_KEY` (Fragen-KI),
`MANUS_OAUTH_*` und `JWT_SECRET` (Anmeldung).

## Betrieb

* **Produktion**: Container aus `Dockerfile`, Start `node server/index.mjs`, Health unter `/api/health`.
* **Migrationen** laufen idempotent beim Start.
* **Sitzung**: JWT im Cookie `pwnd_session` (`SameSite=None; Secure`), damit die Vorschau im Iframe funktioniert.

## Determinismus

Schlachten laufen über einen Seed (`battleId`) und werden als Frames gespeichert.
Der Replay-Hash in `battles.replay_hash` erlaubt den Nachweis, dass Client-Replay und
Serverberechnung identisch sind.
