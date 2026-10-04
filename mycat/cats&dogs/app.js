(() => {
  'use strict';

  const SUPABASE_URL = 'https://raqoawgvthttcjoihqii.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6KjHprkZSX2zRMisxubJfQ_M3S6uqBv';
  const TABLE = 'mycat_dating_profiles';
  const CONSENT_VERSION = 'genotype-profile-v1-2026-10-04';
  const GENOTYPES = ['XX', 'XY', 'X0', 'XXY', 'XYY', 'XXX'];
  const app = document.getElementById('dating-app');

  let client;
  let user = null;
  let savedProfile = null;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function setStatus(message, kind = '') {
    const status = document.getElementById('form-status');
    if (!status) return;
    status.textContent = message;
    status.dataset.kind = kind;
  }

  function setBusy(button, busy, label) {
    if (!button) return;
    button.disabled = busy;
    if (label) button.textContent = label;
  }

  function readMyCatResult() {
    try {
      const state = JSON.parse(localStorage.getItem('mycat_appState') || 'null');
      const result = state?.lastResult;
      const catIds = Array.isArray(result?.catIds)
        ? [...new Set(result.catIds.filter(id => Number.isSafeInteger(id) && id > 0))].slice(0, 18)
        : [];
      if (!catIds.length) return null;

      const matchScores = {};
      for (const id of catIds) {
        const score = Number(result?.matchScores?.[id]);
        if (Number.isFinite(score) && score >= 0 && score <= 100) matchScores[id] = score;
      }
      const userPersonality = {};
      for (const key of ['O', 'C', 'E', 'A', 'N']) {
        const score = Number(result?.userPersonality?.[key]);
        if (Number.isFinite(score) && score >= 0 && score <= 5) userPersonality[key] = score;
      }
      const completedAt = typeof result.completedAt === 'string' && !Number.isNaN(Date.parse(result.completedAt))
        ? new Date(result.completedAt).toISOString()
        : null;

      // Do not upload raw questionnaire answers, favorites, or arbitrary localStorage fields.
      return {
        scoringVersion: typeof result.scoringVersion === 'string' ? result.scoringVersion.slice(0, 40) : null,
        catIds,
        matchScores,
        userPersonality,
        completedAt
      };
    } catch {
      return null;
    }
  }

  function renderSignIn(message = '') {
    app.setAttribute('aria-busy', 'false');
    app.innerHTML = `
      <p class="dating-kicker">Privates Dating-Profil</p>
      <h2>Mit E-Mail anmelden</h2>
      <p class="lead">Dein Genotyp wird nur in deinem persönlichen Profil gespeichert. Dafür brauchst du ein Konto; ein Passwort ist nicht nötig.</p>
      <form id="email-form" novalidate>
        <label class="form-field" for="email-address">E-Mail-Adresse
          <input id="email-address" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="254" placeholder="du@beispiel.de">
        </label>
        <div class="button-row">
          <button class="primary-button" id="send-code" type="submit">Anmeldecode senden <span aria-hidden="true">→</span></button>
        </div>
      </form>
      <form id="verify-form" hidden novalidate>
        <label class="form-field" for="email-code">Code aus der E-Mail
          <input id="email-code" name="token" type="text" inputmode="numeric" autocomplete="one-time-code" required maxlength="8" placeholder="8-stelliger Code">
        </label>
        <button class="primary-button" id="verify-code" type="submit">Code bestätigen</button>
      </form>
      <p id="form-status" class="status-message" role="status" aria-live="polite">${escapeHtml(message)}</p>
      <p class="matching-pending">Die Partnersuche ist noch nicht aktiv. Die Matching-Regeln werden separat festgelegt.</p>
    `;

    let pendingEmail = '';
    document.getElementById('email-form').addEventListener('submit', async event => {
      event.preventDefault();
      const email = document.getElementById('email-address').value.trim();
      const button = document.getElementById('send-code');
      if (!email) return setStatus('Bitte gib eine gültige E-Mail-Adresse ein.', 'error');
      setBusy(button, true, 'Code wird gesendet …');
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href }
      });
      setBusy(button, false, 'Anmeldecode senden →');
      if (error) return setStatus('Der Code konnte nicht gesendet werden. Bitte versuche es später erneut.', 'error');
      pendingEmail = email;
      document.getElementById('verify-form').hidden = false;
      document.getElementById('email-code').focus();
      setStatus('Der Code wurde an deine E-Mail gesendet. Gib ihn hier ein.');
    });

    document.getElementById('verify-form').addEventListener('submit', async event => {
      event.preventDefault();
      const token = document.getElementById('email-code').value.trim();
      const button = document.getElementById('verify-code');
      if (!/^\d{6,8}$/.test(token) || !pendingEmail) return setStatus('Bitte gib den Code aus deiner E-Mail ein.', 'error');
      setBusy(button, true, 'Code wird geprüft …');
      const { data, error } = await client.auth.verifyOtp({ email: pendingEmail, token, type: 'email' });
      setBusy(button, false, 'Code bestätigen');
      if (error) return setStatus('Der Code ist ungültig oder abgelaufen. Bitte prüfe die E-Mail und versuche es erneut.', 'error');
      user = data.user;
      await loadProfile();
    });
  }

  async function loadProfile() {
    app.setAttribute('aria-busy', 'true');
    app.innerHTML = '<p class="loading-message">Privates Profil wird geladen …</p>';
    const { data, error } = await client
      .from(TABLE)
      .select('genotype,mycat_result,mycat_result_consent_at,genotype_consent_version,updated_at')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) {
      console.error('Could not load the private dating profile:', error);
      app.setAttribute('aria-busy', 'false');
      app.innerHTML = `<p class="dating-kicker">Profil gerade nicht erreichbar</p><h2>Bitte später erneut versuchen</h2><p class="lead">Dein gespeichertes Profil wurde nicht verändert. Prüfe deine Verbindung und lade die Seite erneut.</p><button class="secondary-button" id="reload-profile" type="button">Erneut laden</button>`;
      document.getElementById('reload-profile').addEventListener('click', loadProfile);
      return;
    }
    savedProfile = data || null;
    renderProfile();
  }

  function renderProfile(message = '') {
    const localResult = readMyCatResult();
    const remoteResult = savedProfile?.mycat_result || null;
    const canKeepMyCat = Boolean(localResult || remoteResult);
    const previousConsent = savedProfile?.genotype_consent_version === CONSENT_VERSION;
    const resultCount = localResult?.catIds.length || remoteResult?.catIds?.length || 0;
    const resultDate = localResult?.completedAt
      ? new Date(localResult.completedAt).toLocaleDateString('de-DE')
      : '';

    app.setAttribute('aria-busy', 'false');
    app.innerHTML = `
      <p class="dating-kicker">Dein Profil</p>
      <h2>Was soll in deinem Profil stehen?</h2>
      <p class="lead">Wähle den Genotyp, den du in deinem privaten Profil angeben möchtest. Er wird derzeit nicht zur Auswahl oder Bewertung von Matches verwendet.</p>
      <div class="dating-account"><span>Angemeldet als <strong>${escapeHtml(user.email || 'dein Konto')}</strong></span><button id="sign-out" type="button">Abmelden</button></div>
      ${savedProfile ? `<p class="profile-saved">Profil gespeichert${savedProfile.updated_at ? ` · aktualisiert ${escapeHtml(new Date(savedProfile.updated_at).toLocaleString('de-DE'))}` : ''}.</p>` : ''}
      <form id="profile-form">
        <fieldset class="dating-fieldset">
          <legend>Dein Genotyp</legend>
          <p class="field-help">Bitte wähle eine Angabe. Es findet keine automatische Zuordnung zu Geschlecht oder Matching-Rolle statt.</p>
          <div class="genotype-grid">
            ${GENOTYPES.map(value => `<label class="genotype-option"><input type="radio" name="genotype" value="${value}" ${savedProfile?.genotype === value ? 'checked' : ''} required><span>${value}</span></label>`).join('')}
          </div>
        </fieldset>
        <label class="consent-box" for="genotype-consent">
          <input id="genotype-consent" type="checkbox" ${previousConsent ? 'checked' : ''} required>
          <span><strong>Speicherung bestätigen.</strong> Ich möchte, dass meine Auswahl als Genotyp-Feld in meinem privaten Dating-Profil gespeichert wird. Andere Nutzer:innen können dieses Profil aktuell nicht sehen. <a href="privacy.html">Datenschutzhinweise</a>.</span>
        </label>
        <section class="mycat-import" aria-labelledby="mycat-import-title">
          <h3 id="mycat-import-title">MyCat-Ergebnis verbinden <span class="optional-label">optional</span></h3>
          ${localResult
            ? `<p>Auf diesem Gerät liegt ein MyCat-Ergebnis mit ${localResult.catIds.length} Empfehlungen${resultDate ? ` vom ${escapeHtml(resultDate)}` : ''}. Einzelne Antworten werden nicht übertragen.</p>`
            : remoteResult
              ? `<p>Ein MyCat-Ergebnis mit ${resultCount} Empfehlungen ist bereits mit deinem Profil verbunden. Die aktuellen Gerätedaten sind nicht verfügbar.</p>`
              : `<p>Auf diesem Gerät ist noch kein fertiges MyCat-Ergebnis. Du kannst den Test zuerst machen.</p><a href="/mycat/">MyCat öffnen ↗</a>`}
          <label class="consent-box" for="mycat-consent">
            <input id="mycat-consent" type="checkbox" ${canKeepMyCat && remoteResult ? 'checked' : ''} ${canKeepMyCat ? '' : 'disabled'}>
            <span>Ich möchte mein MyCat-Ergebnis ebenfalls im privaten Profil speichern${localResult ? ' (Empfehlungs-IDs, Trefferwerte und Big-Five-Zusammenfassung; keine einzelnen Antworten)' : ''}.</span>
          </label>
        </section>
        <p class="matching-pending">Die Partnersuche bleibt aus, bis die Matching-Regeln festgelegt sind. Dein Genotyp wird bis dahin nicht dafür verwendet.</p>
        <div class="button-row">
          <button class="primary-button" id="save-profile" type="submit">Profil speichern <span aria-hidden="true">→</span></button>
          ${savedProfile ? '<button class="secondary-button" id="delete-profile" type="button">Profil löschen</button>' : ''}
        </div>
      </form>
      <p id="form-status" class="status-message" role="status" aria-live="polite">${escapeHtml(message)}</p>
    `;

    document.getElementById('sign-out').addEventListener('click', async () => {
      const { error } = await client.auth.signOut();
      if (error) return setStatus('Abmelden gerade nicht möglich. Bitte versuche es erneut.', 'error');
      user = null;
      savedProfile = null;
      renderSignIn('Du wurdest abgemeldet.');
    });

    document.getElementById('profile-form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const genotype = new FormData(form).get('genotype');
      const consent = document.getElementById('genotype-consent').checked;
      const shareMyCat = document.getElementById('mycat-consent').checked;
      const button = document.getElementById('save-profile');
      if (!GENOTYPES.includes(genotype)) return setStatus('Bitte wähle einen der sechs aufgeführten Genotypen.', 'error');
      if (!consent) return setStatus('Bitte bestätige zuerst die Speicherung des Genotyp-Feldes.', 'error');

      const selectedMyCat = shareMyCat ? (localResult || remoteResult) : null;
      if (remoteResult && !shareMyCat && !window.confirm('Das verbundene MyCat-Ergebnis aus deinem Dating-Profil entfernen?')) return;
      const now = new Date().toISOString();
      const payload = {
        user_id: user.id,
        genotype,
        genotype_consent_at: now,
        genotype_consent_version: CONSENT_VERSION,
        mycat_result: selectedMyCat,
        mycat_result_consent_at: selectedMyCat ? now : null,
        updated_at: now
      };

      setBusy(button, true, 'Profil wird gespeichert …');
      const { data, error } = await client
        .from(TABLE)
        .upsert(payload, { onConflict: 'user_id' })
        .select('genotype,mycat_result,mycat_result_consent_at,genotype_consent_version,updated_at')
        .single();
      setBusy(button, false, 'Profil speichern →');
      if (error) {
        console.error('Could not save the private dating profile:', error);
        return setStatus('Dein Profil konnte nicht gespeichert werden. Bitte versuche es später erneut.', 'error');
      }
      savedProfile = data;
      renderProfile('Dein Profil wurde privat gespeichert. Matching ist noch nicht aktiv.');
      setStatus('Dein Profil wurde privat gespeichert. Matching ist noch nicht aktiv.', 'success');
    });

    const deleteButton = document.getElementById('delete-profile');
    if (deleteButton) deleteButton.addEventListener('click', async () => {
      if (!window.confirm('Das Dating-Profil mit Genotyp und eventuell verbundenem MyCat-Ergebnis löschen? Dein Anmeldekonto bleibt bestehen.')) return;
      setBusy(deleteButton, true, 'Profil wird gelöscht …');
      const { error } = await client.from(TABLE).delete().eq('user_id', user.id);
      if (error) {
        console.error('Could not delete the private dating profile:', error);
        setBusy(deleteButton, false, 'Profil löschen');
        return setStatus('Das Profil konnte nicht gelöscht werden. Bitte versuche es erneut.', 'error');
      }
      savedProfile = null;
      renderProfile('Das Dating-Profil wurde gelöscht. Dein Anmeldekonto bleibt bestehen.');
      setStatus('Das Dating-Profil wurde gelöscht. Dein Anmeldekonto bleibt bestehen.', 'success');
    });
  }

  async function init() {
    if (!app) return;
    if (!window.supabase?.createClient) {
      app.setAttribute('aria-busy', 'false');
      app.innerHTML = '<p class="dating-kicker">Profil gerade nicht verfügbar</p><h2>Bitte später erneut versuchen</h2><p class="lead">Die sichere Anmeldung konnte nicht geladen werden.</p>';
      return;
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      user = data.session?.user || null;
      if (user) await loadProfile();
      else renderSignIn();
    } catch (error) {
      console.error('Could not initialize the dating profile:', error);
      app.setAttribute('aria-busy', 'false');
      app.innerHTML = '<p class="dating-kicker">Verbindung nicht verfügbar</p><h2>Bitte später erneut versuchen</h2><p class="lead">Es wurden keine Profiländerungen vorgenommen.</p>';
    }
  }

  init();
})();
