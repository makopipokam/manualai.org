(function (root, factory) {
  const deps = typeof module === 'object' && module.exports
    ? [require('./economy.js'), require('./battle-engine.js')]
    : [root.PwndEconomy, root.PwndBattle];
  const api = factory(...deps);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PwndProgression = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (E, B) {
  'use strict';

  // Matchmaking & Progression v1. All numbers live here so they are easy to tune.
  const DAILY_ATTACK_LIMIT = 6;
  const DAILY_LOOT_LIMIT = 2500;
  const TARGET_COOLDOWN_MS = 4 * 60 * 60 * 1000;
  const SHIELD_MS = 2 * 60 * 60 * 1000;
  const START_TROPHIES = 100;
  const STORAGE_PROTECTED = 300;
  const STORAGE_LOOT_SHARE = 0.2;
  const BANK_LOOT_SHARE = 0.5;
  const MATCH_WINDOWS = Object.freeze([3, 6, 12, Infinity]);
  const MIN_CANDIDATES = 3;
  const DAILY_QUIZ_REWARDS = 12;
  const DAILY_QUESTION_GENERATIONS = 40;

  const LEAGUES = Object.freeze([
    { id: 'mud', name: 'Schlammgrund', min: 0, max: 399, bonus: 0, symbol: '◌' },
    { id: 'pebble', name: 'Kieselbett', min: 400, max: 799, bonus: 40, symbol: '◍' },
    { id: 'reed', name: 'Schilfrand', min: 800, max: 1199, bonus: 80, symbol: '♒' },
    { id: 'lily', name: 'Seerosenteich', min: 1200, max: 1599, bonus: 140, symbol: '✿' },
    { id: 'lotus', name: 'Lotusthron', min: 1600, max: null, bonus: 220, symbol: '❀' },
  ].map(Object.freeze));

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function leagueFor(trophies) {
    const t = Math.max(0, Number(trophies) || 0);
    return [...LEAGUES].reverse().find(league => t >= league.min) || LEAGUES[0];
  }
  function trophyOffer(attackerTrophies, defenderTrophies) {
    return clamp(25 + Math.round((defenderTrophies - attackerTrophies) / 20), 8, 45);
  }
  function trophyPenalty(attackerTrophies, defenderTrophies) {
    return clamp(18 + Math.round((attackerTrophies - defenderTrophies) / 20), 5, 35);
  }
  function trophyChange({ attackerTrophies, defenderTrophies, stars }) {
    if (stars >= 1) {
      const gain = Math.round(trophyOffer(attackerTrophies, defenderTrophies) * stars / 3);
      return { attacker: gain, defender: -Math.min(gain, Math.max(0, defenderTrophies)) };
    }
    const penalty = trophyPenalty(attackerTrophies, defenderTrophies);
    return { attacker: -Math.min(penalty, Math.max(0, attackerTrophies)), defender: penalty };
  }
  function trophyPreview(attackerTrophies, defenderTrophies) {
    return {
      win: [1, 2, 3].map(stars => trophyChange({ attackerTrophies, defenderTrophies, stars }).attacker),
      loss: trophyChange({ attackerTrophies, defenderTrophies, stars: 0 }).attacker,
    };
  }

  // What a defender can lose at most. Love is never lootable.
  function lootAvailable({ resources, buildings }) {
    const storage = Object.fromEntries(E.PRODUCED.map(key => [key,
      Math.floor(Math.max(0, (Number(resources[key]) || 0) - STORAGE_PROTECTED) * STORAGE_LOOT_SHARE)]));
    const banks = Object.fromEntries((buildings || []).filter(item => E.BUILDINGS[item.type]?.kind === 'producer')
      .map(item => [item.type, Math.floor((Number(item.bank) || 0) * BANK_LOOT_SHARE)]));
    const total = Object.values(storage).reduce((a, b) => a + b, 0) + Object.values(banks).reduce((a, b) => a + b, 0);
    return { storage, banks, total };
  }
  function computeLoot({ available, coreFraction, producerFractions = {}, stars, leagueBonus = 0, remaining }) {
    const storage = Object.fromEntries(E.PRODUCED.map(key => [key, Math.floor(available.storage[key] * clamp(coreFraction, 0, 1))]));
    const banks = Object.fromEntries(Object.entries(available.banks).map(([type, amount]) =>
      [type, Math.floor(amount * clamp(producerFractions[type] || 0, 0, 1))]));
    let bonus = stars >= 1 ? leagueBonus : 0;
    const raw = Object.values(storage).reduce((a, b) => a + b, 0) + Object.values(banks).reduce((a, b) => a + b, 0) + bonus;
    const left = Math.max(0, remaining);
    let capped = false;
    if (raw > left) {
      capped = true;
      const factor = raw > 0 ? left / raw : 0;
      for (const key of Object.keys(storage)) storage[key] = Math.floor(storage[key] * factor);
      for (const key of Object.keys(banks)) banks[key] = Math.floor(banks[key] * factor);
      bonus = Math.floor(bonus * factor);
    }
    const gained = { ...E.EMPTY_RESOURCES, energy: bonus };
    for (const key of E.PRODUCED) gained[key] += storage[key];
    for (const [type, amount] of Object.entries(banks)) gained[E.BUILDINGS[type].resource] += amount;
    const total = E.PRODUCED.reduce((sum, key) => sum + gained[key], 0);
    return { storage, banks, bonus, gained, total, raw, capped };
  }
  // Upper bound shown on the opponent card: full destruction and three stars, after the daily limit.
  function lootPreview({ available, leagueBonus, remaining }) {
    const full = computeLoot({ available, coreFraction: 1,
      producerFractions: Object.fromEntries(Object.keys(available.banks).map(type => [type, 1])),
      stars: 3, leagueBonus, remaining });
    return { max: full.total, raw: full.raw, capped: full.capped, gained: full.gained };
  }

  function matchScore(attacker, candidate) {
    return Math.abs(attacker.trophies - candidate.trophies) / 100 + Math.abs(attacker.level - candidate.level);
  }
  function selectCandidates(attacker, candidates) {
    const scored = candidates.map(candidate => ({ ...candidate, score: matchScore(attacker, candidate) }));
    for (const window of MATCH_WINDOWS) {
      const inside = scored.filter(candidate => candidate.score <= window);
      if (inside.length >= MIN_CANDIDATES || window === Infinity) return { window, candidates: inside };
    }
    return { window: Infinity, candidates: scored };
  }
  function rotationOrder(attackerId, day, candidates) {
    return [...candidates].map(candidate => ({ candidate, hash: B.fnv1a(`${attackerId}:${day}:${candidate.key}`) }))
      .sort((a, b) => a.hash - b.hash || (a.candidate.key < b.candidate.key ? -1 : 1))
      .map(item => item.candidate);
  }
  function utcDay(ms) { return new Date(ms).toISOString().slice(0, 10); }
  function nextUtcMidnight(ms) {
    const date = new Date(ms);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
  }

  return { DAILY_ATTACK_LIMIT, DAILY_LOOT_LIMIT, TARGET_COOLDOWN_MS, SHIELD_MS, START_TROPHIES, STORAGE_PROTECTED,
    STORAGE_LOOT_SHARE, BANK_LOOT_SHARE, MATCH_WINDOWS, MIN_CANDIDATES, DAILY_QUIZ_REWARDS, DAILY_QUESTION_GENERATIONS,
    LEAGUES, leagueFor, trophyOffer, trophyPenalty, trophyChange, trophyPreview, lootAvailable, computeLoot, lootPreview,
    matchScore, selectCandidates, rotationOrder, utcDay, nextUtcMidnight };
});
