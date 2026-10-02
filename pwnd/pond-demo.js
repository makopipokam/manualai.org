(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PwndPondDemo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const GRID_SIZE = 10;
  const CORE = Object.freeze({ x: 4, y: 4, width: 2, height: 2 });
  const RESOURCES = Object.freeze(['energy', 'water', 'air', 'love']);
  // Costs, base rates and adjacency bonuses match strategy GDD v0.2.
  const BUILDINGS = Object.freeze({
    solar_lily: Object.freeze({ type: 'solar_lily', name: 'Solar-Seerose', symbol: '☀', width: 2, height: 2,
      resource: 'energy', perHour: 120, energyPerHour: 120,
      cost: Object.freeze({ energy: 120, water: 80, air: 20, love: 10 }) }),
    spring_pool: Object.freeze({ type: 'spring_pool', name: 'Quellbecken', symbol: '💧', width: 2, height: 2,
      resource: 'water', perHour: 120,
      cost: Object.freeze({ energy: 80, water: 120, air: 20, love: 10 }) }),
    reed_windmill: Object.freeze({ type: 'reed_windmill', name: 'Schilf-Windrad', symbol: '✺', width: 2, height: 2,
      resource: 'air', perHour: 120,
      cost: Object.freeze({ energy: 100, water: 80, air: 120, love: 15 }) }),
  });
  const SOLAR = BUILDINGS.solar_lily;
  const SPRING = BUILDINGS.spring_pool;
  const REED = BUILDINGS.reed_windmill;
  const STORAGE_CAP = 2000; // Producer collection only: existing quiz balances are not capped.
  const ENERGY_CAP = STORAGE_CAP; // Existing solar API compatibility.
  const MAX_OFFLINE_HOURS = 8;
  const HOUR_MS = 60 * 60 * 1000;
  const BONUSES = Object.freeze([
    Object.freeze({ id: 'sunwater', first: SOLAR.type, second: SPRING.type,
      distance: 2, resource: 'energy', perHour: 300, label: 'Sonnenwasser' }),
    Object.freeze({ id: 'reedflow', first: REED.type, second: SPRING.type,
      distance: 3, resource: 'air', perHour: 120, label: 'Schilfstrom' }),
  ]);

  function validOrigin(type, x, y) {
    const spec = BUILDINGS[type];
    return Boolean(spec) && Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 &&
      x + spec.width <= GRID_SIZE && y + spec.height <= GRID_SIZE;
  }
  function overlaps(a, b) {
    const first = BUILDINGS[a.type] || a;
    const second = BUILDINGS[b.type] || b;
    return a.x < b.x + second.width && a.x + first.width > b.x &&
      a.y < b.y + second.height && a.y + first.height > b.y;
  }
  function footprintDistance(a, b) {
    const first = BUILDINGS[a.type];
    const second = BUILDINGS[b.type];
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
    return Object.fromEntries(buildings.map(building => {
      const spec = BUILDINGS[building.type];
      return [building.type, spec.perHour + bonuses
        .filter(bonus => bonus.first === building.type && bonus.resource === spec.resource)
        .reduce((sum, bonus) => sum + bonus.perHour, 0)];
    }));
  }
  function normalizePondDemo(raw, nowMs = Date.now()) {
    const input = raw && typeof raw === 'object' ? raw : {};
    const buildings = [];
    for (const item of Array.isArray(input.buildings) ? input.buildings : []) {
      if (!validOrigin(item?.type, item.x, item.y) || buildings.some(existing =>
        existing.type === item.type || overlaps(item, existing)) || overlaps(item, CORE)) continue;
      const last = Number(item.lastClaimAt);
      const bank = Number(item.bank);
      const carry = Number(item.carry);
      buildings.push({ id: `${item.type}-1`, type: item.type, x: item.x, y: item.y,
        lastClaimAt: Number.isFinite(last) && last > 0 ? Math.min(last, nowMs) : nowMs,
        bank: Number.isSafeInteger(bank) && bank >= 0 ? Math.min(STORAGE_CAP, bank) : 0,
        carry: Number.isFinite(carry) && carry >= 0 && carry < 1 ? carry : 0 });
    }
    const completedAttempts = Array.isArray(input.completedAttempts)
      ? [...new Set(input.completedAttempts.filter(id => typeof id === 'string' && id.length > 0 && id.length < 129))]
      : [];
    return { buildings, completedAttempts };
  }
  function canAfford(resources, type = SOLAR.type) {
    const cost = BUILDINGS[type]?.cost;
    return Boolean(cost) && RESOURCES.every(key => Number.isSafeInteger(resources?.[key]) && resources[key] >= cost[key]);
  }
  function canPlace(buildings, resources, type, x, y, moving = false) {
    // Legacy solar call signature remains usable by old standalone callers.
    if (typeof type === 'number') { y = x; x = type; type = SOLAR.type; }
    if (!Array.isArray(buildings) || !validOrigin(type, x, y)) return false;
    const own = buildings.find(building => building.type === type);
    if (moving ? !own || (own.x === x && own.y === y) : own || !canAfford(resources, type)) return false;
    const candidate = { type, x, y };
    return !overlaps(candidate, CORE) && !buildings.some(building =>
      building.type !== (moving ? type : null) && overlaps(candidate, building));
  }
  function accruedBuildings(buildings, resources, nowMs) {
    const rates = productionRates(buildings);
    return buildings.map(building => {
      const spec = BUILDINGS[building.type];
      const lastClaimAt = Math.max(building.lastClaimAt, nowMs);
      if (resources[spec.resource] >= STORAGE_CAP) {
        return { ...building, lastClaimAt, bank: 0, carry: 0 };
      }
      const elapsed = Math.min(MAX_OFFLINE_HOURS * HOUR_MS, Math.max(0, nowMs - building.lastClaimAt));
      const exact = Math.max(0, Number(building.carry) || 0) + elapsed * rates[building.type] / HOUR_MS;
      const gained = Math.floor(exact + 1e-9);
      const freeCapacity = Math.max(0, STORAGE_CAP - resources[spec.resource]);
      // GDD §5.4: production above capacity is lost, not banked for a later spend.
      const bank = Math.min(freeCapacity, (building.bank || 0) + gained);
      return { ...building, lastClaimAt, bank,
        carry: bank === freeCapacity ? 0 : Math.max(0, exact - gained) };
    });
  }
  function productionSummary(buildings, resources, nowMs) {
    if (!Array.isArray(buildings) || !Number.isFinite(nowMs)) return null;
    const accrued = accruedBuildings(buildings, resources, nowMs);
    const rates = productionRates(buildings);
    const pending = Object.fromEntries(RESOURCES.map(key => [key, 0]));
    for (const building of accrued) {
      const resource = BUILDINGS[building.type].resource;
      pending[resource] = Math.max(0, Math.min(STORAGE_CAP - resources[resource], building.bank));
    }
    return { pending, rates, bonuses: activeBonuses(buildings), buildings: accrued };
  }
  function placeBuilding({ buildings, resources, type, x, y, nowMs }) {
    if (!Number.isFinite(nowMs) || nowMs < 0 || !canPlace(buildings, resources, type, x, y)) return null;
    const cost = BUILDINGS[type].cost;
    const previous = accruedBuildings(buildings, resources, nowMs);
    return {
      buildings: [...previous, { id: `${type}-1`, type, x, y, lastClaimAt: nowMs, bank: 0, carry: 0 }],
      resources: Object.fromEntries(RESOURCES.map(key => [key, resources[key] - cost[key]])),
    };
  }
  function moveBuilding({ buildings, resources, type, x, y, nowMs }) {
    if (!Number.isFinite(nowMs) || nowMs < 0 || !canPlace(buildings, resources, type, x, y, true)) return null;
    const previous = accruedBuildings(buildings, resources, nowMs);
    return { buildings: previous.map(building => building.type === type ? { ...building, x, y } : building) };
  }
  function claimProduction({ buildings, resources, nowMs }) {
    const summary = productionSummary(buildings, resources, nowMs);
    if (!summary || !RESOURCES.some(key => summary.pending[key] > 0)) return null;
    const nextResources = { ...Object.fromEntries(RESOURCES.map(key => [key, resources[key]])) };
    const nextBuildings = summary.buildings.map(building => {
      const resource = BUILDINGS[building.type].resource;
      const gained = summary.pending[resource];
      nextResources[resource] += gained;
      return { ...building, bank: gained ? 0 : building.bank,
        carry: nextResources[resource] >= STORAGE_CAP ? 0 : building.carry };
    });
    return { buildings: nextBuildings, resources: nextResources, gained: summary.pending };
  }
  function placeSolarLily({ buildings, resources, x, y, nowMs }) {
    return placeBuilding({ buildings, resources, type: SOLAR.type, x, y, nowMs });
  }
  function pendingEnergy(building, energy, nowMs) {
    if (!building || building.type !== SOLAR.type || !Number.isFinite(energy)) return 0;
    return productionSummary([building], { energy, water: 0, air: 0, love: 0 }, nowMs)?.pending.energy || 0;
  }
  function claimSolarEnergy({ building, energy, nowMs }) {
    const result = building && claimProduction({ buildings: [building],
      resources: { energy, water: 0, air: 0, love: 0 }, nowMs });
    return result ? { gained: result.gained.energy, energy: result.resources.energy, building: result.buildings[0] } : null;
  }
  function settleQuiz({ resources, completedAttempts, attemptId, energyAfter, rewards, answeredCount }) {
    if (!attemptId || !Array.isArray(completedAttempts) || completedAttempts.includes(attemptId)) return null;
    if (!Number.isInteger(answeredCount) || answeredCount < 1 ||
      !RESOURCES.every(key => Number.isSafeInteger(resources?.[key]) && resources[key] >= 0) ||
      !Number.isSafeInteger(energyAfter) || energyAfter < 0 ||
      !['water', 'air', 'love'].every(key => Number.isSafeInteger(rewards?.[key]) && rewards[key] >= 0 &&
        Number.isSafeInteger(resources[key] + rewards[key]))) return null;
    return { completedAttempts: [...completedAttempts, attemptId], resources: {
      energy: energyAfter, water: resources.water + rewards.water,
      air: resources.air + rewards.air, love: resources.love + rewards.love,
    } };
  }
  return {
    GRID_SIZE, CORE, RESOURCES, BUILDINGS, SOLAR, SPRING, REED, BONUSES,
    ENERGY_CAP, STORAGE_CAP, MAX_OFFLINE_HOURS, HOUR_MS,
    footprintDistance, activeBonuses, productionRates, productionSummary,
    normalizePondDemo, canAfford, canPlace, accruedBuildings,
    placeBuilding, moveBuilding, claimProduction,
    placeSolarLily, pendingEnergy, claimSolarEnergy, settleQuiz,
  };
});
