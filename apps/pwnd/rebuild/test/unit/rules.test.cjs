// Deterministic rules of ruleset v1: economy, battle engine, progression and bots.
// These tests run without database or network.
const test = require('node:test');
const assert = require('node:assert/strict');

const E = require('../../shared/economy.js');
const B = require('../../shared/battle-engine.js');
const P = require('../../shared/progression.js');
const Bots = require('../../shared/bots.js');
const Q = require('../../shared/quiz-engine.js');

const HOUR = E.HOUR_MS;
const startResources = () => ({ ...E.STARTING_RESOURCES });

test('five resources, honey is produced and love is not', () => {
  assert.deepEqual(E.RESOURCES, ['energy', 'water', 'air', 'love', 'honey']);
  assert.deepEqual(E.PRODUCED, ['energy', 'water', 'air', 'honey']);
  assert.equal(E.STARTING_RESOURCES.honey, 0);
  assert.equal(E.BUILDINGS.bee_meadow.resource, 'honey');
  assert.equal(E.BUILDINGS.bee_meadow.perHour, 60);
  assert.deepEqual(E.PRODUCER_TYPES, ['solar_lily', 'spring_pool', 'reed_windmill', 'bee_meadow']);
  for (const type of E.TROOP_TYPES) assert.ok(E.TROOPS[type].cost.honey > 0, `${type} costs honey`);
  assert.equal(E.BUILDINGS.heron_watch.cost.honey, 60);
  for (const id of ['fish', 'lily', 'stream']) {
    assert.ok(E.UNLOCKS.find(item => item.id === id).cost.honey > 0, `${id} costs honey`);
  }
});

test('placement follows the prototype rules: core, overlaps, grid and cost', () => {
  const rich = Object.fromEntries(E.RESOURCES.map(key => [key, 5000]));
  assert.equal(E.placementError([], rich, 'solar_lily', 3, 3), 'core_collision');
  assert.equal(E.placementError([], rich, 'solar_lily', 9, 0), 'invalid_building');
  assert.equal(E.placementError([], rich, 'solar_lily', -1, 0), 'invalid_building');
  assert.equal(E.placementError([], rich, 'solar_lily', 0, 0), null);
  const built = [{ type: 'solar_lily', x: 0, y: 0 }];
  assert.equal(E.placementError(built, rich, 'spring_pool', 1, 1), 'building_collision');
  assert.equal(E.placementError(built, rich, 'solar_lily', 6, 6), 'building_exists');
  assert.equal(E.placementError(built, rich, 'solar_lily', 6, 6, true), null);
  assert.equal(E.placementError([], startResources(), 'heron_watch', 0, 0), 'insufficient_resources');
  assert.equal(E.placementError([], { ...startResources(), honey: 100 }, 'heron_watch', 0, 0), null);
});

test('neighbourhood bonuses add production, including the bee meadow', () => {
  const near = [{ type: 'solar_lily', x: 0, y: 0 }, { type: 'spring_pool', x: 0, y: 3 }];
  assert.deepEqual(E.activeBonuses(near).map(bonus => bonus.id), ['sunwater']);
  assert.equal(E.productionRates(near).solar_lily, 120 + 300);
  const far = [{ type: 'solar_lily', x: 0, y: 0 }, { type: 'spring_pool', x: 7, y: 7 }];
  assert.deepEqual(E.activeBonuses(far), []);
  const blossom = [{ type: 'solar_lily', x: 0, y: 0 }, { type: 'bee_meadow', x: 0, y: 3 }];
  assert.deepEqual(E.activeBonuses(blossom).map(bonus => bonus.id), ['blossom']);
  assert.equal(E.productionRates(blossom).bee_meadow, 60 + 60);
});

test('accrual uses the pond clock, caps at 8 h and stops at the storage cap', () => {
  const buildings = [{ type: 'bee_meadow', x: 0, y: 0, bank: 0, carry: 0 }];
  const resources = startResources();
  const one = E.accrue({ resources, buildings, lastTickMs: 0, nowMs: HOUR });
  assert.equal(one.buildings[0].bank, 60);
  const long = E.accrue({ resources, buildings, lastTickMs: 0, nowMs: 50 * HOUR });
  assert.equal(long.buildings[0].bank, 8 * 60, 'at most 8 hours of offline production');
  const full = E.accrue({ resources: { ...resources, honey: E.STORAGE_CAP }, buildings, lastTickMs: 0, nowMs: 5 * HOUR });
  assert.equal(full.buildings[0].bank, 0, 'a full storage stops the bank');
  const backwards = E.accrue({ resources, buildings, lastTickMs: 5 * HOUR, nowMs: HOUR });
  assert.equal(backwards.buildings[0].bank, 0, 'clock jumps backwards never produce');
});

test('claim credits every producer once and reports the gain per resource', () => {
  const buildings = [
    { type: 'solar_lily', x: 0, y: 0, bank: 100, carry: 0 },
    { type: 'bee_meadow', x: 0, y: 3, bank: 40, carry: 0 },
  ];
  const first = E.claim({ resources: startResources(), buildings });
  assert.equal(first.gained.energy, 100);
  assert.equal(first.gained.honey, 40);
  assert.equal(first.total, 140);
  assert.equal(first.resources.energy, E.STARTING_RESOURCES.energy + 100);
  const second = E.claim({ resources: first.resources, buildings: first.buildings });
  assert.equal(second.total, 0, 'an empty bank credits nothing');
});

test('pond level counts buildings and discoveries, troop housing stays within 20', () => {
  assert.equal(E.pondLevel({ buildings: [], unlocked: ['frog'] }), 1);
  assert.equal(E.pondLevel({
    buildings: [{ type: 'solar_lily' }, { type: 'heron_watch' }],
    unlocked: ['frog', 'reeds', 'fish'],
  }), 1 + 2 + 2);
  assert.equal(E.troopHousing({ frog: 8, beaver: 4 }), 20);
  assert.equal(E.troopHousing({ frog: 8, beaver: 4, dragonfly: 1 }), 22);
  assert.deepEqual(E.trainCost('beaver', 2), { energy: 0, water: 140, air: 0, love: 30, honey: 30 });
  assert.equal(E.trainCost('beaver', 0), null);
  assert.equal(E.trainCost('heron', 1), null);
});

test('quiz rewards pay honey for combos and a duel win', () => {
  const free = Q.calculateResourceRewards({ mode: 'free', correctAnswers: 8, totalRounds: 8, outcome: 1, maxCombo: 6 });
  assert.equal(free.honey, 2, 'free mode: one honey per three combo steps');
  const duel = Q.calculateResourceRewards({ mode: 'duel', correctAnswers: 9, totalRounds: 10, outcome: 1, maxCombo: 6 });
  assert.equal(duel.honey, 2 * 2 + 5, 'duel: doubled combo honey plus the win bonus');
  const lost = Q.calculateResourceRewards({ mode: 'duel', correctAnswers: 4, totalRounds: 10, outcome: 0, maxCombo: 2 });
  assert.equal(lost.honey, 0);
});

const layout = [
  { type: 'solar_lily', x: 0, y: 0 },
  { type: 'spring_pool', x: 7, y: 0 },
  { type: 'heron_watch', x: 0, y: 7 },
];
const deployment = [
  { unit: 'frog', x: 3, y: 0 }, { unit: 'frog', x: 4, y: 0 }, { unit: 'frog', x: 5, y: 0 },
  { unit: 'beaver', x: 9, y: 4 }, { unit: 'dragonfly', x: 4, y: 9 },
];
const troops = { frog: 3, beaver: 1, dragonfly: 1 };

test('the battle simulation is deterministic and verifiable', () => {
  const first = B.simulate({ layout, deployment, seed: 4711 });
  const second = B.simulate({ layout, deployment, seed: 4711 });
  assert.deepEqual(first.frames, second.frames, 'same input, same frames');
  assert.equal(first.replayHash, second.replayHash);
  assert.equal(B.verifyReplay({ layout, deployment, seed: 4711, replayHash: first.replayHash }).verified, true);
  assert.equal(B.verifyReplay({ layout, deployment, seed: 4712, replayHash: first.replayHash }).verified, false);
  const other = B.simulate({ layout, deployment, seed: 99 });
  assert.notEqual(other.replayHash, first.replayHash, 'another seed changes the damage spread');
  assert.ok(first.ticks <= B.MAX_TICKS);
  assert.equal(first.damage[0].type, 'core');
});

test('deployment is checked against edge cells, stock and buildings', () => {
  assert.equal(B.validateDeployment(layout, deployment, troops), null);
  assert.equal(B.validateDeployment(layout, [{ unit: 'frog', x: 4, y: 4 }], troops), 'deployment_not_on_edge');
  assert.equal(B.validateDeployment(layout, [{ unit: 'frog', x: 0, y: 0 }], troops), 'deployment_blocked');
  assert.equal(B.validateDeployment(layout, [{ unit: 'frog', x: 3, y: 0 }], { frog: 0 }), 'insufficient_troops');
  assert.equal(B.validateDeployment(layout, [], troops), 'empty_deployment');
  assert.equal(B.validateDeployment(layout, [{ unit: 'heron', x: 3, y: 0 }], troops), 'invalid_deployment');
});

test('stars follow destruction and the core, trophies follow the offer formula', () => {
  const full = B.simulate({ layout, deployment: [], seed: 1 });
  assert.equal(full.stars, 0, 'without units nothing is destroyed');
  assert.equal(P.trophyOffer(100, 100), 25);
  assert.equal(P.trophyOffer(1000, 100), 8, 'the offer is clamped at the bottom');
  assert.equal(P.trophyOffer(100, 2000), 45, 'and at the top');
  assert.equal(P.trophyPenalty(100, 100), 18);
  const win = P.trophyChange({ attackerTrophies: 100, defenderTrophies: 100, stars: 3 });
  assert.deepEqual(win, { attacker: 25, defender: -25 }, 'three stars pay the full offer');
  const partial = P.trophyChange({ attackerTrophies: 100, defenderTrophies: 100, stars: 1 });
  assert.equal(partial.attacker, 8);
  const loss = P.trophyChange({ attackerTrophies: 100, defenderTrophies: 100, stars: 0 });
  assert.deepEqual(loss, { attacker: -18, defender: 18 });
  const broke = P.trophyChange({ attackerTrophies: 5, defenderTrophies: 100, stars: 0 });
  assert.equal(broke.attacker, -5, 'trophies never fall below zero');
});

test('loot protects 300 per resource, takes bank shares and respects the daily limit', () => {
  const resources = { energy: 1300, water: 800, air: 300, love: 900, honey: 500 };
  const buildings = [{ type: 'solar_lily', x: 0, y: 0, bank: 200 }, { type: 'bee_meadow', x: 0, y: 3, bank: 100 }];
  const available = P.lootAvailable({ resources, buildings });
  assert.equal(available.storage.energy, Math.floor((1300 - 300) * 0.2));
  assert.equal(available.storage.air, 0, 'the protected amount is never lootable');
  assert.equal(available.storage.honey, Math.floor((500 - 300) * 0.2));
  assert.equal(available.banks.solar_lily, 100);
  assert.equal(available.love, undefined, 'love is not part of the loot');

  const full = P.computeLoot({ available, coreFraction: 1, producerFractions: { solar_lily: 1, bee_meadow: 1 },
    stars: 3, leagueBonus: 40, remaining: P.DAILY_LOOT_LIMIT });
  assert.equal(full.gained.love, 0);
  assert.equal(full.gained.honey, available.storage.honey + 50);
  assert.equal(full.bonus, 40);
  assert.equal(full.capped, false);

  const half = P.computeLoot({ available, coreFraction: 0.5, producerFractions: { solar_lily: 0.5 },
    stars: 1, leagueBonus: 0, remaining: P.DAILY_LOOT_LIMIT });
  assert.equal(half.gained.energy, Math.floor(available.storage.energy * 0.5) + Math.floor(100 * 0.5));

  const noStar = P.computeLoot({ available, coreFraction: 1, producerFractions: {}, stars: 0,
    leagueBonus: 40, remaining: P.DAILY_LOOT_LIMIT });
  assert.equal(noStar.bonus, 0, 'the league bonus needs at least one star');

  const capped = P.computeLoot({ available, coreFraction: 1, producerFractions: { solar_lily: 1, bee_meadow: 1 },
    stars: 3, leagueBonus: 40, remaining: 50 });
  assert.equal(capped.capped, true);
  assert.ok(capped.total <= 50, `the daily limit caps the loot, got ${capped.total}`);
});

test('leagues map trophies to names and bonuses', () => {
  assert.equal(P.leagueFor(0).id, 'mud');
  assert.equal(P.leagueFor(399).id, 'mud');
  assert.equal(P.leagueFor(400).id, 'pebble');
  assert.equal(P.leagueFor(1600).id, 'lotus');
  assert.equal(P.leagueFor(99999).bonus, 220);
  assert.equal(P.leagueFor(-50).id, 'mud');
});

test('matchmaking widens the window and rotates reproducibly per day', () => {
  const attacker = { trophies: 500, level: 4 };
  const close = [
    { key: 'u:1', trophies: 520, level: 4 }, { key: 'u:2', trophies: 480, level: 5 },
    { key: 'u:3', trophies: 560, level: 3 }, { key: 'b:bot-09', trophies: 1800, level: 9 },
  ];
  const selection = P.selectCandidates(attacker, close);
  assert.equal(selection.window, 3);
  assert.equal(selection.candidates.length, 3, 'the far opponent stays outside the first window');
  const sparse = P.selectCandidates(attacker, [{ key: 'u:9', trophies: 1800, level: 9 }]);
  assert.equal(sparse.candidates.length, 1, 'the window widens until candidates remain');

  const order = P.rotationOrder(7, '2026-10-03', selection.candidates).map(item => item.key);
  assert.deepEqual(order, P.rotationOrder(7, '2026-10-03', selection.candidates).map(item => item.key));
  assert.notDeepEqual(order, P.rotationOrder(7, '2026-10-04', selection.candidates).map(item => item.key));
  assert.deepEqual([...order].sort(), ['u:1', 'u:2', 'u:3']);
  assert.equal(P.utcDay(Date.UTC(2026, 9, 3, 23, 59)), '2026-10-03');
  assert.equal(P.nextUtcMidnight(Date.UTC(2026, 9, 3, 23, 59)), Date.UTC(2026, 9, 4));
});

test('the bot pool is complete, deterministic and playable', () => {
  const all = Bots.list();
  assert.equal(all.length, 30);
  assert.equal(all[0].id, 'bot-01');
  assert.equal(all[29].id, 'bot-30');
  assert.equal(all[0].trophies, 40);
  assert.equal(all[29].trophies, 1925);
  assert.equal(Bots.indexOf('bot-31'), -1);
  assert.equal(Bots.profile('bot-99'), null);
  for (const bot of all) {
    assert.ok(bot.buildings.length >= 2 && bot.buildings.length <= 4, `${bot.id} has 2–4 buildings`);
    const rich = Object.fromEntries(E.RESOURCES.map(key => [key, 1e9]));
    bot.buildings.forEach((item, index) => {
      assert.equal(E.placementError(bot.buildings.slice(0, index), rich, item.type, item.x, item.y), null,
        `${bot.id} layout is valid`);
    });
    if (bot.trophies >= 400) assert.ok(bot.buildings.some(item => item.type === 'heron_watch'),
      `${bot.id} defends from the pebble league on`);
    assert.ok(B.edgeCells(bot.buildings).length > 0, `${bot.id} can be attacked`);
  }
  const day = Bots.snapshot('bot-15', '2026-10-03');
  assert.deepEqual(day, Bots.snapshot('bot-15', '2026-10-03'), 'same day, same snapshot');
  assert.notDeepEqual(day.resources, Bots.snapshot('bot-15', '2026-10-04').resources);
  assert.ok(day.resources.honey > 0, 'bots carry honey too');
  for (const item of day.buildings) {
    if (E.BUILDINGS[item.type].kind === 'producer') assert.ok(item.bank > 0, 'producers carry a bank');
  }
});
