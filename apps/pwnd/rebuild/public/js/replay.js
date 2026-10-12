// Replay-Spieler: zeichnet die vom Server gelieferten Frames Tick für Tick auf das 10×10-Raster.
// Die Frames kommen aus der geteilten Kampf-Engine, der Client erfindet nichts dazu.
(function (root) {
  'use strict';

  const UI = root.PwndUI;
  const B = root.PwndBattle;

  const TICK_MS = 160;
  const state = { timer: null, frames: [], layout: [], index: 0, nodes: [], onDone: null, unitTypes: [] };

  function stop() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

  function prepare(container, layout) {
    state.nodes = UI.buildBoard(container);
    state.nodes.forEach(node => { node.disabled = true; });
    state.layout = layout;
    layout.forEach(building => {
      UI.paintBuilding(state.nodes, building, { title: building.type });
      for (let dy = 0; dy < 2; dy += 1) {
        for (let dx = 0; dx < 2; dx += 1) {
          const node = state.nodes[UI.cellIndex(building.x + dx, building.y + dy)];
          if (node) node.dataset.building = String(building.id);
        }
      }
    });
  }

  function clearUnits() {
    state.nodes.forEach(node => {
      node.classList.remove('cell-unit', 'cell-hit');
      const mark = node.querySelector('.unit-mark');
      if (mark) mark.remove();
    });
  }

  function drawFrame(frame) {
    clearUnits();
    for (const [unitId, x, y] of frame.u) {
      const node = state.nodes[UI.cellIndex(x, y)];
      if (!node) continue;
      node.classList.add('cell-unit');
      // Die Einheiten-Id ist der Index in der Aufstellung.
      const type = state.unitTypes[unitId] || B.UNIT_ORDER[0];
      const mark = document.createElement('span');
      mark.className = 'unit-mark';
      mark.textContent = UI.UNIT_ART[type] || '•';
      node.appendChild(mark);
    }
    state.layout.forEach((building, index) => {
      const hp = frame.b[index];
      const ratio = building.maxHp ? Math.max(0, hp) / building.maxHp : 0;
      for (let dy = 0; dy < 2; dy += 1) {
        for (let dx = 0; dx < 2; dx += 1) {
          const node = state.nodes[UI.cellIndex(building.x + dx, building.y + dy)];
          if (!node) continue;
          node.classList.toggle('cell-destroyed', hp <= 0);
          node.style.setProperty('--hp', ratio.toFixed(2));
        }
      }
    });
    for (const event of frame.e || []) {
      if (event[0] === 'a' || event[0] === 'f') {
        const buildingId = event[0] === 'a' ? event[2] : event[1];
        const building = state.layout.find(item => item.id === buildingId);
        if (building) {
          const node = state.nodes[UI.cellIndex(building.x, building.y)];
          if (node) { node.classList.add('cell-hit'); setTimeout(() => node.classList.remove('cell-hit'), TICK_MS); }
        }
      }
    }
    const maxTotal = state.layout.reduce((sum, building) => sum + building.maxHp, 0) || 1;
    const left = frame.b.reduce((sum, hp) => sum + Math.max(0, hp), 0);
    UI.setText('replayTick', String(frame.t));
    UI.setText('replayDestruction', `${Math.round(((maxTotal - left) / maxTotal) * 100)} %`);
    UI.setText('replayUnits', String(frame.u.length));
  }

  function play({ container, layout, frames, deployment, onDone }) {
    stop();
    state.frames = frames || [];
    state.index = 0;
    state.onDone = onDone || null;
    state.unitTypes = (deployment || []).map(entry => entry.unit);
    prepare(container, (layout || []).map(item => ({ ...item, maxHp: item.maxHp || B.BUILDING_STATS[item.type]?.hp || 400 })));
    if (!state.frames.length) { if (state.onDone) state.onDone(); return; }
    state.timer = setInterval(() => {
      if (state.index >= state.frames.length) {
        stop();
        if (state.onDone) state.onDone();
        return;
      }
      drawFrame(state.frames[state.index]);
      state.index += 1;
    }, TICK_MS);
  }

  function skip() {
    stop();
    if (state.frames.length) drawFrame(state.frames[state.frames.length - 1]);
    if (state.onDone) state.onDone();
  }

  root.PwndReplay = { play, skip, stop };
})(window);
