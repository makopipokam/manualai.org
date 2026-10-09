import { query, withTransaction, json, getPool } from '../db.mjs';
import { Economy as E, Progression as P, gameError } from '../shared.mjs';

const ensured = new Set();

// Resource columns are generated from the shared ruleset, so a new resource only
// needs a migration plus its entry in Economy.RESOURCES.
const RESOURCE_COLUMNS = E.RESOURCES.join(', ');
const RESOURCE_PLACEHOLDERS = E.RESOURCES.map(() => '?').join(', ');
const RESOURCE_ASSIGNMENTS = E.RESOURCES.map(key => `${key} = ?`).join(', ');
const resourceValues = resources => E.RESOURCES.map(key => resources[key]);

export function displayNameFor(user) {
  const name = String(user?.name || '').trim().replace(/\s+/g, ' ');
  return (name.split('@')[0] || '').slice(0, 24) || `Teich ${user.id}`;
}

export async function ensurePond(user) {
  if (!user || ensured.has(user.id)) return;
  const start = E.STARTING_RESOURCES;
  await query(
    `INSERT IGNORE INTO ponds (user_id, display_name, ${RESOURCE_COLUMNS}, last_tick_ms, revision, unlocked, upgrades,
       troops, skill_profile, trophies, best_trophies, pond_level, ruleset_version)
     VALUES (?, ?, ${RESOURCE_PLACEHOLDERS}, ?, 0, ?, '[]', '{}', '{}', ?, ?, 1, ?)`,
    [user.id, displayNameFor(user), ...resourceValues(start), Date.now(),
      JSON.stringify(E.START_UNLOCKS), P.START_TROPHIES, P.START_TROPHIES, E.RULESET_VERSION]);
  ensured.add(user.id);
}

function parsePond(row, buildingRows) {
  return {
    userId: Number(row.user_id),
    displayName: row.display_name,
    resources: Object.fromEntries(E.RESOURCES.map(key => [key, Number(row[key])])),
    lastTickMs: Number(row.last_tick_ms),
    revision: Number(row.revision),
    unlocked: json(row.unlocked, ['frog']),
    upgrades: json(row.upgrades, []),
    troops: json(row.troops, {}),
    skillProfile: json(row.skill_profile, {}),
    calibration: Number(row.calibration),
    quizRating: Number(row.quiz_rating),
    trophies: Number(row.trophies),
    bestTrophies: Number(row.best_trophies),
    shieldUntilMs: row.shield_until_ms === null ? null : Number(row.shield_until_ms),
    buildings: buildingRows.map(item => ({ type: item.type, x: Number(item.x), y: Number(item.y),
      bank: Number(item.bank), carry: Number(item.carry) })),
  };
}

// Locks the pond rows of all given users in ascending user_id order (deadlock-safe).
export async function lockPonds(conn, userIds) {
  const ids = [...new Set(userIds.map(Number))].sort((a, b) => a - b);
  const [rows] = await conn.query(`SELECT * FROM ponds WHERE user_id IN (?) ORDER BY user_id FOR UPDATE`, [ids]);
  const [buildingRows] = await conn.query(
    `SELECT * FROM pond_buildings WHERE user_id IN (?) ORDER BY user_id, type FOR UPDATE`, [ids]);
  const ponds = new Map();
  for (const row of rows) {
    ponds.set(Number(row.user_id), parsePond(row, buildingRows.filter(item => Number(item.user_id) === Number(row.user_id))));
  }
  return ponds;
}

export async function lockPond(conn, userId) {
  const pond = (await lockPonds(conn, [userId])).get(Number(userId));
  if (!pond) throw gameError('target_unavailable', 404);
  return pond;
}

export function accruePond(pond, nowMs) {
  const next = E.accrue({ resources: pond.resources, buildings: pond.buildings, lastTickMs: pond.lastTickMs, nowMs });
  pond.buildings = next.buildings;
  pond.lastTickMs = next.lastTickMs;
  return pond;
}

export async function savePond(conn, pond, { bumpRevision = true } = {}) {
  if (bumpRevision) pond.revision += 1;
  pond.bestTrophies = Math.max(pond.bestTrophies, pond.trophies);
  await conn.query(
    `UPDATE ponds SET ${RESOURCE_ASSIGNMENTS}, last_tick_ms = ?, revision = ?, unlocked = ?, upgrades = ?,
       troops = ?, skill_profile = ?, calibration = ?, quiz_rating = ?, trophies = ?, best_trophies = ?, pond_level = ?,
       shield_until_ms = ? WHERE user_id = ?`,
    [...resourceValues(pond.resources), pond.lastTickMs, pond.revision,
      JSON.stringify(pond.unlocked), JSON.stringify(pond.upgrades), JSON.stringify(pond.troops),
      JSON.stringify(pond.skillProfile), pond.calibration, pond.quizRating, pond.trophies, pond.bestTrophies,
      E.pondLevel(pond), pond.shieldUntilMs, pond.userId]);
  if (pond.buildings.length) {
    await conn.query(
      `INSERT INTO pond_buildings (user_id, type, x, y, bank, carry) VALUES ?
       ON DUPLICATE KEY UPDATE x = VALUES(x), y = VALUES(y), bank = VALUES(bank), carry = VALUES(carry)`,
      [pond.buildings.map(item => [pond.userId, item.type, item.x, item.y, item.bank || 0, item.carry || 0])]);
  }
}

export function pondSnapshot(pond, nowMs = Date.now()) {
  const league = P.leagueFor(pond.trophies);
  return {
    rulesetVersion: E.RULESET_VERSION,
    serverTime: nowMs,
    revision: pond.revision,
    displayName: pond.displayName,
    resources: { ...pond.resources },
    buildings: pond.buildings.map(item => ({ type: item.type, x: item.x, y: item.y, bank: item.bank || 0 })),
    lastTickMs: pond.lastTickMs,
    unlocked: [...pond.unlocked],
    upgrades: [...pond.upgrades],
    troops: Object.fromEntries(E.TROOP_TYPES.map(type => [type, Number(pond.troops[type]) || 0])),
    troopHousing: E.troopHousing(pond.troops),
    troopCapacity: E.TROOP_CAPACITY,
    trophies: pond.trophies,
    bestTrophies: pond.bestTrophies,
    league,
    pondLevel: E.pondLevel(pond),
    shieldUntil: pond.shieldUntilMs && pond.shieldUntilMs > nowMs ? pond.shieldUntilMs : null,
    skillProfile: pond.skillProfile,
    quizRating: pond.quizRating,
  };
}

// Read path without locks or writes: accrual is a pure function of the stored tick, and every
// write path accrues again from the stored state before changing balances.
export async function readPond(userId) {
  const pool = getPool();
  const [[rows], [buildingRows]] = await Promise.all([
    pool.query('SELECT * FROM ponds WHERE user_id = ? LIMIT 1', [userId]),
    pool.query('SELECT * FROM pond_buildings WHERE user_id = ? ORDER BY type LIMIT 10', [userId]),
  ]);
  if (!rows[0]) throw gameError('target_unavailable', 404);
  const now = Date.now();
  return pondSnapshot(accruePond(parsePond(rows[0], buildingRows), now), now);
}

function requireRevision(pond, revision, now) {
  if (!Number.isInteger(revision) || revision !== pond.revision) {
    throw gameError('revision_conflict', 409, { snapshot: pondSnapshot(pond, now) });
  }
}

export async function pondAction(userId, body) {
  const { action, type, unlockId } = body || {};
  const x = Number(body?.x), y = Number(body?.y);
  return withTransaction(async conn => {
    const now = Date.now();
    const pond = accruePond(await lockPond(conn, userId), now);
    requireRevision(pond, body?.revision, now);
    let result = {};
    if (action === 'place' || action === 'move') {
      const moving = action === 'move';
      const own = pond.buildings.find(item => item.type === type);
      if (moving && own && own.x === x && own.y === y) throw gameError('invalid_building', 422);
      const error = E.placementError(pond.buildings, pond.resources, type, x, y, moving);
      if (error) throw gameError(error, error === 'insufficient_resources' ? 409 : 422);
      if (moving) { own.x = x; own.y = y; }
      else {
        pond.resources = E.subtract(pond.resources, E.BUILDINGS[type].cost);
        pond.buildings.push({ type, x, y, bank: 0, carry: 0 });
      }
      result = { type, x, y };
    } else if (action === 'claim') {
      const claimed = E.claim({ resources: pond.resources, buildings: pond.buildings });
      if (claimed.total <= 0) throw gameError('nothing_to_claim', 409);
      pond.resources = claimed.resources;
      const banks = new Map(claimed.buildings.map(item => [item.type, item.bank]));
      pond.buildings = pond.buildings.map(item => ({ ...item, bank: banks.has(item.type) ? banks.get(item.type) : item.bank }));
      result = { gained: claimed.gained };
    } else if (action === 'unlock') {
      const item = E.UNLOCKS.find(entry => entry.id === unlockId);
      if (!item) throw gameError('unlock_unknown', 422);
      if (pond.unlocked.includes(item.id)) throw gameError('unlock_exists', 409);
      if (!E.canAfford(pond.resources, item.cost)) throw gameError('insufficient_resources', 409);
      pond.resources = E.subtract(pond.resources, item.cost);
      pond.unlocked = [...pond.unlocked, item.id];
      result = { unlockId: item.id };
    } else {
      throw gameError('invalid_building', 422);
    }
    await savePond(conn, pond);
    return { ...pondSnapshot(pond, now), result };
  });
}

export async function trainTroops(userId, body) {
  const unitType = body?.unitType;
  const count = Number(body?.count);
  return withTransaction(async conn => {
    const now = Date.now();
    const pond = accruePond(await lockPond(conn, userId), now);
    requireRevision(pond, body?.revision, now);
    const cost = E.trainCost(unitType, count);
    if (!cost || count > E.TROOP_CAPACITY) throw gameError('invalid_troop', 422);
    if (E.troopHousing(pond.troops) + E.TROOPS[unitType].housing * count > E.TROOP_CAPACITY) throw gameError('troop_capacity', 409);
    if (!E.canAfford(pond.resources, cost)) throw gameError('insufficient_resources', 409);
    pond.resources = E.subtract(pond.resources, cost);
    pond.troops = { ...pond.troops, [unitType]: (Number(pond.troops[unitType]) || 0) + count };
    await savePond(conn, pond);
    return { ...pondSnapshot(pond, now), result: { unitType, count, cost } };
  });
}
