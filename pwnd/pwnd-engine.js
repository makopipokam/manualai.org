(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PwndEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  function clamp(value, min, max){ return Math.max(min, Math.min(max, value)); }

  function calculateDamage({ correct, question, responseTimeMs, combo = 0, mods = {} }){
    if (!correct) return 0;
    const timeRatio = clamp(responseTimeMs / question.time, 0, 1);
    const speedMultiplier = .75 + (1 - timeRatio) * .75;
    let damage = Math.round(10 * speedMultiplier * (1 + combo * .08));
    if (question.difficulty > .65) damage = Math.round(damage * (1 + (mods.risk || 0)));
    return damage;
  }

  function calculateSelfDamage({ correct, question, mods = {} }){
    if (correct) return 0;
    let damage = Math.round(5 + question.difficulty * 7);
    if (question.type === 'causal') damage = Math.round(damage * (1 - (mods.causalShield || 0)));
    if (mods.riskPenalty) damage = Math.round(damage * (1 + mods.riskPenalty));
    return damage;
  }

  function evaluateAnswer({ answerIndex, question, responseTimeMs, combo = 0, mods = {} }){
    const correct = answerIndex === question.answer;
    let nextCombo = combo;
    if (correct) nextCombo += 1;
    else if (mods.calm && combo > 0) nextCombo = Math.max(0, combo - 1);
    else nextCombo = 0;
    return {
      correct,
      responseTimeMs,
      timeRatio: clamp(responseTimeMs / question.time, 0, 1),
      damage: calculateDamage({ correct, question, responseTimeMs, combo, mods }),
      selfDamage: calculateSelfDamage({ correct, question, mods }),
      combo: nextCombo,
      skillDelta: correct ? .09 : -.12,
    };
  }

  function adaptiveQuestionProfile({ skills = {}, topicSkills = [], history = [], opponent = {}, mode = 'free' }){
    const scope = topicSkills.length ? [...topicSkills] : Object.keys(skills);
    const focus = opponent.focus === 'pressure' ? ['recall', 'risk']
      : opponent.focus === 'reasoning' && mode === 'duel' ? ['causal', 'logic', 'source'] : scope;
    const choices = scope.filter(skill => focus.includes(skill));
    const recentMiss = history.slice(-2).reverse().find(entry => !entry.correct && scope.includes(entry.question.skill));
    // A failed skill is revisited with more support, even when a fox normally favors another type.
    const weakestSkill = recentMiss?.question.skill || [...(choices.length ? choices : scope)].sort((a, b) => (skills[a] ?? .5) - (skills[b] ?? .5))[0] || 'recall';
    const skillLevel = clamp(Number(skills[weakestSkill] ?? .5), 0, 1);
    const recent = history.filter(entry => entry.question.skill === weakestSkill).slice(-2);
    const misses = recent.filter(entry => !entry.correct).length;
    const streak = recent.length === 2 && recent.every(entry => entry.correct);
    const support = misses >= 2 ? 'guided' : misses ? 'lighter' : 'standard';
    // The target is an estimate of a learnable next step, not a claim to measure the learner's actual ZPD.
    const targetDifficulty = clamp(.29 + skillLevel * .60 - (misses >= 2 ? .12 : misses ? .07 : 0) + (streak ? .05 : 0), .28, .88);
    const target = Math.round(targetDifficulty * 100) / 100;
    return { weakestSkill, skillLevel, targetDifficulty: target, targetBand: [Math.max(.2, target - .14), Math.min(.95, target + .14)], support };
  }

  function updateSkillEstimate({ before = .5, correct, difficulty = .5, responseTimeMs = 0, questionTime = 12000 }){
    const level = clamp(Number.isFinite(Number(before)) ? Number(before) : .5, 0, 1);
    const expected = clamp(.5 + (level - clamp(difficulty, .2, .95)) * .7, .15, .85);
    const ratio = clamp(responseTimeMs / Math.max(1, questionTime), 0, 1);
    const speedFactor = correct && ratio > .8 ? .8 : 1;
    return Math.round(clamp(level + ((correct ? 1 : 0) - expected) * .18 * speedFactor, .05, .95) * 1000) / 1000;
  }

  function normalizedPrompt(prompt){ return String(prompt || '').normalize('NFKC').toLocaleLowerCase('de').replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
  function nearDuplicatePrompt(first, second){
    const a = normalizedPrompt(first), b = normalizedPrompt(second);
    if (!a || !b) return false;
    if (a === b) return true;
    if (Math.min(a.length, b.length) < 30) return false;
    if (JSON.stringify(a.match(/\d+/g) || []) !== JSON.stringify(b.match(/\d+/g) || [])) return false;
    const aWords = new Set(a.split(' ')), bWords = new Set(b.split(' '));
    const shared = [...aWords].filter(word => bWords.has(word)).length;
    if (shared >= 6 && shared / (aWords.size + bWords.size - shared) >= .78) return true;
    if (Math.abs(a.length - b.length) / Math.max(a.length, b.length) > .2) return false;
    let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1){
      const current = [i];
      for (let j = 1; j <= b.length; j += 1){
        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      previous = current;
    }
    return 1 - previous[b.length] / Math.max(a.length, b.length) >= .87;
  }

  function chooseNextQuestion({ questions, history = [], skills, opponent = {}, round, accuracy = 0, topicSkills = [] }){
    const usedIds = new Set(history.map(item => item.question.id));
    const usedPrompts = history.map(item => item.question.prompt);
    const profile = adaptiveQuestionProfile({ skills, topicSkills, history, opponent, mode: topicSkills.length ? 'free' : 'duel' });
    const scopedQuestions = topicSkills.length ? questions.filter(question => topicSkills.includes(question.skill)) : questions;
    const candidates = scopedQuestions.filter(question => !usedIds.has(question.id) && !usedPrompts.some(prompt => nearDuplicatePrompt(prompt, question.prompt)));
    if (!candidates.length) return null;
    const near = candidates.filter(question => Math.abs((question.difficulty ?? .5) - profile.targetDifficulty) <= .14);
    const inFocus = near.filter(question => question.skill === profile.weakestSkill);
    const pool = inFocus.length ? inFocus : near.length ? near : candidates;
    return [...pool].sort((a, b) => {
      const distance = Math.abs((a.difficulty ?? .5) - profile.targetDifficulty) - Math.abs((b.difficulty ?? .5) - profile.targetDifficulty);
      return distance || Number(a.skill !== profile.weakestSkill) - Number(b.skill !== profile.weakestSkill);
    })[0];
  }

  function calculateMatchScore({ outcome, accuracy, averageDifficulty, fastCorrectRate }){
    return .5 * outcome + .25 * accuracy + .15 * averageDifficulty + .1 * fastCorrectRate;
  }

  function calculateNewEnergy({ before, opponentRating = 1000, score, calibration = 0 }){
    const safeBefore = Number.isFinite(Number(before)) ? Number(before) : 1000;
    const safeOpponentRating = Number.isFinite(Number(opponentRating)) ? Number(opponentRating) : 1000;
    const safeScore = clamp(Number.isFinite(Number(score)) ? Number(score) : 0, 0, 1);
    const expected = 1 / (1 + Math.pow(10, ((safeOpponentRating - safeBefore) / 400)));
    const k = calibration < 1 ? 48 : 24;
    const delta = Math.round(k * (safeScore - expected));
    return { delta, energy: Math.max(0, Math.round(safeBefore + delta)) };
  }

  function calculateResourceRewards({ mode = 'duel', correctAnswers, totalRounds, outcome = 0, fastCorrectRate = 0, maxCombo = 0 }){
    const accuracy = totalRounds ? correctAnswers / totalRounds : 0;
    const free = mode === 'free';
    const waterBase = free ? 20 : 28;
    const airBase = free ? 12 : 14;
    const loveBase = free ? 8 : 8;
    return {
      energy: free ? correctAnswers : 0,
      water: Math.max(8, Math.round(waterBase + accuracy * 24 + (outcome ? 12 : 0))),
      air: Math.max(5, Math.round(airBase + accuracy * 12 + fastCorrectRate * 6)),
      love: Math.max(4, Math.round(loveBase + accuracy * 10 + Math.min(maxCombo, 5) * 1.5 + (outcome ? 4 : 0))),
    };
  }

  return { clamp, calculateDamage, calculateSelfDamage, evaluateAnswer, adaptiveQuestionProfile, updateSkillEstimate, normalizedPrompt, nearDuplicatePrompt, chooseNextQuestion, calculateMatchScore, calculateNewEnergy, calculateResourceRewards };
});
