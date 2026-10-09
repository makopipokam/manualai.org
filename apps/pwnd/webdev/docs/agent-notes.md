# Arbeitsnotizen (Agent) – pwnd Neuaufbau

- Projekt: `/home/ubuntu/pwnd` (webdev `wdp_22683093c8219f5521e15902`, Preview-Port 3000, features server+database, auto_publish=false)
- Prototyp-Klon (nur lesen): `/home/ubuntu/manualai.org/pwnd`
- Plan: `docs/plan.md`, Aufgaben: `TODO.md`
- Git-Autor vor dem ersten Commit: `git config --global user.name makopipokam`, `git config --global user.email manuel.picard@web.de`
- DB: TiDB Cloud (MySQL-kompatibel), `DATABASE_URL` mit `?ssl={"rejectUnauthorized":true}`
- Env: MANUS_PROJECT_ID, MANUS_OAUTH_PORTAL_URL, MANUS_OAUTH_API_URL, MANUS_JWT_SECRET, MANUS_API_URL, MANUS_API_KEY, DATABASE_URL
- LLM: `POST $MANUS_API_URL/v1/chat/completions`, Bearer `$MANUS_API_KEY`, Modell explizit (`gemini-3-flash-preview`, `claude-haiku-4-5`)

## Honig (Nutzerentscheidung 03.10.2026, bestätigt)

Honig 🍯 ist die **5. und letzte Ressource** („Vorrat & Ausdauer"):

- Start 0 🍯, Cap 2.000 wie alle, Farbe `#c8902f`
- Quelle 1: Gebäude **Bienenweide** (`bee_meadow`, 2×2, 60 🍯/h, Kosten 200⚡/120💧/60🌬️/15❤️)
- Quelle 2: Quiz-Combos (frei +1 🍯 je 3 Combo-Punkte, Duell +2 🍯 je 3, +5 🍯 bei Sieg)
- Verwendung: Truppen (Frosch 5, Libelle 10, Biber 15), Reiherwacht 60, Entdeckungen fish/lily/stream 40/70/110
- Bonus **Blütenweide**: Bienenweide ≤ 2 Felder von der Solar-Seerose ⇒ +60 🍯/h
- Loot: Honig ist plünderbar wie ⚡💧🌬️; **Liebe bleibt die einzige geschützte Ressource**
- DB: Spalte `ponds.honey` (Migration `002_honey.sql`, in `001_core.sql` ebenfalls enthalten)

## Stand

Fertig: `shared/` (quiz-engine, economy, battle-engine, progression, bots), `server/` (db, auth, migrate,
services pond/quiz/questions/counters/strategy, routes/api, app, index), `content/questions.json` (78 Fragen), Tests.

Frontend (`public/index.html`, `public/js/*.js`, `public/strategy.css`), `Dockerfile`, `README.md`
und `app.config.ts` sind ebenfalls fertig; alle 13 TODO-Punkte sind abgehakt.

- Unit-Tests: `node --test test/unit/*.test.*` → 20/20 grün
- API-Tests (echte DB, Server muss laufen): `node --test --test-concurrency=1 test/api/*.test.mjs` → 10/10 grün
- Browser-Durchlauf geprüft: Bauen inkl. Bonusfeld, Freischalten, Truppen, freies Quiz,
  Gegnersuche, Aufstellung, Angriff, Replay, Berichte, Liga
- `origin/main` enthielt eine fremde Hello-World-Seite (`/Pi/helloworld/pi/`); beim Merge übernommen,
  ihr Test liegt jetzt in `test/unit/routes.test.mjs`. Unbekannte Pfade liefern `public/404.html`.
- Eigene Rasterklassen heißen `pond-grid` / `grid-cell`, damit sie nicht mit den gleichnamigen
  Prototyp-Regeln in `pwnd.css` kollidieren.

## Auth

- Cookie `webdev_app_session` (httpOnly, Path=/, SameSite=None, Secure), Nonce-Cookie `__Host-oauth_state`
- `GET /api/platform/config.js` → `window.__MANUS_CONFIG__ = {projectId, oauthPortalUrl}`
- Login-URL: `${portal}/app-auth?appId=<projectId>&redirectUri=<origin>/api/oauth/callback&state=<btoa({redirectUri,nonce})>&responseType=code`
- Preview-Fallback: `sessionStorage['manus-cookie']` enthält `webdev_app_session=<token>` → `Authorization: Bearer <token>`
- `GET /api/me` → `{user:{name,email}|null}`, `POST /api/auth/logout`

## API-Formen für das Frontend

- `GET /api/state` → `{pond, progression, quiz}`
- Pond: `{rulesetVersion, serverTime, revision, displayName, resources{energy,water,air,love,honey}, buildings[{type,x,y,bank}], lastTickMs, unlocked[], upgrades[], troops{}, troopHousing, troopCapacity, trophies, bestTrophies, league, pondLevel, shieldUntil, skillProfile, quizRating}`
- `POST /api/pond/actions {action:'place'|'move'|'claim'|'unlock', type, x, y, unlockId, revision}`
- `POST /api/troops/train {unitType, count, revision}`
- `GET /api/progression` → `{league, trophies, bestTrophies, pondLevel, nextLeague, shieldUntil, unreadDefense, quizRewardsLeft, attacksUsed, attacksLeft, lootTaken, lootLeft, resetAt}`
- Quiz: `POST /api/quiz/attempts {mode:'free'|'duel', topicId, opponentId}` → `{attempt, rewardsLeftToday}`;
  `POST /api/quiz/attempts/:id/question` → `{attempt, question|null, done?, retry?}`;
  `.../answer {answerIndex, round}` → `{correct, answerIndex, correctIndex, explanation, damage, selfDamage, timeMs, timedOut, questionTimeMs, attempt, done}`;
  `.../scan`, `.../complete` → `{result, alreadyCompleted, pond}`, `.../upgrade {upgradeId}`
- Attempt: `{id, mode, topicId, opponentId, status, total, round, playerHp, aiHp, combo, maxCombo, skills, upgrades, scanner, scannerUsed, current:{id,type,skill,difficulty,prompt,options,source,round,timeLimitMs,remainingMs,removed,timed}|null, history[]}`
- Quiz-Result: `{mode, topicId, opponentId, outcome, noQuestions, correctAnswers, total, earned, credited, rewarded, practice, rewardsLeftToday, before, after, ratingDelta, quizRating, strongest, weakest, upgradeOffers[], aiQuestionCount, fallbackCount}`
- Themen: nature, patterns, sources, decisions, world, reasoning; Gegner: redfox, arcticfox, fennec (Duell), owl (frei)
- `GET /api/matchmaking/opponent`, `POST /api/matchmaking/next` → `{opponent:{key,kind,name,trophies,league,pondLevel,buildings[],lootPreview,trophies3}|null, rotation:{index,size,window}, limits}`
- `POST /api/attacks {targetKey, deployment:[{unit,x,y}]}` → `{battle:{id,targetKey,defenderName,kind,stars,destruction,coreDestroyed,ticks,unitsDeployed,unitsLost,loot{gained,total,raw,capped,bonus},trophies{before,delta,after},replayHash}, replay:{layout,deployment,frames,verified}, pond, limits}`
- `GET /api/reports?type=defense|attack` → `{reports:[{id,at,perspective,opponentName,opponentKind,stars,destruction,coreDestroyed,resources,lootCapped,trophyDelta,shieldUntil,seen,replayHash}], unread}`
- `GET /api/reports/:id/replay` → `{battle, replay:{layout,deployment,frames,verified,recomputedHash,storedHash}, attackerName, defenderName}`
- `POST /api/reports/seen`, `GET /api/leagues/table` → `{league, leagues, me:{rank,trophies}, players, table:[{rank,name,trophies,pondLevel,isMe}]}`
- Fehler: HTTP-Status + `{error:{code,message,details}}` (z. B. `insufficient_resources`, `revision_conflict`, `troop_capacity`, `target_cooldown`, `daily_attack_limit`)

## Replay-Format (`shared/battle-engine.js`)

- `layout`: `[{id,type,x,y,w,h,maxHp,hp,defense}]`, id 0 = Teichkern
- `frames`: `[{t, u:[[unitId,x,y,hp]], b:[hp je Gebäude], e:[Events]}]`
- `UNIT_ORDER` = `['frog','dragonfly','beaver']`

## Frontend

- `public/pwnd.css` ist die unveränderte Prototyp-CSS; Klassen u. a. `.resource-grid`, `.resource-card`,
  `.pond-build-grid`, `.build-cell`, `.unlock-item`, `.question-card`, `.answer`, `.primary-btn`,
  `.duel-opponent-option`, `.free-topic-option`, `.countdown-*`
- `public/assets/`: `shadow-owl.webp`, `red-fox.webp`, `arctic-fox.webp`, `fennec-fox.webp`
- Shared-Module werden unter `/shared/*.js` ausgeliefert (globale Namen `PwndEconomy`, `PwndEngine`,
  `PwndBattle`, `PwndProgression`, `PwndBots`)
