(function (root, factory) {
  const deps = typeof module === 'object' && module.exports
    ? [require('./economy.js'), require('./battle-engine.js')]
    : [root.PwndEconomy, root.PwndBattle];
  const api = factory(...deps);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PwndBots = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (E, B) {
  'use strict';

  // 30 deterministic bot ponds so the rotation is playable from the first day.
  // Bots have no database rows: they never lose resources and get no reports.
  const NAMES = Object.freeze([
    'Moorquelle', 'Binsenbucht', 'Krötenwinkel', 'Erlenbruch', 'Kalmusgrund', 'Libellenlauf',
    'Seggenried', 'Unkenpfuhl', 'Weidenkolk', 'Muschelsand', 'Rohrkolben', 'Froschbiss',
    'Nebelweiher', 'Sumpfdotter', 'Kiebitzwiese', 'Wasserminze', 'Teichrosenhof', 'Schwanenzug',
    'Eisvogelufer', 'Otterbach', 'Blauer Tümpel', 'Mondsee-Rand', 'Silberreiher', 'Laichkraut',
    'Tausendblatt', 'Krebsscherenbucht', 'Uferschwalbe', 'Graureiherhorst', 'Lotusbecken', 'Sternquelle',
  ]);
  const COUNT = NAMES.length;
  const MIN_TROPHIES = 40;
  const MAX_TROPHIES = 1925;
  const PRODUCERS = E.PRODUCER_TYPES;

  function botId(index) { return `bot-${String(index + 1).padStart(2, '0')}`; }
  function indexOf(id) {
    const match = /^bot-(\d{2})$/.exec(String(id));
    const index = match ? Number(match[1]) - 1 : -1;
    return index >= 0 && index < COUNT ? index : -1;
  }
  function trophiesFor(index) {
    return MIN_TROPHIES + Math.round(index * (MAX_TROPHIES - MIN_TROPHIES) / (COUNT - 1));
  }
  function shuffled(list, rng) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function layoutFor(index, trophies) {
    const rng = B.mulberry32(B.fnv1a(`bot-layout:${botId(index)}`));
    const count = 2 + Math.floor(rng() * 3);
    const types = trophies >= 400
      ? ['heron_watch', ...shuffled(PRODUCERS, rng).slice(0, count - 1)]
      : shuffled(PRODUCERS, rng).slice(0, Math.min(count, PRODUCERS.length));
    const rich = Object.fromEntries(E.RESOURCES.map(key => [key, 1e9]));
    const buildings = [];
    for (const type of types) {
      for (let attempt = 0; attempt < 200; attempt += 1) {
        const x = Math.floor(rng() * (E.GRID_SIZE - 1));
        const y = Math.floor(rng() * (E.GRID_SIZE - 1));
        if (E.placementError(buildings, rich, type, x, y) === null) { buildings.push({ type, x, y }); break; }
      }
    }
    return buildings;
  }
  function discoveriesFor(index, trophies) {
    const rng = B.mulberry32(B.fnv1a(`bot-unlocks:${botId(index)}`));
    const count = Math.min(5, Math.floor(trophies / 400) + Math.floor(rng() * 2));
    return ['frog', ...E.UNLOCKS.slice(1, 1 + count).map(item => item.id)];
  }
  function profile(id) {
    const index = indexOf(id);
    if (index < 0) return null;
    const trophies = trophiesFor(index);
    const buildings = layoutFor(index, trophies);
    const unlocked = discoveriesFor(index, trophies);
    return { id: botId(index), key: `b:${botId(index)}`, kind: 'bot', name: NAMES[index], trophies,
      buildings, unlocked, level: E.pondLevel({ buildings, unlocked }) };
  }
  function list() { return NAMES.map((_, index) => profile(botId(index))); }
  // Daily, reproducible stock and producer banks (seed: bot id + UTC day).
  function snapshot(id, day) {
    const base = profile(id);
    if (!base) return null;
    const rng = B.mulberry32(B.fnv1a(`bot-day:${base.id}:${day}`));
    const stock = 700 + 0.9 * base.trophies;
    const resources = {
      energy: Math.round(stock * (0.85 + 0.3 * rng())),
      water: Math.round(stock * (0.75 + 0.3 * rng())),
      air: Math.round(stock * (0.55 + 0.3 * rng())),
      love: Math.round(100 + base.trophies * 0.1),
      honey: Math.round(40 + base.trophies * 0.12 * (0.7 + 0.6 * rng())),
    };
    const buildings = base.buildings.map(item => ({ ...item,
      bank: E.BUILDINGS[item.type].kind === 'producer' ? Math.floor(200 + rng() * 500) : 0 }));
    return { ...base, resources, buildings };
  }

  return { COUNT, NAMES, MIN_TROPHIES, MAX_TROPHIES, botId, indexOf, trophiesFor, profile, list, snapshot };
});
