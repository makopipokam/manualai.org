// Quizfluss gegen die Server-API: Themenwahl, Gegnerwahl, Countdown, Fragen, Runden- und Endbildschirm.
// Der Client zeigt nur an – Fragen, Zeit, Schaden und Belohnungen entscheidet der Server.
(function (root) {
  'use strict';

  const UI = root.PwndUI;
  const api = root.PwndApi;

  const TOPICS = [
    { id: 'nature', name: 'Natur & Erde', mark: '🌿', copy: 'Lebensräume, Wetter, Kreisläufe.' },
    { id: 'patterns', name: 'Muster & Zahlen', mark: '◧', copy: 'Reihen, Anteile, Größenordnungen.' },
    { id: 'sources', name: 'Quellen & Medien', mark: '📰', copy: 'Wer sagt das – und woher weiß er es?' },
    { id: 'decisions', name: 'Risiko & Entscheidungen', mark: '⚖', copy: 'Abwägen, wenn nicht alles sicher ist.' },
    { id: 'world', name: 'Weltwissen', mark: '🌍', copy: 'Orte, Geschichte, Zusammenhänge.' },
    { id: 'reasoning', name: 'Klar denken', mark: '🧭', copy: 'Schlüsse ziehen, Fehler bemerken.' },
  ];

  const OPPONENTS = [
    { id: 'redfox', name: 'ROTFUCHS', avatar: '/assets/red-fox.webp', mark: '🦊',
      copy: 'Liest deine Antwortmuster und passt sich an.', level: 'ausgeglichen' },
    { id: 'arcticfox', name: 'POLARFUCHS', avatar: '/assets/arctic-fox.webp', mark: '❄',
      copy: 'Verlangt schnelle, klare Entscheidungen.', level: 'Zeitdruck' },
    { id: 'fennec', name: 'FENNEK', avatar: '/assets/fennec-fox.webp', mark: '🌙',
      copy: 'Prüft, ob deine Begründung trägt.', level: 'genau' },
  ];

  const OWL = { id: 'owl', name: 'SCHATTEN-EULE', avatar: '/assets/shadow-owl.webp', mark: '🦉' };

  const state = {
    mode: 'duel',
    topicId: null,
    opponentId: null,
    attempt: null,
    question: null,
    selected: null,
    deadline: 0,
    timer: null,
    countdown: null,
    lastAnswer: null,
    result: null,
  };

  function store() { return root.PwndStore; }
  function opponentMeta(id) { return OPPONENTS.find(item => item.id === id) || OWL; }

  // ---------- Aufbau der Auswahlbildschirme ----------

  function renderTopics() {
    const container = UI.$('freeTopicOptions');
    container.innerHTML = TOPICS.map(topic => `
      <button class="free-topic-option${state.topicId === topic.id ? ' selected' : ''}" type="button" data-topic="${topic.id}">
        <span class="topic-mark">${topic.mark}</span>
        <span><b>${topic.name}</b><em>${topic.copy}</em></span>
      </button>`).join('');
    container.querySelectorAll('button').forEach(node => node.addEventListener('click', () => {
      state.topicId = node.dataset.topic;
      renderTopics();
      const button = UI.$('freeStartBtn');
      button.disabled = false;
      button.textContent = 'Mit der Eule starten';
    }));
  }

  function renderOpponents() {
    const container = UI.$('duelOpponentOptions');
    container.innerHTML = OPPONENTS.map(fox => `
      <button class="duel-opponent-option${state.opponentId === fox.id ? ' selected' : ''}" type="button" data-opponent="${fox.id}">
        <span class="fox-mark"><img src="${fox.avatar}" alt="" loading="lazy"></span>
        <span><b>${fox.name}</b><em>${fox.level}</em><em class="fox-copy">${fox.copy}</em></span>
      </button>`).join('');
    container.querySelectorAll('button').forEach(node => node.addEventListener('click', () => {
      state.opponentId = node.dataset.opponent;
      renderOpponents();
      const button = UI.$('duelStartBtn');
      button.disabled = false;
      button.textContent = `Gegen ${opponentMeta(state.opponentId).name} antreten`;
    }));
  }

  function openFreeSetup() {
    state.mode = 'free';
    state.topicId = null;
    renderTopics();
    const button = UI.$('freeStartBtn');
    button.disabled = true;
    button.textContent = 'Thema wählen';
    document.body.classList.add('free-mode');
    UI.showScreen('screenFreeTopicSetup');
  }

  function openDuelSetup() {
    state.mode = 'duel';
    state.opponentId = null;
    renderOpponents();
    const button = UI.$('duelStartBtn');
    button.disabled = true;
    button.textContent = 'Gegner wählen';
    document.body.classList.remove('free-mode');
    UI.showScreen('screenDuelSetup');
  }

  // ---------- Countdown ----------

  function runCountdown(onDone) {
    const meta = state.mode === 'free' ? OWL : opponentMeta(state.opponentId);
    const screen = UI.$('screenDuelCountdown');
    screen.dataset.opponent = state.mode === 'free' ? 'owl' : state.opponentId;
    UI.setHtml('countdownAvatar', `<img src="${meta.avatar}" alt="">`);
    UI.setText('countdownOpponent', meta.name);
    UI.setText('countdownTitle', state.mode === 'free' ? 'Nimm dir Zeit.' : 'Gleich geht es los.');
    UI.setText('countdownCopy', state.mode === 'free'
      ? 'Acht Fragen ohne Zeitdruck. Die Eule schaut dir beim Denken zu.'
      : 'Zehn Runden. Falsche Antworten kosten dich selbst Kraft.');
    UI.setText('countdownHint', state.mode === 'free' ? 'Acht Fragen · kein Zeitlimit' : 'Zehn Runden · eine Antwort pro Runde');
    UI.showScreen('screenDuelCountdown');

    let value = 3;
    const numberNode = UI.$('countdownNumber');
    const tick = () => {
      if (value > 0) {
        numberNode.textContent = String(value);
        numberNode.classList.remove('countdown-pulse');
        void numberNode.offsetWidth;
        numberNode.classList.add('countdown-pulse');
        UI.setText('countdownStatus', `${value}`);
        value -= 1;
        state.countdown = setTimeout(tick, 820);
      } else {
        screen.classList.add('countdown-go');
        numberNode.textContent = 'LOS';
        state.countdown = setTimeout(() => {
          screen.classList.remove('countdown-go');
          onDone();
        }, 620);
      }
    };
    tick();
  }

  function cancelCountdown() {
    clearTimeout(state.countdown);
    state.countdown = null;
    UI.$('screenDuelCountdown').classList.remove('countdown-go');
    document.body.classList.remove('free-mode');
    UI.showScreen('screenPond');
  }

  // ---------- Quizlauf ----------

  async function start() {
    const payload = state.mode === 'free'
      ? { mode: 'free', topicId: state.topicId }
      : { mode: 'duel', opponentId: state.opponentId };
    try {
      const data = await api.startAttempt(payload);
      state.attempt = data.attempt;
      store().setQuizRewards(data.rewardsLeftToday);
      runCountdown(() => { UI.showScreen('screenBattle'); loadQuestion(); });
    } catch (error) {
      UI.warn(error.message);
      UI.showScreen('screenPond');
    }
  }

  async function loadQuestion() {
    renderBattleHead();
    UI.setText('questionTitle', 'Frage wird vorbereitet …');
    UI.setHtml('answers', '');
    UI.$('lockBtn').disabled = true;
    try {
      const data = await api.nextQuestion(state.attempt.id);
      state.attempt = data.attempt;
      if (data.retry) return loadQuestion();
      if (!data.question || data.done) return finish();
      state.question = data.question;
      state.selected = null;
      renderQuestion();
    } catch (error) {
      UI.warn(error.message);
      UI.showScreen('screenPond');
    }
    return undefined;
  }

  function renderBattleHead() {
    const attempt = state.attempt;
    const free = attempt.mode === 'free';
    const meta = free ? OWL : opponentMeta(attempt.opponentId);
    document.body.classList.toggle('free-mode', free);
    UI.setHtml('opponentAvatar', `<img src="${meta.avatar}" alt="">`);
    UI.setText('opponentLabel', meta.name);
    const topic = TOPICS.find(item => item.id === attempt.topicId);
    UI.setText('topicLabel', topic ? topic.name : '');
    UI.setText('phaseLabel', free ? 'FRAGE' : 'RUNDE');
    UI.setText('roundNo', String(Math.max(1, attempt.round)));
    UI.setText('roundTotal', String(attempt.total));

    const healthRow = UI.$('healthRow');
    healthRow.hidden = free;
    if (!free) {
      UI.$('playerHealth').style.width = `${attempt.playerHp}%`;
      UI.$('aiHealth').style.width = `${attempt.aiHp}%`;
      UI.setText('playerHpText', String(attempt.playerHp));
      UI.setText('aiHpText', String(attempt.aiHp));
      UI.setText('aiHpLabel', meta.name);
    }
    UI.setText('comboText', attempt.combo > 1 ? `Combo × ${attempt.combo}` : '');
    const skills = Object.entries(attempt.skills || {}).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([skill, value]) => `${skillName(skill)} ${Math.round(value * 100)}`).join(' · ');
    UI.setText('skillProfile', skills);
  }

  function skillName(skill) {
    return { recall: 'Wissen', pattern: 'Muster', causal: 'Ursache', logic: 'Logik', source: 'Quelle', risk: 'Risiko' }[skill] || skill;
  }

  function renderQuestion() {
    const question = state.question;
    renderBattleHead();
    UI.setText('questionType', skillName(question.skill).toUpperCase());
    UI.setText('questionTitle', question.prompt);
    UI.setText('questionHint', question.source === 'ai' ? 'Frisch für dich formuliert.' : '');

    const answers = UI.$('answers');
    answers.innerHTML = question.options.map((option, index) => `
      <button class="answer${question.removed === index ? ' removed' : ''}" type="button" data-index="${index}" ${question.removed === index ? 'disabled' : ''}>
        <span class="answer-index">${String.fromCharCode(65 + index)}</span><span>${option}</span>
      </button>`).join('');
    answers.querySelectorAll('button').forEach(node => node.addEventListener('click', () => {
      state.selected = Number(node.dataset.index);
      answers.querySelectorAll('button').forEach(other => other.classList.toggle('selected', other === node));
      UI.$('lockBtn').disabled = false;
    }));

    const scanBtn = UI.$('scanBtn');
    scanBtn.hidden = !(state.attempt.scanner && !state.attempt.scannerUsed && question.removed === null);
    UI.$('lockBtn').disabled = true;
    UI.setText('aiComment', '');

    startTimer(question);
  }

  function startTimer(question) {
    stopTimer();
    const timer = UI.$('timer');
    if (!question.timed) { timer.textContent = 'ohne Zeitdruck'; return; }
    state.deadline = Date.now() + question.remainingMs;
    const tick = () => {
      const left = Math.max(0, state.deadline - Date.now());
      timer.textContent = `${Math.ceil(left / 1000)} s`;
      timer.classList.toggle('urgent', left < 6000);
      if (left <= 0) { stopTimer(); submit(-1); }
    };
    tick();
    state.timer = setInterval(tick, 200);
  }

  function stopTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

  async function scan() {
    try {
      const data = await api.scan(state.attempt.id);
      state.attempt = data.attempt;
      state.question = data.attempt.current;
      renderQuestion();
    } catch (error) {
      UI.warn(error.message);
    }
  }

  async function submit(answerIndex) {
    stopTimer();
    const index = Number.isInteger(answerIndex) ? answerIndex : state.selected;
    if (index === null || index === undefined) return;
    UI.$('lockBtn').disabled = true;
    try {
      const data = await api.answer(state.attempt.id, { answerIndex: index, round: state.attempt.round });
      state.attempt = data.attempt;
      state.lastAnswer = data;
      renderRound(data);
    } catch (error) {
      UI.warn(error.message);
      if (error.code === 'no_question' || error.code === 'attempt_closed') finish();
    }
  }

  function renderRound(data) {
    const free = state.attempt.mode === 'free';
    const correct = data.correct;
    UI.$('resultOrbit').textContent = correct ? '✓' : '✕';
    UI.$('resultOrbit').dataset.tone = correct ? 'good' : 'bad';
    UI.setText('roundEyebrow', data.timedOut ? 'ZEIT ABGELAUFEN' : correct ? 'RICHTIG' : 'DANEBEN');
    UI.setText('roundTitle', correct ? 'Treffer.' : data.timedOut ? 'Die Zeit war schneller.' : 'Nicht ganz.');
    UI.setText('roundCopy', correct
      ? (free ? 'Die Eule nickt. Weiter so.' : `${UI.number(data.damage)} Schaden beim Gegner.`)
      : (free ? 'Schau dir die Erklärung an – dafür ist das freie Quiz da.' : `Du verlierst ${UI.number(data.selfDamage)} Kraft.`));
    UI.setText('resultTime', UI.seconds(data.timeMs));
    UI.setText('resultStatMiddleLabel', free ? 'COMBO' : 'SCHADEN');
    UI.setText('resultDamage', free ? `× ${state.attempt.combo}` : UI.number(data.damage));
    const history = state.attempt.history || [];
    const accuracy = history.length ? history.filter(entry => entry.correct).length / history.length : 0;
    UI.setText('resultAccuracy', UI.percent(accuracy));
    UI.setText('explanation', data.explanation || '');
    UI.setText('continueBtn', data.done ? 'Ergebnis ansehen' : 'Weiter');
    UI.showScreen('screenRound');
  }

  function continueRound() {
    if (state.lastAnswer && state.lastAnswer.done) finish();
    else { UI.showScreen('screenBattle'); loadQuestion(); }
  }

  async function finish() {
    try {
      const data = await api.complete(state.attempt.id);
      state.result = data.result;
      store().applyPond(data.pond);
      store().setQuizRewards(data.result.rewardsLeftToday);
      renderEnd(data.result);
    } catch (error) {
      UI.warn(error.message);
      UI.showScreen('screenPond');
    }
  }

  function renderEnd(result) {
    const free = result.mode === 'free';
    const won = result.outcome === 1;
    UI.$('endResult').textContent = result.noQuestions ? '…' : won ? '★' : '◇';
    UI.setText('energyChange', result.practice ? 'ÜBUNGSRUNDE' : free ? 'FREIES QUIZ' : won ? 'SIEG' : 'NIEDERLAGE');
    UI.setText('endTitle', result.noQuestions ? 'Keine Fragen verfügbar.'
      : free ? 'Die Eule hat dich kennengelernt.' : won ? 'Du hast den Fuchs überdacht.' : 'Der Fuchs war diesmal schneller.');
    UI.setText('endCopy', result.noQuestions
      ? 'Dieses Mal konnte keine Frage geladen werden. Es wurden keine Ressourcen abgezogen.'
      : `${result.correctAnswers} von ${result.total} richtig.`);

    const grid = UI.$('rewardGrid');
    grid.innerHTML = root.PwndEconomy.RESOURCES.map(key => {
      const meta = UI.RESOURCE_META[key];
      const value = result.credited[key] || 0;
      return `<div class="reward-card${value > 0 ? ' gained' : ''}">
        <span>${meta.icon}</span><strong>${UI.signed(value)}</strong><small>${meta.label}</small>
      </div>`;
    }).join('');

    UI.setText('rewardNote', result.practice
      ? `Heute sind alle ${root.PwndProgression.DAILY_QUIZ_REWARDS} belohnten Runden verbraucht – diese Runde zählt als Übung ohne Ressourcen.`
      : `Noch ${result.rewardsLeftToday} belohnte Runden heute.`);

    UI.setText('strengthValue', skillName(result.strongest));
    UI.setText('weaknessValue', skillName(result.weakest));
    UI.setText('ratingValue', free ? '—' : `${UI.number(result.quizRating)} (${UI.signed(result.ratingDelta)})`);

    renderUpgrades(result);
    document.body.classList.toggle('free-mode', free);
    UI.showScreen('screenEnd');
  }

  function renderUpgrades(result) {
    const container = UI.$('upgrades');
    const offers = (result.upgradeOffers || [])
      .map(id => root.PwndEconomy.UPGRADES.find(item => item.id === id))
      .filter(Boolean);
    const chosen = result.upgradeChosen
      ? root.PwndEconomy.UPGRADES.find(item => item.id === result.upgradeChosen) : null;
    if (!offers.length || result.upgradeChosen) {
      container.innerHTML = chosen
        ? `<p class="build-message">Gewählt: <b>${chosen.name}</b> – ${chosen.text}</p>` : '';
      return;
    }
    container.innerHTML = `<p class="eyebrow">EIN VORTEIL FÜR DIE NÄCHSTE RUNDE</p>
      <div class="upgrade-list">${offers.map(offer => `
        <button class="upgrade-card" type="button" data-upgrade="${offer.id}">
          <b>${offer.name}</b><small>${offer.text}</small>
        </button>`).join('')}</div>`;
    container.querySelectorAll('button[data-upgrade]').forEach(node => node.addEventListener('click', async () => {
      try {
        const data = await api.chooseUpgrade(state.attempt.id, node.dataset.upgrade);
        state.result = data.result;
        if (data.pond) store().applyPond(data.pond);
        renderUpgrades(data.result);
      } catch (error) {
        UI.warn(error.message);
      }
    }));
  }

  function init() {
    UI.$('freeQuizBtn').addEventListener('click', openFreeSetup);
    UI.$('startBtn').addEventListener('click', openDuelSetup);
    UI.$('freeStartBtn').addEventListener('click', () => { if (state.topicId) start(); });
    UI.$('duelStartBtn').addEventListener('click', () => { if (state.opponentId) start(); });
    UI.$('cancelCountdownBtn').addEventListener('click', cancelCountdown);
    UI.$('backToPondBtn').addEventListener('click', () => { document.body.classList.remove('free-mode'); UI.showScreen('screenPond'); });
    UI.$('backToPondFromTopicsBtn').addEventListener('click', () => { document.body.classList.remove('free-mode'); UI.showScreen('screenPond'); });
    UI.$('lockBtn').addEventListener('click', () => submit());
    UI.$('scanBtn').addEventListener('click', scan);
    UI.$('continueBtn').addEventListener('click', continueRound);
    UI.$('goBuildBtn').addEventListener('click', () => {
      document.body.classList.remove('free-mode');
      root.PwndPond.renderHub();
      UI.showScreen('screenPond');
    });
    UI.$('againBtn').addEventListener('click', () => {
      if (state.mode === 'free') openFreeSetup(); else openDuelSetup();
    });
  }

  root.PwndQuiz = { init, TOPICS, OPPONENTS, OWL };
})(window);
