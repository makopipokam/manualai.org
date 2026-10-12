import { randomUUID } from 'node:crypto';
import { getPool, withTransaction, json } from '../db.mjs';
import { Economy as E, Battle as B, Progression as P, Bots, gameError } from '../shared.mjs';
import { lockPonds, accruePond, savePond, pondSnapshot } from './pond.mjs';
import { lockCounters, saveCounters, readCounters, today } from './counters.mjs';

function parseTarget(targetKey) {
  const text = String(targetKey || '');
  if (text.startsWith('u:') && /^\d+$/.test(text.slice(2))) return { kind: 'player', userId: Number(text.slice(2)), key: text };
  if (text.startsWith('b:') && Bots.indexOf(text.slice(2)) >= 0) return { kind: 'bot', botId: text.slice(2), key: text };
  return null;
}

function limitsFrom(counters, nowMs) {
  return {
    attacksUsed: counters.attacksUsed, attackLimit: P.DAILY_ATTACK_LIMIT,
    attacksLeft: Math.max(0, P.DAILY_ATTACK_LIMIT - counters.attacksUsed),
    lootTaken: counters.lootTaken, lootLimit: P.DAILY_LOOT_LIMIT,
    lootLeft: Math.max(0, P.DAILY_LOOT_LIMIT - counters.lootTaken),
    resetsAt: P.nextUtcMidnight(nowMs),
  };
}

async function cooldownKeys(db, attackerId, nowMs) {
  const [rows] = await db.query(
    'SELECT defender_id, bot_id FROM battles WHERE attacker_id = ? AND created_at_ms > ? LIMIT 500',
    [attackerId, nowMs - P.TARGET_COOLDOWN_MS]);
  return new Set(rows.map(row => row.bot_id ? `b:${row.bot_id}` : `u:${row.defender_id}`));
}

async function readPondRow(db, userId) {
  const [[row]] = await db.query(
    `SELECT user_id, display_name, trophies, pond_level, shield_until_ms, ${E.RESOURCES.join(', ')}, last_tick_ms
     FROM ponds WHERE user_id = ? LIMIT 1`,
    [userId]);
  if (!row) return null;
  const [buildings] = await db.query('SELECT type, x, y, bank, carry FROM pond_buildings WHERE user_id = ?', [userId]);
  return { row, buildings: buildings.map(item => ({ type: item.type, x: Number(item.x), y: Number(item.y),
    bank: Number(item.bank), carry: Number(item.carry) })) };
}

async function candidateRotation(db, attacker, nowMs) {
  const blocked = await cooldownKeys(db, attacker.userId, nowMs);
  const [rows] = await db.query(
    `SELECT user_id, display_name, trophies, pond_level FROM ponds
     WHERE user_id <> ? AND (shield_until_ms IS NULL OR shield_until_ms <= ?)
     ORDER BY ABS(trophies - ?) ASC, user_id ASC LIMIT 200`,
    [attacker.userId, nowMs, attacker.trophies]);
  const players = rows.map(row => ({ key: `u:${row.user_id}`, kind: 'player', userId: Number(row.user_id),
    name: row.display_name, trophies: Number(row.trophies), level: Number(row.pond_level) }));
  const bots = Bots.list().map(bot => ({ key: bot.key, kind: 'bot', botId: bot.id, name: bot.name,
    trophies: bot.trophies, level: bot.level }));
  const eligible = [...players, ...bots].filter(candidate => !blocked.has(candidate.key));
  const selection = P.selectCandidates({ trophies: attacker.trophies, level: E.pondLevel(attacker) }, eligible);
  return { order: P.rotationOrder(attacker.userId, today(nowMs), selection.candidates), window: selection.window };
}

async function targetState(db, candidate, nowMs) {
  if (candidate.kind === 'bot') {
    const bot = Bots.snapshot(candidate.botId, today(nowMs));
    return { name: bot.name, trophies: bot.trophies, level: bot.level, resources: bot.resources, buildings: bot.buildings };
  }
  const loaded = await readPondRow(db, candidate.userId);
  if (!loaded) return null;
  const resources = Object.fromEntries(E.RESOURCES.map(key => [key, Number(loaded.row[key])]));
  const accrued = E.accrue({ resources, buildings: loaded.buildings, lastTickMs: Number(loaded.row.last_tick_ms), nowMs });
  return { name: loaded.row.display_name, trophies: Number(loaded.row.trophies), level: Number(loaded.row.pond_level),
    resources, buildings: accrued.buildings };
}

async function attackerPond(db, userId) {
  const loaded = await readPondRow(db, userId);
  const [[extra]] = await db.query('SELECT unlocked, troops FROM ponds WHERE user_id = ? LIMIT 1', [userId]);
  return { userId, trophies: Number(loaded.row.trophies), buildings: loaded.buildings,
    unlocked: json(extra.unlocked, ['frog']), troops: json(extra.troops, {}) };
}

export async function currentOpponent(user, { advance = false } = {}) {
  const db = getPool();
  const now = Date.now();
  const attacker = await attackerPond(db, user.id);
  const { order, window } = await candidateRotation(db, attacker, now);
  let counters;
  if (advance) {
    counters = await withTransaction(async conn => {
      const locked = await lockCounters(conn, user.id, today(now));
      locked.rotationIndex += 1;
      await saveCounters(conn, locked);
      return locked;
    });
  } else {
    counters = await readCounters(db, user.id, today(now));
  }
  const limits = limitsFrom(counters, now);
  if (!order.length) return { opponent: null, rotation: { index: 0, size: 0, window }, limits };
  const index = counters.rotationIndex % order.length;
  const candidate = order[index];
  const target = await targetState(db, candidate, now);
  if (!target) return { opponent: null, rotation: { index, size: order.length, window }, limits };
  const available = P.lootAvailable({ resources: target.resources, buildings: target.buildings });
  const league = P.leagueFor(attacker.trophies);
  return {
    opponent: {
      key: candidate.key, kind: candidate.kind, name: target.name, trophies: target.trophies,
      league: P.leagueFor(target.trophies), pondLevel: target.level,
      buildings: target.buildings.map(item => ({ type: item.type, x: item.x, y: item.y })),
      lootPreview: P.lootPreview({ available, leagueBonus: league.bonus, remaining: limits.lootLeft }),
      trophies3: P.trophyPreview(attacker.trophies, target.trophies),
    },
    rotation: { index, size: order.length, window: Number.isFinite(window) ? window : null },
    limits,
  };
}

function normalizeDeployment(deployment) {
  if (!Array.isArray(deployment)) return null;
  return deployment.slice(0, B.MAX_DEPLOYMENT + 1).map(entry => ({ unit: String(entry?.unit || ''), x: Number(entry?.x), y: Number(entry?.y) }));
}

export async function launchAttack(user, body) {
  const target = parseTarget(body?.targetKey);
  if (!target || (target.kind === 'player' && target.userId === user.id)) throw gameError('target_unavailable', 404);
  const deployment = normalizeDeployment(body?.deployment);
  if (!deployment) throw gameError('invalid_deployment', 422);
  const battleId = randomUUID();
  const seed = B.seedFrom(battleId);
  return withTransaction(async conn => {
    const now = Date.now();
    const day = today(now);
    const ponds = await lockPonds(conn, target.kind === 'player' ? [user.id, target.userId] : [user.id]);
    const attacker = ponds.get(user.id);
    const defender = target.kind === 'player' ? ponds.get(target.userId) : null;
    if (target.kind === 'player' && !defender) throw gameError('target_unavailable', 404);
    const counters = await lockCounters(conn, user.id, day);
    if (counters.attacksUsed >= P.DAILY_ATTACK_LIMIT) throw gameError('daily_attack_limit', 429, { limits: limitsFrom(counters, now) });
    const [recent] = await conn.query(
      `SELECT id FROM battles WHERE attacker_id = ? AND ${target.kind === 'player' ? 'defender_id' : 'bot_id'} = ? AND created_at_ms > ? LIMIT 1`,
      [user.id, target.kind === 'player' ? target.userId : target.botId, now - P.TARGET_COOLDOWN_MS]);
    if (recent.length) throw gameError('target_cooldown', 409);
    if (defender && defender.shieldUntilMs && defender.shieldUntilMs > now) throw gameError('target_shielded', 409);

    accruePond(attacker, now);
    let defenderView;
    if (defender) {
      accruePond(defender, now);
      defenderView = { name: defender.displayName, trophies: defender.trophies, resources: { ...defender.resources },
        buildings: defender.buildings.map(item => ({ ...item })) };
    } else {
      const bot = Bots.snapshot(target.botId, day);
      defenderView = { name: bot.name, trophies: bot.trophies, resources: bot.resources, buildings: bot.buildings };
    }
    const layout = defenderView.buildings.map(item => ({ type: item.type, x: item.x, y: item.y }));
    const deploymentError = B.validateDeployment(layout, deployment, attacker.troops);
    if (deploymentError) throw gameError(deploymentError, 422);

    const sim = B.simulate({ layout, deployment, seed });
    const producerFractions = Object.fromEntries(sim.damage.filter(item => E.BUILDINGS[item.type]?.kind === 'producer')
      .map(item => [item.type, item.fraction]));
    const available = P.lootAvailable({ resources: defenderView.resources, buildings: defenderView.buildings });
    const league = P.leagueFor(attacker.trophies);
    const loot = P.computeLoot({ available, coreFraction: sim.damage[0].fraction, producerFractions, stars: sim.stars,
      leagueBonus: league.bonus, remaining: P.DAILY_LOOT_LIMIT - counters.lootTaken });
    const trophyDelta = P.trophyChange({ attackerTrophies: attacker.trophies, defenderTrophies: defenderView.trophies, stars: sim.stars });

    const attackerBefore = attacker.trophies;
    for (const key of E.RESOURCES) attacker.resources[key] += loot.gained[key];
    const used = B.deploymentCounts(deployment);
    attacker.troops = Object.fromEntries(E.TROOP_TYPES.map(type => [type, Math.max(0, (Number(attacker.troops[type]) || 0) - used[type])]));
    attacker.trophies = Math.max(0, attacker.trophies + trophyDelta.attacker);
    attacker.shieldUntilMs = null;

    const defenderLoss = { ...E.EMPTY_RESOURCES };
    let shieldUntil = null;
    if (defender) {
      for (const key of E.PRODUCED) { defender.resources[key] -= loot.storage[key]; defenderLoss[key] += loot.storage[key]; }
      defender.buildings = defender.buildings.map(item => {
        const taken = loot.banks[item.type] || 0;
        if (taken) defenderLoss[E.BUILDINGS[item.type].resource] += taken;
        return { ...item, bank: Math.max(0, (item.bank || 0) - taken) };
      });
      defender.trophies = Math.max(0, defender.trophies + trophyDelta.defender);
      if (sim.stars >= 1) { shieldUntil = now + P.SHIELD_MS; defender.shieldUntilMs = shieldUntil; }
      await savePond(conn, defender);
    }
    await savePond(conn, attacker);
    counters.attacksUsed += 1;
    counters.lootTaken += loot.total;
    await saveCounters(conn, counters);

    const lootRecord = { ...loot, defenderLoss, leagueBonus: league.bonus };
    await conn.query(
      `INSERT INTO battles (id, attacker_id, defender_id, bot_id, attacker_name, defender_name, ruleset_version, seed, snapshot,
         deployment, stars, destruction, core_destroyed, loot, attacker_trophies_before, attacker_trophy_delta,
         defender_trophies_before, defender_trophy_delta, shield_until_ms, replay_hash, seen_by_defender, created_at_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [battleId, user.id, defender ? defender.userId : null, defender ? null : target.botId, attacker.displayName,
        defenderView.name, E.RULESET_VERSION, seed, JSON.stringify({ buildings: layout }), JSON.stringify(deployment),
        sim.stars, sim.destruction, sim.coreDestroyed ? 1 : 0, JSON.stringify(lootRecord), attackerBefore,
        attacker.trophies - attackerBefore, defenderView.trophies, defender ? trophyDelta.defender : 0, shieldUntil,
        sim.replayHash, defender ? 0 : 1, now]);

    return {
      battle: {
        id: battleId, targetKey: target.key, defenderName: defenderView.name, kind: target.kind,
        stars: sim.stars, destruction: sim.destruction, coreDestroyed: sim.coreDestroyed, ticks: sim.ticks,
        unitsDeployed: sim.unitsDeployed, unitsLost: sim.unitsLost,
        loot: { gained: loot.gained, total: loot.total, raw: loot.raw, capped: loot.capped, bonus: loot.bonus },
        trophies: { before: attackerBefore, delta: attacker.trophies - attackerBefore, after: attacker.trophies },
        replayHash: sim.replayHash,
      },
      replay: { layout: sim.layout, deployment, frames: sim.frames, verified: true },
      pond: pondSnapshot(attacker, now),
      limits: limitsFrom(counters, now),
    };
  });
}

function reportFrom(row, perspective) {
  const loot = json(row.loot, {});
  const defense = perspective === 'defense';
  return {
    id: row.id, at: Number(row.created_at_ms), perspective,
    opponentName: defense ? row.attacker_name : row.defender_name,
    opponentKind: row.bot_id ? 'bot' : 'player',
    stars: Number(row.stars), destruction: Number(row.destruction), coreDestroyed: Boolean(row.core_destroyed),
    resources: defense ? (loot.defenderLoss || {}) : (loot.gained || {}),
    lootCapped: Boolean(loot.capped),
    trophyDelta: defense ? Number(row.defender_trophy_delta) : Number(row.attacker_trophy_delta),
    shieldUntil: row.shield_until_ms ? Number(row.shield_until_ms) : null,
    seen: defense ? Boolean(row.seen_by_defender) : true,
    replayHash: row.replay_hash,
  };
}

export async function listReports(user, type) {
  const perspective = type === 'attack' ? 'attack' : 'defense';
  const column = perspective === 'attack' ? 'attacker_id' : 'defender_id';
  const [rows] = await getPool().query(
    `SELECT id, attacker_name, defender_name, bot_id, stars, destruction, core_destroyed, loot, attacker_trophy_delta,
       defender_trophy_delta, shield_until_ms, seen_by_defender, replay_hash, created_at_ms
     FROM battles WHERE ${column} = ? ORDER BY created_at_ms DESC LIMIT 30`, [user.id]);
  const unread = await unreadDefenseCount(user.id);
  return { reports: rows.map(row => reportFrom(row, perspective)), unread };
}

export async function unreadDefenseCount(userId) {
  const [[row]] = await getPool().query('SELECT COUNT(*) AS n FROM battles WHERE defender_id = ? AND seen_by_defender = 0 LIMIT 1', [userId]);
  return Number(row?.n || 0);
}

export async function markReportsSeen(user) {
  await getPool().query('UPDATE battles SET seen_by_defender = 1 WHERE defender_id = ? AND seen_by_defender = 0', [user.id]);
  return { unread: 0 };
}

export async function replayReport(user, battleId) {
  const [[row]] = await getPool().query(
    `SELECT * FROM battles WHERE id = ? AND (attacker_id = ? OR defender_id = ?) LIMIT 1`, [String(battleId), user.id, user.id]);
  if (!row) throw gameError('report_missing', 404);
  const snapshot = json(row.snapshot, { buildings: [] });
  const deployment = json(row.deployment, []);
  const result = B.verifyReplay({ layout: snapshot.buildings, deployment, seed: Number(row.seed), replayHash: row.replay_hash });
  const perspective = Number(row.attacker_id) === user.id ? 'attack' : 'defense';
  return {
    report: reportFrom(row, perspective),
    replay: { layout: result.layout, deployment, frames: result.frames, verified: result.verified,
      recomputedHash: result.replayHash, storedHash: row.replay_hash },
    attackerName: row.attacker_name, defenderName: row.defender_name,
  };
}

export async function leagueTable(user) {
  const db = getPool();
  const [[me]] = await db.query('SELECT trophies FROM ponds WHERE user_id = ? LIMIT 1', [user.id]);
  const trophies = Number(me?.trophies || 0);
  const league = P.leagueFor(trophies);
  const max = league.max === null ? 2147483647 : league.max;
  const [rows] = await db.query(
    `SELECT user_id, display_name, trophies, pond_level FROM ponds WHERE trophies BETWEEN ? AND ?
     ORDER BY trophies DESC, user_id ASC LIMIT 50`, [league.min, max]);
  const [[rank]] = await db.query(
    `SELECT COUNT(*) AS ahead FROM ponds WHERE trophies BETWEEN ? AND ? AND (trophies > ? OR (trophies = ? AND user_id < ?)) LIMIT 1`,
    [league.min, max, trophies, trophies, user.id]);
  const [[size]] = await db.query('SELECT COUNT(*) AS n FROM ponds WHERE trophies BETWEEN ? AND ? LIMIT 1', [league.min, max]);
  return {
    league, leagues: P.LEAGUES,
    me: { rank: Number(rank.ahead) + 1, trophies },
    players: Number(size.n),
    table: rows.map((row, index) => ({ rank: index + 1, name: row.display_name, trophies: Number(row.trophies),
      pondLevel: Number(row.pond_level), isMe: Number(row.user_id) === user.id })),
  };
}

export async function progression(user) {
  const db = getPool();
  const now = Date.now();
  const [[[row]], counters, unreadDefense] = await Promise.all([
    db.query('SELECT trophies, best_trophies, pond_level, shield_until_ms FROM ponds WHERE user_id = ? LIMIT 1', [user.id]),
    readCounters(db, user.id, today(now)),
    unreadDefenseCount(user.id),
  ]);
  const trophies = Number(row.trophies);
  const league = P.leagueFor(trophies);
  const nextLeague = P.LEAGUES[P.LEAGUES.indexOf(league) + 1] || null;
  return {
    trophies, bestTrophies: Number(row.best_trophies), league, nextLeague, leagues: P.LEAGUES,
    pondLevel: Number(row.pond_level),
    shieldUntil: row.shield_until_ms && Number(row.shield_until_ms) > now ? Number(row.shield_until_ms) : null,
    unreadDefense,
    quizRewardsLeft: Math.max(0, P.DAILY_QUIZ_REWARDS - counters.quizRewarded),
    ...limitsFrom(counters, now),
  };
}
