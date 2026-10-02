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

  function chooseNextQuestion({ questions, history = [], skills, opponent, round, accuracy = 0 }){
    const recent = history.slice(-2).map(item => item.question.id);
    const used = history.map(item => item.question.id);
    const weakest = Object.entries(skills).sort((a, b) => a[1] - b[1])[0]?.[0];
    const focus = opponent.focus === 'pressure' ? ['recall', 'risk']
      : opponent.focus === 'reasoning' ? ['causal', 'logic', 'source']
      : [weakest];
    let candidates = questions.filter(question =>
      !used.includes(question.id) &&
      (round < 2 || focus.includes(question.skill) || question.type !== history.at(-1)?.question.type)
    );
    if (!candidates.length) candidates = questions.filter(question => !used.includes(question.id));
    if (!candidates.length) candidates = questions.filter(question => !recent.includes(question.id));
    const target = Math.min(.9, .25 + (round / 10) * .55 + (accuracy < .5 ? -.1 : 0) + (opponent.focus === 'reasoning' ? .08 : 0));
    return [...candidates].sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target))[0];
  }

  function calculateMatchScore({ outcome, accuracy, averageDifficulty, fastCorrectRate }){
    return .5 * outcome + .25 * accuracy + .15 * averageDifficulty + .1 * fastCorrectRate;
  }

  function calculateNewEnergy({ before, opponentRating, score, calibration = 0 }){
    const expected = 1 / (1 + Math.pow(10, ((opponentRating - before) / 400)));
    const k = calibration < 1 ? 48 : 24;
    const delta = Math.round(k * (score - expected));
    return { delta, energy: Math.max(0, Math.round(before + delta)) };
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

  return { clamp, calculateDamage, calculateSelfDamage, evaluateAnswer, chooseNextQuestion, calculateMatchScore, calculateNewEnergy, calculateResourceRewards };
});
