// API integration tests against the managed MySQL/TiDB database.
// Creates temporary `test-…` users, signs real session tokens and removes everything afterwards.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../server/app.mjs';
import { runMigrations } from '../../server/migrate.mjs';
import { query, closePool } from '../../server/db.mjs';
import { signSession, upsertUser } from '../../server/auth.mjs';
import { today } from '../../server/services/counters.mjs';

const users = {};
let server;
let base;

async function makeUser(label) {
  const openId = `test-${label}-${randomUUID()}`;
  const user = await upsertUser({ openId, name: `test-${label}`, email: null, method: 'test' });
  const token = await signSession({ openId, name: `test-${label}` });
  users[label] = { ...user, token };
  return users[label];
}

async function api(label, method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (label) headers.Authorization = `Bearer ${users[label].token}`;
  const response = await fetch(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

async function setCounters(label, values) {
  const day = today();
  await query('INSERT IGNORE INTO daily_counters (user_id, day) VALUES (?, ?)', [users[label].id, day]);
  const sets = Object.keys(values).map(key => `${key} = ?`).join(', ');
  await query(`UPDATE daily_counters SET ${sets} WHERE user_id = ? AND day = ?`, [...Object.values(values), users[label].id, day]);
}

before(async () => {
  await runMigrations({ log: () => {} });
  server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  for (const label of ['a', 'b', 'c']) await makeUser(label);
  // Keep the LLM out of the API tests: the daily generation budget is already used up.
  for (const label of ['a', 'b', 'c']) await setCounters(label, { questions_generated: 40 });
});

after(async () => {
  const ids = Object.values(users).map(user => user.id);
  if (ids.length) {
    await query('DELETE FROM battles WHERE attacker_id IN (?) OR defender_id IN (?)', [ids, ids]);
    for (const table of ['pond_buildings', 'quiz_attempts', 'daily_counters', 'ponds']) {
      await query(`DELETE FROM ${table} WHERE user_id IN (?)`, [ids]);
    }
    await query('DELETE FROM users WHERE id IN (?)', [ids]);
  }
  await new Promise(resolve => server.close(resolve));
  await closePool();
});

test('health is public, game state needs a session', async () => {
  assert.equal((await api(null, 'GET', '/api/health')).status, 200);
  const unauth = await api(null, 'GET', '/api/state');
  assert.equal(unauth.status, 401);
  assert.equal(unauth.data.error.code, 'unauthorized');
  const routes = await fetch(`${base}/manus-routes.json`);
  assert.equal(routes.status, 200);
  assert.deepEqual((await routes.json()).routes.map(route => route.path), ['/']);
});

test('new pond starts with ruleset v1 resources and the build path is server-checked', async () => {
  const { data } = await api('a', 'GET', '/api/state');
  assert.deepEqual(data.pond.resources, { energy: 1000, water: 500, air: 300, love: 100, honey: 0 });
  assert.equal(data.pond.trophies, 100);
  assert.equal(data.pond.league.id, 'mud');
  assert.deepEqual(data.pond.unlocked, ['frog']);
  let revision = data.pond.revision;
  const core = await api('a', 'POST', '/api/pond/actions', { action: 'place', type: 'solar_lily', x: 3, y: 3, revision });
  assert.equal(core.status, 422);
  assert.equal(core.data.error.code, 'core_collision');
  const placed = await api('a', 'POST', '/api/pond/actions', { action: 'place', type: 'solar_lily', x: 0, y: 0, revision });
  assert.equal(placed.status, 200);
  assert.deepEqual(placed.data.resources, { energy: 880, water: 420, air: 280, love: 90, honey: 0 });
  const stale = await api('a', 'POST', '/api/pond/actions', { action: 'place', type: 'spring_pool', x: 0, y: 2, revision });
  assert.equal(stale.status, 409);
  assert.equal(stale.data.error.code, 'revision_conflict');
  revision = placed.data.revision;
  const overlap = await api('a', 'POST', '/api/pond/actions', { action: 'place', type: 'spring_pool', x: 1, y: 1, revision });
  assert.equal(overlap.data.error.code, 'building_collision');
  const spring = await api('a', 'POST', '/api/pond/actions', { action: 'place', type: 'spring_pool', x: 0, y: 2, revision });
  assert.equal(spring.status, 200);
  // The heron watch costs honey, so it stays blocked until the pond has some.
  const broke = await api('a', 'POST', '/api/pond/actions', { action: 'place', type: 'heron_watch', x: 7, y: 7, revision: spring.data.revision });
  assert.equal(broke.data.error.code, 'insufficient_resources');
  await query('UPDATE ponds SET honey = 200 WHERE user_id = ?', [users.a.id]);
  const heron = await api('a', 'POST', '/api/pond/actions', { action: 'place', type: 'heron_watch', x: 7, y: 7,
    revision: (await api('a', 'GET', '/api/pond')).data.revision });
  assert.equal(heron.status, 200);
  assert.equal(heron.data.resources.honey, 140);
  assert.equal(heron.data.pondLevel, 4);
  const again = await api('a', 'POST', '/api/pond/actions', { action: 'place', type: 'heron_watch', x: 7, y: 0, revision: heron.data.revision });
  assert.equal(again.data.error.code, 'building_exists');
});

test('production accrues by server time and can be claimed once', async () => {
  await query('UPDATE ponds SET last_tick_ms = last_tick_ms - ? WHERE user_id = ?', [2 * 3600000, users.a.id]);
  const { data } = await api('a', 'GET', '/api/pond');
  const solar = data.buildings.find(item => item.type === 'solar_lily');
  assert.ok(solar.bank >= 239 + 600 - 2, `solar bank with Sonnenwasser bonus, got ${solar.bank}`);
  const claimed = await api('a', 'POST', '/api/pond/actions', { action: 'claim', revision: data.revision });
  assert.equal(claimed.status, 200);
  assert.ok(claimed.data.result.gained.energy >= 800);
  const empty = await api('a', 'POST', '/api/pond/actions', { action: 'claim', revision: claimed.data.revision });
  if (empty.status === 200) {
    // A few seconds of production may accrue between both requests, but never the claimed banks again.
    const total = Object.values(empty.data.result.gained).reduce((sum, value) => sum + value, 0);
    assert.ok(total < 10, `second claim only collects fresh production, got ${total}`);
  } else {
    assert.equal(empty.data.error.code, 'nothing_to_claim');
  }
});

test('troops train into the 20-slot camp', async () => {
  // Love and honey only come from quizzes and the bee meadow; stock the pond for a full camp.
  await query('UPDATE ponds SET love = 400, water = 1500, honey = 400 WHERE user_id = ?', [users.a.id]);
  let { data } = await api('a', 'GET', '/api/pond');
  const frogs = await api('a', 'POST', '/api/troops/train', { unitType: 'frog', count: 8, revision: data.revision });
  assert.equal(frogs.status, 200);
  assert.equal(frogs.data.troops.frog, 8);
  assert.equal(frogs.data.resources.water, data.resources.water - 200);
  assert.equal(frogs.data.resources.honey, data.resources.honey - 40);
  // Without honey no troop can be trained, even with water and love in stock.
  await query('UPDATE ponds SET honey = 0 WHERE user_id = ?', [users.a.id]);
  const broke = await api('a', 'POST', '/api/troops/train', { unitType: 'frog', count: 1,
    revision: (await api('a', 'GET', '/api/pond')).data.revision });
  assert.equal(broke.data.error.code, 'insufficient_resources');
  await query('UPDATE ponds SET honey = 400 WHERE user_id = ?', [users.a.id]);
  const beavers = await api('a', 'POST', '/api/troops/train', { unitType: 'beaver', count: 4, revision: frogs.data.revision });
  assert.equal(beavers.status, 200);
  assert.equal(beavers.data.troopHousing, 20);
  const full = await api('a', 'POST', '/api/troops/train', { unitType: 'frog', count: 1, revision: beavers.data.revision });
  assert.equal(full.data.error.code, 'troop_capacity');
});

test('matchmaking offers a rotating opponent and an attack books loot, trophies and a verifiable replay', async () => {
  const first = await api('a', 'GET', '/api/matchmaking/opponent');
  assert.equal(first.status, 200);
  assert.ok(first.data.opponent, 'bots guarantee an opponent');
  assert.ok(first.data.rotation.size >= 3);
  const next = await api('a', 'POST', '/api/matchmaking/next');
  assert.equal(next.data.rotation.index, (first.data.rotation.index + 1) % first.data.rotation.size);
  const opponent = next.data.opponent;
  const edges = [];
  for (let i = 0; i < 10; i += 1) edges.push([i, 0], [i, 9]);
  const occupied = (x, y) => [{ x: 4, y: 4 }, ...opponent.buildings].some(b => x >= b.x && x < b.x + 2 && y >= b.y && y < b.y + 2);
  const free = edges.filter(([x, y]) => !occupied(x, y));
  const deployment = [
    ...free.slice(0, 8).map(([x, y]) => ({ unit: 'frog', x, y })),
    ...free.slice(8, 12).map(([x, y]) => ({ unit: 'beaver', x, y })),
  ];
  const tooMany = await api('a', 'POST', '/api/attacks', { targetKey: opponent.key,
    deployment: [...deployment, { unit: 'frog', x: free[12][0], y: free[12][1] }] });
  assert.equal(tooMany.data.error.code, 'insufficient_troops');
  const inner = await api('a', 'POST', '/api/attacks', { targetKey: opponent.key, deployment: [{ unit: 'frog', x: 2, y: 2 }] });
  assert.equal(inner.data.error.code, 'deployment_not_on_edge');
  const before = (await api('a', 'GET', '/api/pond')).data;
  const attack = await api('a', 'POST', '/api/attacks', { targetKey: opponent.key, deployment });
  assert.equal(attack.status, 200, JSON.stringify(attack.data));
  const battle = attack.data.battle;
  assert.ok(battle.stars >= 0 && battle.stars <= 3);
  assert.equal(attack.data.pond.troops.frog, 0);
  assert.equal(attack.data.pond.troops.beaver, 0);
  assert.equal(attack.data.limits.attacksUsed, 1);
  assert.equal(attack.data.pond.resources.energy, before.resources.energy + battle.loot.gained.energy);
  assert.equal(attack.data.pond.trophies, before.trophies + battle.trophies.delta);
  const cooldown = await api('a', 'POST', '/api/attacks', { targetKey: opponent.key, deployment: [{ unit: 'frog', x: free[0][0], y: free[0][1] }] });
  assert.equal(cooldown.data.error.code, 'target_cooldown');
  const reports = await api('a', 'GET', '/api/reports?type=attack');
  assert.equal(reports.data.reports[0].id, battle.id);
  const replay = await api('a', 'GET', `/api/reports/${battle.id}/replay`);
  assert.equal(replay.data.replay.verified, true);
  assert.equal(replay.data.replay.recomputedHash, battle.replayHash);
  const after = await api('a', 'GET', '/api/matchmaking/opponent');
  assert.ok(!after.data.opponent || after.data.opponent.key !== opponent.key, 'cooldown target leaves the rotation');
});

test('a real defender loses exactly the looted share, gets a report and a shield', async () => {
  await query('UPDATE ponds SET energy = 1800, water = 1300, air = 900, love = 400, honey = 1200 WHERE user_id = ?', [users.b.id]);
  await query(`UPDATE ponds SET troops = '{"frog":12,"beaver":2}' WHERE user_id = ?`, [users.c.id]);
  const deployment = [];
  for (let x = 0; x < 10 && deployment.length < 12; x += 1) deployment.push({ unit: 'frog', x, y: 0 });
  deployment.push({ unit: 'beaver', x: 0, y: 9 }, { unit: 'beaver', x: 9, y: 9 });
  while (deployment.length < 14) deployment.push({ unit: 'frog', x: 0, y: 5 });
  const defenderBefore = (await api('b', 'GET', '/api/pond')).data;
  const attack = await api('c', 'POST', '/api/attacks', { targetKey: `u:${users.b.id}`, deployment });
  assert.equal(attack.status, 200, JSON.stringify(attack.data));
  const battle = attack.data.battle;
  assert.equal(battle.stars >= 1, true, 'an undefended starter pond falls');
  const defenderAfter = (await api('b', 'GET', '/api/pond')).data;
  for (const key of ['energy', 'water', 'air', 'honey']) {
    const bonus = key === 'energy' ? battle.loot.bonus : 0;
    assert.equal(defenderBefore.resources[key] - defenderAfter.resources[key], battle.loot.gained[key] - bonus, `${key} loss equals loot`);
  }
  assert.ok(battle.loot.gained.honey > 0, 'honey is lootable');
  assert.equal(defenderAfter.resources.love, defenderBefore.resources.love, 'love is never lootable');
  assert.ok(defenderAfter.shieldUntil > Date.now());
  assert.equal(defenderAfter.trophies, defenderBefore.trophies - battle.trophies.delta);
  const reports = await api('b', 'GET', '/api/reports?type=defense');
  assert.equal(reports.data.unread, 1);
  assert.equal(reports.data.reports[0].id, battle.id);
  assert.equal(reports.data.reports[0].seen, false);
  await api('b', 'POST', '/api/reports/seen');
  assert.equal((await api('b', 'GET', '/api/progression')).data.unreadDefense, 0);
  await query(`UPDATE ponds SET troops = '{"frog":2}' WHERE user_id = ?`, [users.a.id]);
  const shielded = await api('a', 'POST', '/api/attacks', { targetKey: `u:${users.b.id}`, deployment: [{ unit: 'frog', x: 0, y: 0 }] });
  assert.equal(shielded.data.error.code, 'target_shielded');
  const self = await api('a', 'POST', '/api/attacks', { targetKey: `u:${users.a.id}`, deployment: [{ unit: 'frog', x: 0, y: 0 }] });
  assert.equal(self.data.error.code, 'target_unavailable');
});

test('daily attack and loot limits are enforced on the server', async () => {
  await query(`UPDATE ponds SET troops = '{"frog":4}' WHERE user_id = ?`, [users.a.id]);
  const opponent = (await api('a', 'GET', '/api/matchmaking/opponent')).data.opponent;
  const occupied = (x, y) => [{ x: 4, y: 4 }, ...opponent.buildings].some(b => x >= b.x && x < b.x + 2 && y >= b.y && y < b.y + 2);
  const cell = [[0, 0], [9, 0], [0, 9], [9, 9]].find(([x, y]) => !occupied(x, y));
  await setCounters('a', { loot_taken: 2500 });
  const capped = await api('a', 'POST', '/api/attacks', { targetKey: opponent.key, deployment: [{ unit: 'frog', x: cell[0], y: cell[1] }] });
  assert.equal(capped.status, 200, JSON.stringify(capped.data));
  assert.equal(capped.data.battle.loot.total, 0, 'no loot once the daily loot limit is reached');
  await setCounters('a', { attacks_used: 6 });
  const next = (await api('a', 'GET', '/api/matchmaking/opponent')).data.opponent;
  const blocked = await api('a', 'POST', '/api/attacks', { targetKey: next.key, deployment: [{ unit: 'frog', x: 0, y: 0 }] });
  assert.equal(blocked.status, 429);
  assert.equal(blocked.data.error.code, 'daily_attack_limit');
});

async function playQuiz(label, start) {
  const created = await api(label, 'POST', '/api/quiz/attempts', start);
  assert.equal(created.status, 200, JSON.stringify(created.data));
  const id = created.data.attempt.id;
  for (let round = 1; round <= created.data.attempt.total; round += 1) {
    const q = await api(label, 'POST', `/api/quiz/attempts/${id}/question`);
    assert.equal(q.status, 200, JSON.stringify(q.data));
    assert.equal(q.data.question.answer, undefined, 'the answer key never reaches the client');
    assert.equal(q.data.question.explanation, undefined);
    const repeat = await api(label, 'POST', `/api/quiz/attempts/${id}/question`);
    assert.equal(repeat.data.question.id, q.data.question.id, 'an open question is not replaced');
    const answer = await api(label, 'POST', `/api/quiz/attempts/${id}/answer`, { answerIndex: 0, round });
    assert.equal(answer.status, 200, JSON.stringify(answer.data));
    assert.equal(typeof answer.data.correctIndex, 'number');
  }
  return id;
}

test('free quiz credits rewards exactly once and offers no upgrade', async () => {
  const before = (await api('b', 'GET', '/api/pond')).data;
  const id = await playQuiz('b', { mode: 'free', topicId: 'patterns' });
  const done = await api('b', 'POST', `/api/quiz/attempts/${id}/complete`);
  assert.equal(done.status, 200);
  const result = done.data.result;
  assert.equal(result.rewarded, true);
  assert.equal(result.credited.energy, result.correctAnswers);
  assert.equal(done.data.pond.resources.water, before.resources.water + result.credited.water);
  const twice = await api('b', 'POST', `/api/quiz/attempts/${id}/complete`);
  assert.equal(twice.data.alreadyCompleted, true);
  assert.deepEqual(twice.data.pond.resources, done.data.pond.resources, 'second complete credits nothing');
  assert.deepEqual(result.upgradeOffers, []);
  const chosen = await api('b', 'POST', `/api/quiz/attempts/${id}/upgrade`, { upgradeId: 'memory' });
  assert.equal(chosen.data.error.code, 'upgrade_unavailable');
});

test('duel uses server time, energy formula and the daily reward limit', async () => {
  const created = await api('c', 'POST', '/api/quiz/attempts', { mode: 'duel', opponentId: 'fennec' });
  const id = created.data.attempt.id;
  const early = await api('c', 'POST', `/api/quiz/attempts/${id}/complete`);
  assert.equal(early.data.error.code, 'attempt_incomplete');
  await api('c', 'POST', `/api/quiz/attempts/${id}/question`);
  const [row] = await query('SELECT state FROM quiz_attempts WHERE id = ?', [id]);
  const state = typeof row.state === 'string' ? JSON.parse(row.state) : row.state;
  state.issuedAtMs -= state.timeLimitMs + 10000;
  await query('UPDATE quiz_attempts SET state = ? WHERE id = ?', [JSON.stringify(state), id]);
  const late = await api('c', 'POST', `/api/quiz/attempts/${id}/answer`, { answerIndex: state.current.answer, round: 1 });
  assert.equal(late.data.timedOut, true);
  assert.equal(late.data.correct, false, 'a late answer counts as timeout even if it was right');
  for (let round = 2; round <= 10; round += 1) {
    await api('c', 'POST', `/api/quiz/attempts/${id}/question`);
    await api('c', 'POST', `/api/quiz/attempts/${id}/answer`, { answerIndex: 1, round });
  }
  const done = await api('c', 'POST', `/api/quiz/attempts/${id}/complete`);
  const result = done.data.result;
  assert.equal(result.credited.energy, 10 + 3 * result.correctAnswers + (result.outcome ? 20 : 0));
  assert.equal(result.upgradeOffers.length, 3);
  const offer = result.upgradeOffers[0];
  const chosen = await api('c', 'POST', `/api/quiz/attempts/${id}/upgrade`, { upgradeId: offer });
  assert.equal(chosen.status, 200);
  assert.deepEqual(chosen.data.pond.upgrades, [offer]);
  const other = await api('c', 'POST', `/api/quiz/attempts/${id}/upgrade`, { upgradeId: result.upgradeOffers[1] });
  assert.equal(other.data.error.code, 'upgrade_unavailable');
  await setCounters('c', { quiz_rewarded: 12 });
  const practiceId = await playQuiz('c', { mode: 'free', topicId: 'world' });
  const practice = await api('c', 'POST', `/api/quiz/attempts/${practiceId}/complete`);
  assert.equal(practice.data.result.rewarded, false);
  assert.equal(practice.data.result.practice, true);
  assert.deepEqual(practice.data.result.credited, { energy: 0, water: 0, air: 0, love: 0, honey: 0 });
});

test('league table lists real players of the own league with the own rank', async () => {
  const { data } = await api('a', 'GET', '/api/leagues/table');
  assert.equal(data.league.id, 'mud');
  assert.ok(data.me.rank >= 1);
  assert.ok(data.table.every(row => !String(row.name).startsWith('bot-')));
});
