const $ = (id) => document.getElementById(id);
const screens = [...document.querySelectorAll('.screen')];
const TYPE_NAMES = { recall: 'RAPID RECALL', pattern: 'PATTERN RECOGNITION', causal: 'CAUSAL CHOICE', logic: 'LOGIC TRAP', source: 'SOURCE SENSE', risk: 'AGENT DECISION' };
const SKILL_NAMES = { recall: 'Abruf', pattern: 'Muster', causal: 'Kausalität', logic: 'Logik', source: 'Quellengefühl', risk: 'Risiko' };
const STARTING_RESOURCES = Object.freeze({ energy: 1000, water: 250, air: 120, love: 60 });
const RESOURCE_NAMES = Object.freeze({ energy: 'Energie', water: 'Wasser', air: 'Luft', love: 'Liebe' });
const OPPONENTS = {
  mirror: { name: 'MIRROR', rating: 1000, focus: 'adaptive', time: 1, intro: 'MIRROR beobachtet deine erste Entscheidung.' },
  rush: { name: 'RUSH', rating: 1050, focus: 'pressure', time: .82, intro: 'RUSH wartet nicht auf Sicherheit. Die Uhr ist Teil des Angriffs.' },
  oracle: { name: 'ORACLE', rating: 1150, focus: 'reasoning', time: 1.08, intro: 'ORACLE prüft nicht nur deine Antwort — sondern die Lücke in deiner Begründung.' },
};
const UPGRADES = [
  { id: 'memory', name: 'KLARES WASSER', text: '+2 Sekunden bei schnellen Abruffragen.', apply: s => { s.mods.time = 2000; } },
  { id: 'causal', name: 'SCHILFGÜRTEL', text: 'Kausalitätsfragen verursachen 15 % weniger Schaden bei Fehlern.', apply: s => { s.mods.causalShield = .15; } },
  { id: 'risk', name: 'TIEFER TEICH', text: '+25 % Schaden bei schwierigen Fragen — aber +20 % Selbstschaden bei Fehlern.', apply: s => { s.mods.risk = .25; s.mods.riskPenalty = .2; } },
  { id: 'calm', name: 'RUHIGE BUCHT', text: 'Eine falsche Antwort pro Match verliert nur einen Combo-Punkt.', apply: s => { s.mods.calm = true; } },
  { id: 'scanner', name: 'LIBELLENBLICK', text: 'Einmal pro Match eine Antwortoption entfernen.', apply: s => { s.mods.scanner = true; } },
];
const POND_UNLOCKS = [
  { id: 'frog', name: 'Froschbucht', cost: { energy: 1000, water: 250, air: 120, love: 60 }, copy: 'Ein erster Bewohner wartet am Ufer.', symbol: '🐸' },
  { id: 'reeds', name: 'Schilfgürtel', cost: { energy: 1040, water: 320, air: 135, love: 70 }, copy: 'Mehr Ufer schafft Schutz und Ruhe.', symbol: '♒' },
  { id: 'dragonfly', name: 'Libellen', cost: { energy: 1120, water: 420, air: 170, love: 90 }, copy: 'Kleine Besucher zeigen klares Wasser an.', symbol: '✦' },
  { id: 'fish', name: 'Karpfenkolk', cost: { energy: 1260, water: 560, air: 215, love: 115 }, copy: 'Ein tiefer Bereich für größere Bewohner.', symbol: '◉' },
  { id: 'lily', name: 'Seerosenfeld', cost: { energy: 1440, water: 760, air: 275, love: 150 }, copy: 'Blüten machen den Teich zu deinem Ort.', symbol: '✿' },
  { id: 'stream', name: 'Quellzulauf', cost: { energy: 1700, water: 1000, air: 340, love: 200 }, copy: 'Eine neue Quelle erweitert deinen Wasserlauf.', symbol: '⌁' },
];
const QUESTIONS = [
  { id:'r1', type:'recall', skill:'recall', difficulty:.25, time:10000, prompt:'Welcher Planet ist der Sonne am nächsten?', options:['Venus','Mars','Merkur','Jupiter'], answer:2, explanation:'Merkur ist der sonnennächste Planet.' },
  { id:'r2', type:'recall', skill:'recall', difficulty:.45, time:11000, prompt:'Wie viele Seiten hat ein Hexagon?', options:['5','6','7','8'], answer:1, explanation:'Ein Hexagon ist ein Sechseck.' },
  { id:'r3', type:'recall', skill:'recall', difficulty:.65, time:13000, prompt:'Welches Gas macht den größten Anteil der Erdatmosphäre aus?', options:['Sauerstoff','Stickstoff','Kohlendioxid','Wasserstoff'], answer:1, explanation:'Stickstoff macht ungefähr 78 % der Erdatmosphäre aus.' },
  { id:'p1', type:'pattern', skill:'pattern', difficulty:.35, time:18000, prompt:'Welche Zahl setzt die Reihe sinnvoll fort? 2, 4, 8, 16, …', options:['20','24','30','32'], answer:3, explanation:'Jede Zahl wird mit 2 multipliziert.' },
  { id:'p2', type:'pattern', skill:'pattern', difficulty:.58, time:22000, prompt:'Welche Form folgt logisch? Kreis, Dreieck, Kreis, Dreieck, …', options:['Kreis','Quadrat','Dreieck','Linie'], answer:0, explanation:'Das Muster wechselt abwechselnd zwischen Kreis und Dreieck.' },
  { id:'p3', type:'pattern', skill:'pattern', difficulty:.72, time:26000, prompt:'Was folgt? 1, 1, 2, 3, 5, 8, …', options:['11','12','13','15'], answer:2, explanation:'Jede Zahl entsteht aus der Summe der beiden vorherigen Zahlen.' },
  { id:'c1', type:'causal', skill:'causal', difficulty:.42, time:26000, prompt:'Eine Stadt erhöht die Parkgebühren stark. Was ist — unter gleichen Bedingungen — am wahrscheinlichsten?', options:['Alle Autos verschwinden sofort.','Ein Teil der Menschen wechselt auf Alternativen.','Die Straßen werden automatisch breiter.','Der öffentliche Verkehr wird kostenlos.'], answer:1, explanation:'Ein höherer Preis kann die Nachfrage nach Parkplätzen senken und Alternativen attraktiver machen. Die Folge ist wahrscheinlich, aber nicht zwingend.' },
  { id:'c2', type:'causal', skill:'causal', difficulty:.62, time:30000, prompt:'Eine Pflanze erhält mehr Licht, aber weiterhin kaum Wasser. Welche Aussage ist am saubersten?', options:['Mehr Licht garantiert gesundes Wachstum.','Mehr Licht kann helfen, wenn Wasser nicht zum limitierenden Faktor wird.','Wasser spielt für Pflanzen keine Rolle.','Die Pflanze wächst immer doppelt so schnell.'], answer:1, explanation:'Ein Faktor wirkt nur, wenn andere notwendige Bedingungen ausreichend vorhanden sind.' },
  { id:'c3', type:'causal', skill:'causal', difficulty:.78, time:35000, prompt:'Ein Team arbeitet länger, macht aber mehr Fehler. Welche Erklärung ist am plausibelsten?', options:['Arbeitszeit verursacht immer Fehler.','Müdigkeit könnte die Genauigkeit senken; weitere Daten wären sinnvoll.','Mehr Arbeit verbessert immer die Qualität.','Fehler beweisen, dass das Team unfähig ist.'], answer:1, explanation:'Die Aussage nennt eine plausible Kausalhypothese, verwechselt sie aber nicht mit einem Beweis.' },
  { id:'l1', type:'logic', skill:'logic', difficulty:.45, time:30000, prompt:'Alle Noren sind blau. Einige blaue Dinge sind schwer. Was folgt zwingend?', options:['Einige Noren sind schwer.','Alle Noren sind schwer.','Es folgt nichts über das Gewicht der Noren.','Keine Noren sind schwer.'], answer:2, explanation:'Aus „einige blaue Dinge sind schwer“ folgt nicht, dass diese Dinge Noren sind.' },
  { id:'l2', type:'logic', skill:'logic', difficulty:.62, time:34000, prompt:'Wenn es regnet, wird der Boden nass. Der Boden ist nass. Was folgt zwingend?', options:['Es hat geregnet.','Es hat nicht geregnet.','Nichts Sicheres über die Ursache des nassen Bodens.','Der Regen war stark.'], answer:2, explanation:'Der Boden kann auch aus anderen Gründen nass sein. Das wäre ein unzulässiger Umkehrschluss.' },
  { id:'l3', type:'logic', skill:'logic', difficulty:.78, time:40000, prompt:'Kein guter Plan ist völlig risikofrei. Plan X ist risikofrei. Was folgt?', options:['Plan X ist ein guter Plan.','Plan X ist kein guter Plan.','Plan X ist unmöglich.','Man kann nichts schließen.'], answer:1, explanation:'Wenn kein guter Plan risikofrei ist, kann ein risikofreier Plan nicht gut sein.' },
  { id:'s1', type:'source', skill:'source', difficulty:.4, time:24000, prompt:'Welche Aussage ist am belastbarsten formuliert?', options:['Das beweist endgültig, dass …','Die Daten legen nahe, dass …, mit diesen Einschränkungen.','Jeder weiß, dass …','Eine Person im Internet sagt …'], answer:1, explanation:'Gute Aussagen trennen Daten, Schlussfolgerung und Einschränkungen.' },
  { id:'s2', type:'source', skill:'source', difficulty:.6, time:28000, prompt:'Du liest eine überraschende Behauptung. Was ist der beste erste Schritt?', options:['Sie sofort weiterleiten.','Nur die Überschrift bewerten.','Quelle, Belege und Gegenpositionen prüfen.','Sie ablehnen, weil sie überraschend ist.'], answer:2, explanation:'Eine ungewöhnliche Behauptung braucht nicht automatisch Ablehnung, aber eine sorgfältige Prüfung.' },
  { id:'s3', type:'source', skill:'source', difficulty:.76, time:32000, prompt:'Was macht eine Quelle für eine konkrete Tatsachenfrage besonders nützlich?', options:['Sie klingt selbstbewusst.','Sie nennt überprüfbare Methode, Daten und Kontext.','Sie hat viele Emojis.','Sie bestätigt deine Meinung.'], answer:1, explanation:'Nachvollziehbarkeit und Kontext sind stärker als Tonfall oder Bestätigung.' },
  { id:'risk1', type:'risk', skill:'risk', difficulty:.55, time:12000, prompt:'Du liegst knapp zurück. Welche Entscheidung passt zu einem kontrollierten Comeback?', options:['Sichere Frage: wenig Schaden, hohe Trefferchance.','Riskante Frage: hohe Belohnung, aber hoher Verlust bei Fehler.','Sofort aufgeben.','Zufällig klicken.'], answer:1, explanation:'Ein kontrolliertes Comeback akzeptiert Risiko bewusst und macht die Konsequenz sichtbar.' },
  { id:'risk2', type:'risk', skill:'risk', difficulty:.7, time:12000, prompt:'Die AI greift wiederholt deine Logikschwäche an. Was ist die intelligenteste Vorbereitung?', options:['Nur noch schnelle Fakten raten.','Ein Upgrade wählen, das Fehlerfolgen begrenzt.','Die Schwäche ignorieren.','Die Zeit immer weiter verkürzen.'], answer:1, explanation:'Die eigene Schwäche zu erkennen und ihre Konsequenzen zu begrenzen ist eine strategische Reaktion.' },
];

const saved = JSON.parse(localStorage.getItem('pwnd-profile') || 'null');
const state = {
  energy: saved?.energy ?? saved?.ip ?? STARTING_RESOURCES.energy,
  water: saved?.water ?? saved?.elixir ?? STARTING_RESOURCES.water,
  air: saved?.air ?? STARTING_RESOURCES.air,
  love: saved?.love ?? STARTING_RESOURCES.love,
  calibration: saved?.calibration ?? 0,
  upgrades: saved?.upgrades ?? [],
  unlocked: saved?.unlocked ?? ['frog'],
  opponentId: 'mirror',
  mode: 'duel',
  mods: {},
  match: null,
  timerId: null,
};

const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const resourceIds = { energy: ['pondEnergy', 'playerEnergy'], water: ['pondWater', 'playerWater'], air: ['pondAir', 'playerAir'], love: ['pondLove', 'playerLove'] };

function setText(id, value){ const element = $(id); if (element) element.textContent = value; }
function formatResource(value){ return Math.round(value); }
function save(){
  localStorage.setItem('pwnd-profile', JSON.stringify({
    resourceVersion: 2,
    energy: formatResource(state.energy),
    water: formatResource(state.water),
    air: formatResource(state.air),
    love: formatResource(state.love),
    calibration: state.calibration,
    upgrades: state.upgrades,
    unlocked: state.unlocked,
  }));
}
if (saved && !saved.resourceVersion) save();
function updateResourceDisplays(){
  Object.entries(resourceIds).forEach(([resource, ids]) => ids.forEach(id => setText(id, formatResource(state[resource]))));
}
function formatCost(cost){ return ['energy', 'water', 'air', 'love'].map(resource => `${cost[resource]} ${RESOURCE_NAMES[resource]}`).join(' · '); }
function canAfford(cost){ return Object.entries(cost).every(([resource, value]) => state[resource] >= value); }
function show(id){ screens.forEach(s => s.classList.toggle('active', s.id === id)); window.scrollTo(0,0); }
function formatTime(ms){ return `${String(Math.ceil(ms / 1000)).padStart(2, '0')}`; }
function weightedQuestion(){
  const match = state.match;
  return PwndEngine.chooseNextQuestion({ questions: QUESTIONS, history: match.history, skills: match.skills, opponent: OPPONENTS[match.opponentId], round: match.round, accuracy: match.accuracy });
}
function startMatch(mode = 'duel'){
  state.mode = mode;
  state.mods = {};
  state.upgrades.forEach(id => UPGRADES.find(upgrade => upgrade.id === id)?.apply(state));
  state.match = { round: 0, total: mode === 'free' ? 6 : 10, playerHp: 100, aiHp: 100, combo: 0, maxCombo: 0, history: [], skills: { recall: .5, pattern: .5, causal: .5, logic: .5, source: .5, risk: .5 }, accuracy: 0, opponentId: state.opponentId, selected: null, current: null, mode };
  setText('roundTotal', state.match.total);
  updateResourceDisplays();
  setText('opponentLabel', OPPONENTS[state.opponentId].name);
  setText('phaseLabel', mode === 'free' ? 'FREIES QUIZZEN' : 'QUIZDUELL');
  show('screenBattle');
  nextQuestion();
}
function nextQuestion(){
  const match = state.match;
  if (match.round >= match.total) return finishMatch();
  match.round += 1;
  match.current = weightedQuestion();
  match.selected = null;
  match.submitted = false;
  renderBattle();
  startTimer(Math.round(match.current.time * OPPONENTS[match.opponentId].time) + (state.mods.time || 0));
}
function renderBattle(){
  const match = state.match;
  const question = match.current;
  setText('roundNo', match.round);
  setText('questionType', TYPE_NAMES[question.type]);
  setText('questionTitle', question.prompt);
  setText('questionHint', question.type === 'risk' ? 'Deine Entscheidung hat Konsequenzen.' : 'Wähle eine Antwort.');
  setText('comboText', `COMBO ${match.combo}`);
  setText('skillProfile', `${SKILL_NAMES[weakest(match.skills)]} wird beobachtet`);
  $('playerHealth').style.width = `${Math.max(0, match.playerHp)}%`;
  $('aiHealth').style.width = `${Math.max(0, match.aiHp)}%`;
  setText('playerHpText', Math.ceil(match.playerHp));
  setText('aiHpText', Math.ceil(match.aiHp));
  $('lockBtn').disabled = true;
  $('answers').innerHTML = question.options.map((option, index) => `<button class="answer" type="button" data-answer="${index}"><span class="answer-index">${String.fromCharCode(65 + index)}</span><span>${esc(option)}</span></button>`).join('');
  document.querySelectorAll('.answer').forEach(button => button.addEventListener('click', () => selectAnswer(Number(button.dataset.answer))));
  setText('aiComment', match.round === 1 ? OPPONENTS[match.opponentId].intro : adaptiveComment(match));
}
function weakest(skills){ return Object.entries(skills).sort((a, b) => a[1] - b[1])[0][0]; }
function adaptiveComment(match){
  const weakSkill = SKILL_NAMES[weakest(match.skills)];
  if (match.combo >= 2) return 'Interessant. Deine Sicherheit steigt — also wechsle ich die Perspektive.';
  if (match.history.at(-1)?.correct === false) return `Deine ${weakSkill}-Lücke ist sichtbar. Ich stelle die nächste Frage nicht zufällig.`;
  return 'Noch kein klares Muster. Eine weitere Entscheidung genügt.';
}
function startTimer(limit){
  clearInterval(state.timerId);
  const started = performance.now();
  const tick = () => {
    const left = Math.max(0, limit - (performance.now() - started));
    setText('timer', `00:${formatTime(left)}`);
    $('timer').classList.toggle('danger', left < 5000);
    if (left <= 0) {
      clearInterval(state.timerId);
      if (!state.match.submitted) submitAnswer(state.match.selected ?? -1, limit);
    }
  };
  tick();
  state.timerId = setInterval(tick, 100);
  state.match.startedAt = started;
}
function selectAnswer(index){
  if (state.match.submitted) return;
  state.match.selected = index;
  $('lockBtn').disabled = false;
  document.querySelectorAll('.answer').forEach(button => button.classList.toggle('selected', Number(button.dataset.answer) === index));
}
function submitAnswer(index, forcedMs = null){
  const match = state.match;
  const question = match.current;
  if (match.submitted) return;
  match.submitted = true;
  match.selected = index;
  clearInterval(state.timerId);
  const time = forcedMs ?? Math.max(1, performance.now() - match.startedAt);
  const result = PwndEngine.evaluateAnswer({ answerIndex: index, question, responseTimeMs: time, combo: match.combo, mods: state.mods });
  match.combo = result.combo;
  match.maxCombo = Math.max(match.maxCombo, result.combo);
  match.aiHp = Math.max(0, match.aiHp - result.damage);
  match.playerHp = Math.max(0, match.playerHp - result.selfDamage);
  match.skills[question.skill] = Math.max(0, Math.min(1, match.skills[question.skill] + result.skillDelta));
  match.history.push({ question, correct: result.correct, time, damage: result.damage, selfDamage: result.selfDamage });
  match.accuracy = match.history.filter(entry => entry.correct).length / match.history.length;
  document.querySelectorAll('.answer').forEach((button, optionIndex) => {
    button.disabled = true;
    if (optionIndex === question.answer) button.classList.add('correct');
    if (optionIndex === index && optionIndex !== question.answer) button.classList.add('wrong');
  });
  $('lockBtn').disabled = true;
  showRoundResult({ correct: result.correct, time, damage: result.damage, selfDamage: result.selfDamage, question });
}
function showRoundResult(result){
  document.body.classList.remove('battle-hit', 'battle-miss');
  document.body.classList.add(result.correct ? 'battle-hit' : 'battle-miss');
  $('resultOrbit').classList.toggle('miss', !result.correct);
  $('resultOrbit').textContent = result.correct ? '+' : '×';
  setText('roundEyebrow', result.correct ? 'RESSOURCENFLUSS' : 'GEGENWELLE');
  setText('roundTitle', result.correct ? 'Deine Entscheidung trägt.' : 'Die AI hat gekontert.');
  setText('roundCopy', result.correct ? `Du hast ${result.damage} Schaden verursacht${result.time < result.question.time * .45 ? ' — schnell und präzise.' : '.'}` : `Du hast die Frage verfehlt und ${result.selfDamage} Ausdauer verloren. Die Konsequenz bleibt bestehen.`);
  setText('resultTime', `${(result.time / 1000).toFixed(1)} s`);
  setText('resultDamage', result.correct ? `+${result.damage}` : `-${result.selfDamage}`);
  setText('resultAccuracy', result.correct ? 'KORREKT' : 'FEHLER');
  setText('explanation', result.question.explanation);
  setText('continueBtn', state.match.round >= state.match.total ? 'Ressourcenbilanz ansehen →' : 'Nächste Runde →');
  show('screenRound');
}
function finishMatch(){
  const match = state.match;
  const before = { energy: state.energy, water: state.water, air: state.air, love: state.love };
  const opponent = OPPONENTS[match.opponentId];
  const outcome = match.aiHp <= match.playerHp ? 1 : 0;
  const averageDifficulty = match.history.reduce((sum, entry) => sum + entry.question.difficulty, 0) / match.history.length;
  const fastCorrectRate = Math.min(1, match.history.filter(entry => entry.correct && entry.time < entry.question.time * .55).length / 3);
  const score = PwndEngine.calculateMatchScore({ outcome, accuracy: match.accuracy, averageDifficulty, fastCorrectRate });
  const energyRating = PwndEngine.calculateNewEnergy({ before: state.energy, opponentRating: opponent.rating, score, calibration: state.calibration });
  const correctAnswers = match.history.filter(entry => entry.correct).length;
  const rewards = PwndEngine.calculateResourceRewards({ mode: match.mode, correctAnswers, totalRounds: match.total, outcome, fastCorrectRate, maxCombo: match.maxCombo });
  state.energy = energyRating.energy;
  state.water += rewards.water;
  state.air += rewards.air;
  state.love += rewards.love;
  state.calibration = Math.min(1, state.calibration + 1);
  save();
  const strongest = Object.entries(match.skills).sort((a, b) => b[1] - a[1])[0][0];
  const weak = Object.entries(match.skills).sort((a, b) => a[1] - b[1])[0][0];
  setText('endResult', outcome ? 'GEWONNEN' : 'AUS DEM FLUSS');
  $('endResult').style.color = outcome ? 'var(--leaf)' : 'var(--clay)';
  setText('energyChange', `${energyRating.delta >= 0 ? '+' : ''}${energyRating.delta} ENERGIE`);
  setText('endTitle', outcome ? 'Dein Teich ist gewachsen.' : 'Die AI hat deinen Wasserlauf gelesen.');
  setText('endCopy', `${correctAnswers}/${match.total} Antworten korrekt gegen ${opponent.name}. ${match.mode === 'free' ? 'Freies Quizzen füllt Energie, Wasser, Luft und Liebe verlässlich auf.' : 'Dein Duell hat deine vier Reserven gestärkt.'}`);
  setText('energyValue', formatResource(state.energy));
  setText('waterValue', formatResource(state.water));
  setText('airValue', formatResource(state.air));
  setText('loveValue', formatResource(state.love));
  setText('energyBeforeAfter', `${formatResource(before.energy)} → ${formatResource(state.energy)}`);
  setText('waterChange', `+${rewards.water} · Teich`);
  setText('airChange', `+${rewards.air} · Bewegung`);
  setText('loveChange', `+${rewards.love} · Vertrauen`);
  setText('strengthValue', SKILL_NAMES[strongest]);
  setText('weaknessValue', SKILL_NAMES[weak]);
  updateResourceDisplays();
  renderPondUnlocks();
  renderUpgrades();
  show('screenEnd');
}
function renderPondUnlocks(){
  const grid = $('unlockGrid');
  if (!grid) return;
  grid.innerHTML = POND_UNLOCKS.map(item => {
    const open = state.unlocked.includes(item.id);
    const affordable = canAfford(item.cost);
    return `<div class="unlock-item ${open ? 'open' : 'locked'}"><span class="unlock-symbol">${open ? item.symbol : '·'}</span><div><b>${item.name}</b><small>${open ? item.copy : formatCost(item.cost)}</small></div>${open ? '<strong>offen</strong>' : `<button class="unlock-action" type="button" data-unlock="${item.id}" ${affordable ? '' : 'disabled'}>${affordable ? 'freischalten' : 'gesperrt'}</button>`}</div>`;
  }).join('');
  grid.querySelectorAll('[data-unlock]').forEach(button => button.addEventListener('click', () => unlockPond(button.dataset.unlock)));
}
function unlockPond(id){
  const item = POND_UNLOCKS.find(unlock => unlock.id === id);
  if (!item || state.unlocked.includes(id) || !canAfford(item.cost)) return;
  Object.entries(item.cost).forEach(([resource, value]) => { state[resource] -= value; });
  state.unlocked = [...state.unlocked, id];
  save();
  updateResourceDisplays();
  renderPondUnlocks();
}
function renderUpgrades(){
  const choices = [...UPGRADES].sort(() => Math.random() - .5).slice(0, 3);
  $('upgrades').innerHTML = choices.map(upgrade => `<label class="upgrade"><input type="radio" name="upgrade" value="${upgrade.id}"><strong>${upgrade.name}</strong><small>${upgrade.text}</small></label>`).join('');
  document.querySelectorAll('.upgrade').forEach(option => option.addEventListener('click', () => {
    document.querySelectorAll('.upgrade').forEach(other => other.classList.remove('selected'));
    option.classList.add('selected');
    const id = option.querySelector('input').value;
    if (!state.upgrades.includes(id)) state.upgrades = [...state.upgrades.slice(-2), id];
    save();
  }));
}

document.querySelectorAll('.opponent-option').forEach(button => button.addEventListener('click', () => {
  state.opponentId = button.dataset.opponent;
  document.querySelectorAll('.opponent-option').forEach(other => other.classList.toggle('selected', other === button));
}));

updateResourceDisplays();
renderPondUnlocks();
$('startBtn').addEventListener('click', () => startMatch('duel'));
$('freeQuizBtn').addEventListener('click', () => startMatch('free'));
$('lockBtn').addEventListener('click', () => submitAnswer(state.match.selected));
$('continueBtn').addEventListener('click', () => state.match.round >= state.match.total ? finishMatch() : (show('screenBattle'), nextQuestion()));
$('againBtn').addEventListener('click', () => startMatch(state.mode));
