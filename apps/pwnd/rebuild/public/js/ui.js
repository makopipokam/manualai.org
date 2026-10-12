// Shared view helpers: screen switching, formatting and the small building blocks
// that pond, quiz and strategy screens reuse.
(function (root) {
  'use strict';

  const E = root.PwndEconomy;

  const RESOURCE_META = Object.freeze({
    energy: { label: 'ENERGIE', symbol: 'ϟ', icon: '⚡', hint: 'Entscheidungskraft', css: 'energy-resource' },
    water: { label: 'WASSER', symbol: '≈', icon: '💧', hint: 'Wachstum im Teich', css: 'water-resource' },
    air: { label: 'LUFT', symbol: '⌁', icon: '🌬️', hint: 'Raum für Bewegung', css: 'air-resource' },
    love: { label: 'LIEBE', symbol: '♥', icon: '❤️', hint: 'Bindung und Vertrauen', css: 'love-resource' },
    honey: { label: 'HONIG', symbol: '⬢', icon: '🍯', hint: 'Vorrat für Truppen', css: 'honey-resource' },
  });

  const BUILDING_ART = Object.freeze({
    core: '◆', solar_lily: '☀', spring_pool: '✦', reed_windmill: '✺', bee_meadow: '⬢', heron_watch: '⛉',
  });

  const UNIT_ART = Object.freeze({ frog: '🐸', dragonfly: '✦', beaver: '🦫' });

  const screens = new Map();
  let activeScreen = null;

  function $(id) { return document.getElementById(id); }

  function registerScreens() {
    document.querySelectorAll('.screen').forEach(node => screens.set(node.id, node));
  }

  function showScreen(id) {
    if (!screens.size) registerScreens();
    screens.forEach((node, key) => {
      const active = key === id;
      node.classList.toggle('active', active);
      node.hidden = !active;
    });
    activeScreen = id;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function currentScreen() { return activeScreen; }

  function number(value) { return Math.round(Number(value) || 0).toLocaleString('de-DE'); }

  function signed(value) {
    const rounded = Math.round(Number(value) || 0);
    return rounded > 0 ? `+${number(rounded)}` : number(rounded);
  }

  function percent(value) { return `${Math.round((Number(value) || 0) * 100)} %`; }

  function seconds(ms) { return `${(Math.max(0, Number(ms) || 0) / 1000).toFixed(1)} s`; }

  function relativeTime(ms) {
    const diff = Date.now() - Number(ms || 0);
    if (diff < 60000) return 'gerade eben';
    if (diff < 3600000) return `vor ${Math.round(diff / 60000)} min`;
    if (diff < 86400000) return `vor ${Math.round(diff / 3600000)} h`;
    return `vor ${Math.round(diff / 86400000)} d`;
  }

  function untilTime(ms) {
    const diff = Number(ms || 0) - Date.now();
    if (diff <= 0) return 'abgelaufen';
    if (diff < 3600000) return `noch ${Math.max(1, Math.round(diff / 60000))} min`;
    return `noch ${Math.round(diff / 3600000)} h`;
  }

  // Cost lines like "120 ⚡ · 80 💧 · 10 ❤️" – only resources that actually cost something.
  function costLine(cost, resources) {
    return E.RESOURCES.filter(key => Number(cost?.[key]) > 0).map(key => {
      const amount = Number(cost[key]);
      const short = resources && Number(resources[key]) < amount;
      return `<span class="cost-item${short ? ' cost-short' : ''}">${number(amount)} ${RESOURCE_META[key].icon}</span>`;
    }).join('<i class="cost-dot">·</i>');
  }

  function resourceLine(amounts, { onlyPositive = true } = {}) {
    const parts = E.RESOURCES.filter(key => !onlyPositive || Number(amounts?.[key]) > 0)
      .map(key => `<span class="loot-item">${signed(amounts[key])} ${RESOURCE_META[key].icon}</span>`);
    return parts.length ? parts.join('<i class="cost-dot">·</i>') : '<span class="loot-item">nichts</span>';
  }

  function renderResourceCards(container, resources, pending) {
    container.innerHTML = E.RESOURCES.map(key => {
      const meta = RESOURCE_META[key];
      const extra = pending && pending[key] ? `<em class="resource-pending">+${number(pending[key])} wartet</em>` : '';
      return `<div class="resource-card ${meta.css}">
        <div><small>${meta.label}</small><strong id="res-${key}">${number(resources[key])}</strong><span>${meta.hint}</span>${extra}</div>
        <div class="resource-symbol">${meta.symbol}</div>
      </div>`;
    }).join('');
  }

  // 10×10 board used by the hub, the deployment screen and the replay.
  // `decorate` is either a function (x, y) => ({ className, html }) or an options object.
  function buildBoard(container, decorate) {
    const cells = typeof decorate === 'function'
      ? decorate
      : (decorate && typeof decorate.cells === 'function' ? decorate.cells : () => ({}));
    const nodes = [];
    container.innerHTML = '';
    for (let y = 0; y < E.GRID_SIZE; y += 1) {
      for (let x = 0; x < E.GRID_SIZE; x += 1) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'grid-cell';
        cell.dataset.x = String(x);
        cell.dataset.y = String(y);
        cell.setAttribute('aria-label', `Feld ${x + 1}, ${y + 1}`);
        const extra = cells(x, y) || {};
        if (extra.className) cell.className += ` ${extra.className}`;
        if (extra.html) cell.innerHTML = extra.html;
        container.appendChild(cell);
        nodes.push(cell);
      }
    }
    return nodes;
  }

  function cellIndex(x, y) { return y * E.GRID_SIZE + x; }

  // Paints a building footprint (always 2×2) onto an existing board.
  function paintBuilding(nodes, building, { className = '', symbol = null, title = '' } = {}) {
    const art = symbol || BUILDING_ART[building.type] || '◼';
    for (let dy = 0; dy < 2; dy += 1) {
      for (let dx = 0; dx < 2; dx += 1) {
        const node = nodes[cellIndex(building.x + dx, building.y + dy)];
        if (!node) continue;
        node.classList.add('cell-building', `cell-${building.type}`);
        if (className) node.classList.add(className);
        if (dx === 0 && dy === 0) {
          node.innerHTML = `<span class="building-mark">${art}</span>`;
          if (title) node.title = title;
        }
      }
    }
  }

  function toast(message, tone = 'info') {
    const node = $('pondSceneToast');
    if (!node) return;
    node.textContent = message;
    node.dataset.tone = tone;
    node.classList.add('visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('visible'), 2600);
  }

  function warn(message) {
    const node = $('saveWarning');
    if (!node) return;
    if (!message) { node.hidden = true; node.textContent = ''; return; }
    node.hidden = false;
    node.textContent = message;
    clearTimeout(warn.timer);
    warn.timer = setTimeout(() => { node.hidden = true; }, 6000);
  }

  function setText(id, value) { const node = $(id); if (node) node.textContent = value; }
  function setHtml(id, value) { const node = $(id); if (node) node.innerHTML = value; }

  root.PwndUI = {
    $, RESOURCE_META, BUILDING_ART, UNIT_ART,
    showScreen, currentScreen, registerScreens,
    number, signed, percent, seconds, relativeTime, untilTime,
    costLine, resourceLine, renderResourceCards,
    buildBoard, cellIndex, paintBuilding,
    toast, warn, setText, setHtml,
  };
})(window);
