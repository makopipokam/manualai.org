(function (root, factory) {
  const economy = typeof module === 'object' && module.exports ? require('./economy.js') : root.PwndEconomy;
  const api = factory(economy);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PwndBattle = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (E) {
  'use strict';

  // BattleEngine v1: a submitted plan (deployment) is simulated tick by tick on the
  // defender's 10×10 pond. Same layout + deployment + seed ⇒ same frames and hash.
  const MAX_TICKS = 120;
  const MAX_DEPLOYMENT = 40;
  const DAMAGE_SPREAD = 0.1;
  const BUILDING_STATS = Object.freeze({
    core: Object.freeze({ hp: 1200, name: 'Teichkern', symbol: '◆',
      defense: Object.freeze({ name: 'Teichwellen', range: 2, damage: 18, hitsGround: true, hitsAir: false }) }),
    solar_lily: Object.freeze({ hp: 400 }),
    spring_pool: Object.freeze({ hp: 400 }),
    reed_windmill: Object.freeze({ hp: 400 }),
    bee_meadow: Object.freeze({ hp: 400 }),
    heron_watch: Object.freeze({ hp: 600,
      defense: Object.freeze({ name: 'Reiherwacht', range: 3, damage: 30, hitsGround: true, hitsAir: true }) }),
  });
  const UNIT_ORDER = E.TROOP_TYPES;
  const STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function fnv1a(text) {
    let hash = 0x811c9dc5;
    const input = String(text);
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
  }
  function fnvHex(text) { return fnv1a(text).toString(16).padStart(8, '0'); }
  // 64-bit style digest from two independent FNV-1a passes; used as replay hash.
  function replayDigest(text) { return fnvHex(text) + fnvHex('pwnd:' + text); }
  function seedFrom(id) { return fnv1a('battle:' + String(id)); }

  function buildLayout(buildings) {
    const ordered = [{ type: 'core', x: E.CORE.x, y: E.CORE.y }, ...[...(buildings || [])]
      .filter(item => E.BUILDINGS[item.type])
      .sort((a, b) => E.BUILDING_TYPES.indexOf(a.type) - E.BUILDING_TYPES.indexOf(b.type))];
    return ordered.map((item, index) => {
      const stats = BUILDING_STATS[item.type];
      return { id: index, type: item.type, x: item.x, y: item.y, w: 2, h: 2, maxHp: stats.hp, hp: stats.hp,
        defense: stats.defense || null };
    });
  }
  function occupiedBy(buildings, x, y) {
    return buildings.find(b => b.hp > 0 && x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) || null;
  }
  function isEdge(x, y) { return x === 0 || y === 0 || x === E.GRID_SIZE - 1 || y === E.GRID_SIZE - 1; }
  function edgeCells(layoutBuildings) {
    const buildings = buildLayout(layoutBuildings);
    const cells = [];
    for (let y = 0; y < E.GRID_SIZE; y += 1) {
      for (let x = 0; x < E.GRID_SIZE; x += 1) {
        if (isEdge(x, y) && !occupiedBy(buildings, x, y)) cells.push([x, y]);
      }
    }
    return cells;
  }
  function deploymentCounts(deployment) {
    const counts = Object.fromEntries(UNIT_ORDER.map(type => [type, 0]));
    for (const entry of deployment || []) if (counts[entry?.unit] !== undefined) counts[entry.unit] += 1;
    return counts;
  }
  // Returns an error code or null. The server re-runs this on every attack.
  function validateDeployment(layoutBuildings, deployment, troops) {
    if (!Array.isArray(deployment) || deployment.length < 1) return 'empty_deployment';
    if (deployment.length > MAX_DEPLOYMENT) return 'invalid_deployment';
    const buildings = buildLayout(layoutBuildings);
    for (const entry of deployment) {
      if (!entry || !E.TROOPS[entry.unit] || !Number.isInteger(entry.x) || !Number.isInteger(entry.y)) return 'invalid_deployment';
      if (entry.x < 0 || entry.y < 0 || entry.x >= E.GRID_SIZE || entry.y >= E.GRID_SIZE) return 'invalid_deployment';
      if (!isEdge(entry.x, entry.y)) return 'deployment_not_on_edge';
      if (occupiedBy(buildings, entry.x, entry.y)) return 'deployment_blocked';
    }
    const counts = deploymentCounts(deployment);
    if (troops && UNIT_ORDER.some(type => counts[type] > (Number(troops[type]) || 0))) return 'insufficient_troops';
    return null;
  }
  function distanceToFootprint(b, x, y) {
    const dx = Math.max(0, b.x - x, x - (b.x + b.w - 1));
    const dy = Math.max(0, b.y - y, y - (b.y + b.h - 1));
    return Math.max(dx, dy);
  }
  function bfs(buildings, sx, sy) {
    const size = E.GRID_SIZE;
    const dist = new Array(size * size).fill(Infinity);
    const prev = new Array(size * size).fill(-1);
    const queue = [sy * size + sx];
    dist[queue[0]] = 0;
    for (let head = 0; head < queue.length; head += 1) {
      const cell = queue[head];
      const cx = cell % size, cy = Math.floor(cell / size);
      for (const [dx, dy] of STEPS) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        const next = ny * size + nx;
        if (dist[next] !== Infinity || occupiedBy(buildings, nx, ny)) continue;
        dist[next] = dist[cell] + 1;
        prev[next] = cell;
        queue.push(next);
      }
    }
    return { dist, prev };
  }
  function groundRoute(buildings, unit, target, range, field) {
    const size = E.GRID_SIZE;
    let best = -1;
    for (let cell = 0; cell < size * size; cell += 1) {
      if (field.dist[cell] === Infinity) continue;
      if (distanceToFootprint(target, cell % size, Math.floor(cell / size)) > range) continue;
      if (best < 0 || field.dist[cell] < field.dist[best]) best = cell;
    }
    return best < 0 ? null : { cell: best, steps: field.dist[best] };
  }
  function chooseTarget(buildings, unit, spec) {
    const alive = buildings.filter(b => b.hp > 0);
    if (!alive.length) return null;
    if (spec.air) {
      return alive.reduce((best, b) => !best || distanceToFootprint(b, unit.x, unit.y) < distanceToFootprint(best, unit.x, unit.y) ? b : best, null);
    }
    const field = bfs(buildings, unit.x, unit.y);
    const scored = alive.map(b => ({ b, route: groundRoute(buildings, unit, b, spec.range, field) })).filter(item => item.route);
    const pool = spec.prefers === 'defense' && scored.some(item => item.b.defense)
      ? scored.filter(item => item.b.defense) : scored;
    const pick = pool.reduce((best, item) => !best || item.route.steps < best.route.steps ? item : best, null);
    return pick ? pick.b : null;
  }
  function moveUnit(buildings, unit, spec, target) {
    if (spec.air) {
      for (let step = 0; step < spec.move.cells; step += 1) {
        if (distanceToFootprint(target, unit.x, unit.y) <= spec.range) return;
        const cx = Math.min(Math.max(unit.x, target.x), target.x + target.w - 1);
        const cy = Math.min(Math.max(unit.y, target.y), target.y + target.h - 1);
        unit.x += Math.sign(cx - unit.x);
        unit.y += Math.sign(cy - unit.y);
      }
      return;
    }
    const field = bfs(buildings, unit.x, unit.y);
    const route = groundRoute(buildings, unit, target, spec.range, field);
    if (!route) return;
    const path = [];
    for (let cell = route.cell; cell !== -1 && field.dist[cell] > 0; cell = field.prev[cell]) path.unshift(cell);
    const steps = Math.min(spec.move.cells, path.length);
    if (steps > 0) {
      const cell = path[steps - 1];
      unit.x = cell % E.GRID_SIZE;
      unit.y = Math.floor(cell / E.GRID_SIZE);
    }
  }
  function roll(rng, base) { return Math.max(1, Math.round(base * (1 - DAMAGE_SPREAD + 2 * DAMAGE_SPREAD * rng()))); }

  function simulate({ layout, deployment, seed }) {
    const rng = mulberry32(seed >>> 0);
    const buildings = buildLayout(layout);
    const units = [];
    const frames = [];
    let deployed = 0;
    let tick = 0;
    for (tick = 1; tick <= MAX_TICKS; tick += 1) {
      const events = [];
      if (deployed < deployment.length) {
        const entry = deployment[deployed];
        const spec = E.TROOPS[entry.unit];
        const unit = { id: deployed, type: entry.unit, x: entry.x, y: entry.y, hp: spec.hp, maxHp: spec.hp, deployedAt: tick, target: null };
        units.push(unit);
        events.push(['d', unit.id, UNIT_ORDER.indexOf(unit.type), unit.x, unit.y]);
        deployed += 1;
      }
      for (const b of buildings) {
        if (b.hp <= 0 || !b.defense) continue;
        let best = null, bestDistance = Infinity;
        for (const unit of units) {
          if (unit.hp <= 0) continue;
          const air = E.TROOPS[unit.type].air;
          if (air ? !b.defense.hitsAir : !b.defense.hitsGround) continue;
          const distance = distanceToFootprint(b, unit.x, unit.y);
          if (distance <= b.defense.range && distance < bestDistance) { best = unit; bestDistance = distance; }
        }
        if (!best) continue;
        const damage = roll(rng, b.defense.damage);
        best.hp = Math.max(0, best.hp - damage);
        events.push(['f', b.id, best.id, damage]);
        if (best.hp <= 0) events.push(['k', best.id]);
      }
      for (const unit of units) {
        if (unit.hp <= 0) continue;
        const spec = E.TROOPS[unit.type];
        if (!unit.target || unit.target.hp <= 0) unit.target = chooseTarget(buildings, unit, spec);
        const target = unit.target;
        if (!target) continue;
        if (distanceToFootprint(target, unit.x, unit.y) <= spec.range) {
          const damage = roll(rng, spec.damage);
          target.hp = Math.max(0, target.hp - damage);
          events.push(['a', unit.id, target.id, damage]);
          if (target.hp <= 0) { events.push(['x', target.id]); unit.target = null; }
        } else if ((tick - unit.deployedAt) % spec.move.every === 0) {
          moveUnit(buildings, unit, spec, target);
        }
      }
      frames.push({ t: tick, u: units.filter(unit => unit.hp > 0).map(unit => [unit.id, unit.x, unit.y, unit.hp]),
        b: buildings.map(b => b.hp), e: events });
      if (buildings.every(b => b.hp <= 0)) break;
      if (deployed >= deployment.length && units.every(unit => unit.hp <= 0)) break;
    }
    const maxTotal = buildings.reduce((sum, b) => sum + b.maxHp, 0);
    const damageTotal = buildings.reduce((sum, b) => sum + (b.maxHp - b.hp), 0);
    const destruction = buildings.every(b => b.hp <= 0) ? 100 : Math.min(99, Math.floor(100 * damageTotal / maxTotal));
    const core = buildings[0];
    const coreDestroyed = core.hp <= 0;
    const stars = (destruction >= 50 ? 1 : 0) + (coreDestroyed ? 1 : 0) + (destruction === 100 ? 1 : 0);
    const damage = buildings.map(b => ({ id: b.id, type: b.type, x: b.x, y: b.y, maxHp: b.maxHp, hp: b.hp,
      fraction: (b.maxHp - b.hp) / b.maxHp }));
    const summary = { stars, destruction, coreDestroyed, ticks: Math.min(tick, MAX_TICKS),
      unitsDeployed: deployed, unitsLost: units.filter(unit => unit.hp <= 0).length };
    const replayHash = replayDigest(JSON.stringify({ v: E.RULESET_VERSION, summary, frames }));
    return { ...summary, damage, frames, replayHash,
      layout: buildings.map(b => ({ id: b.id, type: b.type, x: b.x, y: b.y, maxHp: b.maxHp })) };
  }
  function verifyReplay({ layout, deployment, seed, replayHash }) {
    const result = simulate({ layout, deployment, seed });
    return { ...result, verified: result.replayHash === replayHash };
  }

  return { MAX_TICKS, MAX_DEPLOYMENT, BUILDING_STATS, UNIT_ORDER, mulberry32, fnv1a, fnvHex, replayDigest, seedFrom,
    buildLayout, edgeCells, isEdge, deploymentCounts, validateDeployment, distanceToFootprint, simulate, verifyReplay };
});
