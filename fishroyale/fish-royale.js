(function () {
  'use strict';
  const E = window.FishRoyaleEngine;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const viewLobby = $('#lobby');
  const viewMatch = $('#match');
  const viewFinish = $('#finish');
  const resultBackdrop = $('#resultBackdrop');
  let selectedPlaylist = 'reef';
  let match = null;
  let lastFocusedElement = null;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

  function showView(view) {
    [viewLobby, viewMatch, viewFinish].forEach((item) => {
      item.hidden = item !== view;
      item.classList.toggle('is-visible', item === view);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function escapeToLobby() {
    resultBackdrop.hidden = true;
    match = null;
    showView(viewLobby);
    $('#startMatch').focus();
  }

  function updateHealth() {
    $('#playerHealth').textContent = String(match.playerHealth);
    $('#rivalHealth').textContent = String(match.rivalHealth);
    $('#playerHealthBar').style.width = `${(match.playerHealth / E.MAX_HEALTH) * 100}%`;
    $('#rivalHealthBar').style.width = `${(match.rivalHealth / E.MAX_HEALTH) * 100}%`;
    $('#energyValue').textContent = String(match.energy);
    $('#energyMeter').innerHTML = Array.from({ length: E.MAX_ENERGY }, (_, index) => `<i class="energy-pip${index < match.energy ? ' is-full' : ''}" aria-hidden="true"></i>`).join('');
    $('#energyMeter').setAttribute('aria-label', `${match.energy} von ${E.MAX_ENERGY} Taktik-Energie`);
    $('#roundNumber').textContent = String(match.roundIndex + 1);
  }

  function renderIntent() {
    const intent = E.currentIntent(match);
    if (!intent) return;
    $('#intentCaption').innerHTML = `<b>${escapeHtml(intent.name)}</b> · ${escapeHtml(intent.line)} <span>ANGRIFF: ${E.LANE_NAMES[intent.attackLane].toUpperCase()} · ${intent.attack}</span>`;
    E.LANES.forEach((lane) => {
      const guard = intent.guards[lane];
      const guardNode = $(`#guard-${lane}`);
      guardNode.textContent = guard.value ? `WACHE · ${guard.value} · ${E.TYPE_LABELS[guard.type]}` : 'OFFEN · 0';
      guardNode.classList.toggle('is-open', guard.value === 0);
      const attackNode = $(`#attack-${lane}`);
      const attacked = lane === intent.attackLane;
      attackNode.textContent = attacked ? `GEGNERZUG · ${intent.attack}` : '';
      attackNode.classList.toggle('is-coming', attacked);
      $(`[data-lane="${lane}"]`).disabled = !(match.phase === 'choose' && match.answered);
    });
  }

  function renderQuestion() {
    const question = E.currentQuestion(match);
    if (!question) return;
    $('#questionCategory').textContent = question.category;
    $('#questionText').textContent = question.prompt;
    $('#answerList').innerHTML = question.options.map((option, index) => `<button type="button" class="answer-button" data-answer="${index}" ${match.answered ? 'disabled' : ''}><span class="answer-key">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option)}</span></button>`).join('');
    const feedback = $('#quizFeedback');
    feedback.classList.toggle('is-result', match.answered);
    feedback.classList.toggle('is-correct', match.answered && match.correct);
    feedback.classList.toggle('is-wrong', match.answered && !match.correct);
    if (!match.answered) {
      feedback.textContent = 'Nimm dir Zeit. Erst Wissen, dann Taktik.';
    } else {
      feedback.textContent = `${match.correct ? 'Richtig.' : 'Nicht ganz.'} ${question.explanation} ${match.correct ? '+3' : '+2'} Taktik-Energie.`;
    }
    $$('#answerList .answer-button').forEach((button) => {
      const answer = Number(button.dataset.answer);
      if (match.answered && answer === question.answer) button.classList.add('is-right');
      else if (match.answered && !match.correct && answer === match._submittedAnswer) button.classList.add('is-wrong');
    });
  }

  function renderCards() {
    const host = $('#cardList');
    host.innerHTML = E.CARDS.map((card) => {
      const unavailable = match.phase !== 'choose' || !match.answered || card.cost > match.energy;
      const selected = match.selectedCardId === card.id;
      return `<button type="button" class="battle-card type-${card.type}${selected ? ' is-selected' : ''}" data-card="${card.id}" aria-pressed="${selected}" ${unavailable ? 'disabled' : ''}><span class="card-mark">${card.mark}</span><span class="card-main"><b>${card.name}</b><small>${card.description}</small></span><span class="card-stats"><i class="cost">✦ ${card.cost}</i><i>⚔ ${card.attack}</i><i>◈ ${card.guard}</i></span></button>`;
    }).join('');
    const card = E.cardById(match.selectedCardId);
    const lane = match.selectedLane;
    $('#choiceHint').textContent = !match.answered ? 'Beantworte zuerst die Frage. Der gegnerische Zug ist bereits offen.' : !card ? 'Wähle eine freie Karte; alle vier gehören von Anfang an dir.' : !lane ? `${card.name} bereit. Wähle jetzt eine der drei Spuren.` : `${card.name} → ${E.LANE_NAMES[lane]}. Prüfe deine Entscheidung und führe den Zug aus.`;
    $('#deployMove').disabled = !(match.phase === 'choose' && match.answered && card && lane);
    $('#deployMove').innerHTML = match.roundIndex === match.roundsTotal - 1 ? 'Letzten Zug ausführen <span aria-hidden="true">→</span>' : 'Zug ausführen <span aria-hidden="true">→</span>';
  }

  function renderMatch() {
    if (!match) return;
    $('#playlistLabel').textContent = match.playlistLabel.toUpperCase();
    updateHealth();
    renderIntent();
    renderQuestion();
    renderCards();
    $$('.lane-button').forEach((button) => {
      const selected = match.selectedLane === button.dataset.lane;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-selected', selected);
    });
  }

  function startMatch() {
    match = E.createMatch(selectedPlaylist);
    $('#resultBackdrop').hidden = true;
    $('#playlistLabel').textContent = match.playlistLabel.toUpperCase();
    showView(viewMatch);
    renderMatch();
    $('#questionText').focus({ preventScroll: true });
  }

  function showTurnResult(result) {
    lastFocusedElement = document.activeElement;
    $('#resultKicker').textContent = `ZUG ${result.round} AUSGEWERTET`;
    $('#resultTitle').textContent = result.damage > result.incomingDamage ? 'Guter Konter.' : result.damage < result.incomingDamage ? 'Der Gegnerzug trifft.' : 'Ausgeglichener Zug.';
    $('#resultIntro').textContent = `${result.cardName} in der ${result.laneName}. ${result.questionCorrect ? 'Die richtige Antwort stärkt deinen Zug.' : 'Auch ohne richtige Antwort bleibt dein Grundzug spielbar.'}`;
    $('#resultDamage').textContent = String(result.damage);
    $('#resultBlocked').textContent = String(result.blocked);
    $('#resultIncoming').textContent = String(result.incomingDamage);
    const outcome = result.defended ? `${result.opponentName} griff dieselbe Spur an: ${result.blocked} von ${result.incomingAttack} Angriffspunkten wurden abgewehrt.` : `${result.opponentName} griff die ${E.LANE_NAMES[result.intentLane]} an, während du eine andere Spur gewählt hast.`;
    const advantage = result.typeBonus > 0 ? ' Dein Typvorteil gab +1 Treffer.' : result.typeBonus < 0 ? ' Der Wachen-Typ hat deinen Treffer um 1 geschwächt.' : '';
    $('#resultExplanation').textContent = `${outcome} Deine Karte verursachte ${result.damage} Schaden nach der gegnerischen Wache.${advantage}`;
    $('#continueMatch').textContent = match.status === 'finished' ? 'Ergebnis ansehen' : 'Nächste Frage';
    $('#continueMatch').insertAdjacentHTML('beforeend', ' <span aria-hidden="true">→</span>');
    resultBackdrop.hidden = false;
    $('#continueMatch').focus();
  }

  function showFinish() {
    const winner = match.winner;
    $('#finishSeal').textContent = winner === 'player' ? '✦' : winner === 'rival' ? '↗' : '≈';
    $('#finishKicker').textContent = winner === 'player' ? 'DU HAST DAS DUELL GEWONNEN' : winner === 'rival' ? 'DIE RIFFWACHE HAT GEWONNEN' : 'UNENTSCHIEDEN';
    $('#finishTitle').textContent = winner === 'player' ? 'Klug gespielt.' : winner === 'rival' ? 'Gutes Training.' : 'Auf Augenhöhe.';
    $('#finishCopy').textContent = winner === 'player' ? 'Dein Wissen hat Taktik möglich gemacht. Alle Karten waren offen — den Unterschied hast du selbst gespielt.' : winner === 'rival' ? 'Der Gegnerzug war vorhersehbar. Beim nächsten Mal kannst du deine Antwort und Spur neu kombinieren.' : 'Beide Riffe stehen gleich stark da. Ein sauberes, faires Unentschieden.';
    $('#finishPlayerHp').textContent = String(match.playerHealth);
    $('#finishRivalHp').textContent = String(match.rivalHealth);
    $('#resultBackdrop').hidden = true;
    showView(viewFinish);
    $('#playAgain').focus({ preventScroll: true });
  }

  $('#playlistChoices').addEventListener('click', (event) => {
    const button = event.target.closest('[data-playlist]');
    if (!button) return;
    selectedPlaylist = button.dataset.playlist;
    $$('#playlistChoices .playlist-card').forEach((choice) => {
      const selected = choice === button;
      choice.classList.toggle('is-selected', selected);
      choice.setAttribute('aria-pressed', String(selected));
    });
  });

  $('#startMatch').addEventListener('click', startMatch);
  $('#leaveMatch').addEventListener('click', escapeToLobby);
  $('#playAgain').addEventListener('click', () => {
    showView(viewLobby);
    $('#startMatch').focus({ preventScroll: true });
  });

  $('#answerList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-answer]');
    if (!button || !match) return;
    const answerIndex = Number(button.dataset.answer);
    const question = E.currentQuestion(match);
    const next = E.answerQuestion(match, answerIndex);
    if (!next) return;
    match = { ...next, _submittedAnswer: answerIndex };
    renderMatch();
    $('#choiceHint').textContent = `${match.correct ? 'Richtig beantwortet' : 'Antwort notiert'} — wähle jetzt deine Karte und die Spur.`;
    const rightAnswer = $('#answerList .answer-button.is-right');
    if (rightAnswer) rightAnswer.setAttribute('aria-label', `Richtig: ${question.options[question.answer]}`);
  });

  $('#cardList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-card]');
    if (!button || !match) return;
    match = E.selectCard(match, button.dataset.card) || match;
    renderMatch();
  });

  $('#laneList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-lane]');
    if (!button || !match) return;
    match = E.selectLane(match, button.dataset.lane) || match;
    renderMatch();
  });

  $('#deployMove').addEventListener('click', () => {
    if (!match) return;
    match = E.resolveTurn(match) || match;
    if (!match.lastResult) return;
    updateHealth();
    showTurnResult(match.lastResult);
  });

  $('#continueMatch').addEventListener('click', () => {
    resultBackdrop.hidden = true;
    if (match.status === 'finished') {
      showFinish();
      return;
    }
    match = E.nextRound(match);
    if (!match) return;
    renderMatch();
    $('#questionText').focus({ preventScroll: true });
    if (lastFocusedElement) lastFocusedElement.blur();
  });

  resultBackdrop.addEventListener('click', (event) => {
    if (event.target === resultBackdrop) {
      resultBackdrop.hidden = true;
      if (lastFocusedElement && lastFocusedElement.isConnected) lastFocusedElement.focus();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !resultBackdrop.hidden) {
      resultBackdrop.hidden = true;
      if (lastFocusedElement && lastFocusedElement.isConnected) lastFocusedElement.focus();
    }
  });
})();
