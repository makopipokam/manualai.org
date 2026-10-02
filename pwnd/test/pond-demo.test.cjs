const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'pond-demo.js'), 'utf8'), context);
const P = context.PwndPondDemo;
const plain = value => JSON.parse(JSON.stringify(value));
const initial = { energy: 1000, water: 250, air: 120, love: 60 };
const hour = 3600000;

assert.equal(P.GRID_SIZE, 10);
assert.deepEqual(plain(P.SOLAR.cost), { energy: 120, water: 80, air: 20, love: 10 });
assert.equal(P.SOLAR.energyPerHour, 120);
assert.equal(P.normalizePondDemo(null, 100).buildings.length, 0);
assert.deepEqual(plain(P.normalizePondDemo({ buildings: [{ type: 'solar_lily', x: 4, y: 4 }] }, 100).buildings), []);
for (const [x, y] of [[-1, 0], [9, 0], [0, 9], [4, 4], [3, 3], [5, 5]]) {
  assert.equal(P.canPlace([], initial, x, y), false, `invalid or core-overlapping origin ${x},${y}`);
}
const built = P.placeSolarLily({ buildings: [], resources: initial, x: 2, y: 3, nowMs: 1000 });
assert.ok(built);
assert.deepEqual(plain(built.resources), { energy: 880, water: 170, air: 100, love: 50 });
assert.deepEqual(initial, { energy: 1000, water: 250, air: 120, love: 60 }, 'a rejected action must not mutate the caller');
assert.equal(P.placeSolarLily({ buildings: built.buildings, resources: built.resources, x: 6, y: 4, nowMs: 2000 }), null, 'the demo contains one producer only');
assert.equal(P.placeSolarLily({ buildings: [], resources: { ...initial, love: 9 }, x: 2, y: 3, nowMs: 1000 }), null);

const reward = { energy: 5, water: 47, air: 20, love: 15 };
const awarded = P.settleQuiz({ resources: built.resources, completedAttempts: [], attemptId: 'attempt-one', energyAfter: 885, rewards: reward, answeredCount: 8 });
assert.deepEqual(plain(awarded.resources), { energy: 885, water: 217, air: 120, love: 65 });
assert.equal(P.settleQuiz({ resources: awarded.resources, completedAttempts: awarded.completedAttempts, attemptId: 'attempt-one', energyAfter: 890, rewards: reward, answeredCount: 8 }), null, 'a replay cannot earn a second reward');
assert.equal(P.settleQuiz({ resources: initial, completedAttempts: [], attemptId: 'empty', energyAfter: 1000, rewards: reward, answeredCount: 0 }), null, 'API exhaustion cannot create an empty paid run');
assert.equal(P.settleQuiz({ resources: { ...initial, water: Number.MAX_SAFE_INTEGER }, completedAttempts: [], attemptId: 'overflow', energyAfter: 1000, rewards: reward, answeredCount: 8 }), null, 'overflowed resource balances must not be stored');
const highQuizEnergy = P.settleQuiz({ resources: { ...initial, energy: 1998 }, completedAttempts: [], attemptId: 'older-beta-energy', energyAfter: 2006, rewards: reward, answeredCount: 8 });
assert.equal(highQuizEnergy.resources.energy, 2006, 'legacy quiz energy remains separate from the solar harvest cap');
const restored = P.normalizePondDemo({ buildings: built.buildings, completedAttempts: awarded.completedAttempts }, 2000);
assert.deepEqual(plain(restored.buildings), plain(built.buildings));
assert.deepEqual(plain(restored.completedAttempts), ['attempt-one']);
assert.equal(P.pendingEnergy(restored.buildings[0], awarded.resources.energy, 1000 + hour), 120);
const claim = P.claimSolarEnergy({ building: restored.buildings[0], energy: awarded.resources.energy, nowMs: 1000 + hour });
assert.equal(claim.gained, 120);
assert.equal(claim.energy, 1005);
assert.equal(P.claimSolarEnergy({ building: claim.building, energy: claim.energy, nowMs: 1000 + hour }), null, 'the same clock instant cannot be claimed twice');
assert.equal(P.pendingEnergy(built.buildings[0], 1000, 1000 + 12 * hour), 960, 'offline accrual stops at eight hours');
assert.equal(P.pendingEnergy(built.buildings[0], 1990, 1000 + hour), 10, 'energy production respects the local cap');
assert.equal(P.pendingEnergy(built.buildings[0], 2000, 1000 + hour), 0);
assert.equal(P.pendingEnergy(built.buildings[0], highQuizEnergy.resources.energy, 1000 + hour), 0);
assert.equal(P.pendingEnergy(built.buildings[0], 1000, 500), 0, 'moving a local clock backwards must not grant energy');
console.log('pwnd pond demo tests: ok');
