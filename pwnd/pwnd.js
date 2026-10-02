const $ = (id) => document.getElementById(id);
const screens = [...document.querySelectorAll('.screen')];
const TYPE_NAMES = { recall: 'RAPID RECALL', pattern: 'PATTERN RECOGNITION', causal: 'CAUSAL CHOICE', logic: 'LOGIC TRAP', source: 'SOURCE SENSE', risk: 'AGENT DECISION' };
const SKILL_NAMES = { recall: 'Abruf', pattern: 'Muster', causal: 'Kausalität', logic: 'Logik', source: 'Quellengefühl', risk: 'Risiko' };
const STARTING_RESOURCES = Object.freeze({ energy: 1000, water: 250, air: 120, love: 60 });
const RESOURCE_NAMES = Object.freeze({ energy: 'Energie', water: 'Wasser', air: 'Luft', love: 'Liebe' });
const FREE_OPPONENT_ID = 'owl';
const QUESTION_API = '/api/pwnd-question';
const RESOURCE_SYMBOLS = Object.freeze({ energy: '⚡', water: '💧', air: '🌬️', love: '❤️' });
const OPPONENTS = {
  redfox: { name: 'ROTFUCHS', species: 'Vulpes vulpes', avatar: '🔥🦊', focus: 'adaptive', rating: 1000, time: 1, intro: 'Der Rotfuchs beobachtet deine erste Entscheidung und wartet auf dein Muster.' },
  arcticfox: { name: 'POLARFUCHS', species: 'Vulpes lagopus', avatar: '❄️🦊', focus: 'pressure', rating: 1080, time: .82, intro: 'Der Polarfuchs wartet nicht auf Sicherheit. Die Kälte macht jede Sekunde sichtbar.' },
  fennec: { name: 'FENNEK', species: 'Vulpes zerda', avatar: '🌙🦊', focus: 'reasoning', rating: 1160, time: 1.08, intro: 'Der Fennek hört auf die Lücke in deiner Begründung — nicht nur auf deine Antwort.' },
  owl: { name: 'SCHATTENEULE', species: 'wissende Nacht-Eule', avatar: '🦉', focus: 'reasoning', rating: 1000, time: 1, intro: 'Die Schatten-Eule blättert lautlos in ihrem Archiv. Hier zählt Neugier, nicht Tempo.' },
};
const TOPICS = {
  nature: { name: 'Natur & Erde', icon: '🌿', copy: 'Planet, Körper und Umwelt', skills: ['recall', 'causal'] },
  patterns: { name: 'Muster & Zahlen', icon: '◌', copy: 'Reihen, Formen und klare Regeln', skills: ['pattern', 'logic'] },
  sources: { name: 'Quellen & Medien', icon: '⌁', copy: 'Belege, Diagramme und Einordnung', skills: ['source', 'causal'] },
  decisions: { name: 'Risiko & Entscheidungen', icon: '⚖', copy: 'Abwägen, Unsicherheit und Folgen', skills: ['risk', 'logic'] },
  world: { name: 'Weltwissen', icon: '✦', copy: 'Fakten, Alltag und Orientierung', skills: ['recall', 'source'] },
  reasoning: { name: 'Klar denken', icon: '◇', copy: 'Schlüsse, Ursachen und Argumente', skills: ['logic', 'causal'] },
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
  { id:'r4', type:'recall', skill:'recall', difficulty:.35, time:14000, prompt:'Bei welcher Temperatur siedet Wasser ungefähr auf Meereshöhe?', options:['50 °C','75 °C','100 °C','130 °C'], answer:2, explanation:'Auf Meereshöhe siedet Wasser bei ungefähr 100 °C.' },
  { id:'r5', type:'recall', skill:'recall', difficulty:.55, time:15000, prompt:'Wie viele Kontinente werden im gängigen geografischen Modell meist gezählt?', options:['5','6','7','8'], answer:2, explanation:'Im gängigen Modell werden sieben Kontinente gezählt.' },
  { id:'r6', type:'recall', skill:'recall', difficulty:.7, time:16000, prompt:'Welches Organ pumpt Blut durch den menschlichen Körper?', options:['Lunge','Leber','Herz','Niere'], answer:2, explanation:'Das Herz pumpt Blut durch den Körper.' },
  { id:'p1', type:'pattern', skill:'pattern', difficulty:.35, time:18000, prompt:'Welche Zahl setzt die Reihe sinnvoll fort? 2, 4, 8, 16, …', options:['20','24','30','32'], answer:3, explanation:'Jede Zahl wird mit 2 multipliziert.' },
  { id:'p2', type:'pattern', skill:'pattern', difficulty:.58, time:22000, prompt:'Welche Form folgt logisch? Kreis, Dreieck, Kreis, Dreieck, …', options:['Kreis','Quadrat','Dreieck','Linie'], answer:0, explanation:'Das Muster wechselt abwechselnd zwischen Kreis und Dreieck.' },
  { id:'p3', type:'pattern', skill:'pattern', difficulty:.72, time:26000, prompt:'Was folgt? 1, 1, 2, 3, 5, 8, …', options:['11','12','13','15'], answer:2, explanation:'Jede Zahl entsteht aus der Summe der beiden vorherigen Zahlen.' },
  { id:'p4', type:'pattern', skill:'pattern', difficulty:.48, time:20000, prompt:'Welche Zahl folgt? 3, 6, 12, 24, …', options:['36','42','48','54'], answer:2, explanation:'Jede Zahl wird verdoppelt; 24 mal 2 ergibt 48.' },
  { id:'p5', type:'pattern', skill:'pattern', difficulty:.68, time:24000, prompt:'Welche Zahl folgt? 81, 27, 9, 3, …', options:['0','1','2','6'], answer:1, explanation:'Jede Zahl wird durch 3 geteilt; danach folgt 1.' },
  { id:'c1', type:'causal', skill:'causal', difficulty:.42, time:26000, prompt:'Eine Stadt erhöht die Parkgebühren stark. Was ist — unter gleichen Bedingungen — am wahrscheinlichsten?', options:['Alle Autos verschwinden sofort.','Ein Teil der Menschen wechselt auf Alternativen.','Die Straßen werden automatisch breiter.','Der öffentliche Verkehr wird kostenlos.'], answer:1, explanation:'Ein höherer Preis kann die Nachfrage nach Parkplätzen senken und Alternativen attraktiver machen. Die Folge ist wahrscheinlich, aber nicht zwingend.' },
  { id:'c2', type:'causal', skill:'causal', difficulty:.62, time:30000, prompt:'Eine Pflanze erhält mehr Licht, aber weiterhin kaum Wasser. Welche Aussage ist am saubersten?', options:['Mehr Licht garantiert gesundes Wachstum.','Mehr Licht kann helfen, wenn Wasser nicht zum limitierenden Faktor wird.','Wasser spielt für Pflanzen keine Rolle.','Die Pflanze wächst immer doppelt so schnell.'], answer:1, explanation:'Ein Faktor wirkt nur, wenn andere notwendige Bedingungen ausreichend vorhanden sind.' },
  { id:'c3', type:'causal', skill:'causal', difficulty:.78, time:35000, prompt:'Ein Team arbeitet länger, macht aber mehr Fehler. Welche Erklärung ist am plausibelsten?', options:['Arbeitszeit verursacht immer Fehler.','Müdigkeit könnte die Genauigkeit senken; weitere Daten wären sinnvoll.','Mehr Arbeit verbessert immer die Qualität.','Fehler beweisen, dass das Team unfähig ist.'], answer:1, explanation:'Die Aussage nennt eine plausible Kausalhypothese, verwechselt sie aber nicht mit einem Beweis.' },
  { id:'c4', type:'causal', skill:'causal', difficulty:.5, time:28000, prompt:'Nach einer regelmäßigen Schlafroutine fühlt sich eine Person tagsüber konzentrierter. Was ist die sauberste Aussage?', options:['Die Routine beweist eine einzige Ursache.','Die Routine könnte beitragen; andere Faktoren sollten mitbeobachtet werden.','Schlaf hat keinen Einfluss auf Konzentration.','Konzentration steigt bei allen Menschen gleich stark.'], answer:1, explanation:'Die Beobachtung ist ein plausibler Hinweis, aber kein Beweis ohne Kontrolle weiterer Faktoren.' },
  { id:'c5', type:'causal', skill:'causal', difficulty:.7, time:32000, prompt:'Ein Produkt wird günstiger und verkauft sich häufiger. Was ist am wahrscheinlichsten?', options:['Der Preis ist sicher die einzige Ursache.','Der niedrigere Preis kann die Nachfrage erhöht haben; weitere Einflüsse bleiben möglich.','Die Qualität muss automatisch gestiegen sein.','Mehr Verkäufe beweisen, dass alle es brauchen.'], answer:1, explanation:'Preis kann Nachfrage beeinflussen, aber Werbung, Saison oder Verfügbarkeit können ebenfalls wirken.' },
  { id:'l1', type:'logic', skill:'logic', difficulty:.45, time:30000, prompt:'Alle Noren sind blau. Einige blaue Dinge sind schwer. Was folgt zwingend?', options:['Einige Noren sind schwer.','Alle Noren sind schwer.','Es folgt nichts über das Gewicht der Noren.','Keine Noren sind schwer.'], answer:2, explanation:'Aus „einige blaue Dinge sind schwer“ folgt nicht, dass diese Dinge Noren sind.' },
  { id:'l2', type:'logic', skill:'logic', difficulty:.62, time:34000, prompt:'Wenn es regnet, wird der Boden nass. Der Boden ist nass. Was folgt zwingend?', options:['Es hat geregnet.','Es hat nicht geregnet.','Nichts Sicheres über die Ursache des nassen Bodens.','Der Regen war stark.'], answer:2, explanation:'Der Boden kann auch aus anderen Gründen nass sein. Das wäre ein unzulässiger Umkehrschluss.' },
  { id:'l3', type:'logic', skill:'logic', difficulty:.78, time:40000, prompt:'Kein guter Plan ist völlig risikofrei. Plan X ist risikofrei. Was folgt?', options:['Plan X ist ein guter Plan.','Plan X ist kein guter Plan.','Plan X ist unmöglich.','Man kann nichts schließen.'], answer:1, explanation:'Wenn kein guter Plan risikofrei ist, kann ein risikofreier Plan nicht gut sein.' },
  { id:'l4', type:'logic', skill:'logic', difficulty:.5, time:30000, prompt:'Alle A sind B. Alle B sind C. Was folgt zwingend?', options:['Alle A sind C.','Einige C sind keine B.','Alle C sind A.','Nichts folgt.'], answer:0, explanation:'Wenn A vollständig in B und B vollständig in C liegt, liegt auch A vollständig in C.' },
  { id:'l5', type:'logic', skill:'logic', difficulty:.72, time:36000, prompt:'Einige Musiker sind Lehrer. Kein Lehrer ist unsichtbar. Was folgt?', options:['Alle Musiker sind sichtbar.','Einige Musiker sind sichtbar.','Kein Musiker ist sichtbar.','Alle Sichtbaren sind Musiker.'], answer:1, explanation:'Die Musiker, die Lehrer sind, sind sichtbar. Über die übrigen Musiker folgt nichts.' },
  { id:'s1', type:'source', skill:'source', difficulty:.4, time:24000, prompt:'Welche Aussage ist am belastbarsten formuliert?', options:['Das beweist endgültig, dass …','Die Daten legen nahe, dass …, mit diesen Einschränkungen.','Jeder weiß, dass …','Eine Person im Internet sagt …'], answer:1, explanation:'Gute Aussagen trennen Daten, Schlussfolgerung und Einschränkungen.' },
  { id:'s2', type:'source', skill:'source', difficulty:.6, time:28000, prompt:'Du liest eine überraschende Behauptung. Was ist der beste erste Schritt?', options:['Sie sofort weiterleiten.','Nur die Überschrift bewerten.','Quelle, Belege und Gegenpositionen prüfen.','Sie ablehnen, weil sie überraschend ist.'], answer:2, explanation:'Eine ungewöhnliche Behauptung braucht nicht automatisch Ablehnung, aber eine sorgfältige Prüfung.' },
  { id:'s3', type:'source', skill:'source', difficulty:.76, time:32000, prompt:'Was macht eine Quelle für eine konkrete Tatsachenfrage besonders nützlich?', options:['Sie klingt selbstbewusst.','Sie nennt überprüfbare Methode, Daten und Kontext.','Sie hat viele Emojis.','Sie bestätigt deine Meinung.'], answer:1, explanation:'Nachvollziehbarkeit und Kontext sind stärker als Tonfall oder Bestätigung.' },
  { id:'s4', type:'source', skill:'source', difficulty:.5, time:26000, prompt:'Was sollte ein gutes Diagramm für eine Zeitreihe unbedingt zeigen?', options:['Nur eine dekorative Farbe.','Eine erkennbare Zeitachse und beschriftete Werte.','Eine möglichst kleine Schrift.','Keine Quelle.'], answer:1, explanation:'Zeitachse und Werte machen eine Entwicklung prüfbar und verständlich.' },
  { id:'s5', type:'source', skill:'source', difficulty:.7, time:30000, prompt:'Welche Aussage über Expertenkonsens ist am verantwortungsvollsten?', options:['Konsens macht jede Detailfrage automatisch wahr.','Konsens ist ein starkes Signal, ersetzt aber nicht die Prüfung der konkreten Frage.','Ein einzelner Widerspruch widerlegt alles.','Expertenmeinungen sind immer wertlos.'], answer:1, explanation:'Konsens erhöht die Belastbarkeit, ist aber kein Freibrief für jede Detailbehauptung.' },
  { id:'risk1', type:'risk', skill:'risk', difficulty:.55, time:12000, prompt:'Du liegst knapp zurück. Welche Entscheidung passt zu einem kontrollierten Comeback?', options:['Sichere Frage: wenig Schaden, hohe Trefferchance.','Riskante Frage: hohe Belohnung, aber hoher Verlust bei Fehler.','Sofort aufgeben.','Zufällig klicken.'], answer:1, explanation:'Ein kontrolliertes Comeback akzeptiert Risiko bewusst und macht die Konsequenz sichtbar.' },
  { id:'risk2', type:'risk', skill:'risk', difficulty:.7, time:12000, prompt:'Die AI greift wiederholt deine Logikschwäche an. Was ist die intelligenteste Vorbereitung?', options:['Nur noch schnelle Fakten raten.','Ein Upgrade wählen, das Fehlerfolgen begrenzt.','Die Schwäche ignorieren.','Die Zeit immer weiter verkürzen.'], answer:1, explanation:'Die eigene Schwäche zu erkennen und ihre Konsequenzen zu begrenzen ist eine strategische Reaktion.' },
  { id:'risk3', type:'risk', skill:'risk', difficulty:.6, time:14000, prompt:'Du hast wenig Lebenspunkte, aber die nächste Frage wirkt vertraut. Was ist die beste Entscheidung?', options:['Antwort blind erzwingen.','Kurz prüfen, ob die Sicherheit echt ist, und dann bewusst antworten.','Immer aufgeben.','Die Uhr ignorieren.'], answer:1, explanation:'Bei wenig Lebenspunkten zählt nicht Panik, sondern eine kurze Prüfung der eigenen Sicherheit.' },
  { id:'risk4', type:'risk', skill:'risk', difficulty:.78, time:14000, prompt:'Eine schwierige Frage bietet eine große Belohnung. Was gehört zu einer guten Risikoentscheidung?', options:['Nur die Belohnung ansehen.','Wahrscheinlichkeit, Verlust und aktuelle Lage gemeinsam abwägen.','Risiko grundsätzlich vermeiden.','Zufall als Strategie nehmen.'], answer:1, explanation:'Gute Entscheidungen berücksichtigen Gewinn, Verlustwahrscheinlichkeit und den aktuellen Spielstand.' },
  ...((globalThis.PWND_AI_QUESTIONS || []).filter(question => question && question.id && question.prompt)),
];

const saved = JSON.parse(localStorage.getItem('pwnd-profile') || 'null');
const DEFAULT_SKILLS = Object.freeze({ recall: .5, pattern: .5, causal: .5, logic: .5, source: .5, risk: .5 });
function normalizeSkillProfile(raw){
  return Object.fromEntries(Object.keys(DEFAULT_SKILLS).map(skill => {
    const value = Number(raw?.[skill]);
    return [skill, Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : DEFAULT_SKILLS[skill]];
  }));
}
const state = {
  energy: saved?.energy ?? saved?.ip ?? STARTING_RESOURCES.energy,
  water: saved?.water ?? saved?.elixir ?? STARTING_RESOURCES.water,
  air: saved?.air ?? STARTING_RESOURCES.air,
  love: saved?.love ?? STARTING_RESOURCES.love,
  calibration: saved?.calibration ?? 0,
  skillProfile: normalizeSkillProfile(saved?.skillProfile),
  upgrades: saved?.upgrades ?? [],
  unlocked: saved?.unlocked ?? ['frog'],
  opponentId: 'redfox',
  selectedTopicId: null,
  pendingTopicIds: [],
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
  localStorage.setItem('pwnd-profile', JSON.stringify({ resourceVersion: 2, energy: formatResource(state.energy), water: formatResource(state.water), air: formatResource(state.air), love: formatResource(state.love), calibration: state.calibration, skillProfile: normalizeSkillProfile(state.skillProfile), upgrades: state.upgrades, unlocked: state.unlocked }));
}
if (saved && !saved.resourceVersion) save();
function updateResourceDisplays(){ Object.entries(resourceIds).forEach(([resource, ids]) => ids.forEach(id => setText(id, formatResource(state[resource])))); }
function formatCost(cost){ return ['energy', 'water', 'air', 'love'].map(resource => `${RESOURCE_SYMBOLS[resource]} ${cost[resource]}`).join(' · '); }
function canAfford(cost){ return Object.entries(cost).every(([resource, value]) => state[resource] >= value); }
function show(id){ screens.forEach(screen => screen.classList.toggle('active', screen.id === id)); window.scrollTo(0, 0); }
function formatTime(ms){ return `${String(Math.ceil(ms / 1000)).padStart(2, '0')}`; }
function currentOpponent(){ return OPPONENTS[state.match?.opponentId || state.opponentId]; }
function currentTopic(){ return state.match?.topicId ? TOPICS[state.match.topicId] : TOPICS[state.selectedTopicId]; }
function weightedQuestion(){ const match = state.match; return PwndEngine.chooseNextQuestion({ questions: QUESTIONS, history: match.history, skills: match.skills, opponent: currentOpponent(), round: match.round, accuracy: match.accuracy, topicSkills: match.topicId ? TOPICS[match.topicId].skills : [] }); }
function isUsableQuestion(question, match){
  if (!question || typeof question.prompt !== 'string' || !Array.isArray(question.options) || question.options.length !== 4) return false;
  if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) return false;
  const usedIds = new Set(match.history.map(entry => entry.question.id));
  const usedPrompts = new Set(match.history.map(entry => PwndEngine.normalizedPrompt(entry.question.prompt)));
  return !usedIds.has(question.id) && !usedPrompts.has(PwndEngine.normalizedPrompt(question.prompt));
}
function staticAiQuestion(match){
  const topic = TOPICS[match.topicId];
  const pool = (globalThis.PWND_AI_QUESTIONS || []).filter(question => question.topicId === match.topicId);
  return pool.length ? PwndEngine.chooseNextQuestion({ questions: pool, history: match.history, skills: match.skills, opponent: currentOpponent(), round: match.round, accuracy: match.accuracy, topicSkills: topic.skills }) : null;
}
function showQuestionLoading(match){
  setText('questionType', 'KI-FRAGE · EULE DENKT');
  setText('questionTitle', 'Die Schatten-Eule formuliert eine neue Frage …');
  setText('questionHint', match.mode === 'free' ? '' : 'Dein Skill-Level wird berücksichtigt.');
  setText('aiComment', 'Die Eule beobachtet deine Antworten.');
  $('answers').innerHTML = '';
  $('lockBtn').disabled = true;
  setText('roundNo', match.round);
}
async function requestAiQuestion(match){
  const topic = TOPICS[match.topicId];
  const profile = PwndEngine.adaptiveQuestionProfile({ skills: match.skills, topicSkills: topic.skills, round: match.round });
  const excludeIds = match.history.map(entry => entry.question.id);
  const excludePrompts = match.history.map(entry => entry.question.prompt);
  try {
    const response = await fetch(QUESTION_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topicId: match.topicId, skills: match.skills, weakestSkill: profile.weakestSkill, targetDifficulty: profile.targetDifficulty, excludeIds, excludePrompts }) });
    if (!response.ok) throw new Error(`question API ${response.status}`);
    const payload = await response.json();
    if (isUsableQuestion(payload.question, match)) { match.aiQuestionCount += 1; return payload.question; }
    throw new Error('invalid or repeated question');
  } catch (error) {
    console.warn('KI-Frage nicht verfügbar, Offline-Frage wird verwendet:', error);
    match.aiFallbackCount += 1;
    return staticAiQuestion(match) || weightedQuestion();
  }
}
function selectFreeTopic(id){
  if (!TOPICS[id] || !state.pendingTopicIds.includes(id)) return;
  state.selectedTopicId = id;
  document.querySelectorAll('.free-topic-option').forEach(button => button.classList.toggle('selected', button.dataset.topic === id));
  $('freeStartBtn').setAttribute('aria-label', `Los mit ${TOPICS[id].name}`);
}
function renderFreeTopicOptions(){
  const options = $('freeTopicOptions');
  if (!options) return;
  options.innerHTML = state.pendingTopicIds.map(id => { const topic = TOPICS[id]; return `<button class="free-topic-option" type="button" data-topic="${id}"><span class="topic-mark">${topic.icon}</span><span><b>${topic.name}</b><small>${topic.copy}</small><em>Die Eule prüft darin deine Schwächen.</em></span></button>`; }).join('');
  options.querySelectorAll('.free-topic-option').forEach(button => button.addEventListener('click', () => selectFreeTopic(button.dataset.topic)));
  selectFreeTopic(state.selectedTopicId || state.pendingTopicIds[0]);
}
function enterFreeTopicSetup(){
  state.pendingTopicIds = Object.keys(TOPICS).sort(() => Math.random() - .5).slice(0, 3);
  state.selectedTopicId = state.pendingTopicIds[0];
  renderFreeTopicOptions();
  show('screenFreeTopicSetup');
}
function selectDuelOpponent(id){
  if (!OPPONENTS[id] || id === FREE_OPPONENT_ID) return;
  state.opponentId = id;
  document.querySelectorAll('.duel-opponent-option').forEach(button => button.classList.toggle('selected', button.dataset.opponent === id));
  $('duelStartBtn').setAttribute('aria-label', `Los gegen ${OPPONENTS[id].name}`);
}
function enterDuelSetup(){ show('screenDuelSetup'); selectDuelOpponent(state.opponentId); }
function startLaunchCountdown(){
  const match = state.match;
  const opponent = currentOpponent();
  const free = match.mode === 'free';
  const screen = $('screenDuelCountdown');
  screen.dataset.opponent = match.opponentId;
  document.body.dataset.duelOpponent = match.opponentId;
  setText('countdownAvatar', opponent.avatar);
  setText('countdownOpponent', opponent.name);
  setText('countdownTitle', free ? 'Die Eule erwacht.' : 'Der Teich ruft.');
  setText('countdownCopy', free ? `${opponent.intro} Thema: ${TOPICS[match.topicId].name}.` : opponent.intro);
  setText('countdownStatus', free ? 'ARCHIV ÖFFNET' : 'BEREIT MACHEN');
  setText('countdownHint', free ? 'Deine erste Frage wartet.' : 'Das Duell beginnt gleich.');
  setText('cancelCountdownBtn', free ? '← Thema wählen' : '← Gegner wählen');
  setText('countdownNumber', '3');
  screen.classList.remove('countdown-go');
  clearTimeout(state.timerId);
  let remaining = 3;
  const tick = () => {
    if (state.match !== match) return;
    if (remaining > 0) {
      setText('countdownNumber', remaining);
      const number = $('countdownNumber');
      number.classList.remove('countdown-pulse');
      void number.offsetWidth;
      number.classList.add('countdown-pulse');
      remaining -= 1;
      state.timerId = setTimeout(tick, 1000);
      return;
    }
    setText('countdownStatus', 'LOS!');
    setText('countdownNumber', 'LOS');
    screen.classList.add('countdown-go');
    state.timerId = setTimeout(() => {
      if (state.match !== match) return;
      show('screenBattle');
      nextQuestion();
    }, 650);
  };
  show('screenDuelCountdown');
  tick();
}
function cancelDuelCountdown(){
  clearTimeout(state.timerId);
  const free = state.match?.mode === 'free';
  state.match = null;
  state.mode = 'duel';
  delete document.body.dataset.duelOpponent;
  show(free ? 'screenFreeTopicSetup' : 'screenDuelSetup');
  if (!free) selectDuelOpponent(state.opponentId);
}
function startMatch(mode = 'duel', topicId = null){
  state.mode = mode;
  state.mods = {};
  state.upgrades.forEach(id => UPGRADES.find(upgrade => upgrade.id === id)?.apply(state));
  const opponentId = mode === 'free' ? FREE_OPPONENT_ID : state.opponentId;
  const selectedTopicId = mode === 'free' ? (topicId || state.selectedTopicId || Object.keys(TOPICS)[0]) : null;
  state.match = { round: 0, total: mode === 'free' ? 8 : 10, playerHp: 100, aiHp: 100, combo: 0, maxCombo: 0, history: [], skills: normalizeSkillProfile(state.skillProfile), accuracy: 0, opponentId, topicId: selectedTopicId, selected: null, current: null, mode, aiQuestionCount: 0, aiFallbackCount: 0 };
  document.body.classList.toggle('free-mode', mode === 'free');
  setText('roundTotal', state.match.total);
  updateResourceDisplays();
  updateOpponentHeader();
  setText('phaseLabel', mode === 'free' ? 'FREIES QUIZZEN' : 'QUIZDUELL');
  setText('topicLabel', mode === 'free' ? `· ${TOPICS[selectedTopicId].name}` : '');
  if (mode === 'duel' || mode === 'free') return startLaunchCountdown();
  show('screenBattle');
  nextQuestion();
}
function updateOpponentHeader(){
  const opponent = currentOpponent();
  setText('opponentLabel', opponent.name);
  setText('opponentSpecies', opponent.species);
  setText('opponentAvatar', opponent.avatar);
}
async function nextQuestion(){
  const match = state.match;
  if (match.round >= match.total) return finishMatch();
  match.round += 1;
  match.selected = null;
  match.submitted = false;
  showQuestionLoading(match);
  show('screenBattle');
  match.current = match.mode === 'free' ? await requestAiQuestion(match) : weightedQuestion();
  if (state.match !== match) return;
  if (!match.current) {
    match.round -= 1;
    match.total = match.round;
    return finishMatch();
  }
  renderBattle();
  startTimer(Math.round(match.current.time * currentOpponent().time) + (state.mods.time || 0));
}
function renderBattle(){
  const match = state.match;
  const question = match.current;
  setText('roundNo', match.round);
  const aiQuestion = String(question.source || '').startsWith('ai');
  setText('questionType', `${aiQuestion ? 'KI · ' : ''}${TYPE_NAMES[question.type]}`);
  setText('topicLabel', match.mode === 'free' ? `· ${TOPICS[match.topicId].name}` : '');
  setText('questionTitle', question.prompt);
  setText('questionHint', match.mode === 'free' ? '' : (question.type === 'risk' ? 'Deine Entscheidung hat Konsequenzen.' : 'Wähle eine Antwort.'));
  setText('comboText', `COMBO ${match.combo}`);
  setText('skillProfile', `${SKILL_NAMES[weakest(match.skills, match.topicId ? TOPICS[match.topicId].skills : null)]} wird beobachtet`);
  $('playerHealth').style.width = `${Math.max(0, match.playerHp)}%`;
  $('aiHealth').style.width = `${Math.max(0, match.aiHp)}%`;
  setText('playerHpText', Math.ceil(match.playerHp));
  setText('aiHpText', Math.ceil(match.aiHp));
  $('lockBtn').disabled = true;
  $('answers').innerHTML = question.options.map((option, index) => `<button class="answer" type="button" data-answer="${index}"><span class="answer-index">${String.fromCharCode(65 + index)}</span><span>${esc(option)}</span></button>`).join('');
  document.querySelectorAll('.answer').forEach(button => button.addEventListener('click', () => selectAnswer(Number(button.dataset.answer))));
  setText('lockBtn', 'Antwort abgeben');
  setText('aiComment', match.mode === 'free'
    ? (match.round === 1 ? 'Die Eule beobachtet deine Antworten.' : adaptiveComment(match))
    : currentOpponent().intro);
}
function weakest(skills, scope = null){ const keys = scope?.length ? scope : Object.keys(skills); return [...keys].sort((a, b) => (skills[a] ?? .5) - (skills[b] ?? .5))[0]; }
function adaptiveComment(match){
  const topic = match.topicId ? TOPICS[match.topicId] : null;
  const weakSkill = SKILL_NAMES[weakest(match.skills, topic?.skills)];
  if (match.mode === 'free') {
    if (match.history.at(-1)?.correct === false) return `Die Schatten-Eule markiert deine ${weakSkill}-Lücke in ${topic.name}. Die nächste Frage zielt gezielt dorthin.`;
    return `Die Schatten-Eule vergleicht deine Antworten in ${topic.name} und prüft weiter deine ${weakSkill}.`;
  }
  if (match.combo >= 2) return 'Interessant. Deine Sicherheit steigt — also wechsle ich die Perspektive.';
  if (match.history.at(-1)?.correct === false) return `Deine ${weakSkill}-Lücke ist sichtbar. Ich stelle die nächste Frage nicht zufällig.`;
  return 'Noch kein klares Muster. Eine weitere Entscheidung genügt.';
}
function startTimer(limit){
  clearInterval(state.timerId);
  const started = performance.now();
  state.match.startedAt = started;
  if (state.match.mode === 'free') { setText('timer', 'RUHIG'); $('timer').classList.remove('danger'); return; }
  const tick = () => { const left = Math.max(0, limit - (performance.now() - started)); setText('timer', `00:${formatTime(left)}`); $('timer').classList.toggle('danger', left < 5000); if (left <= 0) { clearInterval(state.timerId); if (!state.match.submitted) submitAnswer(state.match.selected ?? -1, limit); } };
  tick();
  state.timerId = setInterval(tick, 100);
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
  if (match.mode === 'duel') { match.aiHp = Math.max(0, match.aiHp - result.damage); match.playerHp = Math.max(0, match.playerHp - result.selfDamage); }
  match.skills[question.skill] = Math.max(0, Math.min(1, match.skills[question.skill] + result.skillDelta));
  state.skillProfile = normalizeSkillProfile(match.skills);
  save();
  match.history.push({ question, correct: result.correct, time, damage: result.damage, selfDamage: result.selfDamage });
  match.accuracy = match.history.filter(entry => entry.correct).length / match.history.length;
  document.querySelectorAll('.answer').forEach((button, optionIndex) => { button.disabled = true; if (optionIndex === question.answer) button.classList.add('correct'); if (optionIndex === index && optionIndex !== question.answer) button.classList.add('wrong'); });
  $('lockBtn').disabled = true;
  showRoundResult({ correct: result.correct, time, damage: result.damage, selfDamage: result.selfDamage, question });
}
function showRoundResult(result){
  const free = state.match.mode === 'free';
  document.body.classList.remove('battle-hit', 'battle-miss');
  document.body.classList.add(result.correct ? 'battle-hit' : 'battle-miss');
  $('resultOrbit').classList.toggle('miss', !result.correct);
  $('resultOrbit').textContent = result.correct ? '+' : '×';
  setText('roundEyebrow', free ? (result.correct ? 'WISSEN GESAMMELT' : 'DIE EULE BEOBACHTET') : (result.correct ? 'RESSOURCENFLUSS' : 'GEGENWELLE'));
  setText('roundTitle', free ? (result.correct ? 'Die Eule nickt.' : 'Die Eule schweigt.') : (result.correct ? 'Deine Entscheidung trägt.' : 'Die AI hat gekontert.'));
  setText('roundCopy', free ? (result.correct ? 'Eine neue Spur landet in deinem Wissensarchiv.' : 'Die Schatten-Eule formuliert eine neue Frage. Versuch es gleich erneut.') : (result.correct ? `Du hast ${result.damage} Schaden verursacht${result.time < result.question.time * .45 ? ' — schnell und präzise.' : '.'}` : `Du hast die Frage verfehlt und ${result.selfDamage} Ausdauer verloren. Die Konsequenz bleibt bestehen.`));
  setText('resultTime', free ? 'ohne Zeitdruck' : `${(result.time / 1000).toFixed(1)} s`);
  setText('resultStatMiddleLabel', free ? 'WISSEN' : 'SCHADEN');
  setText('resultDamage', free ? (result.correct ? '+1' : '0') : (result.correct ? `+${result.damage}` : `-${result.selfDamage}`));
  setText('resultAccuracy', result.correct ? 'KORREKT' : 'FEHLER');
  setText('explanation', result.question.explanation);
  setText('continueBtn', state.match.round >= state.match.total ? 'Ressourcenbilanz ansehen →' : 'Nächste Runde →');
  show('screenRound');
}
function finishMatch(){
  const match = state.match;
  const before = { energy: state.energy, water: state.water, air: state.air, love: state.love };
  const opponent = currentOpponent();
  const free = match.mode === 'free';
  const outcome = free ? 1 : (match.aiHp <= match.playerHp ? 1 : 0);
  const averageDifficulty = match.history.length ? match.history.reduce((sum, entry) => sum + entry.question.difficulty, 0) / match.history.length : 0;
  const fastCorrectRate = Math.min(1, match.history.filter(entry => entry.correct && entry.time < entry.question.time * .55).length / 3);
  const score = PwndEngine.calculateMatchScore({ outcome, accuracy: match.accuracy, averageDifficulty, fastCorrectRate });
  const energyRating = free ? { delta: 0, energy: state.energy } : PwndEngine.calculateNewEnergy({ before: state.energy, opponentRating: opponent.rating, score, calibration: state.calibration });
  const correctAnswers = match.history.filter(entry => entry.correct).length;
  const rewards = PwndEngine.calculateResourceRewards({ mode: match.mode, correctAnswers, totalRounds: match.total, outcome, fastCorrectRate, maxCombo: match.maxCombo });
  state.energy = free ? state.energy + rewards.energy : energyRating.energy;
  state.water += rewards.water;
  state.air += rewards.air;
  state.love += rewards.love;
  if (!free) state.calibration = Math.min(1, state.calibration + 1);
  save();
  const strongest = Object.entries(match.skills).sort((a, b) => b[1] - a[1])[0][0];
  const weak = weakest(match.skills, match.topicId ? TOPICS[match.topicId].skills : null);
  setText('endResult', free ? 'ARCHIVIERT' : (outcome ? 'GEWONNEN' : 'AUS DEM FLUSS'));
  $('endResult').style.color = free ? 'var(--air)' : (outcome ? 'var(--leaf)' : 'var(--clay)');
  setText('energyChange', `${free ? '+' + rewards.energy : (energyRating.delta >= 0 ? '+' : '') + energyRating.delta} ENERGIE`);
  setText('endTitle', free ? 'Dein Wissensarchiv ist gewachsen.' : (outcome ? 'Dein Teich ist gewachsen.' : 'Die AI hat deinen Wasserlauf gelesen.'));
  setText('endCopy', free ? `${correctAnswers}/${match.total} Fragen in ${TOPICS[match.topicId].name} richtig. Die Schatten-Eule hat neue Spuren in deinem Archiv hinterlassen und deine Schwächen vermessen.` : `${correctAnswers}/${match.total} Antworten korrekt gegen ${opponent.name}. Dein Duell hat deine vier Reserven gestärkt.`);
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
  updateResourceDisplays(); renderPondUnlocks(); renderUpgrades(); show('screenEnd');
}
function renderPondUnlocks(){
  const grid = $('unlockGrid'); if (!grid) return;
  grid.innerHTML = POND_UNLOCKS.map(item => { const open = state.unlocked.includes(item.id); const affordable = canAfford(item.cost); return `<div class="unlock-item ${open ? 'open' : 'locked'}"><span class="unlock-symbol">${open ? item.symbol : '·'}</span><div><b>${item.name}</b><small>${open ? item.copy : formatCost(item.cost)}</small></div>${open ? '<strong>offen</strong>' : `<button class="unlock-action" type="button" data-unlock="${item.id}" ${affordable ? '' : 'disabled'}>${affordable ? 'freischalten' : 'gesperrt'}</button>`}</div>`; }).join('');
  grid.querySelectorAll('[data-unlock]').forEach(button => button.addEventListener('click', () => unlockPond(button.dataset.unlock)));
}
function unlockPond(id){ const item = POND_UNLOCKS.find(unlock => unlock.id === id); if (!item || state.unlocked.includes(id) || !canAfford(item.cost)) return; Object.entries(item.cost).forEach(([resource, value]) => { state[resource] -= value; }); state.unlocked = [...state.unlocked, id]; save(); updateResourceDisplays(); renderPondUnlocks(); }
function renderUpgrades(){ const choices = [...UPGRADES].sort(() => Math.random() - .5).slice(0, 3); $('upgrades').innerHTML = choices.map(upgrade => `<label class="upgrade"><input type="radio" name="upgrade" value="${upgrade.id}"><strong>${upgrade.name}</strong><small>${upgrade.text}</small></label>`).join(''); document.querySelectorAll('.upgrade').forEach(option => option.addEventListener('click', () => { document.querySelectorAll('.upgrade').forEach(other => other.classList.remove('selected')); option.classList.add('selected'); const id = option.querySelector('input').value; if (!state.upgrades.includes(id)) state.upgrades = [...state.upgrades.slice(-2), id]; save(); })); }

document.querySelectorAll('.duel-opponent-option').forEach(button => button.addEventListener('click', () => selectDuelOpponent(button.dataset.opponent)));
updateResourceDisplays();
renderPondUnlocks();
$('startBtn').addEventListener('click', enterDuelSetup);
$('freeQuizBtn').addEventListener('click', enterFreeTopicSetup);
$('backToPondBtn').addEventListener('click', () => show('screenStart'));
$('backToPondFromTopicsBtn').addEventListener('click', () => show('screenStart'));
$('freeStartBtn').addEventListener('click', () => startMatch('free', state.selectedTopicId));
$('duelStartBtn').addEventListener('click', () => startMatch('duel'));
$('cancelCountdownBtn').addEventListener('click', cancelDuelCountdown);
$('lockBtn').addEventListener('click', () => submitAnswer(state.match.selected));
$('continueBtn').addEventListener('click', () => state.match.round >= state.match.total ? finishMatch() : (show('screenBattle'), nextQuestion()));
$('againBtn').addEventListener('click', () => state.mode === 'free' ? enterFreeTopicSetup() : enterDuelSetup());
