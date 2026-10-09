// Strategie-Ebene: Gegnersuche, Aufstellung, Angriff, Ergebnis, Berichte und Liga.
// Der Server liefert Gegner, Beutevorschau und Replay; der Client stellt nur auf und zeigt an.
(function (root) {
  'use strict';

  const E = root.PwndEconomy;
  const B = root.PwndBattle;
  const P = root.PwndProgression;
  const UI = root.PwndUI;
  const api = root.PwndApi;

  const state = {
    opponent: null,
    rotation: null,
    limits: null,
    selectedUnit: null,
    deployment: [],
    deployNodes: [],
    lastBattle: null,
    lastReplay: null,
    reportType: 'defense',
  };

  function store() { return root.PwndStore; }
  function pond() { return store().pond; }

  // ---------- Gegnersuche ----------

  async function openScout(advance = false) {
    UI.showScreen('screenScout');
    UI.setText('scoutStatus', 'Suche einen passenden Teich …');
    UI.$('scoutCard').hidden = true;
    try {
      const data = advance ? await api.nextOpponent() : await api.opponent();
      state.opponent = data.opponent;
      state.rotation = data.rotation;
      state.limits = data.limits;
      store().setLimits(data.limits);
      renderScout();
    } catch (error) {
      UI.setText('scoutStatus', error.message);
    }
  }

  function renderScout() {
    const limits = state.limits || {};
    UI.setText('scoutLimits', `Angriffe heute: ${limits.attacksUsed || 0} / ${P.DAILY_ATTACK_LIMIT} · Beutelimit übrig: ${UI.number(limits.lootLeft || 0)}`);

    if (!state.opponent) {
      UI.setText('scoutStatus', 'Gerade ist kein Gegner frei. Angegriffene Teiche sind vier Stunden geschützt – versuche es später noch einmal.');
      UI.$('scoutCard').hidden = true;
      return;
    }
    const opponent = state.opponent;
    UI.setText('scoutStatus', `Gegner ${state.rotation.index + 1} von ${state.rotation.size} in deinem Trophäenbereich.`);
    UI.$('scoutCard').hidden = false;
    UI.setText('scoutKind', opponent.kind === 'bot' ? 'ÜBUNGSTEICH' : 'SPIELERTEICH');
    UI.setText('scoutName', opponent.name);
    UI.setText('scoutTrophies', UI.number(opponent.trophies));
    UI.setText('scoutLeague', `${opponent.league.name} · Stufe ${opponent.pondLevel}`);

    const nodes = UI.buildBoard(UI.$('scoutGrid'));
    nodes.forEach(node => { node.disabled = true; });
    UI.paintBuilding(nodes, { type: 'core', x: E.CORE.x, y: E.CORE.y }, { title: 'Teichkern' });
    opponent.buildings.forEach(building => UI.paintBuilding(nodes, building, { title: E.BUILDINGS[building.type].name }));

    const preview = opponent.lootPreview || {};
    UI.setHtml('scoutLoot', UI.resourceLine(preview.gained || {}));
    UI.setText('scoutTrophyGain', `+${opponent.trophies3.win[2]}`);
    UI.setText('scoutTrophyLoss', `1 Stern +${opponent.trophies3.win[0]} · ohne Stern ${opponent.trophies3.loss}`);

    const hasTroops = E.troopHousing(pond().troops) > 0;
    const planBtn = UI.$('planAttackBtn');
    planBtn.disabled = !hasTroops || (state.limits && state.limits.attacksLeft <= 0);
    planBtn.textContent = !hasTroops ? 'Erst Truppen ausbilden'
      : state.limits && state.limits.attacksLeft <= 0 ? 'Heute keine Angriffe mehr' : 'Truppen aufstellen';
  }

  // ---------- Aufstellung ----------

  function openDeploy() {
    state.deployment = [];
    state.selectedUnit = null;
    renderTroopPicker();
    renderDeployGrid();
    UI.setText('deployStatus', 'Wähle eine Einheit und tippe auf ein freies Randfeld.');
    UI.$('launchAttackBtn').disabled = true;
    UI.showScreen('screenDeploy');
  }

  function usedCounts() {
    return B.deploymentCounts(state.deployment);
  }

  function renderTroopPicker() {
    const troops = pond().troops;
    const used = usedCounts();
    const picker = UI.$('troopPicker');
    picker.innerHTML = E.TROOP_TYPES.map(type => {
      const left = (troops[type] || 0) - (used[type] || 0);
      const troop = E.TROOPS[type];
      return `<button class="troop-pick${state.selectedUnit === type ? ' selected' : ''}" type="button"
        data-unit="${type}" ${left <= 0 ? 'disabled' : ''}>
        <span class="troop-mark">${UI.UNIT_ART[type]}</span>
        <span><b>${troop.name}</b><em>${left} übrig</em></span>
      </button>`;
    }).join('');
    picker.querySelectorAll('button[data-unit]').forEach(node => node.addEventListener('click', () => {
      state.selectedUnit = node.dataset.unit;
      renderTroopPicker();
      renderDeployGrid();
      UI.setText('deployStatus', `${E.TROOPS[state.selectedUnit].name}: tippe auf ein freies Randfeld.`);
    }));
  }

  function layoutOf(opponent) {
    return opponent.buildings.map(item => ({ type: item.type, x: item.x, y: item.y }));
  }

  function renderDeployGrid() {
    const opponent = state.opponent;
    const layout = layoutOf(opponent);
    const edges = new Set(B.edgeCells(layout).map(([x, y]) => `${x},${y}`));
    const container = UI.$('deployGrid');
    state.deployNodes = UI.buildBoard(container, (x, y) => {
      const free = edges.has(`${x},${y}`);
      return { className: free && state.selectedUnit ? 'cell-deploy' : free ? 'cell-edge' : '' };
    });
    UI.paintBuilding(state.deployNodes, { type: 'core', x: E.CORE.x, y: E.CORE.y }, { title: 'Teichkern' });
    opponent.buildings.forEach(building => UI.paintBuilding(state.deployNodes, building, { title: E.BUILDINGS[building.type].name }));

    state.deployment.forEach(entry => {
      const node = state.deployNodes[UI.cellIndex(entry.x, entry.y)];
      if (!node) return;
      node.classList.add('cell-unit');
      node.innerHTML = `<span class="unit-mark">${UI.UNIT_ART[entry.unit]}</span>`;
    });

    state.deployNodes.forEach(node => node.addEventListener('click', () => {
      onDeployCell(Number(node.dataset.x), Number(node.dataset.y));
    }));
  }

  function onDeployCell(x, y) {
    const existing = state.deployment.findIndex(entry => entry.x === x && entry.y === y);
    if (existing >= 0) {
      state.deployment.splice(existing, 1);
      refreshDeploy('Einheit zurückgenommen.');
      return;
    }
    if (!state.selectedUnit) { UI.setText('deployStatus', 'Wähle zuerst eine Einheit.'); return; }
    const next = [...state.deployment, { unit: state.selectedUnit, x, y }];
    const error = B.validateDeployment(layoutOf(state.opponent), next, pond().troops);
    if (error) { UI.setText('deployStatus', deployError(error)); return; }
    state.deployment = next;
    refreshDeploy(`${state.deployment.length} ${state.deployment.length === 1 ? 'Einheit' : 'Einheiten'} aufgestellt.`);
  }

  function refreshDeploy(message) {
    renderTroopPicker();
    renderDeployGrid();
    UI.setText('deployStatus', message);
    UI.$('launchAttackBtn').disabled = state.deployment.length === 0;
  }

  function deployError(code) {
    return {
      deployment_not_on_edge: 'Truppen starten nur am Rand des Teichs.',
      deployment_blocked: 'Auf diesem Feld steht ein Gebäude.',
      insufficient_troops: 'So viele Einheiten hast du nicht im Lager.',
      deployment_duplicate: 'Dieses Feld ist schon belegt.',
      invalid_deployment: 'Diese Aufstellung geht nicht.',
      empty_deployment: 'Stelle mindestens eine Einheit auf.',
    }[code] || 'Diese Aufstellung geht nicht.';
  }

  // ---------- Angriff ----------

  async function launch() {
    UI.$('launchAttackBtn').disabled = true;
    UI.setText('deployStatus', 'Der Angriff läuft …');
    try {
      const data = await api.attack({ targetKey: state.opponent.key, deployment: state.deployment });
      state.lastBattle = data.battle;
      state.lastReplay = data.replay;
      store().applyPond(data.pond);
      store().setLimits(data.limits);
      playReplay(data.replay, () => showBattleResult(data.battle));
    } catch (error) {
      UI.setText('deployStatus', attackError(error));
      UI.$('launchAttackBtn').disabled = false;
      if (error.code === 'target_cooldown' || error.code === 'target_shielded' || error.code === 'target_unavailable') {
        openScout(true);
      }
    }
  }

  function attackError(error) {
    return {
      daily_attack_limit: `Heute sind alle ${P.DAILY_ATTACK_LIMIT} Angriffe verbraucht.`,
      target_cooldown: 'Diesen Teich hast du gerade erst angegriffen.',
      target_shielded: 'Dieser Teich steht unter Schutzschild.',
      insufficient_troops: 'So viele Einheiten hast du nicht im Lager.',
    }[error.code] || error.message;
  }

  function playReplay(replay, onDone) {
    UI.setText('replayEyebrow', 'ANGRIFF LÄUFT');
    UI.setText('replayTitle', 'Deine Truppen sind unterwegs.');
    UI.$('replayAgainBtn').hidden = true;
    UI.$('skipReplayBtn').hidden = false;
    UI.showScreen('screenReplay');
    root.PwndReplay.play({
      container: UI.$('replayGrid'),
      layout: replay.layout,
      frames: replay.frames,
      deployment: replay.deployment,
      onDone,
    });
  }

  function showBattleResult(battle) {
    const stars = Number(battle.stars) || 0;
    UI.setHtml('battleStars', [0, 1, 2].map(index =>
      `<span class="star${index < stars ? ' filled' : ''}">✿</span>`).join(''));
    UI.setText('battleResultEyebrow', battle.kind === 'bot' ? 'ÜBUNGSTEICH' : 'SPIELERTEICH');
    UI.setText('battleResultTitle', stars === 3 ? 'Teich erobert.' : stars > 0 ? `${stars} von 3 Sternen.` : 'Kein Stern.');
    UI.setText('battleResultCopy', stars > 0
      ? `Du hast ${battle.defenderName} zu ${battle.destruction} % zerstört.`
      : `${battle.defenderName} hat deinen Angriff abgewehrt.`);

    const grid = UI.$('battleLootGrid');
    grid.innerHTML = E.RESOURCES.map(key => {
      const meta = UI.RESOURCE_META[key];
      const value = battle.loot.gained[key] || 0;
      return `<div class="reward-card${value > 0 ? ' gained' : ''}">
        <span>${meta.icon}</span><strong>${UI.signed(value)}</strong><small>${meta.label}</small>
      </div>`;
    }).join('');
    UI.setText('battleLootNote', battle.loot.capped
      ? 'Dein Tages-Beutelimit war erreicht – die Beute wurde anteilig gekürzt.'
      : battle.loot.bonus ? `Enthält ${UI.number(battle.loot.bonus)} ⚡ Liga-Bonus.` : 'Liebe bleibt bei jedem Teich geschützt.');

    UI.setText('battleDestruction', `${battle.destruction} %`);
    UI.setText('battleTrophies', UI.signed(battle.trophies.delta));
    UI.setText('battleLosses', `${battle.unitsLost} von ${battle.unitsDeployed}`);
    UI.setText('battleHash', `Replay-Prüfsumme ${battle.replayHash}`);
    UI.showScreen('screenBattleResult');
  }

  // ---------- Berichte ----------

  async function openReports(type = state.reportType) {
    state.reportType = type;
    UI.$('tabDefense').classList.toggle('active', type === 'defense');
    UI.$('tabAttack').classList.toggle('active', type === 'attack');
    UI.$('tabDefense').setAttribute('aria-selected', String(type === 'defense'));
    UI.$('tabAttack').setAttribute('aria-selected', String(type === 'attack'));
    UI.showScreen('screenReports');
    UI.setText('reportsStatus', 'Berichte werden geladen …');
    try {
      const data = await api.reports(type);
      renderReports(data.reports, type);
      if (type === 'defense' && data.unread > 0) {
        await api.markReportsSeen();
        store().setUnreadDefense(0);
      }
    } catch (error) {
      UI.setText('reportsStatus', error.message);
    }
  }

  function renderReports(reports, type) {
    UI.setText('reportsStatus', reports.length ? '' : type === 'defense'
      ? 'Noch war niemand bei dir. Dein Teich ist unberührt.'
      : 'Du hast noch keinen Teich angegriffen.');
    UI.setHtml('reportList', reports.map(report => `
      <article class="report-card${report.seen ? '' : ' unread'}">
        <header>
          <div>
            <b>${report.opponentName}</b>
            <small>${report.opponentKind === 'bot' ? 'Übungsteich' : 'Spielerteich'} · ${UI.relativeTime(report.at)}</small>
          </div>
          <span class="report-stars">${[0, 1, 2].map(index => `<i class="${index < report.stars ? 'filled' : ''}">✿</i>`).join('')}</span>
        </header>
        <p class="report-line">${type === 'defense' ? 'Verloren' : 'Erbeutet'}: ${UI.resourceLine(report.resources)}</p>
        <footer>
          <span>${report.destruction} % zerstört</span>
          <span>${UI.signed(report.trophyDelta)} 🏆</span>
          <button class="link-btn" type="button" data-replay="${report.id}">Replay</button>
        </footer>
      </article>`).join(''));
    UI.$('reportList').querySelectorAll('button[data-replay]').forEach(node =>
      node.addEventListener('click', () => openReplay(node.dataset.replay)));
  }

  async function openReplay(battleId) {
    try {
      const data = await api.replay(battleId);
      state.lastBattle = data.battle;
      state.lastReplay = data.replay;
      UI.showScreen('screenReplay');
      UI.setText('replayEyebrow', data.replay.verified ? 'GEPRÜFTES REPLAY' : 'REPLAY');
      UI.setText('replayTitle', `${data.attackerName} gegen ${data.defenderName}`);
      UI.$('replayAgainBtn').hidden = false;
      root.PwndReplay.play({
        container: UI.$('replayGrid'),
        layout: data.replay.layout,
        frames: data.replay.frames,
        deployment: data.replay.deployment,
        onDone: () => { UI.$('skipReplayBtn').textContent = 'Fertig'; },
      });
    } catch (error) {
      UI.warn(error.message);
    }
  }

  // ---------- Liga ----------

  async function openLeague() {
    UI.showScreen('screenLeague');
    UI.setText('leagueLede', 'Tabelle wird geladen …');
    try {
      const data = await api.leagueTable();
      UI.setText('leagueEyebrow', `LIGA · ${data.league.name.toUpperCase()}`);
      UI.setText('leagueTitle', data.league.name);
      UI.setText('leagueLede', `Platz ${data.me.rank} von ${data.players} Teichen · ${UI.number(data.me.trophies)} Trophäen · Liga-Bonus ${UI.number(data.league.bonus)} ⚡ je Sieg.`);
      UI.setHtml('leagueLadder', data.leagues.map(league => `
        <span class="ladder-step${league.id === data.league.id ? ' current' : ''}" style="--league:${league.color}">
          <b>${league.name}</b><small>ab ${UI.number(league.min)}</small>
        </span>`).join(''));
      UI.setHtml('leagueTableBody', data.table.map(row => `
        <tr class="${row.isMe ? 'is-me' : ''}">
          <td>${row.rank}</td><td>${row.name}</td><td>${row.pondLevel}</td><td>${UI.number(row.trophies)}</td>
        </tr>`).join(''));
    } catch (error) {
      UI.setText('leagueLede', error.message);
    }
  }

  function init() {
    UI.$('attackCard').addEventListener('click', () => openScout(false));
    UI.$('campCard').addEventListener('click', () => { root.PwndPond.renderCamp(); UI.showScreen('screenCamp'); });
    UI.$('reportsCard').addEventListener('click', () => openReports('defense'));
    UI.$('leagueCard').addEventListener('click', openLeague);
    UI.$('nextOpponentBtn').addEventListener('click', () => openScout(true));
    UI.$('planAttackBtn').addEventListener('click', openDeploy);
    UI.$('clearDeployBtn').addEventListener('click', () => { state.deployment = []; refreshDeploy('Aufstellung geleert.'); });
    UI.$('launchAttackBtn').addEventListener('click', launch);
    UI.$('skipReplayBtn').addEventListener('click', () => {
      if (UI.$('skipReplayBtn').textContent === 'Fertig') { UI.showScreen('screenReports'); UI.$('skipReplayBtn').textContent = 'Überspringen'; return; }
      root.PwndReplay.skip();
    });
    UI.$('replayAgainBtn').addEventListener('click', () => { if (state.lastBattle) openReplay(state.lastBattle.id); });
    UI.$('battleReplayBtn').addEventListener('click', () => {
      if (state.lastReplay) playReplay(state.lastReplay, () => showBattleResult(state.lastBattle));
    });
    UI.$('tabDefense').addEventListener('click', () => openReports('defense'));
    UI.$('tabAttack').addEventListener('click', () => openReports('attack'));
    document.querySelectorAll('[data-back]').forEach(node => node.addEventListener('click', () => {
      root.PwndReplay.stop();
      const target = node.dataset.back;
      if (target === 'scout') openScout(false);
      else { root.PwndPond.renderHub(); UI.showScreen('screenPond'); }
    }));
  }

  root.PwndStrategy = { init, openScout, openReports, openLeague };
})(window);
