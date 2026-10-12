import { randomUUID } from 'node:crypto';
import { getPool, withTransaction, json } from '../db.mjs';
import { Economy as E, QuizEngine as Q, Progression as P, Battle as B, gameError } from '../shared.mjs';
import { lockPond, accruePond, savePond, pondSnapshot } from './pond.mjs';
import { lockCounters, saveCounters, readCounters, reserveGeneration, today } from './counters.mjs';
import { TOPICS, OPPONENTS, SKILLS, QUESTION_TIME_MIN, generateQuestion, staticQuestion } from './questions.mjs';

const TOTALS = Object.freeze({ free: 8, duel: 10 });
const GRACE_MS = 3000;
const FREE_LIMIT_MS = 10 * 60 * 1000;
const DUEL_FOXES = Object.freeze(['redfox', 'arcticfox', 'fennec']);

function normalizeSkills(raw) {
  return Object.fromEntries(SKILLS.map(skill => {
    const value = Number(raw?.[skill]);
    return [skill, Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.5];
  }));
}

function publicQuestion(question, extra = {}) {
  return { id: question.id, type: question.type, skill: question.skill, difficulty: question.difficulty,
    prompt: question.prompt, options: question.options, source: question.source || 'archive', ...extra };
}

function publicAttempt(row, state, nowMs = Date.now()) {
  return {
    id: row.id, mode: row.mode, topicId: row.topic_id, opponentId: row.opponent_id, status: row.status,
    total: Number(row.total), round: state.round, playerHp: state.playerHp, aiHp: state.aiHp,
    combo: state.combo, maxCombo: state.maxCombo, skills: state.skills, upgrades: state.upgrades,
    scanner: Boolean(state.mods.scanner), scannerUsed: Boolean(state.scannerUsed),
    current: state.current && state.pendingAnswer ? publicQuestion(state.current, {
      round: state.round, timeLimitMs: state.timeLimitMs,
      remainingMs: Math.max(0, state.timeLimitMs - (nowMs - state.issuedAtMs)),
      removed: state.removedIndex ?? null, timed: row.mode === 'duel' }) : null,
    history: state.history.map(entry => ({ skill: entry.question.skill, correct: entry.correct, timeMs: entry.time,
      prompt: entry.question.prompt, questionTimeMs: entry.question.time })),
  };
}

async function loadAttempt(db, userId, attemptId, lock = false) {
  const [rows] = await db.query(`SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ? LIMIT 1${lock ? ' FOR UPDATE' : ''}`,
    [String(attemptId), userId]);
  if (!rows[0]) throw gameError('attempt_missing', 404);
  return { row: rows[0], state: json(rows[0].state, {}) };
}

async function saveAttempt(conn, row, state, extra = {}) {
  const sets = ['state = ?'];
  const params = [JSON.stringify(state)];
  for (const [column, value] of Object.entries(extra)) {
    sets.push(`${column} = ?`);
    params.push(column === 'result' ? JSON.stringify(value) : value);
  }
  params.push(row.id);
  await conn.query(`UPDATE quiz_attempts SET ${sets.join(', ')} WHERE id = ?`, params);
}

export async function startAttempt(user, body) {
  const mode = body?.mode === 'duel' ? 'duel' : body?.mode === 'free' ? 'free' : null;
  if (!mode) throw gameError('invalid_opponent', 422);
  const topicId = mode === 'free' ? body?.topicId : null;
  const opponentId = mode === 'free' ? 'owl' : body?.opponentId;
  if (mode === 'free' && !TOPICS[topicId]) throw gameError('invalid_topic', 422);
  if (mode === 'duel' && !DUEL_FOXES.includes(opponentId)) throw gameError('invalid_opponent', 422);
  const id = randomUUID();
  const now = Date.now();
  return withTransaction(async conn => {
    const pond = await lockPond(conn, user.id);
    const upgrades = pond.upgrades.filter(upgradeId => E.UPGRADES.some(item => item.id === upgradeId));
    const state = {
      round: 0, playerHp: 100, aiHp: 100, combo: 0, maxCombo: 0, skills: normalizeSkills(pond.skillProfile),
      history: [], upgrades, mods: E.upgradeMods(upgrades), calmUsed: false, scannerUsed: false,
      current: null, pendingAnswer: false, issuedAtMs: 0, timeLimitMs: 0, aiQuestionCount: 0, fallbackCount: 0,
      exhausted: false,
    };
    await conn.query(`UPDATE quiz_attempts SET status = 'abandoned' WHERE user_id = ? AND status = 'active'`, [user.id]);
    await conn.query(
      `INSERT INTO quiz_attempts (id, user_id, mode, topic_id, opponent_id, status, total, state, created_at_ms)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
      [id, user.id, mode, topicId, opponentId, TOTALS[mode], JSON.stringify(state), now]);
    const counters = await lockCounters(conn, user.id);
    const row = { id, mode, topic_id: topicId, opponent_id: opponentId, status: 'active', total: TOTALS[mode] };
    return { attempt: publicAttempt(row, state, now),
      rewardsLeftToday: Math.max(0, P.DAILY_QUIZ_REWARDS - counters.quizRewarded) };
  });
}

function timeLimitFor(row, state, question) {
  if (row.mode !== 'duel') return FREE_LIMIT_MS;
  const base = Math.max(Number(question.time) || 0, QUESTION_TIME_MIN[question.skill] || 20000);
  const recent = state.history.slice(-2);
  let factor = OPPONENTS[row.opponent_id].time;
  if (recent.length === 2 && recent.every(entry => !entry.correct)) factor = Math.max(1.12, factor * 1.3);
  else if (recent.at(-1) && (!recent.at(-1).correct || recent.at(-1).time > recent.at(-1).question.time * 0.85)) factor = Math.max(1, factor * 1.12);
  const memory = question.skill === 'recall' ? (state.mods.time || 0) : 0;
  return Math.round(base * factor) + memory;
}

export async function nextQuestion(user, attemptId) {
  const pool = getPool();
  const { row, state } = await loadAttempt(pool, user.id, attemptId);
  if (row.status !== 'active') throw gameError('attempt_closed', 409);
  const now = Date.now();
  if (state.pendingAnswer && state.current) return { attempt: publicAttempt(row, state, now), question: publicAttempt(row, state, now).current };
  if (state.round >= Number(row.total) || state.exhausted) return { attempt: publicAttempt(row, state, now), question: null, done: true };

  const topicSkills = row.topic_id ? TOPICS[row.topic_id].skills : [];
  const opponent = OPPONENTS[row.opponent_id];
  const profile = Q.adaptiveQuestionProfile({ skills: state.skills, topicSkills, history: state.history, opponent, mode: row.mode });
  let question = null;
  let generated = false;
  if (await reserveGeneration(pool, user.id)) {
    question = await generateQuestion({ mode: row.mode, topicId: row.topic_id, opponentId: row.opponent_id,
      skills: state.skills, profile, history: state.history });
    generated = Boolean(question);
  }
  if (!question) {
    question = staticQuestion({ mode: row.mode, topicId: row.topic_id, history: state.history, skills: state.skills,
      opponent, round: state.round + 1, accuracy: accuracyOf(state), topicSkills });
  }

  return withTransaction(async conn => {
    const fresh = await loadAttempt(conn, user.id, attemptId, true);
    const s = fresh.state;
    const at = Date.now();
    if (fresh.row.status !== 'active') throw gameError('attempt_closed', 409);
    if (s.pendingAnswer && s.current) return { attempt: publicAttempt(fresh.row, s, at), question: publicAttempt(fresh.row, s, at).current };
    if (s.round !== state.round) return { attempt: publicAttempt(fresh.row, s, at), question: null, retry: true };
    if (!question) {
      s.exhausted = true;
      await saveAttempt(conn, fresh.row, s, { total: s.history.length });
      fresh.row.total = s.history.length;
      return { attempt: publicAttempt(fresh.row, s, at), question: null, done: true };
    }
    s.round += 1;
    s.current = question;
    s.pendingAnswer = true;
    s.issuedAtMs = at;
    s.timeLimitMs = timeLimitFor(fresh.row, s, question);
    s.removedIndex = null;
    s.challenge = profile;
    if (generated) s.aiQuestionCount += 1; else s.fallbackCount += 1;
    await saveAttempt(conn, fresh.row, s);
    const attempt = publicAttempt(fresh.row, s, at);
    return { attempt, question: attempt.current, weakestSkill: profile.weakestSkill };
  });
}

function accuracyOf(state) {
  return state.history.length ? state.history.filter(entry => entry.correct).length / state.history.length : 0;
}

export async function answerQuestion(user, attemptId, body) {
  const requested = Number(body?.answerIndex);
  if (!Number.isInteger(requested) || requested < -1 || requested > 3) throw gameError('invalid_answer', 422);
  return withTransaction(async conn => {
    const { row, state } = await loadAttempt(conn, user.id, attemptId, true);
    if (row.status !== 'active') throw gameError('attempt_closed', 409);
    if (!state.pendingAnswer || !state.current) throw gameError('no_question', 409);
    if (Number.isInteger(body?.round) && body.round !== state.round) throw gameError('no_question', 409);
    const now = Date.now();
    const question = state.current;
    const elapsed = Math.max(1, now - state.issuedAtMs);
    const duel = row.mode === 'duel';
    let answerIndex = requested;
    let timedOut = false;
    let time = elapsed;
    if (duel && (elapsed > state.timeLimitMs + GRACE_MS || requested === -1)) {
      timedOut = elapsed > state.timeLimitMs + GRACE_MS || requested === -1;
      if (elapsed > state.timeLimitMs + GRACE_MS) answerIndex = -1;
      time = Math.min(elapsed, state.timeLimitMs);
    }
    const mods = { ...state.mods };
    if (state.calmUsed) delete mods.calm;
    const result = Q.evaluateAnswer({ answerIndex, question, responseTimeMs: time, combo: state.combo, mods });
    if (!result.correct && mods.calm && state.combo > 0) state.calmUsed = true;
    state.combo = result.combo;
    state.maxCombo = Math.max(state.maxCombo, result.combo);
    if (duel) {
      state.aiHp = Math.max(0, state.aiHp - result.damage);
      state.playerHp = Math.max(0, state.playerHp - result.selfDamage);
    }
    state.skills[question.skill] = Q.updateSkillEstimate({ before: state.skills[question.skill], correct: result.correct,
      difficulty: question.difficulty, responseTimeMs: time, questionTime: question.time });
    state.history.push({ question, correct: result.correct, pickedIndex: answerIndex, time, damage: result.damage,
      selfDamage: result.selfDamage, timedOut });
    state.pendingAnswer = false;
    await saveAttempt(conn, row, state);
    return {
      correct: result.correct, answerIndex, correctIndex: question.answer, explanation: question.explanation,
      damage: duel ? result.damage : 0, selfDamage: duel ? result.selfDamage : 0, timeMs: time, timedOut,
      questionTimeMs: question.time, attempt: publicAttempt(row, state, now),
      done: state.round >= Number(row.total),
    };
  });
}

export async function scanQuestion(user, attemptId) {
  return withTransaction(async conn => {
    const { row, state } = await loadAttempt(conn, user.id, attemptId, true);
    if (row.status !== 'active' || !state.pendingAnswer || !state.current) throw gameError('no_question', 409);
    if (!state.mods.scanner || state.scannerUsed) throw gameError('upgrade_unavailable', 409);
    const wrong = [0, 1, 2, 3].filter(index => index !== state.current.answer);
    const removedIndex = wrong[B.fnv1a(`${row.id}:${state.round}`) % wrong.length];
    state.scannerUsed = true;
    state.removedIndex = removedIndex;
    await saveAttempt(conn, row, state);
    return { removedIndex, attempt: publicAttempt(row, state) };
  });
}

function upgradeOffers(attemptId) {
  const ids = E.UPGRADES.map(item => item.id);
  return ids.map(id => ({ id, hash: B.fnv1a(`${attemptId}:${id}`) })).sort((a, b) => a.hash - b.hash).slice(0, 3).map(item => item.id);
}

function weakestOf(skills, scope) {
  const keys = scope?.length ? scope : Object.keys(skills);
  return [...keys].sort((a, b) => (skills[a] ?? 0.5) - (skills[b] ?? 0.5))[0];
}

export async function completeAttempt(user, attemptId) {
  return withTransaction(async conn => {
    const now = Date.now();
    const pond = accruePond(await lockPond(conn, user.id), now);
    const { row, state } = await loadAttempt(conn, user.id, attemptId, true);
    if (row.status === 'completed') {
      return { result: json(row.result, {}), alreadyCompleted: true, pond: pondSnapshot(pond, now) };
    }
    if (row.status !== 'active') throw gameError('attempt_closed', 409);
    const total = Number(row.total);
    if (state.pendingAnswer || state.history.length < total) throw gameError('attempt_incomplete', 409);

    const free = row.mode === 'free';
    const history = state.history;
    const noQuestions = history.length === 0;
    const correctAnswers = history.filter(entry => entry.correct).length;
    const outcome = free ? 1 : (state.aiHp <= state.playerHp ? 1 : 0);
    const accuracy = accuracyOf(state);
    const averageDifficulty = history.length ? history.reduce((sum, entry) => sum + entry.question.difficulty, 0) / history.length : 0;
    const fastCorrectRate = Math.min(1, history.filter(entry => entry.correct && entry.time < entry.question.time * 0.55).length / 3);
    const counters = await lockCounters(conn, user.id, today(now));
    const rewarded = !noQuestions && counters.quizRewarded < P.DAILY_QUIZ_REWARDS;
    const base = noQuestions ? { ...E.EMPTY_RESOURCES }
      : Q.calculateResourceRewards({ mode: row.mode, correctAnswers, totalRounds: total, outcome, fastCorrectRate, maxCombo: state.maxCombo });
    const earned = { ...base, energy: noQuestions ? 0 : free ? correctAnswers : 10 + 3 * correctAnswers + (outcome ? 20 : 0) };
    const credited = rewarded ? earned : { ...E.EMPTY_RESOURCES };
    const before = { ...pond.resources };
    for (const key of E.RESOURCES) pond.resources[key] += credited[key];
    let ratingDelta = 0;
    if (!free && !noQuestions) {
      const score = Q.calculateMatchScore({ outcome, accuracy, averageDifficulty, fastCorrectRate });
      const rating = Q.calculateNewEnergy({ before: pond.quizRating, opponentRating: OPPONENTS[row.opponent_id].rating,
        score, calibration: pond.calibration });
      ratingDelta = rating.energy - pond.quizRating;
      pond.quizRating = rating.energy;
      pond.calibration = Math.min(1, pond.calibration + 1);
    }
    pond.skillProfile = normalizeSkills(state.skills);
    if (rewarded) { counters.quizRewarded += 1; await saveCounters(conn, counters); }
    const topicSkills = row.topic_id ? TOPICS[row.topic_id].skills : null;
    const strongest = Object.entries(state.skills).sort((a, b) => b[1] - a[1])[0][0];
    const result = {
      mode: row.mode, topicId: row.topic_id, opponentId: row.opponent_id, outcome, noQuestions, correctAnswers, total,
      earned, credited, rewarded, practice: !rewarded && !noQuestions,
      rewardsLeftToday: Math.max(0, P.DAILY_QUIZ_REWARDS - counters.quizRewarded),
      before, after: { ...pond.resources }, ratingDelta, quizRating: pond.quizRating,
      strongest, weakest: weakestOf(state.skills, topicSkills),
      upgradeOffers: free || noQuestions ? [] : upgradeOffers(row.id), upgradeChosen: null,
      aiQuestionCount: state.aiQuestionCount, fallbackCount: state.fallbackCount, completedAt: now,
    };
    await saveAttempt(conn, row, state, { status: 'completed', result, rewarded: rewarded ? 1 : 0, completed_at_ms: now });
    await savePond(conn, pond);
    return { result, alreadyCompleted: false, pond: pondSnapshot(pond, now) };
  });
}

export async function chooseUpgrade(user, attemptId, body) {
  const upgradeId = body?.upgradeId;
  return withTransaction(async conn => {
    const now = Date.now();
    const pond = accruePond(await lockPond(conn, user.id), now);
    const { row, state } = await loadAttempt(conn, user.id, attemptId, true);
    const result = json(row.result, null);
    if (row.status !== 'completed' || !result) throw gameError('upgrade_unavailable', 409);
    if (result.upgradeChosen) {
      if (result.upgradeChosen === upgradeId) return { result, pond: pondSnapshot(pond, now) };
      throw gameError('upgrade_unavailable', 409);
    }
    if (!result.upgradeOffers.includes(upgradeId)) throw gameError('upgrade_unavailable', 409);
    pond.upgrades = [...pond.upgrades.filter(id => id !== upgradeId)].slice(-(E.MAX_ACTIVE_UPGRADES - 1)).concat(upgradeId);
    result.upgradeChosen = upgradeId;
    await saveAttempt(conn, row, state, { result });
    await savePond(conn, pond);
    return { result, pond: pondSnapshot(pond, now) };
  });
}

export async function quizStatus(user) {
  const counters = await readCounters(getPool(), user.id);
  return {
    rewardsLeftToday: Math.max(0, P.DAILY_QUIZ_REWARDS - counters.quizRewarded),
    rewardLimit: P.DAILY_QUIZ_REWARDS,
    generationsLeftToday: Math.max(0, P.DAILY_QUESTION_GENERATIONS - counters.questionsGenerated),
  };
}
