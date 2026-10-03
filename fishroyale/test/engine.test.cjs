const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = {};
const source = fs.readFileSync(path.join(__dirname, '..', 'engine.js'), 'utf8');
vm.runInNewContext(source, context);
const E = context.FishRoyaleEngine;
const plain = (value) => JSON.parse(JSON.stringify(value));

assert.equal(E.MAX_HEALTH, 16);
assert.equal(E.OPPONENT_PLAN.length, 6);
assert.deepEqual(plain(Object.keys(E.PLAYLISTS).sort()), ['logic', 'numbers', 'reef']);
assert.equal(E.CARDS.length, 4, 'all four cards are always available');
assert.equal(E.CARDS.some((card) => card.paid || card.evolution || card.random), false);
assert.doesNotMatch(source, /Math\.random/, 'combat and content must never sample random outcomes');
assert.doesNotMatch(source, /setTimeout|setInterval|Date\.now/, 'the engine has no timers or background progression');
for (const playlistId of Object.keys(E.PLAYLISTS)) {
  assert.equal(E.PLAYLISTS[playlistId].questions.length, 6, `${playlistId} has a fixed six-question path`);
  for (const question of E.PLAYLISTS[playlistId].questions) {
    assert.ok(question.prompt.length > 10);
    assert.ok(question.answer >= 0 && question.answer < question.options.length);
  }
}
assert.equal(E.isAdvantage('coral', 'current'), true);
assert.equal(E.isAdvantage('current', 'depth'), true);
assert.equal(E.isAdvantage('depth', 'storm'), true);
assert.equal(E.isAdvantage('storm', 'coral'), true);
assert.equal(E.isAdvantage('coral', 'coral'), false);
assert.throws(() => E.createMatch('unknown'), /Unbekanntes Quizriff/);

let match = E.createMatch('reef');
assert.equal(match.phase, 'question');
assert.equal(match.energy, 2);
assert.equal(E.currentIntent(match).attackLane, 'right');
assert.equal(E.answerQuestion(match, -1), null);
assert.equal(E.answerQuestion(match, 3), null);
const correct = E.answerQuestion(match, E.currentQuestion(match).answer);
assert.equal(correct.correct, true);
assert.equal(correct.energy, 5, 'a correct answer gives +3 tactic energy');
assert.equal(E.answerQuestion(correct, 0), null, 'an answer cannot be retried');
const wrong = E.answerQuestion(match, (E.currentQuestion(match).answer + 1) % 3);
assert.equal(wrong.correct, false);
assert.equal(wrong.energy, 4, 'a wrong answer still grants the fair +2 baseline');
assert.equal(E.selectCard(match, 'kelp-scout'), null, 'cards cannot be selected before the quiz');
assert.equal(E.selectCard(wrong, 'missing-card'), null);
assert.equal(E.selectCard({ ...wrong, energy: 2 }, 'deep-manta'), null, 'an unaffordable card cannot be selected');
let play = E.selectCard(correct, 'kelp-scout');
assert.equal(E.selectLane(play, 'north'), null);
play = E.selectLane(play, 'right');
const original = plain(play);
const result = E.resolveTurn(play);
assert.ok(result);
assert.equal(result.history.length, 1);
assert.equal(result.lastResult.cardName, 'Tangspäher');
assert.equal(result.lastResult.laneName, 'Ostspur');
assert.equal(result.lastResult.defended, true, 'the incoming lane is telegraphed');
assert.equal(result.lastResult.quizBonus, 1);
assert.equal(result.energy, 3);
assert.deepEqual(plain(play), original, 'turn resolution does not mutate its caller');
assert.equal(result.playerHealth, 16 - result.lastResult.incomingDamage);
assert.equal(result.rivalHealth, 16 - result.lastResult.damage);
assert.equal(E.resolveTurn(match), null, 'a turn cannot resolve without an answer, card and lane');

let next = E.nextRound(result);
assert.equal(next.roundIndex, 1);
assert.equal(next.phase, 'question');
assert.equal(E.currentIntent(next).attackLane, 'left');
assert.equal(E.nextRound(next), null, 'only a result can advance a round');

function runAllCorrect(playlistId) {
  let game = E.createMatch(playlistId);
  while (game.status === 'active') {
    const question = E.currentQuestion(game);
    game = E.answerQuestion(game, question.answer);
    const affordable = E.CARDS.filter((card) => card.cost <= game.energy).sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id));
    game = E.selectCard(game, affordable[0].id);
    const intent = E.currentIntent(game);
    game = E.selectLane(game, intent.attackLane);
    game = E.resolveTurn(game);
    if (game.status === 'active') game = E.nextRound(game);
  }
  return game;
}
const runOne = runAllCorrect('logic');
const runTwo = runAllCorrect('logic');
assert.deepEqual(plain(runOne.history), plain(runTwo.history), 'the same choices always produce the same match');
assert.equal(runOne.status, 'finished');
assert.ok(['player', 'rival', 'draw'].includes(runOne.winner));
assert.ok(runOne.history.length <= 6 && runOne.history.length >= 1);
console.log('fish royale engine tests: ok');
