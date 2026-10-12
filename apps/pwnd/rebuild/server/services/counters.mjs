import { Progression as P } from '../shared.mjs';

export function today(nowMs = Date.now()) { return P.utcDay(nowMs); }

function parse(row, userId, day) {
  return {
    userId, day,
    attacksUsed: Number(row?.attacks_used || 0),
    lootTaken: Number(row?.loot_taken || 0),
    rotationIndex: Number(row?.rotation_index || 0),
    quizRewarded: Number(row?.quiz_rewarded || 0),
    questionsGenerated: Number(row?.questions_generated || 0),
  };
}

// Creates today's row if needed and locks it for the rest of the transaction.
export async function lockCounters(conn, userId, day = today()) {
  await conn.query('INSERT IGNORE INTO daily_counters (user_id, day) VALUES (?, ?)', [userId, day]);
  const [[row]] = await conn.query('SELECT * FROM daily_counters WHERE user_id = ? AND day = ? FOR UPDATE', [userId, day]);
  return parse(row, userId, day);
}

export async function readCounters(db, userId, day = today()) {
  const [rows] = await db.query('SELECT * FROM daily_counters WHERE user_id = ? AND day = ? LIMIT 1', [userId, day]);
  return parse(rows[0], userId, day);
}

export async function saveCounters(conn, counters) {
  await conn.query(
    `UPDATE daily_counters SET attacks_used = ?, loot_taken = ?, rotation_index = ?, quiz_rewarded = ?, questions_generated = ?
     WHERE user_id = ? AND day = ?`,
    [counters.attacksUsed, counters.lootTaken, counters.rotationIndex, counters.quizRewarded, counters.questionsGenerated,
      counters.userId, counters.day]);
}

// Atomically reserves one LLM generation for today; false once the daily budget is used.
export async function reserveGeneration(db, userId, day = today()) {
  await db.query('INSERT IGNORE INTO daily_counters (user_id, day) VALUES (?, ?)', [userId, day]);
  const [result] = await db.query(
    `UPDATE daily_counters SET questions_generated = questions_generated + 1
     WHERE user_id = ? AND day = ? AND questions_generated < ?`, [userId, day, P.DAILY_QUESTION_GENERATIONS]);
  return result.affectedRows === 1;
}
