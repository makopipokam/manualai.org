// Start der Anwendung: Anmeldung, gemeinsamer Zustand und Verdrahtung der Module.
(function (root) {
  'use strict';

  const UI = root.PwndUI;
  const api = root.PwndApi;

  const store = {
    user: null,
    pond: null,
    progression: null,
    quiz: null,

    applyPond(snapshot) {
      if (!snapshot) return;
      this.pond = snapshot;
      if (UI.currentScreen() === 'screenPond') root.PwndPond.renderHub();
    },
    setLimits(limits) {
      if (!limits) return;
      this.progression = { ...(this.progression || {}), ...limits };
    },
    setQuizRewards(left) {
      if (typeof left !== 'number') return;
      this.quiz = { ...(this.quiz || {}), rewardsLeftToday: left };
    },
    setUnreadDefense(count) {
      this.progression = { ...(this.progression || {}), unreadDefense: count };
      const badge = UI.$('reportsBadge');
      if (badge) { badge.hidden = !count; badge.textContent = String(count || 0); }
    },
    async refresh() {
      const data = await api.state();
      this.pond = data.pond;
      this.progression = data.progression;
      this.quiz = data.quiz;
      return data;
    },
  };

  root.PwndStore = store;

  function showLogin(message) {
    UI.$('logoutBtn').hidden = true;
    UI.$('topLeague').hidden = true;
    if (message) UI.setText('loginHint', message);
    UI.showScreen('screenLogin');
  }

  async function enterGame() {
    await store.refresh();
    UI.$('logoutBtn').hidden = false;
    root.PwndPond.renderHub();
    UI.showScreen('screenPond');
  }

  async function boot() {
    UI.registerScreens();
    root.PwndPond.init();
    root.PwndQuiz.init();
    root.PwndStrategy.init();

    UI.$('loginBtn').addEventListener('click', () => {
      const url = api.loginUrl();
      if (!url) { UI.warn('Die Anmeldung ist gerade nicht erreichbar. Lade die Seite neu.'); return; }
      location.href = url;
    });
    UI.$('logoutBtn').addEventListener('click', async () => {
      try { await api.logout(); } catch (_error) { /* abmelden gilt trotzdem */ }
      location.reload();
    });

    try {
      const me = await api.me();
      if (!me.user) { showLogin(); return; }
      store.user = me.user;
      await enterGame();
    } catch (error) {
      if (error.status === 401) showLogin();
      else showLogin('Der Teich ist gerade nicht erreichbar. Versuche es in einem Moment noch einmal.');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
