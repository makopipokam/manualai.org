(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PwndPondDemo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const GRID_SIZE = 10;
  const CORE = Object.freeze({ x: 4, y: 4, width: 2, height: 2 });
  // The price and rate match the strategy GDD v0.2. This demo is NOT a trusted economy.
  const SOLAR = Object.freeze({
    type: 'solar_lily', width: 2, height: 2,
    cost: Object.freeze({ energy: 120, water: 80, air: 20, love: 10 }),
    energyPerHour: 120,
  });
  const ENERGY_CAP = 2000;
  const MAX_OFFLINE_HOURS = 8;
  const HOUR_MS = 60 * 60 * 1000;
  const RESOURCES = Object.freeze(['energy', 'water', 'air', 'love']);

  function validOrigin(x, y) {
    return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 &&
      x + SOLAR.width <= GRID_SIZE && y + SOLAR.height <= GRID_SIZE;
  }
  function overlaps(x, y, other) {
    return x < other.x + (other.width || 2) && x + SOLAR.width > other.x &&
      y < other.y + (other.height || 2) && y + SOLAR.height > other.y;
  }
  function normalizePondDemo(raw, nowMs = Date.now()) {
    const input = raw && typeof raw === 'object' ? raw : {};
    const first = Array.isArray(input.buildings) ? input.buildings.find(building =>
      building?.type === SOLAR.type && validOrigin(building.x, building.y) &&
      !overlaps(building.x, building.y, CORE)
    ) : null;
    const lastClaimAt = Number(first?.lastClaimAt);
    const buildings = first ? [{
      id: 'solar-1', type: SOLAR.type, x: first.x, y: first.y,
      lastClaimAt: Number.isFinite(lastClaimAt) && lastClaimAt > 0 ? Math.min(lastClaimAt, nowMs) : nowMs,
    }] : [];
    const completedAttempts = Array.isArray(input.completedAttempts)
      ? [...new Set(input.completedAttempts.filter(id => typeof id === 'string' && id.length > 0 && id.length < 129))]
      : [];
    return { buildings, completedAttempts };
  }
  function canAfford(resources) {
    return RESOURCES.every(key => Number.isFinite(resources?.[key]) && resources[key] >= SOLAR.cost[key]);
  }
  function canPlace(buildings, resources, x, y) {
    return validOrigin(x, y) && !overlaps(x, y, CORE) &&
      Array.isArray(buildings) && buildings.length === 0 && canAfford(resources);
  }
  function placeSolarLily({ buildings, resources, x, y, nowMs }) {
    if (!canPlace(buildings, resources, x, y) || !Number.isFinite(nowMs) || nowMs < 0) return null;
    return {
      buildings: [{ id: 'solar-1', type: SOLAR.type, x, y, lastClaimAt: nowMs }],
      resources: Object.fromEntries(RESOURCES.map(key => [key, resources[key] - SOLAR.cost[key]])),
    };
  }
  function settleQuiz({ resources, completedAttempts, attemptId, energyAfter, rewards, answeredCount }) {
    if (!attemptId || !Array.isArray(completedAttempts) || completedAttempts.includes(attemptId)) return null;
    if (!Number.isInteger(answeredCount) || answeredCount < 1 ||
      !RESOURCES.every(key => Number.isSafeInteger(resources?.[key]) && resources[key] >= 0) ||
      !Number.isSafeInteger(energyAfter) || energyAfter < 0 ||
      !['water', 'air', 'love'].every(key => Number.isSafeInteger(rewards?.[key]) && rewards[key] >= 0 &&
        Number.isSafeInteger(resources[key] + rewards[key]))) return null;
    return {
      completedAttempts: [...completedAttempts, attemptId],
      resources: {
        energy: energyAfter,
        water: resources.water + rewards.water,
        air: resources.air + rewards.air,
        love: resources.love + rewards.love,
      },
    };
  }
  function pendingEnergy(building, energy, nowMs) {
    if (!building || building.type !== SOLAR.type || !Number.isFinite(nowMs) ||
      !Number.isFinite(building.lastClaimAt) || !Number.isFinite(energy)) return 0;
    const elapsed = Math.min(MAX_OFFLINE_HOURS * HOUR_MS, Math.max(0, nowMs - building.lastClaimAt));
    return Math.max(0, Math.min(ENERGY_CAP - energy, Math.floor(elapsed * SOLAR.energyPerHour / HOUR_MS)));
  }
  function claimSolarEnergy({ building, energy, nowMs }) {
    if (!building || !Number.isFinite(nowMs) || !Number.isFinite(building.lastClaimAt)) return null;
    const gained = pendingEnergy(building, energy, nowMs);
    if (!gained) return null;
    const elapsed = nowMs - building.lastClaimAt;
    // Keep fractional production time unless the 8-hour offline cap was reached.
    const lastClaimAt = elapsed >= MAX_OFFLINE_HOURS * HOUR_MS || energy + gained >= ENERGY_CAP
      ? nowMs : building.lastClaimAt + gained * HOUR_MS / SOLAR.energyPerHour;
    return { gained, energy: energy + gained, building: { ...building, lastClaimAt } };
  }

  return {
    GRID_SIZE, CORE, SOLAR, ENERGY_CAP, MAX_OFFLINE_HOURS,
    normalizePondDemo, canPlace, placeSolarLily, settleQuiz, pendingEnergy, claimSolarEnergy,
  };
});
