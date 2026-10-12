# pwnd – serverautoritatives Pond Strategy-Rebuild

Dieser Ordner enthält einen vollständigen, eigenständigen Snapshot des pwnd-Neuaufbaus aus dem Manus-Projekt. Er wurde aus dessen akzeptiertem Stand `d7008117d04a10e712c1078549cc8751ff77842f` übernommen und unter `apps/pwnd/rebuild/` abgelegt, ohne die bisherige GitHub-Pages-Demo `apps/pwnd/index.html` zu ersetzen.

## Inhalt

- `public/` – Vanilla-JS-Weboberfläche, Styles, Assets und Routenmanifest
- `server/` – Express-API, Manus-OAuth, MySQL-Zugriff, Migrationen und Spielservices
- `shared/` – deterministische Quiz-, Teich-, Battle-, Matchmaking- und Progressionslogik
- `content/questions.json` – Fragenkatalog für die serverseitige Auswahl
- `test/` – Unit- und API-Regressionstests
- `docs/plan.md`, `TODO.md`, `docs/agent-notes.md` – Produktregeln, Umsetzungsstand und technische Entscheidungen
- `ai-context/` – Gesprächsarchiv und Handoff für zukünftige KI-Arbeit

## Lokal starten

Voraussetzungen: Node.js 22+, pnpm gemäß `package.json`, eine erreichbare MySQL-kompatible Datenbank und die zur Manus-OAuth-App gehörenden Umgebungsvariablen. **Keine Geheimnisse in dieses Repository eintragen.**

```bash
cd apps/pwnd/rebuild
pnpm install --frozen-lockfile
pnpm test
```

Für API- und Datenbanktests zusätzlich erst eine eigens dafür vorgesehene Testdatenbank und die erforderlichen Umgebungsvariablen konfigurieren; anschließend `pnpm test:api` verwenden. Die API-Tests wurden bei dieser Übernahme nicht gegen eine produktive oder gemeinsam genutzte Datenbank ausgeführt.

Zum Starten der App: `pnpm start`. Das Startskript führt die idempotenten Migrationen aus und startet Express auf `PORT` oder Port 3000. Mit Docker: `docker build -t pwnd-rebuild .` aus diesem Verzeichnis.

## Hosting-Hinweis

Das bestehende `manuelpicard/manualai.org`-Repository wird über **GitHub Pages statisch** veröffentlicht. GitHub Pages kann den Node-/Express-Server und die MySQL-Migrationen nicht ausführen. Daher ist der neue serverautorititative Modus durch den Upload **noch nicht live geschaltet**. Die vorhandene Demo bleibt vorerst die Standardseite. Für den Online-Betrieb braucht pwnd einen Node-Host, eine Datenbank und konfigurierte OAuth-/LLM-Umgebungsvariablen; erst dann sollte die Oberfläche auf den neuen Backend-Endpunkt zeigen.

Für Gesprächsverlauf, Anforderungen, Regeln, Herkunft und nächste Schritte siehe [AI_HANDOFF.md](ai-context/AI_HANDOFF.md) und [CONVERSATION.md](ai-context/CONVERSATION.md).
