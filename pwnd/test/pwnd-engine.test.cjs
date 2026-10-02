const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = { console };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'pwnd-engine.js'), 'utf8'), context);
const engine = context.PwndEngine;
const appSource = fs.readFileSync(path.join(__dirname, '..', 'pwnd.js'), 'utf8');
const questionIds = [...appSource.matchAll(/\{ id:'([^']+)', type:/g)].map(match => match[1]);
assert.ok(new Set(questionIds).size >= 30, 'the pwnd question pool should contain at least 30 unique questions');

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
  { ...question, id: 'q3', skill: 'causal', type: 'causal', difficulty: .8 },
];
const next = engine.chooseNextQuestion({ questions, history: [{ question: questions[0] }], skills: { recall: .2, logic: .8, causal: .7 }, opponent, round: 3, accuracy: .5 });
assert.ok(next && next.id !== 'q', 'recent questions should be avoided');
const noRepeat = engine.chooseNextQuestion({ questions, history: [{ question: questions[0] }, { question: questions[1] }], skills: { recall: .5, logic: .5, causal: .5 }, opponent, round: 3, accuracy: .5 });
assert.equal(noRepeat.id, 'q3', 'unused questions should be preferred before a repeat');

const topicQuestions = [
  { ...question, id: 'topic-recall', skill: 'recall', type: 'recall', difficulty: .35 },
  { ...question, id: 'topic-recall-2', skill: 'recall', type: 'recall', difficulty: .55 },
  { ...question, id: 'topic-logic', skill: 'logic', type: 'logic', difficulty: .4 },
  { ...question, id: 'topic-source', skill: 'source', type: 'source', difficulty: .5 },
];
const owlWeaknessQuestion = engine.chooseNextQuestion({
  questions: topicQuestions,
  history: [{ question: topicQuestions[0], correct: false }],
  skills: { recall: .2, logic: .8, source: .7 },
  topicSkills: ['recall', 'logic'],
  opponent: { focus: 'reasoning' },
  round: 2,
  accuracy: 0,
});
assert.equal(owlWeaknessQuestion.skill, 'recall', 'the owl should target the weakest skill inside the chosen topic');

const score = engine.calculateMatchScore({ outcome: 1, accuracy: .8, averageDifficulty: .6, fastCorrectRate: .5 });
assert.ok(score > .5 && score < 1);
const energy = engine.calculateNewEnergy({ before: 1000, opponentRating: 1000, score, calibration: 0 });
assert.ok(energy.energy > 1000 && energy.delta > 0);
assert.equal(energy.energy, 1000 + energy.delta, 'energy should move by the deterministic rating delta');

const duelRewards = engine.calculateResourceRewards({ mode: 'duel', correctAnswers: 8, totalRounds: 10, outcome: 1, fastCorrectRate: .6, maxCombo: 4 });
const freeRewards = engine.calculateResourceRewards({ mode: 'free', correctAnswers: 6, totalRounds: 8, outcome: 1, fastCorrectRate: 0, maxCombo: 0 });
assert.equal(freeRewards.energy, 6, 'free quiz energy should track learned correct answers');
assert.equal(duelRewards.energy, 0, 'duel energy should be driven by rating');
for (const resource of ['water', 'air', 'love']) {
  assert.ok(duelRewards[resource] > 0, `${resource} should be a positive duel reward`);
  assert.ok(freeRewards[resource] > 0, `${resource} should be a positive free-quiz reward`);
}
assert.ok(duelRewards.water > freeRewards.water, 'duel should provide more water on an equivalent strong run');
assert.ok(duelRewards.love > freeRewards.love, 'winning a duel should strengthen love more than free quiz');

console.log('pwnd-engine tests: ok');
