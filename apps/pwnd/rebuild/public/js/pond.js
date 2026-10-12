// Teich-Hub: Szene, Ressourcen, Bauraster, Wachstumskarte und Truppenlager.
// Jede Aktion geht mit der aktuellen Revision an den Server; der Server entscheidet.
(function (root) {
  'use strict';

  const E = root.PwndEconomy;
  const UI = root.PwndUI;
  const api = root.PwndApi;

  const FEATURE_NODES = { frog: 'pond-frog', reeds: 'pond-reeds', dragonfly: 'pond-dragonfly',
    fish: 'pond-fish', lily: 'pond-lilies', stream: 'pond-stream' };

  const state = {
    pendingType: null,   // Gebäude, für das gerade ein Feld gewählt wird
    movingIndex: null,   // Index eines Gebäudes, das verschoben wird
    boardNodes: [],
  };

  function store() { return root.PwndStore; }
  function pond() { return store().pond; }

  function busy(flag) { document.body.classList.toggle('is-busy', Boolean(flag)); }

  async function send(payload, successMessage, retry = true) {
    busy(true);
    try {
      const snapshot = await api.pondAction({ ...payload, revision: pond().revision });
      store().applyPond(snapshot);
      if (successMessage) UI.toast(successMessage, 'good');
      return snapshot;
    } catch (error) {
      if (error.code === 'revision_conflict' && error.details?.snapshot) {
        store().applyPond(error.details.snapshot);
        // Der Teich hat sich zwischendurch verändert (z. B. Produktion). Einmal mit dem neuen Stand wiederholen.
        if (retry) { busy(false); return send(payload, successMessage, false); }
        UI.warn('Dein Teich war nicht aktuell – er wurde gerade neu geladen. Versuche es noch einmal.');
      } else {
        UI.warn(error.message);
      }
      return null;
    } finally {
      busy(false);
      renderHub();
    }
  }

  // ---------- Szene ----------

  function renderScene() {
    const data = pond();
    Object.entries(FEATURE_NODES).forEach(([id, className]) => {
      const node = document.querySelector(`.${className}`);
      if (node) node.classList.toggle('visible', data.unlocked.includes(id));
    });
    const builtTypes = new Set(data.buildings.map(item => item.type));
    const sceneNodes = { solar_lily: 'pondBuiltSolar', spring_pool: 'pondBuiltSpring',
      reed_windmill: 'pondBuiltReed', bee_meadow: 'pondBuiltBees' };
    Object.entries(sceneNodes).forEach(([type, id]) => {
      const node = UI.$(id);
      if (node) node.classList.toggle('visible', builtTypes.has(type));
    });
  }

  // ---------- Ressourcen, Liga, Limits ----------

  function pendingNow() {
    const data = pond();
    return E.pendingProduction({ resources: data.resources, buildings: data.buildings,
      lastTickMs: data.lastTickMs, nowMs: Date.now() });
  }

  function renderResources() {
    const data = pond();
    const pending = pendingNow();
    UI.renderResourceCards(UI.$('resourceGrid'), data.resources, pending.pending);
    const claimBtn = UI.$('claimProductionBtn');
    const total = pending.total;
    claimBtn.hidden = total <= 0;
    UI.setText('pendingProduction', total > 0 ? `· ${UI.number(total)}` : '');
  }

  function renderLeague() {
    const data = pond();
    const progression = store().progression;
    const league = data.league;
    UI.setHtml('leagueStrip', `
      <div class="league-chip" style="--league:${league.color}">
        <small>LIGA</small><strong>${league.name}</strong><span>${UI.number(data.trophies)} Trophäen</span>
      </div>
      <div class="league-chip">
        <small>BESTWERT</small><strong>${UI.number(data.bestTrophies)}</strong><span>Trophäen</span>
      </div>
      <div class="league-chip">
        <small>ANGRIFFE HEUTE</small><strong>${progression ? progression.attacksLeft : '—'}</strong><span>von ${root.PwndProgression.DAILY_ATTACK_LIMIT}</span>
      </div>`);
    const topLeague = UI.$('topLeague');
    topLeague.hidden = false;
    topLeague.textContent = `${league.name} · ${UI.number(data.trophies)} 🏆`;

    const shield = UI.$('shieldNote');
    if (data.shieldUntil) {
      shield.hidden = false;
      shield.textContent = `Schutzschild aktiv – ${UI.untilTime(data.shieldUntil)}. Ein eigener Angriff beendet ihn sofort.`;
    } else {
      shield.hidden = true;
    }

    UI.setText('pondLevelValue', String(data.pondLevel));
    UI.setText('pondLevelHint', `${data.buildings.length} Gebäude · ${Math.max(0, data.unlocked.length - 1)} Entdeckungen`);

    if (progression) {
      UI.setText('attackCardMeta', `${progression.attacksLeft} frei`);
      UI.setText('campCardMeta', `${data.troopHousing} / ${data.troopCapacity}`);
      UI.setText('leagueCardMeta', progression.nextLeague
        ? `noch ${UI.number(progression.nextLeague.trophies - data.trophies)} 🏆` : 'höchste Liga');
      const badge = UI.$('reportsBadge');
      badge.hidden = !progression.unreadDefense;
      badge.textContent = String(progression.unreadDefense || 0);
      UI.setText('attackCardCopy', progression.attacksLeft > 0
        ? 'Suche einen Gegner und schicke deine Truppen los.'
        : 'Heute sind alle Angriffe verbraucht. Morgen geht es weiter.');
    }
    const quiz = store().quiz;
    if (quiz) {
      UI.setText('quizLimitHint', `Belohnte Quizrunden heute: ${quiz.rewardsLeftToday} von ${quiz.rewardLimit}. Danach quizzt du zur Übung weiter.`);
    }
  }

  // ---------- Bauraster ----------

  function buildingAt(x, y) {
    return pond().buildings.find(item => x >= item.x && x < item.x + 2 && y >= item.y && y < item.y + 2) || null;
  }

  function isCore(x, y) {
    return x >= E.CORE.x && x < E.CORE.x + 2 && y >= E.CORE.y && y < E.CORE.y + 2;
  }

  function bonusCells(type) {
    // Felder, auf denen das gewählte Gebäude einen Nachbarschaftsbonus auslöst.
    const cells = new Set();
    const others = pond().buildings.filter((_, index) => index !== state.movingIndex);
    for (const bonus of E.BONUSES) {
      const partners = others.filter(item =>
        (bonus.first === type && item.type === bonus.second) || (bonus.second === type && item.type === bonus.first));
      for (const partner of partners) {
        for (let y = 0; y < E.GRID_SIZE; y += 1) {
          for (let x = 0; x < E.GRID_SIZE; x += 1) {
            if (E.footprintDistance({ type, x, y }, partner) <= bonus.distance) cells.add(`${x},${y}`);
          }
        }
      }
    }
    return cells;
  }

  function renderBuildChoices() {
    const data = pond();
    const list = UI.$('buildChoiceList');
    const built = new Set(data.buildings.map(item => item.type));
    list.innerHTML = E.BUILDING_TYPES.map(type => {
      const building = E.BUILDINGS[type];
      const owned = built.has(type);
      const affordable = E.canAfford(data.resources, building.cost);
      const rate = building.kind === 'producer'
        ? `${building.perHour} ${UI.RESOURCE_META[building.resource].icon}/h`
        : 'Verteidigung';
      const classes = ['build-choice'];
      if (state.pendingType === type) classes.push('selected');
      if (owned) classes.push('owned');
      else if (!affordable) classes.push('locked');
      return `<button class="${classes.join(' ')}" type="button" data-type="${type}" ${owned ? 'data-owned="1"' : ''}>
        <span class="choice-mark">${UI.BUILDING_ART[type]}</span>
        <span class="choice-body">
          <b>${building.name}</b>
          <em>${owned ? 'gebaut – antippen und verschieben' : rate}</em>
          <span class="choice-cost">${owned ? '' : UI.costLine(building.cost, data.resources)}</span>
        </span>
      </button>`;
    }).join('');
    list.querySelectorAll('button').forEach(node => {
      node.addEventListener('click', () => chooseBuilding(node.dataset.type, node.dataset.owned === '1'));
    });
  }

  function chooseBuilding(type, owned) {
    const data = pond();
    if (owned) {
      const index = data.buildings.findIndex(item => item.type === type);
      state.movingIndex = index;
      state.pendingType = type;
      UI.setText('pondBuildStatus', `${E.BUILDINGS[type].name} verschieben: wähle ein neues Feld.`);
    } else if (state.pendingType === type) {
      resetSelection();
      return;
    } else {
      if (!E.canAfford(data.resources, E.BUILDINGS[type].cost)) {
        UI.setText('pondBuildStatus', `Für ${E.BUILDINGS[type].name} fehlen dir noch Ressourcen.`);
        renderBuildChoices();
        return;
      }
      state.pendingType = type;
      state.movingIndex = null;
      UI.setText('pondBuildStatus', `${E.BUILDINGS[type].name}: tippe auf ein freies Feld. Goldene Felder geben einen Bonus.`);
    }
    UI.$('cancelBuildBtn').hidden = false;
    renderBuildChoices();
    renderGrid();
  }

  function resetSelection() {
    state.pendingType = null;
    state.movingIndex = null;
    UI.$('cancelBuildBtn').hidden = true;
    UI.setText('pondBuildStatus', 'Tippe auf ein Gebäude, um mögliche Bauplätze zu sehen.');
    renderBuildChoices();
    renderGrid();
  }

  function renderGrid() {
    const data = pond();
    const container = UI.$('pondBuildGrid');
    const bonuses = state.pendingType ? bonusCells(state.pendingType) : new Set();
    const others = data.buildings.filter((_, index) => index !== state.movingIndex);
    state.boardNodes = UI.buildBoard(container, (x, y) => {
      const classes = [];
      if (isCore(x, y)) classes.push('cell-core');
      if (state.pendingType) {
        const error = E.placementError(others, data.resources, state.pendingType, x, y, state.movingIndex !== null);
        if (error === null) classes.push(bonuses.has(`${x},${y}`) ? 'cell-bonus' : 'cell-open');
      }
      return { className: classes.join(' ') };
    });
    const coreNode = state.boardNodes[UI.cellIndex(E.CORE.x, E.CORE.y)];
    coreNode.innerHTML = '<span class="building-mark">◆</span>';
    coreNode.title = 'Teichkern – Lager und letzte Verteidigung';

    const rates = E.productionRates(data.buildings);
    data.buildings.forEach((item, index) => {
      if (index === state.movingIndex) return;
      const building = E.BUILDINGS[item.type];
      const rate = rates[item.type] || 0;
      const title = building.kind === 'producer'
        ? `${building.name} · ${rate} ${UI.RESOURCE_META[building.resource].icon}/h · Bank ${UI.number(item.bank)}`
        : `${building.name} · schützt deinen Teich`;
      UI.paintBuilding(state.boardNodes, item, { title });
    });

    state.boardNodes.forEach(node => {
      node.addEventListener('click', () => onCellClick(Number(node.dataset.x), Number(node.dataset.y)));
    });
    renderBonusHint();
  }

  function renderBonusHint() {
    const active = E.activeBonuses(pond().buildings);
    UI.setHtml('buildBonusPreview', active.length
      ? active.map(bonus => `<b>${bonus.label}</b>: +${bonus.perHour} ${UI.RESOURCE_META[bonus.resource].icon} pro Stunde`).join(' · ')
      : 'Stelle Gebäude nah beieinander auf: Quellbecken, Solar-Seerose, Schilf-Windrad und Bienenweide verstärken sich gegenseitig. Goldene Felder zeigen passende Plätze.');
  }

  async function onCellClick(x, y) {
    if (!state.pendingType) {
      const building = buildingAt(x, y);
      if (building) {
        const index = pond().buildings.indexOf(building);
        state.movingIndex = index;
        state.pendingType = building.type;
        UI.$('cancelBuildBtn').hidden = false;
        UI.setText('pondBuildStatus', `${E.BUILDINGS[building.type].name} verschieben: wähle ein neues Feld.`);
        renderBuildChoices();
        renderGrid();
      } else if (isCore(x, y)) {
        UI.setText('pondBuildStatus', 'Der Teichkern bleibt, wo er ist – er ist dein Lager.');
      }
      return;
    }
    const data = pond();
    const others = data.buildings.filter((_, index) => index !== state.movingIndex);
    const error = E.placementError(others, data.resources, state.pendingType, x, y, state.movingIndex !== null);
    if (error) {
      UI.setText('pondBuildStatus', errorText(error));
      return;
    }
    const moving = state.movingIndex !== null;
    const type = state.pendingType;
    resetSelection();
    await send({ action: moving ? 'move' : 'place', type, x, y },
      moving ? `${E.BUILDINGS[type].name} verschoben.` : `${E.BUILDINGS[type].name} gebaut.`);
  }

  function errorText(code) {
    const messages = {
      core_collision: 'Der Teichkern in der Mitte bleibt frei.',
      building_collision: 'Hier steht schon ein Gebäude.',
      building_exists: 'Dieses Gebäude hast du schon – du kannst es verschieben.',
      invalid_building: 'Das Gebäude passt nicht auf dieses Feld.',
      insufficient_resources: 'Dafür fehlen dir noch Ressourcen.',
      troop_capacity: 'Im Lager sind nur 20 Plätze.',
    };
    return messages[code] || 'Das geht gerade nicht.';
  }

  // ---------- Wachstumskarte ----------

  function renderUnlocks() {
    const data = pond();
    const grid = UI.$('unlockGrid');
    grid.innerHTML = E.UNLOCKS.map(item => {
      const owned = data.unlocked.includes(item.id);
      const affordable = E.canAfford(data.resources, item.cost);
      return `<article class="unlock-item${owned ? ' owned' : ''}">
        <span class="unlock-symbol">${item.symbol}</span>
        <div>
          <b>${item.name}</b>
          <small>${item.copy}</small>
          <div class="unlock-costs">${owned ? '<span class="unlock-done">eingezogen</span>' : UI.costLine(item.cost, data.resources)}</div>
        </div>
        ${owned ? '' : `<button class="unlock-action" type="button" data-unlock="${item.id}" ${affordable ? '' : 'disabled'}>Einladen</button>`}
      </article>`;
    }).join('');
    grid.querySelectorAll('button[data-unlock]').forEach(node => {
      node.addEventListener('click', () => unlock(node.dataset.unlock));
    });

    const discovered = data.unlocked.length;
    UI.setText('pondResidentCount', `${discovered} / ${E.UNLOCKS.length}`);
    UI.setText('pondProgressLabel', discovered >= E.UNLOCKS.length
      ? 'Dein Teich ist vollständig' : discovered > 3 ? 'Der Teich lebt auf' : 'Der Teich ist noch jung');
    UI.setHtml('pondResidents', data.unlocked.map(id => {
      const item = E.UNLOCKS.find(entry => entry.id === id);
      return item ? `<span class="resident-chip">${item.symbol} ${item.name}</span>` : '';
    }).join(''));
  }

  async function unlock(unlockId) {
    const item = E.UNLOCKS.find(entry => entry.id === unlockId);
    const result = await send({ action: 'unlock', unlockId }, `${item ? item.name : 'Neuer Bewohner'} zieht ein.`);
    if (result) {
      const status = UI.$('pondUnlockStatus');
      if (status && item) status.textContent = `${item.name} ist eingezogen.`;
    }
  }

  async function claim() {
    const pending = pendingNow();
    if (pending.total <= 0) { UI.toast('Noch nichts zum Abholen.', 'info'); return; }
    const result = await send({ action: 'claim' });
    if (result?.result) UI.toast(`Abgeholt: ${UI.number(result.result.total)}`, 'good');
  }

  // ---------- Truppenlager ----------

  function renderCamp() {
    const data = pond();
    const used = data.troopHousing;
    const bar = UI.$('campBar');
    bar.style.width = `${Math.min(100, (used / data.troopCapacity) * 100)}%`;
    UI.setText('campMeterText', `${used} / ${data.troopCapacity} Plätze`);

    const list = UI.$('troopList');
    list.innerHTML = E.TROOP_TYPES.map(type => {
      const troop = E.TROOPS[type];
      const owned = data.troops[type] || 0;
      const free = Math.floor((data.troopCapacity - used) / troop.housing);
      return `<article class="troop-card">
        <span class="troop-mark">${UI.UNIT_ART[type]}</span>
        <div class="troop-body">
          <b>${troop.name} <span class="troop-count">× ${owned}</span></b>
          <small>${troop.copy}</small>
          <div class="troop-stats">
            <span>${troop.hp} HP</span><span>${troop.damage} Schaden</span>
            <span>Reichweite ${troop.range}</span><span>${troop.housing} ${troop.housing === 1 ? 'Platz' : 'Plätze'}</span>
          </div>
          <div class="unlock-costs">${UI.costLine(troop.cost, data.resources)}</div>
        </div>
        <div class="troop-actions">
          <button class="ghost-btn small" type="button" data-train="${type}" data-count="1" ${free < 1 ? 'disabled' : ''}>+1</button>
          <button class="ghost-btn small" type="button" data-train="${type}" data-count="5" ${free < 5 ? 'disabled' : ''}>+5</button>
        </div>
      </article>`;
    }).join('');
    list.querySelectorAll('button[data-train]').forEach(node => {
      node.addEventListener('click', () => train(node.dataset.train, Number(node.dataset.count)));
    });
  }

  async function train(unitType, count, retry = true) {
    busy(true);
    try {
      const snapshot = await api.trainTroops({ unitType, count, revision: pond().revision });
      store().applyPond(snapshot);
      UI.setText('campStatus', `${count} × ${E.TROOPS[unitType].name} ausgebildet.`);
    } catch (error) {
      if (error.code === 'revision_conflict' && error.details?.snapshot) {
        store().applyPond(error.details.snapshot);
        if (retry) { busy(false); return train(unitType, count, false); }
      }
      UI.setText('campStatus', error.code === 'insufficient_resources'
        ? `Für ${count} × ${E.TROOPS[unitType].name} fehlen dir ${missingText(unitType, count)}.`
        : error.message);
    } finally {
      busy(false);
      renderCamp();
      renderResources();
    }
    return undefined;
  }

  function missingText(unitType, count) {
    const cost = E.trainCost(unitType, count) || {};
    const data = pond();
    const missing = E.RESOURCES.filter(key => (cost[key] || 0) > (data.resources[key] || 0))
      .map(key => `${UI.number(cost[key] - data.resources[key])} ${UI.RESOURCE_META[key].icon}`);
    return missing.join(' und ') || 'Ressourcen';
  }

  // ---------- Gesamtansicht ----------

  function renderHub() {
    if (!store().pond) return;
    renderScene();
    renderResources();
    renderLeague();
    renderBuildChoices();
    renderGrid();
    renderUnlocks();
  }

  function init() {
    UI.$('cancelBuildBtn').addEventListener('click', resetSelection);
    UI.$('claimProductionBtn').addEventListener('click', claim);
    setInterval(() => {
      if (UI.currentScreen() === 'screenPond' && store().pond) renderResources();
    }, 15000);
  }

  root.PwndPond = { init, renderHub, renderCamp, resetSelection, errorText };
})(window);
