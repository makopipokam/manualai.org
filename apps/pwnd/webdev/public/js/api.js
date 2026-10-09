// Thin API client: every rule lives on the server, the client only sends intents.
(function (root) {
  'use strict';

  const SESSION_COOKIE = 'webdev_app_session';
  const STATE_COOKIE = '__Host-oauth_state';

  // Cloud Preview runs cross-site; if the browser drops the cookie, the platform hands the
  // session string to the page through sessionStorage instead.
  function bearerToken() {
    try {
      const raw = sessionStorage.getItem('manus-cookie');
      if (!raw) return null;
      const match = new RegExp(`${SESSION_COOKIE}=([^;]+)`).exec(raw);
      return match ? decodeURIComponent(match[1]) : null;
    } catch (_error) {
      return null;
    }
  }

  class ApiError extends Error {
    constructor(status, body) {
      const detail = body && body.error ? body.error : {};
      super(detail.message || 'Da ist etwas schiefgelaufen.');
      this.name = 'ApiError';
      this.status = status;
      this.code = detail.code || 'server_error';
      this.details = detail.details || null;
    }
  }

  async function request(method, path, body) {
    const headers = { Accept: 'application/json' };
    const token = bearerToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    let response;
    try {
      response = await fetch(path, { method, headers, credentials: 'include',
        body: body === undefined ? undefined : JSON.stringify(body) });
    } catch (_error) {
      throw new ApiError(0, { error: { code: 'offline', message: 'Keine Verbindung zum Teich. Versuche es gleich noch einmal.' } });
    }
    const text = await response.text();
    let data = null;
    if (text) { try { data = JSON.parse(text); } catch (_error) { data = null; } }
    if (!response.ok) throw new ApiError(response.status, data);
    return data;
  }

  function randomNonce() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Manus OAuth: the nonce travels in the state parameter and in a cookie the server compares.
  function loginUrl() {
    const config = root.__MANUS_CONFIG__ || {};
    if (!config.oauthPortalUrl || !config.projectId) return null;
    const redirectUri = `${location.origin}/api/oauth/callback`;
    const nonce = randomNonce();
    document.cookie = `${STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
    const state = btoa(JSON.stringify({ redirectUri, nonce })).replace(/=+$/, '');
    const portal = config.oauthPortalUrl.replace(/\/+$/, '');
    const params = new URLSearchParams({ appId: config.projectId, redirectUri, state, responseType: 'code' });
    return `${portal}/app-auth?${params.toString()}`;
  }

  const api = {
    ApiError,
    loginUrl,
    me: () => request('GET', '/api/me'),
    logout: () => request('POST', '/api/auth/logout', {}),
    state: () => request('GET', '/api/state'),
    pond: () => request('GET', '/api/pond'),
    pondAction: payload => request('POST', '/api/pond/actions', payload),
    trainTroops: payload => request('POST', '/api/troops/train', payload),
    progression: () => request('GET', '/api/progression'),
    quizStatus: () => request('GET', '/api/quiz/status'),
    startAttempt: payload => request('POST', '/api/quiz/attempts', payload),
    nextQuestion: id => request('POST', `/api/quiz/attempts/${id}/question`, {}),
    answer: (id, payload) => request('POST', `/api/quiz/attempts/${id}/answer`, payload),
    scan: id => request('POST', `/api/quiz/attempts/${id}/scan`, {}),
    complete: id => request('POST', `/api/quiz/attempts/${id}/complete`, {}),
    chooseUpgrade: (id, upgradeId) => request('POST', `/api/quiz/attempts/${id}/upgrade`, { upgradeId }),
    opponent: () => request('GET', '/api/matchmaking/opponent'),
    nextOpponent: () => request('POST', '/api/matchmaking/next', {}),
    attack: payload => request('POST', '/api/attacks', payload),
    reports: type => request('GET', `/api/reports?type=${encodeURIComponent(type)}`),
    markReportsSeen: () => request('POST', '/api/reports/seen', {}),
    replay: id => request('GET', `/api/reports/${encodeURIComponent(id)}/replay`),
    leagueTable: () => request('GET', '/api/leagues/table'),
  };

  root.PwndApi = api;
})(window);
