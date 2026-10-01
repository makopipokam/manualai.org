const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { console };
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '..', 'pwnd-engine.js'), 'utf8'), context);
const engine = context.PwndEngine;

const question = { id: 'q', type: 'recall', skill: 'recall', difficulty: .5, answer: 1, time: 12000 };
const opponent = { focus: 'adaptive' };

const hit = engine.evaluateAnswer({ answerIndex: 1, question, responseTimeMs: 2000, combo: 1 });
assert.equal(hit.correct, true);
assert.ok(hit.damage > 10, 'fast combo answers should deal meaningful damage');
assert.equal(hit.selfDamage, 0);
assert.equal(hit.combo, 2);

const miss = engine.evaluateAnswer({ answerIndex: 0, question, responseTimeMs: 5000, combo: 2 });
assert.equal(miss.correct, false);
assert.equal(miss.damage, 0);
assert.ok(miss.selfDamage > 0);
assert.equal(miss.combo, 0);

const questions = [
  question,
  { ...question, id: 'q2', skill: 'logic', type: 'logic', difficulty: .65 },
  { ...question, id: 'q3', skill: 'causal', type: 'causal', difficulty: .8 }
];
const next = engine.chooseNextQuestion({ questions, history: [{ question: questions[0] }], skills: { recall: .2, logic: .8, causal: .7 }, opponent, round: 3, accuracy: .5 });
assert.ok(next && next.id !== 'q', 'recent questions should be avoided');

const score = engine.calculateMatchScore({ outcome: 1, accuracy: .8, averageDifficulty: .6, fastCorrectRate: .5 });
assert.ok(score > .5 && score < 1);
const rating = engine.calculateNewIP({ before: 1000, opponentRating: 1000, score, calibration: 0 });
assert.ok(rating.ip > 1000 && rating.delta > 0);
assert.equal(rating.ip, 1000 + rating.delta, 'the water resource should move by the deterministic delta');
const duelElixir = engine.calculateElixirReward({ mode: 'duel', correctAnswers: 8, totalRounds: 10, outcome: 1 });
const freeElixir = engine.calculateElixirReward({ mode: 'free', correctAnswers: 8, totalRounds: 10, outcome: 0 });
assert.ok(duelElixir > freeElixir && freeElixir > 0, 'duel and free quiz should feed elixir independently from gold');

console.log('pwnd-engine tests: ok');
