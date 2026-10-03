(function (root) {
  'use strict';

  const LANES = Object.freeze(['left', 'center', 'right']);
  const LANE_NAMES = Object.freeze({ left: 'Westspur', center: 'Mittelspur', right: 'Ostspur' });
  const MAX_HEALTH = 16;
  const MAX_ENERGY = 6;
  const CORRECT_ENERGY = 3;
  const WRONG_ENERGY = 2;

  // Jede Beziehung ist fest: ein Typ kontert genau den folgenden Typ im Kreis.
  const TYPE_LABELS = Object.freeze({ coral: 'Koralle', current: 'Strömung', depth: 'Tiefe', storm: 'Sturm' });
  const BEATS = Object.freeze({ coral: 'current', current: 'depth', depth: 'storm', storm: 'coral' });

  const CARDS = Object.freeze([
    Object.freeze({ id: 'kelp-scout', name: 'Tangspäher', type: 'current', cost: 2, attack: 2, guard: 2, mark: 'TS', description: 'Schnell und verlässlich. Hält die Spur.' }),
    Object.freeze({ id: 'coral-keeper', name: 'Korallenwacht', type: 'coral', cost: 2, attack: 1, guard: 4, mark: 'KW', description: 'Wenig Druck, starke Abwehr.' }),
    Object.freeze({ id: 'deep-manta', name: 'Tiefenmanta', type: 'depth', cost: 3, attack: 5, guard: 1, mark: 'TM', description: 'Kräftiger Treffer, leicht zu durchbrechen.' }),
    Object.freeze({ id: 'storm-ray', name: 'Sturmrochen', type: 'storm', cost: 3, attack: 3, guard: 3, mark: 'SR', description: 'Ausgewogen. Kontert Korallenwachen.' })
  ]);

  const OPPONENT_PLAN = Object.freeze([
    Object.freeze({ name: 'Scherenkrabbe', line: 'Die Westspur ist offen. Die Krabbe drückt nach Osten.', attackLane: 'right', attack: 3, attackType: 'coral', guards: Object.freeze({ left: Object.freeze({ value: 1, type: 'current' }), center: Object.freeze({ value: 0, type: 'depth' }), right: Object.freeze({ value: 2, type: 'coral' }) }) }),
    Object.freeze({ name: 'Stachelrochen', line: 'Ein schneller Vorstoß über die Westspur.', attackLane: 'left', attack: 3, attackType: 'storm', guards: Object.freeze({ left: Object.freeze({ value: 2, type: 'storm' }), center: Object.freeze({ value: 1, type: 'current' }), right: Object.freeze({ value: 0, type: 'depth' }) }) }),
    Object.freeze({ name: 'Muränenwache', line: 'Die Mittelspur ist bewacht; Angriff kommt von Westen.', attackLane: 'left', attack: 2, attackType: 'current', guards: Object.freeze({ left: Object.freeze({ value: 0, type: 'coral' }), center: Object.freeze({ value: 3, type: 'current' }), right: Object.freeze({ value: 1, type: 'storm' }) }) }),
    Object.freeze({ name: 'Mondqualle', line: 'Ein schwerer, aber langsamer Schlag aus der Mitte.', attackLane: 'center', attack: 4, attackType: 'depth', guards: Object.freeze({ left: Object.freeze({ value: 1, type: 'storm' }), center: Object.freeze({ value: 1, type: 'depth' }), right: Object.freeze({ value: 2, type: 'coral' }) }) }),
    Object.freeze({ name: 'Riffhai', line: 'Der Hai hält die Mittelspur frei und nimmt Kurs nach Osten.', attackLane: 'right', attack: 3, attackType: 'storm', guards: Object.freeze({ left: Object.freeze({ value: 2, type: 'current' }), center: Object.freeze({ value: 0, type: 'depth' }), right: Object.freeze({ value: 1, type: 'storm' }) }) }),
    Object.freeze({ name: 'Panzerkrabbe', line: 'Letzter Zug: ein starker Westangriff, die Ostspur ist kaum gedeckt.', attackLane: 'left', attack: 4, attackType: 'coral', guards: Object.freeze({ left: Object.freeze({ value: 2, type: 'coral' }), center: Object.freeze({ value: 2, type: 'current' }), right: Object.freeze({ value: 0, type: 'depth' }) }) })
  ]);

  const PLAYLISTS = Object.freeze({
    reef: Object.freeze({ label: 'Riffwissen', questions: Object.freeze([
      Object.freeze({ category: 'MEER & LICHT', prompt: 'Welche Lichtfarbe reicht in klarem Meerwasser im Allgemeinen am tiefsten?', options: Object.freeze(['Rot', 'Blau', 'Orange']), answer: 1, explanation: 'Rotes Licht wird nahe der Oberfläche stärker absorbiert; blaues Licht dringt typischerweise tiefer.' }),
      Object.freeze({ category: 'RIFFBAU', prompt: 'Woraus besteht das harte Skelett vieler riffbildender Korallen?', options: Object.freeze(['Kieselsäure', 'Kalziumkarbonat', 'Chitin']), answer: 1, explanation: 'Korallenpolypen bauen ihr Kalkskelett hauptsächlich aus Kalziumkarbonat auf.' }),
      Object.freeze({ category: 'LEBENSRAUM', prompt: 'Was leisten symbiotische Algen in vielen Korallen?', options: Object.freeze(['Sie unterstützen die Koralle durch Photosynthese.', 'Sie ersetzen das Skelett.', 'Sie filtern Salz aus dem Wasser.']), answer: 0, explanation: 'Die Algen liefern durch Photosynthese energiereiche Stoffe; die Koralle bietet ihnen Schutz und Nährstoffe.' }),
      Object.freeze({ category: 'MEERESSTRÖMUNG', prompt: 'Was bedeutet „Auftrieb“ (Upwelling) im Meer?', options: Object.freeze(['Warmes Oberflächenwasser sinkt in eine Höhle.', 'Nährstoffreiches Tiefenwasser steigt auf.', 'Ein Riff wächst plötzlich höher.']), answer: 1, explanation: 'Beim Auftrieb gelangt oft kühles, nährstoffreiches Tiefenwasser an die Oberfläche.' }),
      Object.freeze({ category: 'SEEGRAS', prompt: 'Welche Rolle können Seegraswiesen für junge Meerestiere spielen?', options: Object.freeze(['Sie bieten Nahrung und Schutz.', 'Sie erzeugen Süßwasser.', 'Sie verhindern jede Strömung.']), answer: 0, explanation: 'Dichte Seegraswiesen sind wichtige Kinderstuben und Rückzugsorte für viele Arten.' }),
      Object.freeze({ category: 'ÖKOLOGIE', prompt: 'Was beschreibt Mutualismus?', options: Object.freeze(['Eine Beziehung, von der beide beteiligten Arten profitieren.', 'Ein Tier jagt grundsätzlich alle anderen.', 'Zwei Arten teilen denselben Namen.']), answer: 0, explanation: 'Mutualismus ist eine Form der Wechselbeziehung, bei der beide Partner einen Nutzen haben.' })
    ]) }),
    logic: Object.freeze({ label: 'Logiklab', questions: Object.freeze([
      Object.freeze({ category: 'ZAHLENFOLGE', prompt: 'Welche Zahl folgt? 3 · 6 · 12 · 24 · …', options: Object.freeze(['36', '42', '48']), answer: 2, explanation: 'Jede Zahl wird verdoppelt: 24 × 2 = 48.' }),
      Object.freeze({ category: 'SCHLUSSFOLGERUNG', prompt: 'Alle Rochen sind Fische. Manta ist ein Rochen. Was folgt sicher?', options: Object.freeze(['Manta ist ein Fisch.', 'Alle Fische sind Rochen.', 'Manta lebt im Süßwasser.']), answer: 0, explanation: 'Wenn alle Rochen Fische sind und Manta ein Rochen ist, ist Manta ein Fisch.' }),
      Object.freeze({ category: 'MUSTER', prompt: 'Mira sammelt 2 Perlen. Neri sammelt doppelt so viele wie Mira und eine dazu. Wie viele hat Neri?', options: Object.freeze(['4', '5', '6']), answer: 1, explanation: 'Zweimal Miras 2 Perlen plus eine: 2 × 2 + 1 = 5.' }),
      Object.freeze({ category: 'AUSSCHLUSS', prompt: 'Welche Zahl passt nicht in die Reihe der Primzahlen?', options: Object.freeze(['17', '19', '21']), answer: 2, explanation: '21 lässt sich als 3 × 7 schreiben und ist deshalb keine Primzahl.' }),
      Object.freeze({ category: 'REIHENFOLGE', prompt: 'A kommt vor B. C kommt nach B. Welche Reihenfolge ist möglich?', options: Object.freeze(['A – B – C', 'B – A – C', 'C – B – A']), answer: 0, explanation: 'Nur A – B – C erfüllt beide Hinweise gleichzeitig.' }),
      Object.freeze({ category: 'WENN-DANN', prompt: 'Nur Fische mit Streifen dürfen in die Strömung. Koro hat keine Streifen. Was ist sicher?', options: Object.freeze(['Koro darf nicht hinein.', 'Koro ist ein Hai.', 'Alle Fische haben Streifen.']), answer: 0, explanation: 'Die Regel nennt Streifen als notwendige Bedingung; Koro erfüllt sie nicht.' })
    ]) }),
    numbers: Object.freeze({ label: 'Mathemeer', questions: Object.freeze([
      Object.freeze({ category: 'BRÜCHE', prompt: 'Von 12 Muscheln geht ein Drittel verloren. Wie viele bleiben?', options: Object.freeze(['4', '8', '9']), answer: 1, explanation: 'Ein Drittel von 12 sind 4; 12 − 4 = 8.' }),
      Object.freeze({ category: 'ZAHLENFOLGE', prompt: 'Welche Zahl folgt? 2 · 5 · 9 · 14 · 20 · …', options: Object.freeze(['25', '26', '27']), answer: 2, explanation: 'Die Abstände wachsen: +3, +4, +5, +6 — also als Nächstes +7.' }),
      Object.freeze({ category: 'MULTIPLIKATION', prompt: 'Zwei Schwärme haben je 3 Fische. Wie viele Fische sind das zusammen?', options: Object.freeze(['5', '6', '9']), answer: 1, explanation: 'Zwei Gruppen mit je drei Fischen: 2 × 3 = 6.' }),
      Object.freeze({ category: 'FLÄCHE', prompt: 'Ein rechteckiges Riff ist 5 Felder lang und 3 Felder breit. Wie viele Felder hat es?', options: Object.freeze(['8', '15', '16']), answer: 1, explanation: 'Die Fläche ist Länge × Breite: 5 × 3 = 15 Felder.' }),
      Object.freeze({ category: 'PROZENTE', prompt: 'Was sind 20 Prozent von 50 Perlen?', options: Object.freeze(['5', '10', '20']), answer: 1, explanation: '20 % ist ein Fünftel; ein Fünftel von 50 sind 10.' }),
      Object.freeze({ category: 'ÜBERSCHLAG', prompt: 'Die Strömung trägt 3 Muscheln pro Minute. Wie viele in 4 Minuten?', options: Object.freeze(['7', '12', '14']), answer: 1, explanation: '3 Muscheln × 4 Minuten = 12 Muscheln.' })
    ]) })
  });

  function getPlaylist(id) {
    return PLAYLISTS[id] || null;
  }

  function cardById(id) {
    return CARDS.find((card) => card.id === id) || null;
  }

  function isAdvantage(attacker, defender) {
    return BEATS[attacker] === defender;
  }

  function createMatch(playlistId) {
    const playlist = getPlaylist(playlistId);
    if (!playlist) throw new Error('Unbekanntes Quizriff.');
    return {
      playlistId,
      playlistLabel: playlist.label,
      roundIndex: 0,
      roundsTotal: OPPONENT_PLAN.length,
      playerHealth: MAX_HEALTH,
      rivalHealth: MAX_HEALTH,
      energy: 2,
      phase: 'question',
      status: 'active',
      correct: null,
      answered: false,
      selectedCardId: null,
      selectedLane: null,
      history: [],
      lastResult: null,
      winner: null
    };
  }

  function currentQuestion(match) {
    const playlist = getPlaylist(match.playlistId);
    return playlist ? playlist.questions[match.roundIndex] || null : null;
  }

  function currentIntent(match) {
    return OPPONENT_PLAN[match.roundIndex] || null;
  }

  function answerQuestion(match, answerIndex) {
    if (!match || match.status !== 'active' || match.phase !== 'question' || match.answered) return null;
    const question = currentQuestion(match);
    if (!question || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.options.length) return null;
    const correct = answerIndex === question.answer;
    return {
      ...match,
      answered: true,
      correct,
      phase: 'choose',
      energy: Math.min(MAX_ENERGY, match.energy + (correct ? CORRECT_ENERGY : WRONG_ENERGY))
    };
  }

  function selectCard(match, cardId) {
    if (!match || match.status !== 'active' || match.phase !== 'choose' || !match.answered) return null;
    const card = cardById(cardId);
    if (!card || card.cost > match.energy) return null;
    return { ...match, selectedCardId: cardId };
  }

  function selectLane(match, laneId) {
    if (!match || match.status !== 'active' || match.phase !== 'choose' || !match.answered || !LANES.includes(laneId)) return null;
    return { ...match, selectedLane: laneId };
  }

  function resolveTurn(match) {
    if (!match || match.status !== 'active' || match.phase !== 'choose' || !match.answered || !match.selectedCardId || !match.selectedLane) return null;
    const card = cardById(match.selectedCardId);
    const intent = currentIntent(match);
    if (!card || !intent || card.cost > match.energy) return null;

    const defender = intent.guards[match.selectedLane];
    const offenceAdvantage = isAdvantage(card.type, defender.type);
    const offenceDisadvantage = isAdvantage(defender.type, card.type);
    const quizBonus = match.correct ? 1 : 0;
    const typeBonus = offenceAdvantage ? 1 : (offenceDisadvantage ? -1 : 0);
    const damage = Math.max(0, card.attack + quizBonus + typeBonus - defender.value);
    const defended = match.selectedLane === intent.attackLane;
    const defenceAdvantage = isAdvantage(card.type, intent.attackType);
    const shield = defended ? card.guard + quizBonus + (defenceAdvantage ? 1 : 0) : 0;
    const blocked = defended ? Math.min(intent.attack, shield) : 0;
    const incomingDamage = intent.attack - blocked;
    const playerHealth = Math.max(0, match.playerHealth - incomingDamage);
    const rivalHealth = Math.max(0, match.rivalHealth - damage);
    const roundsPlayed = match.roundIndex + 1;
    const finished = playerHealth === 0 || rivalHealth === 0 || roundsPlayed >= match.roundsTotal;
    const winner = !finished ? null : (playerHealth === rivalHealth ? 'draw' : (playerHealth > rivalHealth ? 'player' : 'rival'));
    const result = Object.freeze({
      round: roundsPlayed,
      questionCorrect: match.correct,
      cardName: card.name,
      lane: match.selectedLane,
      laneName: LANE_NAMES[match.selectedLane],
      opponentName: intent.name,
      damage,
      laneGuard: defender.value,
      quizBonus,
      typeBonus,
      incomingAttack: intent.attack,
      blocked,
      incomingDamage,
      intentLane: intent.attackLane,
      defended,
      energySpent: card.cost
    });

    return {
      ...match,
      playerHealth,
      rivalHealth,
      energy: match.energy - card.cost,
      phase: 'result',
      status: finished ? 'finished' : 'active',
      history: [...match.history, result],
      lastResult: result,
      winner
    };
  }

  function nextRound(match) {
    if (!match || match.status !== 'active' || match.phase !== 'result' || match.roundIndex + 1 >= match.roundsTotal) return null;
    return {
      ...match,
      roundIndex: match.roundIndex + 1,
      phase: 'question',
      answered: false,
      correct: null,
      selectedCardId: null,
      selectedLane: null,
      lastResult: null
    };
  }

  root.FishRoyaleEngine = Object.freeze({
    LANES, LANE_NAMES, MAX_HEALTH, MAX_ENERGY, CORRECT_ENERGY, WRONG_ENERGY,
    TYPE_LABELS, BEATS, CARDS, OPPONENT_PLAN, PLAYLISTS,
    getPlaylist, cardById, isAdvantage, createMatch, currentQuestion, currentIntent,
    answerQuestion, selectCard, selectLane, resolveTurn, nextRound
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
