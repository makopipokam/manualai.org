(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PwndEconomy = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Ruleset v1. Builds on the prototype's pond-demo.js and the Supabase RPCs
  // (pwnd_accrue / pwnd_pond_action); the server is authoritative, the browser
  // uses the same functions only for previews.
  const RULESET_VERSION = 1;
  const GRID_SIZE = 10;
  const CORE = Object.freeze({ type: 'core', x: 4, y: 4, width: 2, height: 2 });
  // Honey is the fifth and final resource: it links quiz play to the strategy layer,
  // because troops and the heron watch cost honey.
  const RESOURCES = Object.freeze(['energy', 'water', 'air', 'love', 'honey']);
  const PRODUCED = Object.freeze(['energy', 'water', 'air', 'honey']);
  const STARTING_RESOURCES = Object.freeze({ energy: 1000, water: 500, air: 300, love: 100, honey: 0 });
  const EMPTY_RESOURCES = Object.freeze({ energy: 0, water: 0, air: 0, love: 0, honey: 0 });
  const STORAGE_CAP = 2000; // Producer collection only: quiz and loot balances are not capped.
  const MAX_OFFLINE_HOURS = 8;
  const HOUR_MS = 60 * 60 * 1000;

  const BUILDINGS = Object.freeze({
    solar_lily: Object.freeze({ type: 'solar_lily', name: 'Solar-Seerose', symbol: '☀', width: 2, height: 2,
      kind: 'producer', resource: 'energy', perHour: 120,
      cost: Object.freeze({ energy: 120, water: 80, air: 20, love: 10 }) }),
    spring_pool: Object.freeze({ type: 'spring_pool', name: 'Quellbecken', symbol: '💧', width: 2, height: 2,
      kind: 'producer', resource: 'water', perHour: 120,
      cost: Object.freeze({ energy: 80, water: 120, air: 20, love: 10 }) }),
    reed_windmill: Object.freeze({ type: 'reed_windmill', name: 'Schilf-Windrad', symbol: '✺', width: 2, height: 2,
      kind: 'producer', resource: 'air', perHour: 120,
      cost: Object.freeze({ energy: 100, water: 80, air: 120, love: 15 }) }),
    bee_meadow: Object.freeze({ type: 'bee_meadow', name: 'Bienenweide', symbol: '⬢', width: 2, height: 2,
      kind: 'producer', resource: 'honey', perHour: 60,
      cost: Object.freeze({ energy: 200, water: 120, air: 60, love: 15 }) }),
    heron_watch: Object.freeze({ type: 'heron_watch', name: 'Reiherwacht', symbol: '⛉', width: 2, height: 2,
      kind: 'defense', resource: null, perHour: 0,
      cost: Object.freeze({ energy: 260, water: 60, air: 80, love: 20, honey: 60 }) }),
  });
  const BUILDING_TYPES = Object.freeze(Object.keys(BUILDINGS));
  const PRODUCER_TYPES = Object.freeze(BUILDING_TYPES.filter(type => BUILDINGS[type].kind === 'producer'));
  const SOLAR = BUILDINGS.solar_lily;
  const SPRING = BUILDINGS.spring_pool;
  const REED = BUILDINGS.reed_windmill;
  const BEES = BUILDINGS.bee_meadow;
  const HERON = BUILDINGS.heron_watch;

  const BONUSES = Object.freeze([
    Object.freeze({ id: 'sunwater', first: SOLAR.type, second: SPRING.type,
      distance: 2, resource: 'energy', perHour: 300, label: 'Sonnenwasser' }),
    Object.freeze({ id: 'reedflow', first: REED.type, second: SPRING.type,
      distance: 3, resource: 'air', perHour: 120, label: 'Schilfstrom' }),
    Object.freeze({ id: 'blossom', first: BEES.type, second: SOLAR.type,
      distance: 2, resource: 'honey', perHour: 60, label: 'Blütenweide' }),
  ]);

  // Growth map. "frog" is open from the start, as in the prototype.
  const UNLOCKS = Object.freeze([
    { id: 'frog', name: 'Froschbucht', cost: { energy: 1000, water: 250, air: 120, love: 60 }, copy: 'Ein erster Bewohner wartet am Ufer.', symbol: '🐸' },
    { id: 'reeds', name: 'Schilfgürtel', cost: { energy: 1040, water: 320, air: 135, love: 70 }, copy: 'Mehr Ufer schafft Schutz und Ruhe.', symbol: '♒' },
    { id: 'dragonfly', name: 'Libellen', cost: { energy: 1120, water: 420, air: 170, love: 90 }, copy: 'Kleine Besucher zeigen klares Wasser an.', symbol: '✦' },
    { id: 'fish', name: 'Karpfenkolk', cost: { energy: 1260, water: 560, air: 215, love: 115, honey: 40 }, copy: 'Ein tiefer Bereich für größere Bewohner.', symbol: '◉' },
    { id: 'lily', name: 'Seerosenfeld', cost: { energy: 1440, water: 760, air: 275, love: 150, honey: 70 }, copy: 'Blüten machen den Teich zu deinem Ort.', symbol: '✿' },
    { id: 'stream', name: 'Quellzulauf', cost: { energy: 1700, water: 1000, air: 340, love: 200, honey: 110 }, copy: 'Eine neue Quelle erweitert deinen Wasserlauf.', symbol: '⌁' },
  ].map(item => Object.freeze({ ...item, cost: Object.freeze(item.cost) })));
  const START_UNLOCKS = Object.freeze(['frog']);

  // Quiz upgrades (prototype). Mods are applied by the server when scoring answers.
  const UPGRADES = Object.freeze([
    { id: 'memory', name: 'KLARES WASSER', text: '+2 Sekunden bei schnellen Abruffragen.', mods: { time: 2000 } },
    { id: 'causal', name: 'SCHILFGÜRTEL', text: 'Kausalitätsfragen verursachen 15 % weniger Schaden bei Fehlern.', mods: { causalShield: .15 } },
    { id: 'risk', name: 'TIEFER TEICH', text: '+25 % Schaden bei schwierigen Fragen — aber +20 % Selbstschaden bei Fehlern.', mods: { risk: .25, riskPenalty: .2 } },
    { id: 'calm', name: 'RUHIGE BUCHT', text: 'Eine falsche Antwort pro Match verliert nur einen Combo-Punkt.', mods: { calm: true } },
    { id: 'scanner', name: 'LIBELLENBLICK', text: 'Einmal pro Match eine Antwortoption entfernen.', mods: { scanner: true } },
  ].map(item => Object.freeze({ ...item, mods: Object.freeze(item.mods) })));
  const MAX_ACTIVE_UPGRADES = 3;

  // Troops for the attack path. Housing capacity of the pond camp: 20.
  const TROOP_CAPACITY = 20;
  const TROOPS = Object.freeze({
    frog: Object.freeze({ type: 'frog', name: 'Froschtrupp', symbol: '🐸', housing: 1, hp: 60, damage: 12, range: 1,
      move: Object.freeze({ cells: 1, every: 1 }), air: false, prefers: 'nearest',
      cost: Object.freeze({ energy: 0, water: 25, air: 0, love: 5, honey: 5 }),
      copy: 'Schnell und günstig. Greift das nächste Gebäude an.' }),
    dragonfly: Object.freeze({ type: 'dragonfly', name: 'Libelle', symbol: '✦', housing: 2, hp: 45, damage: 10, range: 3,
      move: Object.freeze({ cells: 2, every: 1 }), air: true, prefers: 'nearest',
      cost: Object.freeze({ energy: 0, water: 40, air: 20, love: 10, honey: 10 }),
      copy: 'Fliegt über alles hinweg. Teichwellen erreichen sie nicht.' }),
    beaver: Object.freeze({ type: 'beaver', name: 'Biber', symbol: '🦫', housing: 3, hp: 220, damage: 22, range: 1,
      move: Object.freeze({ cells: 1, every: 2 }), air: false, prefers: 'defense',
      cost: Object.freeze({ energy: 0, water: 70, air: 0, love: 15, honey: 15 }),
      copy: 'Langsam und zäh. Nagt zuerst an der Verteidigung.' }),
  });
  const TROOP_TYPES = Object.freeze(Object.keys(TROOPS));

  function spec(type) { return type === 'core' ? CORE : BUILDINGS[type]; }
  function validOrigin(type, x, y) {
    const s = BUILDINGS[type];
    return Boolean(s) && Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 &&
      x + s.width <= GRID_SIZE && y + s.height <= GRID_SIZE;
  }
  function overlaps(a, b) {
    const first = spec(a.type) || a;
    const second = spec(b.type) || b;
    return a.x < b.x + second.width && a.x + first.width > b.x &&
      a.y < b.y + second.height && a.y + first.height > b.y;
  }
  // Distance between the closest occupied cells of two footprints (dx + dy), as in SQL.
  function footprintDistance(a, b) {
    const first = spec(a.type);
    const second = spec(b.type);
    const dx = Math.max(0, b.x - (a.x + first.width - 1), a.x - (b.x + second.width - 1));
    const dy = Math.max(0, b.y - (a.y + first.height - 1), a.y - (b.y + second.height - 1));
    return dx + dy;
  }
  function activeBonuses(buildings) {
    return BONUSES.filter(bonus => {
      const first = buildings.find(building => building.type === bonus.first);
      const second = buildings.find(building => building.type === bonus.second);
      return first && second && footprintDistance(first, second) <= bonus.distance;
    });
  }
  function productionRates(buildings) {
    const bonuses = activeBonuses(buildings);
    return Object.fromEntries(buildings.filter(item => BUILDINGS[item.type]?.kind === 'producer').map(building => {
      const s = BUILDINGS[building.type];
      return [building.type, s.perHour + bonuses
        .filter(bonus => bonus.first === building.type && bonus.resource === s.resource)
        .reduce((sum, bonus) => sum + bonus.perHour, 0)];
    }));
  }
  function canAfford(resources, typeOrCost = SOLAR.type) {
    const cost = typeof typeOrCost === 'string' ? BUILDINGS[typeOrCost]?.cost : typeOrCost;
    return Boolean(cost) && RESOURCES.every(key => Number.isSafeInteger(resources?.[key]) && resources[key] >= (cost[key] || 0));
  }
  function placementError(buildings, resources, type, x, y, moving = false) {
    if (!Array.isArray(buildings) || !BUILDINGS[type]) return 'invalid_building';
    if (!validOrigin(type, x, y)) return 'invalid_building';
    const own = buildings.find(building => building.type === type);
    if (moving && !own) return 'building_missing';
    if (!moving && own) return 'building_exists';
    const candidate = { type, x, y };
    if (overlaps(candidate, CORE)) return 'core_collision';
    if (buildings.some(building => building.type !== (moving ? type : null) && overlaps(candidate, building))) return 'building_collision';
    if (!moving && !canAfford(resources, type)) return 'insufficient_resources';
    return null;
  }
  function canPlace(buildings, resources, type, x, y, moving = false) {
    if (moving) {
      const own = Array.isArray(buildings) && buildings.find(building => building.type === type);
      if (own && own.x === x && own.y === y) return false;
    }
    return placementError(buildings, resources, type, x, y, moving) === null;
  }

  // Server accrual (port of pwnd_accrue): one pond clock, at most 8 h, banks capped
  // by the free capacity up to 2.000 per produced resource.
  function accrue({ resources, buildings, lastTickMs, nowMs }) {
    const seconds = Math.min(MAX_OFFLINE_HOURS * 3600, Math.max(0, (nowMs - lastTickMs) / 1000));
    if (!(seconds > 0)) return { buildings: buildings.map(item => ({ ...item })), lastTickMs: Math.max(lastTickMs, nowMs) };
    const rates = productionRates(buildings);
    const next = buildings.map(item => {
      const s = BUILDINGS[item.type];
      if (!s || s.kind !== 'producer') return { ...item };
      const free = Math.max(0, STORAGE_CAP - resources[s.resource]);
      const exact = (Number(item.carry) || 0) + seconds * rates[item.type] / 3600;
      const bank = Math.min(free, (Number(item.bank) || 0) + Math.floor(exact + 1e-9));
      return { ...item, bank, carry: bank >= free ? 0 : exact - Math.floor(exact + 1e-9) };
    });
    return { buildings: next, lastTickMs: nowMs };
  }
  // Port of the SQL claim branch: credit min(bank, free capacity) per producer.
  function claim({ resources, buildings }) {
    const nextResources = { ...resources };
    const gained = { ...EMPTY_RESOURCES };
    const nextBuildings = [...buildings].sort((a, b) => a.type.localeCompare(b.type)).map(item => {
      const s = BUILDINGS[item.type];
      if (!s || s.kind !== 'producer') return { ...item };
      const credit = Math.min(item.bank || 0, Math.max(0, STORAGE_CAP - nextResources[s.resource]));
      nextResources[s.resource] += credit;
      gained[s.resource] += credit;
      return { ...item, bank: (item.bank || 0) - credit };
    });
    return { resources: nextResources, buildings: nextBuildings, gained,
      total: PRODUCED.reduce((sum, key) => sum + gained[key], 0) };
  }
  function pendingProduction({ resources, buildings, lastTickMs, nowMs }) {
    const accrued = accrue({ resources, buildings, lastTickMs, nowMs }).buildings;
    const pending = { ...EMPTY_RESOURCES };
    for (const item of accrued) {
      const s = BUILDINGS[item.type];
      if (s?.kind === 'producer') pending[s.resource] = Math.max(0, Math.min(STORAGE_CAP - resources[s.resource], item.bank || 0));
    }
    return { pending, rates: productionRates(buildings), bonuses: activeBonuses(buildings) };
  }
  function pondLevel({ buildings = [], unlocked = [] }) {
    const built = new Set(buildings.map(item => item.type).filter(type => BUILDINGS[type])).size;
    const discovered = new Set(unlocked.filter(id => id !== 'frog' && UNLOCKS.some(item => item.id === id))).size;
    return 1 + built + discovered;
  }
  function troopHousing(troops = {}) {
    return TROOP_TYPES.reduce((sum, type) => sum + (Number(troops[type]) || 0) * TROOPS[type].housing, 0);
  }
  function trainCost(type, count) {
    const s = TROOPS[type];
    if (!s || !Number.isInteger(count) || count < 1) return null;
    return Object.fromEntries(RESOURCES.map(key => [key, (s.cost[key] || 0) * count]));
  }
  function upgradeMods(ids = []) {
    return ids.reduce((mods, id) => Object.assign(mods, UPGRADES.find(item => item.id === id)?.mods || {}), {});
  }
  function subtract(resources, cost) {
    return Object.fromEntries(RESOURCES.map(key => [key, resources[key] - (cost[key] || 0)]));
  }

  return {
    RULESET_VERSION, GRID_SIZE, CORE, RESOURCES, PRODUCED, STARTING_RESOURCES, EMPTY_RESOURCES,
    STORAGE_CAP, MAX_OFFLINE_HOURS, HOUR_MS,
    BUILDINGS, BUILDING_TYPES, PRODUCER_TYPES, SOLAR, SPRING, REED, BEES, HERON, BONUSES,
    UNLOCKS, START_UNLOCKS, UPGRADES, MAX_ACTIVE_UPGRADES, TROOP_CAPACITY, TROOPS, TROOP_TYPES,
    validOrigin, overlaps, footprintDistance, activeBonuses, productionRates, canAfford, placementError, canPlace,
    accrue, claim, pendingProduction, pondLevel, troopHousing, trainCost, upgradeMods, subtract,
  };
});
