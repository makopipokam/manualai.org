const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = { console };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'pwnd-engine.js'), 'utf8'), context);
const engine = context.PwndEngine;
const aiContext = { globalThis: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'pwnd-ai-questions.js'), 'utf8'), aiContext);
const aiQuestions = aiContext.globalThis.PWND_AI_QUESTIONS;
const appSource = fs.readFileSync(path.join(__dirname, '..', 'pwnd.js'), 'utf8');
const apiSource = fs.readFileSync(path.join(__dirname, '..', '..', 'api', 'pwnd-question.js'), 'utf8');
const pageSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.match(pageSource, /Ressourcen sammeln/, 'the pond activity must be called resources');
assert.doesNotMatch(pageSource, /ENERGIE · WASSER · LUFT · LIEBE/, 'the growth map should show the four symbols instead of resource names');
assert.match(pageSource, /growth-resource-legend[^>]*role="img"/, 'the growth legend must group all four resources');
assert.match(appSource, /class="unlock-costs"/, 'growth costs must render as grouped resource values');
assert.doesNotMatch(pageSource, /duel-start-glyph|▶/, 'the LOS buttons must not contain a play symbol');
for (const species of ['red', 'arctic', 'fennec']) {
  const portrait = `assets/${species}-fox.webp`;
  assert.ok(fs.statSync(path.join(__dirname, '..', portrait)).size > 10000, `${species} fox portrait must be a real optimized image`);
  assert.ok(pageSource.includes(portrait), `${species} fox portrait must appear on the selection screen`);
  assert.ok(appSource.includes(portrait), `${species} fox portrait must follow the opponent into the match`);
}
assert.doesNotMatch(pageSource, /Vulpes vulpes|Vulpes lagopus|Vulpes zerda/, 'tiny Latin metadata should be removed from the opponent UI');
for (const feature of ['frog', 'reeds', 'dragonfly', 'fish', 'lily', 'stream']) {
  assert.match(pageSource, new RegExp(`data-feature="${feature}"`), `${feature} must have a home in the top pond`);
}
assert.match(appSource, /renderPondScene\(id\)/, 'unlocking must add the new element to the top pond');
assert.match(appSource, /renderPondScene\(\)/, 'saved pond progress must rehydrate on page load');
assert.match(appSource, /recentAnswers/, 'fox requests must contain the previously observed answers');
assert.match(appSource, /match\.current = await requestAiQuestion\(match\)/, 'duels must request adaptive questions');
assert.match(appSource, /QUESTION_TIME_MIN/, 'adaptive duel difficulty must not remove adequate thinking time');
assert.match(appSource, /foxComment\(match, question\)/, 'each duel question must refresh the fox dialogue');
assert.match(appSource, /setText\('aiComment', foxComment\(match, match\.current\)\)/, 'fox dialogue belongs to the thinking phase before each question');
assert.match(appSource, /\$\('aiComment'\)\.hidden = match\.mode === 'duel'/, 'fox dialogue must disappear while answer choices are visible');
assert.doesNotMatch(appSource, /wertet deine letzte Antwort aus/, 'old red loading placeholder must be removed');
assert.doesNotMatch(appSource, /question\.opponentLine/, 'fox dialogue must use observed answers, never a model-invented claim');
assert.match(appSource, /source: fallback\.source \|\| 'archive'/, 'the last offline fallback must be visibly tagged as archive content');
const questionIds = [...appSource.matchAll(/\{ id:'([^']+)', type:/g)].map(match => match[1]);
assert.ok(new Set(questionIds).size >= 30, 'the pwnd question pool should contain at least 30 unique questions');
assert.equal(aiQuestions.length, 48, 'the AI fallback pool should contain 48 questions');
assert.equal(new Set(aiQuestions.map(question => question.prompt.trim().toLocaleLowerCase('de'))).size, 48, 'AI prompts must be unique');
assert.match(appSource, /skillProfile/, 'the owl skill profile must persist outside a single match');
assert.match(appSource, /rating: 1000/, 'duel opponents must define a numeric rating');
assert.match(appSource, /rating: 1080/, 'the pressure fox must define a distinct rating');
assert.match(appSource, /rating: 1160/, 'the reasoning fox must define a distinct rating');
assert.match(appSource, /screenDuelCountdown/, 'duels must have a dedicated countdown screen');
assert.match(appSource, /startLaunchCountdown/, 'quiz modes must start through the countdown flow');
assert.match(appSource, /countdownNumber/, 'the countdown must expose an accessible number/status target');
assert.match(appSource, /Die Eule erwacht/, 'free quiz must have an owl-specific launch state');
for (const question of aiQuestions) {
  assert.equal(question.options.length, 4, 'AI questions must have four answer options');
  assert.ok(question.answer >= 0 && question.answer < 4, 'AI answer index must be valid');
}
for (const topicId of ['nature', 'patterns', 'sources', 'decisions', 'world', 'reasoning']) {
  const topicQuestions = aiQuestions.filter(question => question.topicId === topicId);
  assert.equal(topicQuestions.length, 8, `${topicId} should have eight AI questions`);
  const history = [];
  for (let round = 1; round <= 8; round += 1) {
    const next = engine.chooseNextQuestion({ questions: topicQuestions, history, skills: { recall: .5, pattern: .5, causal: .5, logic: .5, source: .5, risk: .5 }, topicSkills: [...new Set(topicQuestions.map(question => question.skill))], opponent: { focus: 'reasoning' }, round, accuracy: .5 });
    assert.ok(next, `${topicId} should yield a question in round ${round}`);
    assert.ok(!history.some(item => item.question.id === next.id), `${topicId} must not repeat question ${next.id}`);
    history.push({ question: next, correct: true });
  }
}
assert.match(apiSource, /excludePrompts/, 'the AI endpoint must receive previously used prompts');
assert.match(apiSource, /options.*length !== 4/, 'the AI endpoint must validate four answer options');

const question = { id: 'q', type: 'recall', skill: 'recall', difficulty: .5, answer: 1, time: 12000, prompt: 'Eine Testfrage mit eindeutigem Text?' };
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
  { ...question, id: 'q2', prompt: 'Eine zweite Testfrage mit anderer Formulierung?', skill: 'logic', type: 'logic', difficulty: .65 },
  { ...question, id: 'q3', prompt: 'Eine dritte Testfrage mit eigener Formulierung?', skill: 'causal', type: 'causal', difficulty: .8 },
];
const next = engine.chooseNextQuestion({ questions, history: [{ question: questions[0] }], skills: { recall: .2, logic: .8, causal: .7 }, opponent, round: 3, accuracy: .5 });
assert.ok(next && next.id !== 'q', 'recent questions should be avoided');
const noRepeat = engine.chooseNextQuestion({ questions, history: [{ question: questions[0] }, { question: questions[1] }], skills: { recall: .5, logic: .5, causal: .5 }, opponent, round: 3, accuracy: .5 });
assert.equal(noRepeat.id, 'q3', 'unused questions should be preferred before a repeat');
const promptRepeat = engine.chooseNextQuestion({ questions: [questions[0], { ...questions[2], id: 'q3-copy', prompt: questions[0].prompt }, questions[1]], history: [{ question: questions[0] }], skills: { recall: .5, logic: .5, causal: .5 }, opponent, round: 3, accuracy: .5 });
assert.equal(promptRepeat.id, 'q2', 'prompt-level repeat protection should skip a different id with the same prompt');
const punctuationRepeat = engine.chooseNextQuestion({ questions: [{ ...questions[2], id: 'punctuation-copy', prompt: 'EINE  TESTFRAGE MIT EINDEUTIGEM TEXT!' }, questions[1]], history: [{ question }], skills: { recall: .5, logic: .5, causal: .5 }, opponent, round: 2 });
assert.equal(punctuationRepeat.id, 'q2', 'minor punctuation and spacing changes must not count as a new question');
assert.ok(engine.nearDuplicatePrompt('Welche Zahl folgt in der Folge 2, 4, 8, 16?', 'Welche Zahl folgt auf die Folge: 2, 4, 8, 16?'), 'a close paraphrase must count as a replay');
assert.ok(!engine.nearDuplicatePrompt('Welche Zahl folgt in der Folge 2, 4, 8, 16?', 'Welche Zahl folgt in der Folge 3, 6, 9, 12?'), 'different numeric sequences must remain independently playable');
const exhausted = engine.chooseNextQuestion({ questions: [question], history: [{ question }], skills: { recall: .5 }, opponent, round: 2, accuracy: 0 });
assert.equal(exhausted, null, 'an exhausted question pool must not repeat an already played question');

const topicQuestions = [
  { ...question, id: 'topic-recall', prompt: 'Themenfrage Abruf eins?', skill: 'recall', type: 'recall', difficulty: .35 },
  { ...question, id: 'topic-recall-2', prompt: 'Themenfrage Abruf zwei?', skill: 'recall', type: 'recall', difficulty: .4 },
  { ...question, id: 'topic-logic', prompt: 'Themenfrage Logik?', skill: 'logic', type: 'logic', difficulty: .4 },
  { ...question, id: 'topic-source', prompt: 'Themenfrage Quelle?', skill: 'source', type: 'source', difficulty: .5 },
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
const tooHardWeakness = engine.chooseNextQuestion({
  questions: [{ ...topicQuestions[1], difficulty: .9 }, topicQuestions[2]],
  history: [{ question: topicQuestions[0], correct: false }],
  skills: { recall: .2, logic: .8 }, topicSkills: ['recall', 'logic'], opponent, round: 2,
});
assert.equal(tooHardWeakness.skill, 'logic', 'do not force an overwhelming weakness question when a more reachable question exists');

const lowSkill = engine.adaptiveQuestionProfile({ skills: { recall: .2, causal: .8 }, topicSkills: ['recall', 'causal'], round: 1 });
const highSkill = engine.adaptiveQuestionProfile({ skills: { recall: .8, causal: .8 }, topicSkills: ['recall', 'causal'], round: 1 });
assert.equal(lowSkill.weakestSkill, 'recall');
assert.equal(highSkill.weakestSkill, 'recall');
assert.ok(lowSkill.targetDifficulty < highSkill.targetDifficulty, 'question difficulty should rise with the player skill level');
assert.ok(lowSkill.targetDifficulty >= .2 && highSkill.targetDifficulty <= .95);
const struggling = engine.adaptiveQuestionProfile({ skills: { logic: .5 }, topicSkills: ['logic'], history: [
  { question: { skill: 'logic' }, correct: false }, { question: { skill: 'logic' }, correct: false },
] });
const successful = engine.adaptiveQuestionProfile({ skills: { logic: .5 }, topicSkills: ['logic'], history: [
  { question: { skill: 'logic' }, correct: true }, { question: { skill: 'logic' }, correct: true },
] });
assert.equal(struggling.support, 'guided', 'two mistakes should trigger additional support');
assert.ok(struggling.targetDifficulty < successful.targetDifficulty, 'challenge must drop after mistakes and rise after secure answers');
const foxProfile = engine.adaptiveQuestionProfile({ skills: { recall: .25, logic: .35, risk: .7 }, opponent: { focus: 'reasoning' }, mode: 'duel' });
assert.equal(foxProfile.weakestSkill, 'logic', 'the fennec should prefer reasoning skills before seeing a specific error');
const foxAfterMiss = engine.adaptiveQuestionProfile({ skills: { recall: .25, logic: .35, risk: .7 }, opponent: { focus: 'reasoning' }, mode: 'duel', history: [{ question: { skill: 'recall' }, correct: false }] });
assert.equal(foxAfterMiss.weakestSkill, 'recall', 'a fox should respond to a documented error even outside its usual focus');
assert.ok(engine.updateSkillEstimate({ before: .5, correct: true, difficulty: .6, responseTimeMs: 3000, questionTime: 12000 }) > .5);
assert.ok(engine.updateSkillEstimate({ before: .5, correct: false, difficulty: .4, responseTimeMs: 12000, questionTime: 12000 }) < .5);
assert.equal(engine.updateSkillEstimate({ before: 0, correct: false, difficulty: .4 }), .05, 'zero skill must not be reset to the neutral baseline');

const score = engine.calculateMatchScore({ outcome: 1, accuracy: .8, averageDifficulty: .6, fastCorrectRate: .5 });
assert.ok(score > .5 && score < 1);
const energy = engine.calculateNewEnergy({ before: 1000, opponentRating: 1000, score, calibration: 0 });
assert.ok(energy.energy > 1000 && energy.delta > 0);
assert.equal(energy.energy, 1000 + energy.delta, 'energy should move by the deterministic rating delta');
const missingRatingEnergy = engine.calculateNewEnergy({ before: 1000, opponentRating: undefined, score: .7, calibration: 0 });
assert.ok(Number.isFinite(missingRatingEnergy.energy), 'missing opponent ratings must never create NaN energy');
assert.ok(Number.isFinite(missingRatingEnergy.delta), 'missing opponent ratings must never create NaN deltas');

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
