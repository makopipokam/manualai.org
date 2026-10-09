# Plan: pwnd – Pond Strategy, Neuaufbau ab GitHub-Prototyp (Option 3)

## 1. Ziel und Ausgangslage

**Ziel:** pwnd als Manus-Webdev-Projekt neu aufbauen. Basis ist der Prototyp aus `makopipokam/manualai.org/pwnd`. Daraus wird ein serverautoritatives Teich-Strategiespiel mit Angriffen und **Matchmaking & Progression v1**. Langfristig soll es ein Aufbauspiel im Stil von Clash of Clans werden.

**Bereits erledigt** (vor dem Plan Mode):

- Das Original-Projekt `wdp_60613dfb9996c1292df21c25` ließ sich nicht öffnen, weil es zu einer anderen Projekt-Identität gehört.
- Neues Webdev-Projekt angelegt:
  - **„pwnd – Pond Strategy“**, Resource `manus-resource://manus-webdev/project/wdp_22683093c8219f5521e15902`
  - Projektordner `/home/ubuntu/pwnd`, Template `flexible`, `server` + `database` (Managed MySQL)
  - Preview-Port 3000. Der Ordner ist bis auf `.git` leer.
- Das GitHub-Repo wurde nur lesend nach `/home/ubuntu/manualai.org` geklont. Dort wird nichts gepusht.

**Quelle der Regeln:**

- Replay `https://manus.im/share/e4G3ZsSbNA6RkxaAa6V2PD`:
  - 6 Angriffe pro UTC-Tag
  - 2.500 Loot-Einheiten pro Tag
  - 4 h Ziel-Cooldown
  - Matchmaking über Trophäen/Teichstufe
  - tägliche, reproduzierbare Rotation
  - Ligen, Tageszähler, Schutzfilter, Verteidigungsberichte
  - deterministischer Bot-Pool
- „Dörfer“ (Clans) sind ausdrücklich die **nächste** Phase und werden in diesem Plan nicht gebaut.

**Prototyp-Bestand, der übernommen wird:**

- `pwnd-engine.js`: Quiz-Engine mit Schaden, Combo, adaptiver Frageauswahl, Skill-Update, Near-Duplicate-Erkennung, Elo und Ressourcenbelohnung.
- `pond-demo.js`: 10×10-Raster mit 2×2-Kern bei (4,4) und drei 2×2-Produzenten:

  | Gebäude | Kosten ⚡/💧/🌬️/❤️ |
  |---|---|
  | Solar-Seerose | 120/80/20/10 |
  | Quellbecken | 80/120/20/10 |
  | Schilf-Windrad | 100/80/120/15 |

  - Produktion 120/h je Gebäude.
  - Boni: Sonnenwasser +300 ⚡/h bei Distanz ≤ 2, Schilfstrom +120 🌬️/h bei Distanz ≤ 3.
  - Produktions-Cap 2.000 pro Ressource, höchstens 8 h Offline-Nachholung, manuelles Abholen, kostenloses Umsetzen.
- Supabase-RPC-Logik (`pwnd_accrue`, `pwnd_pond_action`) mit Zeilensperre, Revisionsprüfung und Serverzeit.
- `pwnd.js`, `index.html`, `pwnd.css`: Hub, Wachstumskarte mit 6 Entdeckungen, Eulen- und Fuchs-Quiz-Flow, Upgrades.
- `pwnd-ai-questions.json` mit 48 Fragen plus 26 eingebaute Fragen.
- Generierung über `api/pwnd-question.js`: dort Anthropic, hier ersetzt durch Manus LLM.
- Fuchs- und Eulen-Assets (`assets/*.webp`) sowie die Tests.

## 2. Stack-Entscheidung

- **Node 22 + Express**, Server als ESM in `.mjs`. Dazu `mysql2/promise`, `jose` für HS256-JWT und `cookie`.
- pnpm wird in `package.json` auf `pnpm@10.18.0` gepinnt. Freigegebene Build-Skripte stehen in `pnpm-workspace.yaml`.
- **Vanilla-Frontend** aus dem Prototyp bleibt erhalten: Screens, CSS und UMD-Engines. Express liefert es statisch aus. Es gibt keinen React-Umbau.
- **Gemeinsame UMD-Engines** in `shared/` laufen im Browser und in Node über `createRequire`. Sie sind deterministisch und ohne DOM.
- **Login: Manus OAuth.**
  - Ablauf: `/api/oauth/callback` → Nonce-Prüfung über `__Host-oauth_state` → `ExchangeToken` → `GetUserInfo`.
  - Session-Cookie `webdev_app_session`: JWT HS256 mit `MANUS_JWT_SECRET` und Payload `{openId, appId, name}`, Prüfung `appId === MANUS_PROJECT_ID`.
  - Cookie-Attribute `HttpOnly; Secure; SameSite=None`.
  - Den Login-Start baut der Client mit `window.location.origin`.
  - Supabase-OTP entfällt.
- **LLM:** `POST $MANUS_API_URL/v1/chat/completions`, Modell explizit gewählt, Validierung wie im Prototyp. Fallback ist der statische Pool.
- **Deploy:**
  - `Dockerfile` mit `node:22-slim`, pnpm-Install `--frozen-lockfile --prod`, `EXPOSE 3000`, `PORT` wird beachtet.
  - Config `deploy.healthPath=/api/health`.
  - Migrationen laufen beim Start idempotent über eine Versionstabelle.

## 3. Projektstruktur

```text
/home/ubuntu/pwnd
├── package.json, pnpm-lock.yaml, pnpm-workspace.yaml, Dockerfile, app.config.ts (logoUrl)
├── docs/plan.md                  Kopie dieses Plans inkl. Design
├── shared/                       UMD, Browser + Node, deterministisch
│   ├── quiz-engine.js            = pwnd-engine.js (API unverändert)
│   ├── economy.js                = pond-demo.js + Reiherwacht, Entdeckungen, Truppen, Teichstufe
│   ├── battle-engine.js          10×10-Kampfsimulation, PRNG (mulberry32), Replay-Hash (FNV-1a)
│   ├── progression.js            Ligen, Trophäen, Loot, Tageslimits, Rotations-Hash, Match-Score
│   └── bots.js                   deterministischer Bot-Pool
├── content/questions.json        Fragenpool NUR serverseitig (Antwortschlüssel nie im Browser)
├── server/
│   ├── index.mjs                 Express, Static, /api/health, Fehlerbehandlung
│   ├── env.mjs, db.mjs           Pool, withTransaction, utcDay()
│   ├── migrate.mjs + migrations/ 001_core.sql, 002_quiz.sql, 003_battle_progression.sql
│   ├── auth.mjs                  OAuth-Callback, Session, requireUser
│   ├── services/                 pond, quiz, questions (LLM), battle, matchmaking, reports
│   └── routes/api.mjs
├── public/                       index.html, pwnd.css (portiert) + strategy.css, js/*.js (ES-Module),
│                                 assets/*.webp, manus-routes.json ({"routes":[{"path":"/","title":"pwnd"}]})
└── test/                         node:test – Engine-Tests (portiert + neu), API-Tests gegen echtes MySQL
```

## 4. Datenmodell (MySQL)

| Tabelle | Inhalt |
|---|---|
| `schema_migrations` | `version`, `applied_at` |
| `users` | `id`, `open_id` (unique), `name`, `email`, `login_method`, `created_at`, `last_signed_in` |
| `ponds` | `user_id` (PK), `display_name`, energy/water/air/love, `revision`, `last_tick` DATETIME(3), `trophies` (Start 100), `best_trophies`, `quiz_rating` (Start 1000, versteckt), `calibration`, `skill_profile` JSON, `upgrades` JSON, `unlocked` JSON (Start `["frog"]`), `shield_until`, `ruleset_version`, `created_at` |
| `buildings` | `user_id`, `type`, `x`, `y`, `bank`, `carry` DECIMAL(20,18); PK (`user_id`, `type`) |
| `troops` | `user_id`, `unit_type`, `count` |
| `quiz_attempts` | `id`, `user_id`, `mode`, `topic_id`, `opponent_id`, `status` (active/completed/abandoned/invalid), `total`, `history` JSON, `current_question` JSON (mit Schlüssel), `issued_at`, `result` JSON, `idempotency_key`, `rewarded` |
| `daily_counters` | `user_id`, `day` (UTC DATE): `attacks_used`, `loot_taken`, `quiz_rewarded`, `questions_generated`, `rotation_index`; PK (`user_id`, `day`) |
| `battles` | `id`, `attacker_id`, `defender_id` (NULL bei Bot), `bot_id`, `seed`, `ruleset_version`, `defender_snapshot` JSON, `deployment` JSON, `result` JSON, `replay_hash`, `created_at`, `defender_seen` |

Spielerdaten werden in einer Transaktion mit `SELECT … FOR UPDATE` gesperrt, mit Revisionsprüfung (409 bei Konflikt). Bei Angriffen werden beide Teiche in fester Reihenfolge nach `user_id` gesperrt, damit keine Deadlocks entstehen.

## 5. Spielregeln (Ruleset v1, alles serverseitig)

### 5.1 Economy

- **Start:** 1.000 ⚡ / 500 💧 / 300 🌬️ / 100 ❤️ / 0 🍯, wie beim Online-Starter des Prototyps, ergänzt um Honig.
- **Produzenten, Boni, Cap, Accrual, Umsetzen** exakt wie im Prototyp, portiert aus `pwnd_accrue` und `pwnd_pond_action`.
- **Neu: Reiherwacht** (`heron_watch`, 2×2, eine pro Teich): Kosten 260 ⚡ / 60 💧 / 80 🌬️ / 20 ❤️ / 60 🍯. Sie ist das Verteidigungsgebäude und produziert nichts.
- **Neu: Honig 🍯 als 5. und letzte Ressource** — „Vorrat & Ausdauer". Er verbindet Quiz und Strategie: Ohne Quizzen wächst der Teich zwar, aber Armee und Verteidigung bleiben klein.
  - **Quelle 1:** Produktionsgebäude **Bienenweide** (`bee_meadow`, 2×2, 60 🍯/h, Kosten 200 ⚡ / 120 💧 / 60 🌬️ / 15 ❤️). Damit gibt es vier Produzenten plus Reiherwacht.
  - **Quelle 2:** Quiz-Combos — frei +1 🍯 je drei Combo-Punkte, Duell +2 🍯 je drei Combo-Punkte und +5 🍯 bei Sieg.
  - **Verwendung:** Truppen und Reiherwacht kosten Honig; die Entdeckungen ab Karpfenkolk brauchen zusätzlich Honig (40 / 70 / 110 🍯).
  - **Neuer Nachbarschaftsbonus „Blütenweide":** Steht die Bienenweide höchstens 2 Felder von der Solar-Seerose entfernt, produziert sie +60 🍯 pro Stunde.
  - **Cap:** 2.000 wie bei den anderen Ressourcen. Honig ist plünderbar, Liebe bleibt die einzige geschützte Ressource.
- **Wachstumskarte:** Die 6 Entdeckungen mit den Prototyp-Kosten werden serverseitig freigeschaltet (`unlock`).
- **Teichstufe** = 1 + Anzahl Gebäude (0–5) + Entdeckungen außer dem Frosch (0–5), also Stufe 1–11.

### 5.2 Quiz online

**Ablauf** gemäß `quiz-pond-integration-contract.md`:

1. `start`
2. `question`: Der Server wählt die Frage und speichert Antwort und Ausgabezeit. Der Client erhält die Frage ohne Antwort.
3. `answer`: Die Zeit misst der Server. Für die Netzwerk-Latenz gibt es 3 s Kulanz, danach zählt die Antwort als Timeout.
4. `complete`: Die Gutschrift erfolgt idempotent und genau einmal.

**Regeln:**

- 8 Fragen im freien Modus, 10 Fragen im Duell.
- No-Repeat-Regel und adaptive Auswahl aus der Engine.
- Die Fuchs-Kommentare bleiben clientseitig und deterministisch.

**Belohnungen** (`calculateResourceRewards`):

- **Frei:** Energie = Anzahl richtiger Antworten.
- **Duell:** Energie = 10 + 3 × richtige Antworten + 20 bei Sieg. Das Elo-Rating wird getrennt in `quiz_rating` geführt; die Energie fällt dadurch nie durch eine Niederlage.

**Limits:**

- Höchstens 12 belohnte Versuche pro UTC-Tag; danach sind Versuche Übung ohne Belohnung.
- Höchstens 40 LLM-Generierungen pro Spieler und Tag; danach wird der statische Pool verwendet.

**Upgrades:** Die 5 Prototyp-Upgrades sind serverseitig gespeichert, maximal 3 aktiv. Nach jedem abgeschlossenen Duell darf eines gewählt werden. Die Mods wirken bei der serverseitigen Bewertung.

### 5.3 Truppen (Teichlager, Kapazität 20 Plätze, sofortiges Training, beim Einsatz verbraucht)

| Einheit | Plätze | HP | Schaden/Tick | Reichweite | Tempo | Typ | Kosten |
|---|---|---|---|---|---|---|---|
| Froschtrupp | 1 | 60 | 12 | 1 | 1 Feld/Tick | Boden, nächstes Gebäude | 25 💧 / 5 ❤️ / 5 🍯 |
| Libelle | 2 | 45 | 10 | 3 | 2 Felder/Tick | Flug | 40 💧 / 10 ❤️ / 20 🌬️ / 10 🍯 |
| Biber | 3 | 220 | 22 | 1 | 1 Feld/2 Ticks | Boden, bevorzugt Verteidigung | 70 💧 / 15 ❤️ / 15 🍯 |

### 5.4 BattleEngine v1 (deterministisch)

**Gebäude des Verteidigers:**

- Teichkern: HP 1.200. Verteidigt mit „Teichwellen“: Reichweite 2, 18 Schaden pro Tick, trifft nur Bodeneinheiten.
- Produzenten (inkl. Bienenweide): HP 400.
- Reiherwacht: HP 600, Reichweite 3, 30 Schaden pro Tick, trifft Boden- und Flugeinheiten.

**Aufstellung:** Die Einheiten werden auf freie Randfelder (x oder y ∈ {0, 9}) gesetzt. Pro Tick wird eine Einheit in Listenreihenfolge eingesetzt.

**Ablauf je Tick** (höchstens 120 Ticks):

1. Einsetzen
2. Verteidigung feuert auf die nächste Einheit (Tie-Break nach ID)
3. Einheiten wählen ihr Ziel, bewegen sich und greifen an. Bodeneinheiten nutzen BFS um Gebäude herum, Flugeinheiten fliegen direkt.
4. Tote Einheiten werden entfernt.

**Determinismus:** ±10 % Schadensstreuung über den Seed (mulberry32). Der Seed wird aus der Battle-ID abgeleitet.

**Ergebnis:**

- Zerstörung % = Σ erlittener Schaden ÷ Σ max HP (HP-gewichtet).
- Sterne: ★ bei ≥ 50 %, ★ wenn der Teichkern zerstört ist, ★ bei 100 %.
- Die Engine liefert kompakte Frames für das Replay und einen `replayHash`.
- Replays werden aus Snapshot, Aufstellung und Seed neu berechnet; der Hash wird dabei geprüft.

### 5.5 Loot

**Verfügbar:**

- Lager (liegt im Kern) für ⚡/💧/🌬️/🍯: `floor(max(0, Bestand − 300) × 20 %)`.
- Produzentenbank: 50 % pro Gebäude.
- **Liebe ist nie plünderbar.**

**Erbeutet:**

- Lager-Loot × Zerstörungsanteil des Kerns.
- Bank-Loot × Zerstörungsanteil des jeweiligen Produzenten.
- Liga-Bonus in ⚡ bei mindestens einem Stern (siehe 5.6).

**Tageslimit:** höchstens **2.500 Loot-Einheiten pro UTC-Tag**. Darüber wird proportional gekürzt. Ist das Limit erreicht, sind Angriffe weiter möglich, bringen aber 0 Loot. Die UI zeigt das vorher an.

**Verteidiger:** Ein echter Verteidiger verliert genau den erbeuteten Lager- und Bankanteil, den Bonus dagegen nicht.

### 5.6 Trophäen und Ligen

**Trophäen:**

- **Sieg (≥ 1★):** Angebot = clamp(25 + round((T_Verteidiger − T_Angreifer) / 20), 8, 45). Der Angreifer erhält round(Angebot × Sterne / 3); ein echter Verteidiger verliert denselben Wert, mindestens bis 0.
- **Niederlage (0★):** Strafe = clamp(18 + round((T_Angreifer − T_Verteidiger) / 20), 5, 35). Der Angreifer verliert sie, ein echter Verteidiger gewinnt sie.

**Ligen:**

| Liga | Trophäen | Liga-Bonus |
|---|---|---|
| Schlammgrund | 0–399 | 0 |
| Kieselbett | 400–799 | +40 ⚡ |
| Schilfrand | 800–1.199 | +80 ⚡ |
| Seerosenteich | 1.200–1.599 | +140 ⚡ |
| Lotusthron | 1.600+ | +220 ⚡ |

**Ligatabelle:** echte Spieler der eigenen Liga, Top 50 nach Trophäen, plus der eigene Rang. Bots sind ausgenommen.

### 5.7 Matchmaking und Schutz

**Limits:**

- **6 Angriffe pro UTC-Tag.**
- **4 h Ziel-Cooldown** je Angreifer-Ziel-Paar, für echte Spieler und Bots.

**Schutzfilter** schließt aus:

- sich selbst,
- aktive Schilde,
- Ziele im Cooldown.

**Schild:** Nach einer Verteidigung mit ≥ 1★ bekommt der Verteidiger einen 2-h-Schild. Wer selbst angreift, verliert seinen eigenen Schild.

**Match-Score und Rotation:**

- Match-Score = |ΔTrophäen| / 100 + |ΔTeichstufe|.
- Kandidatenfenster ≤ 3, wird auf 6, dann 12, dann ∞ erweitert, bis mindestens 3 Kandidaten da sind.
- **Tägliche Rotation:** Die Kandidaten werden nach FNV-Hash(`angreiferId:UTC-Datum:kandidatId`) sortiert.
- Der Zeiger `rotation_index` steht in `daily_counters`. „Nächster Gegner“ ist kostenlos und rückt den Zeiger vor (modulo der Länge).

**Beim Angriff** prüft der Server alles neu: Eignung, Tageslimit, Truppenbestand und Aufstellungsregeln. Danach laufen Accrual beim Verteidiger, Simulation und Buchung atomar.

### 5.8 Bot-Pool

- **30 Bots** `bot-01` … `bot-30` mit Teich-Namen, zum Beispiel „Moorquelle“ oder „Binsenbucht“.
- Trophäen fest verteilt von 40 bis 1.925.
- Layout deterministisch aus der Bot-ID: 2–4 Gebäude, ab Kieselbett mit Reiherwacht.
- Bestand und Bänke variieren täglich deterministisch über den Seed aus ID und UTC-Tag. Der Bestand liegt bei ca. 700 + 0,9 × Trophäen.
- Bots haben keine DB-Zeilen, verlieren nichts und erzeugen keine Berichte. Sie zählen aber für Cooldown, Tageslimit und Trophäen.

### 5.9 Berichte

- **Verteidigungsberichte:**
  - Inhalt: Angreifer, Zeit, Sterne, Zerstörung, Verlust pro Ressource, Trophäen und Schild.
  - Badge für ungelesene Berichte, „gelesen“-Markierung.
  - Replay mit Hash-Prüfung.
- **Angriffsverlauf** für den Angreifer.

## 6. API (JSON, Cookie-Session, Fehlercodes wie im Prototyp, z. B. `insufficient_resources` oder `revision_conflict`)

- **System und Login:**
  - `GET /api/health`
  - `GET /api/auth/config` mit `appId` und `portalUrl`
  - `GET /api/oauth/callback`
  - `POST /api/auth/logout`
  - `GET /api/me`
- **Teich:**
  - `GET /api/pond`
  - `POST /api/pond/actions` mit `{kind: place|move|claim|unlock|train, …, revision}`
- **Quiz:**
  - `POST /api/quiz/attempts`
  - `POST /api/quiz/attempts/:id/question`, `…/answer`, `…/complete`
  - `POST /api/quiz/upgrades`
- **Progression und Angriffe:**
  - `GET /api/progression` mit Liga, Trophäen, Restangriffen, Rest-Loot und Schild
  - `GET /api/matchmaking/opponent`, `POST /api/matchmaking/next`
  - `POST /api/attacks` mit `{targetKey, deployment}`; Antwort sind Ergebnis und Replay-Frames
- **Berichte und Liga:**
  - `GET /api/reports?type=defense|attack`
  - `GET /api/reports/:id/replay`
  - `POST /api/reports/seen`
  - `GET /api/leagues/table`

## 7. Frontend (Einzelseite `/`, Screens per Klassenwechsel wie im Prototyp)

| Screen | Inhalt |
|---|---|
| Anmeldung | Manus-Login |
| Teich-Hub | Bestehender Hub mit Szene, 5 Ressourcen inkl. Honig, 10×10-Bauraster inkl. Bienenweide und Reiherwacht und Wachstumskarte. Neu: Liga-Chip, Trophäen, Teichstufe, Tageszähler, Berichte-Badge, Aktivitätskarte „Angreifen“ |
| Quiz | Eule und Fuchs mit vorhandenem Markup, Ablauf und Animationen, jetzt über die Server-API. Antwortschlüssel kommen erst nach dem Antworten |
| Teichlager | Truppen trainieren, Kapazitätsanzeige |
| Gegnersuche | Gegnerkarte mit Name, Liga, Trophäen, Stufe, Layout-Vorschau, erwartetem Loot nach Limit und Trophäen bei Sieg/Niederlage. Buttons „Nächster Gegner“ und „Angreifen“ |
| Aufstellung | Randfelder antippen, Einheit wählen, Restplätze anzeigen |
| Kampf-Replay | Animiertes Raster: Einheiten, HP-Balken, Treffer, Sterne |
| Ergebnis | Sterne, Zerstörung, Loot, Trophäen, ggf. Hinweis auf das Loot-Limit |
| Liga | Ligaleiter, Tabelle, eigener Rang |
| Berichte | Verteidigung und Angriff, jeweils mit Replay |

## 8. Design (aus `docs/ideas.md` des Prototyps übernommen)

- **Design Movement:** natürliche, leicht magische Teichwelt im Stil eines „Garten-Dioramas“; papierhafte Naturkarten statt Sci-Fi-Arena.
- **Prinzipien:**
  - Der Teich ist der Hub, kein Menü.
  - Die Ressourcen sind gleichwertig sichtbar.
  - Ruhige, lebendige Bewegung.
  - Wettbewerb ist präsent, aber nicht feindlich.
- **Farben:**
  - bestehende Light-Palette: Wasser `#2c96aa`, Türkis `#2f9c91`, Moos/Blatt `#3f9362`, Sand `#e5d6ac`, Lehm `#9b6558`, Seerose `#c87589`, Sonne `#d19a3c`
  - Ressourcenfarben: Energie `#b67c24`, Wasser `#287f77`, Luft `#5d86af`, Liebe `#ae617c`, Honig `#c8902f`
  - **Signaturfarbe:** Teich-Türkis `#2f9c91`
- **Layout:**
  - Mobile-first im Hochformat, vertikaler „Uferweg“ durch die Abschnitte.
  - Kampf- und Aufstellungsraster im Querformat-tauglichen Scrollcontainer.
- **Signatur-Elemente:**
  - Wasserwellen
  - Seerosen- und Schilfmotive
  - Wabenmuster der Bienenweide
  - goldene Bonusfelder
  - Sterne als Seerosenblüten
- **Interaktion und Animation:**
  - sanftes Aufsteigen der Screens
  - Ressourcen fließen sichtbar in den Vorrat
  - Replay mit 2 Ticks pro Sekunde und kurzen Treffer-Pulsen
  - `prefers-reduced-motion` wird beachtet
- **Typografie:** System-Sans des Prototyps (`ui-sans-serif`, system-ui), große, eng laufende Headlines (letter-spacing −0,06 em), Mikro-Eyebrows in Versalien.
- **Brand:** „pwnd – dein Teich, der zurückschlägt“; warm, neugierig, verspielt.
  - Beispiele: „Der Rotfuchs liest deine erste Entscheidung.“, „Die Reiherwacht hält Ausschau.“
- **Wortmarke:** „pwnd“ in Kleinbuchstaben, das „w“ als Wellenlinie in Türkis.
- **Logo:** `app.config.ts` erhält eine `logoUrl`, hochgeladen per `manus-upload-file`.

## 9. Umsetzungsschritte

1. **Setup:**
   - `package.json` mit pnpm-Pin, `pnpm-workspace.yaml`, Installation.
   - LSP über `PUT runtime/post-edit` mit `["javascript","html","css","json"]`.
   - `GET config` für Port und `auto_publish`.
   - Deploy-Config mit `Dockerfile` und `/api/health`.
   - `manus-routes.json`.
2. **Shared Engines:** Quiz-Engine und Economy aus dem Prototyp übernehmen, die alten Tests portieren. Neu: Battle-Engine, Progression und Bots, jeweils mit Unit-Tests für Determinismus, Regeln und Grenzwerte.
3. **Server-Grundlage:**
   - Migrationen 001–003.
   - Auth mit OAuth und Session.
   - Pond-Service als Port der Supabase-RPC-Logik auf MySQL-Transaktionen.
   - Dev-Server als Service auf `0.0.0.0:3000`.
4. **Quiz-Service** mit serverseitigen Attempts und LLM-Fragen inklusive Fallback.
5. **Truppen, Angriffspfad, Matchmaking & Progression v1:**
   - Truppen trainieren
   - Battle-Endpoint und Rotation
   - Limits, Ligen, Schild, Berichte, Bot-Pool
6. **Frontend:** Prototyp-Markup und CSS portieren, auf die API umstellen, neue Screens bauen.
7. **Prüfung und Abgabe:**
   - Unit-Tests.
   - API-Regressionen gegen das echte Managed MySQL mit temporären `test-`-Benutzern, danach aufgeräumt.
   - Screenshots der Kernscreens.
   - Ein lesender Validierungs-Agent prüft gegen diesen Plan.
   - Fixes, dann Commit und Push auf `origin/main` (Checkpoint). Veröffentlicht wird nur, wenn `auto_publish` aktiv ist oder du es ausdrücklich möchtest.

## 10. Prüfung

- **Unit-Tests:** Economy-Paritätstests aus dem Prototyp, BattleEngine (gleicher Seed → gleicher Hash), Sterne-, Loot- und Trophäenformeln, Rotation (gleicher Tag → gleiche Reihenfolge, anderer Tag → andere), Bot-Determinismus.
- **API-Tests gegen echtes MySQL:**
  - Teich laden, bauen, abholen, Revisionskonflikt.
  - Quiz genau einmal gutgeschrieben; zweites `complete` liefert dasselbe Ergebnis ohne erneute Gutschrift.
  - Manipulierte Antworten werden abgelehnt.
  - 7. Angriff wird abgelehnt (`daily_attack_limit`).
  - Loot über 2.500 wird gekürzt.
  - Erneuter Angriff auf dasselbe Ziel unter 4 h wird abgelehnt (`target_cooldown`).
  - Schild filtert, Verteidigungsbericht entsteht, Replay-Hash stimmt.
- **Login:** echter OAuth-Ablauf in der Preview, keine Fake-User.

## 11. Annahmen und Risiken

- **Neu gestaltet:** Die Details der Kampf-, Truppen- und Lootregeln oben sind meine Gestaltung, weil die Originalarbeit nicht zugänglich ist. Nur die Replay-Eckwerte sind fest übernommen. Alle Zahlen stehen zentral in `shared/progression.js` und `shared/economy.js` und sind leicht änderbar.
- **Login:** Manus OAuth ersetzt das manualAI-Supabase-Login. Bestehende Online-Teiche aus Supabase werden nicht importiert, lokale Browserstände ebenso nicht.
- **Gemeinsame Datenbank:** Entwicklung und Veröffentlichung teilen sich dieselbe Datenbank. Testdaten werden deshalb immer mit `test-`-Präfix angelegt und danach gelöscht.
- **Kosten:** LLM-Fragen verbrauchen Projekt-Credits. Ohne LLM läuft das Spiel vollständig mit dem statischen Pool.
- **Nicht in diesem Umfang:**
  - Dörfer (Clans), nächste Phase
  - Gebäude-Ausbaustufen
  - Trainingszeiten
  - Echtzeit-Kämpfe (Kämpfe werden als Plan eingereicht und dann als Replay gezeigt)
  - 3D/Godot
  - Spotify/Musik
- **Seiteneffekte:** Das GitHub-Repo `manualai.org` bleibt unverändert. Der Klon liegt nur lokal unter `/home/ubuntu/manualai.org`.
