(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const DEMO = window.PwndPondDemo;
  const CONFIG = window.PWND_SUPABASE;
  if (!window.supabase || !DEMO || !CONFIG) {
    document.getElementById('loading').textContent = 'Der Online-Teich kann gerade nicht geladen werden. Bitte versuche es später erneut.';
    return;
  }
  const client = window.supabase.createClient(CONFIG.url, CONFIG.publishableKey);
  const icons = { energy: '⚡', water: '💧', air: '🌬️', love: '❤️' };
  const elementIds = { energy: 'onlineEnergy', water: 'onlineWater', air: 'onlineAir', love: 'onlineLove' };
  const sceneIds = { solar_lily: 'onlineSolar', spring_pool: 'onlineSpring', reed_windmill: 'onlineReed' };
  let pond = null;
  let choice = null;
  let pendingAction = false;
  let requestVersion = 0;
  let activeUserId = null;

  function status(message) { $('onlineStatus').textContent = message; }
  function showAuth(message = '') {
    requestVersion += 1;
    pendingAction = false;
    pond = null;
    choice = null;
    activeUserId = null;
    $('codeForm').hidden = true;
    $('codeInput').value = '';
    $('emailInput').value = '';
    $('loading').hidden = true;
    $('pondView').hidden = true;
    $('authView').hidden = false;
    $('authStatus').textContent = message;
  }
  function readableError(error) {
    if (!navigator.onLine || error?.message?.includes('fetch')) return 'Keine Verbindung. Dein Server-Spielstand wurde nicht verändert.';
    return ({ auth_required: 'Deine Anmeldung ist abgelaufen. Melde dich bitte erneut an.',
      revision_conflict: 'Der Teich wurde in einem anderen Tab geändert. Der neueste Stand wird geladen.',
      insufficient_resources: 'Dafür fehlen Ressourcen.', building_collision: 'Hier steht schon ein Gebäude.',
      core_collision: 'Der Teichkern muss frei bleiben.', building_exists: 'Dieses Gebäude steht schon im Teich.',
      building_missing: 'Dieses Gebäude fehlt im Teich.', invalid_building: 'Dieser Bauplatz ist nicht zulässig.' })[error?.message]
      || 'Der Server konnte diese Aktion nicht abschließen. Bitte versuche es erneut.';
  }
  async function loadPond(quiet = false) {
    if (pendingAction || !navigator.onLine) return;
    const currentRequest = ++requestVersion;
    try {
      const { data, error } = await client.rpc('pwnd_get_pond');
      if (currentRequest !== requestVersion || pendingAction) return;
      if (error) throw error;
      if (!data?.resources || !Array.isArray(data.buildings)) throw new Error('invalid_pond_response');
      pond = data;
      $('loading').hidden = true;
      $('authView').hidden = true;
      $('pondView').hidden = false;
      render();
      if (!quiet) status('Dein Teich ist sicher gespeichert. Wähle ein Gebäude und einen Bauplatz.');
    } catch (error) {
      if (currentRequest !== requestVersion) return;
      if (error?.message === 'auth_required' || error?.code === 'PGRST301') showAuth(readableError(error));
      else if (pond) status(readableError(error));
      else showAuth('Der Online-Teich ist momentan nicht erreichbar. Bitte melde dich erneut an oder probiere es später.');
    }
  }
  function render() {
    if (!pond) return;
    Object.entries(elementIds).forEach(([key, id]) => { $(id).textContent = String(pond.resources[key]); });
    const buildings = pond.buildings.filter(item => DEMO.BUILDINGS[item.type]);
    const rates = DEMO.productionRates(buildings);
    const bonuses = DEMO.activeBonuses(buildings);
    const active = bonuses.length
      ? `Aktiv: ${bonuses.map(bonus => `${bonus.label} +${bonus.perHour} ${icons[bonus.resource]}/h`).join(' · ')}`
      : '☀ + 💧: +300 ⚡/h bis 2 Felder. ✺ + 💧: +120 🌬️/h bis 3 Felder.';
    $('onlineBonus').textContent = active;
    $('onlineBonus').dataset.baseline = active;
    Object.entries(sceneIds).forEach(([type, id]) => {
      const building = buildings.find(item => item.type === type);
      const element = $(id);
      element.classList.toggle('visible', Boolean(building));
      if (building) {
        element.style.left = `${12 + building.x * 8}%`;
        element.style.top = `${10 + building.y * 7}%`;
      }
    });
    $('onlineChoices').innerHTML = Object.values(DEMO.BUILDINGS).map(spec => {
      const owned = buildings.some(item => item.type === spec.type);
      const affordable = DEMO.canAfford(pond.resources, spec.type);
      const selected = choice === spec.type;
      const cost = DEMO.RESOURCES.map(resource => `<span class="unlock-cost"><span aria-hidden="true">${icons[resource]}</span>${spec.cost[resource]}</span>`).join('');
      return `<button class="build-choice${owned ? ' built' : ''}${selected ? ' selected' : ''}" type="button" data-building="${spec.type}" aria-pressed="${selected}" ${pendingAction || (!owned && !affordable) ? 'disabled' : ''}>
        <span class="building-mark ${spec.type}" aria-hidden="true">${spec.symbol}</span><span class="building-detail"><b>${spec.name}</b>
        <span>+${rates[spec.type] || spec.perHour} ${icons[spec.resource]}/h</span>
        <small>${owned ? 'Gebaut · kostenlos umsetzen' : `<span class="unlock-costs">${cost}</span>`}</small></span>
        <strong aria-hidden="true">${selected ? '✓' : owned ? '↗' : '→'}</strong></button>`;
    }).join('');
    $('cancelChoiceBtn').hidden = !choice;
    const selected = DEMO.BUILDINGS[choice];
    $('onlineGrid').innerHTML = Array.from({ length: 100 }, (_, index) => {
      const x = index % 10;
      const y = Math.floor(index / 10);
      const core = x >= 4 && x <= 5 && y >= 4 && y <= 5;
      const found = buildings.find(item => x >= item.x && x < item.x + 2 && y >= item.y && y < item.y + 2);
      const own = found && DEMO.BUILDINGS[found.type];
      const isMove = buildings.some(item => item.type === choice);
      const allowed = !pendingAction && selected && DEMO.canPlace(buildings, pond.resources, choice, x, y, isMove);
      const previews = allowed ? DEMO.activeBonuses([
        ...buildings.filter(item => item.type !== choice), { type: choice, x, y },
      ]).filter(bonus => bonus.first === choice || bonus.second === choice) : [];
      const boosted = previews.length > 0;
      const bonusText = previews.map(bonus => `${bonus.label}: +${bonus.perHour} ${icons[bonus.resource]}/h`).join(' · ');
      const label = own ? `${own.name} auf Feld ${x + 1}, ${y + 1}` : core ? `Teichkern auf Feld ${x + 1}, ${y + 1}`
        : allowed ? `${selected.name} ab Feld ${x + 1}, ${y + 1} ${isMove ? 'umsetzen' : 'bauen'}${boosted ? `; ${bonusText}` : ''}`
          : `Wasserfeld ${x + 1}, ${y + 1}`;
      return `<button class="build-cell${core ? ' core' : ''}${own ? ` ${own.type}` : ''}${own && x === found.x && y === found.y ? ' building-head' : ''}${allowed ? ' allowed' : ''}${boosted ? ' boosted' : ''}"
        type="button" data-x="${x}" data-y="${y}" data-bonus="${bonusText}" aria-label="${label}" ${allowed ? '' : 'disabled'}>${core && x === 4 && y === 4 ? '◆' : own && x === found.x && y === found.y ? own.symbol : allowed ? boosted ? '✦' : '+' : ''}</button>`;
    }).join('');
    const pending = buildings.map(building => {
      const spec = DEMO.BUILDINGS[building.type];
      return { resource: spec.resource, count: Math.max(0, Math.min(Number(building.bank) || 0, 2000 - pond.resources[spec.resource])) };
    });
    const canClaim = pending.some(item => item.count > 0);
    $('onlineClaimBtn').hidden = buildings.length === 0;
    $('onlineClaimBtn').disabled = !canClaim || pendingAction;
    $('onlinePending').textContent = pending.map(item => `+${item.count} ${icons[item.resource]}`).join(' · ');
  }
  async function action(kind, type = null, x = null, y = null) {
    if (!pond || pendingAction) return;
    const currentAction = ++requestVersion;
    const previousRevision = pond.revision;
    pendingAction = true;
    status('Der Server speichert deine Aktion …');
    render();
    try {
      const { data, error } = await client.rpc('pwnd_pond_action', {
        p_kind: kind, p_type: type, p_x: x, p_y: y, p_revision: previousRevision,
      });
      if (currentAction !== requestVersion) return;
      if (error) throw error;
      pond = data;
      choice = null;
      status(kind === 'claim' ? 'Ressourcen abgeholt und gespeichert.' :
        `${DEMO.BUILDINGS[type].name} ${kind === 'move' ? 'umgesetzt' : 'gebaut'} und gespeichert.`);
    } catch (error) {
      if (currentAction !== requestVersion) return;
      status(readableError(error));
      if (error?.message === 'revision_conflict') {
        pendingAction = false;
        await loadPond(true);
        status('Der Teich wurde in einem anderen Tab geändert. Hier ist der aktuelle Stand.');
      }
    } finally {
      pendingAction = false;
      render();
    }
  }
  $('onlineChoices').addEventListener('click', event => {
    const button = event.target.closest('[data-building]');
    if (!button || !pond || pendingAction) return;
    choice = choice === button.dataset.building ? null : button.dataset.building;
    render();
    if (choice) $('onlineGrid').querySelector('.build-cell.allowed')?.focus();
  });
  $('cancelChoiceBtn').addEventListener('click', () => { choice = null; render(); $('onlineBuildTitle').focus(); });
  $('onlineGrid').addEventListener('click', event => {
    const button = event.target.closest('.build-cell.allowed');
    if (!button || !pond || !choice) return;
    const kind = pond.buildings.some(item => item.type === choice) ? 'move' : 'place';
    action(kind, choice, Number(button.dataset.x), Number(button.dataset.y));
  });
  $('onlineGrid').addEventListener('mouseover', event => {
    const button = event.target.closest('.build-cell.allowed');
    if (button) $('onlineBonus').textContent = button.dataset.bonus || $('onlineBonus').dataset.baseline;
  });
  $('onlineGrid').addEventListener('focusin', event => {
    const button = event.target.closest('.build-cell.allowed');
    if (button) $('onlineBonus').textContent = button.dataset.bonus || $('onlineBonus').dataset.baseline;
  });
  $('onlineGrid').addEventListener('mouseleave', () => { $('onlineBonus').textContent = $('onlineBonus').dataset.baseline; });
  $('onlineClaimBtn').addEventListener('click', () => action('claim'));
  $('emailForm').addEventListener('submit', async event => {
    event.preventDefault();
    const email = $('emailInput').value.trim();
    $('sendCodeBtn').disabled = true;
    $('authStatus').textContent = 'Anmeldecode wird gesendet …';
    try {
      const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + '/pwnd/online.html' } });
      if (error) throw error;
      $('codeForm').hidden = false;
      $('authStatus').textContent = 'Gib den Code aus deiner E-Mail ein.';
      $('codeInput').focus();
    } catch (error) {
      $('authStatus').textContent = readableError(error);
    } finally {
      $('sendCodeBtn').disabled = false;
    }
  });
  $('codeForm').addEventListener('submit', async event => {
    event.preventDefault();
    $('verifyCodeBtn').disabled = true;
    $('authStatus').textContent = 'Code wird geprüft …';
    try {
      const { error } = await client.auth.verifyOtp({
        email: $('emailInput').value.trim(), token: $('codeInput').value.trim(), type: 'email',
      });
      if (error) throw error;
      await loadPond();
    } catch (error) {
      $('authStatus').textContent = readableError(error);
    } finally { $('verifyCodeBtn').disabled = false; }
  });
  $('logoutBtn').addEventListener('click', async () => {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) status(readableError(error));
    else showAuth('Du bist abgemeldet – auch bei anderen manualAI-Apps auf diesem Gerät.');
  });
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') showAuth();
    if (event === 'SIGNED_IN') {
      if (session?.user?.id && activeUserId !== session.user.id) {
        requestVersion += 1;
        pendingAction = false;
        pond = null;
        choice = null;
        activeUserId = session.user.id;
        $('pondView').hidden = true;
      }
      setTimeout(() => loadPond(), 0);
    }
  });
  async function boot() {
    const bootVersion = requestVersion;
    try {
      const { data: { user }, error } = await client.auth.getUser();
      if (bootVersion !== requestVersion) return;
      if (error || !user) showAuth();
      else {
        if (activeUserId !== user.id) requestVersion += 1;
        activeUserId = user.id;
        await loadPond();
      }
    } catch { showAuth('Anmeldung momentan nicht erreichbar. Bitte versuche es später erneut.'); }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && pond && !pendingAction) loadPond(true); });
  setInterval(() => { if (!document.hidden && pond && !pendingAction) loadPond(true); }, 30000);
  boot();
})();
