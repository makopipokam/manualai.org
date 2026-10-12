import { SignJWT, jwtVerify } from 'jose';
import { parse as parseCookieHeader } from 'cookie';
import { query } from './db.mjs';
import { ensurePond } from './services/pond.mjs';
import { gameError } from './shared.mjs';

export const COOKIE_NAME = 'webdev_app_session';
export const OAUTH_STATE_COOKIE = '__Host-oauth_state';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const AUTH_SERVICE = '/webdev.v1.WebDevAuthPublicService';

// Preview runs in a cross-site iframe over public HTTPS, so the cookie must be SameSite=None; Secure.
export function sessionCookieOptions() {
  return { httpOnly: true, path: '/', sameSite: 'none', secure: true };
}

function secretKey() {
  const secret = process.env.MANUS_JWT_SECRET;
  if (!secret) throw new Error('MANUS_JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

export async function signSession({ openId, name = '' }, expiresInMs = ONE_YEAR_MS) {
  return new SignJWT({ openId, appId: process.env.MANUS_PROJECT_ID, name: name || '' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(Math.floor((Date.now() + expiresInMs) / 1000))
    .sign(secretKey());
}

export async function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    const { openId, appId, name } = payload;
    if (typeof openId !== 'string' || !openId || typeof appId !== 'string' || appId !== process.env.MANUS_PROJECT_ID) return null;
    return { openId, appId, name: typeof name === 'string' ? name : '' };
  } catch {
    return null;
  }
}

function decodeState(state) {
  try {
    const decoded = Buffer.from(String(state), 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === 'string') return parsed;
  } catch { /* fall through */ }
  return { redirectUri: '' };
}

async function authPost(pathname, body) {
  const base = process.env.MANUS_OAUTH_API_URL;
  if (!base) throw new Error('MANUS_OAUTH_API_URL is not configured');
  const response = await fetch(`${base.replace(/\/$/, '')}${AUTH_SERVICE}/${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${pathname} failed (${response.status}): ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : {};
}

function loginMethod(info) {
  if (info?.platform) return String(info.platform);
  const platforms = Array.isArray(info?.platforms) ? info.platforms.filter(p => typeof p === 'string') : [];
  const map = { REGISTERED_PLATFORM_EMAIL: 'email', REGISTERED_PLATFORM_GOOGLE: 'google', REGISTERED_PLATFORM_APPLE: 'apple',
    REGISTERED_PLATFORM_MICROSOFT: 'microsoft', REGISTERED_PLATFORM_AZURE: 'microsoft', REGISTERED_PLATFORM_GITHUB: 'github' };
  for (const platform of platforms) if (map[platform]) return map[platform];
  return platforms[0] ? platforms[0].toLowerCase() : null;
}

export async function upsertUser({ openId, name, email, method }) {
  await query(
    `INSERT INTO users (open_id, name, email, login_method, last_signed_in) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3))
     ON DUPLICATE KEY UPDATE name = COALESCE(VALUES(name), name), email = COALESCE(VALUES(email), email),
       login_method = COALESCE(VALUES(login_method), login_method), last_signed_in = CURRENT_TIMESTAMP(3)`,
    [openId, name || null, email || null, method || null]);
  const [user] = await query('SELECT id, open_id, name, email, role FROM users WHERE open_id = ? LIMIT 1', [openId]);
  await ensurePond(user);
  return user;
}

export function registerAuthRoutes(app) {
  // Browser-safe values for starting the login in the client.
  app.get('/api/platform/config.js', (_req, res) => {
    const config = { projectId: process.env.MANUS_PROJECT_ID || '', oauthPortalUrl: process.env.MANUS_OAUTH_PORTAL_URL || '' };
    res.type('application/javascript').set('Cache-Control', 'no-store')
      .send(`window.__MANUS_CONFIG__ = ${JSON.stringify(config)};`);
  });

  app.get('/api/oauth/callback', async (req, res) => {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    if (!code || !state) return res.status(400).json({ error: 'code and state are required' });
    const { nonce, redirectUri } = decodeState(state);
    const expected = parseCookieHeader(req.headers.cookie || '')[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expected) return res.status(403).json({ error: 'invalid oauth state' });
    res.clearCookie(OAUTH_STATE_COOKIE, { path: '/', secure: true, sameSite: 'none' });
    try {
      const token = await authPost('ExchangeToken', {
        clientId: process.env.MANUS_PROJECT_ID, grantType: 'authorization_code', code, redirectUri,
      });
      const info = await authPost('GetUserInfo', { accessToken: token.accessToken });
      if (!info.openId) return res.status(400).json({ error: 'openId missing from user info' });
      await upsertUser({ openId: info.openId, name: info.name, email: info.email, method: loginMethod(info) });
      const session = await signSession({ openId: info.openId, name: info.name || '' });
      res.cookie(COOKIE_NAME, session, { ...sessionCookieOptions(), maxAge: ONE_YEAR_MS });
      return res.redirect(302, '/');
    } catch (error) {
      console.error('[oauth] callback failed', error);
      return res.status(500).json({ error: 'OAuth callback failed' });
    }
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie(COOKIE_NAME, sessionCookieOptions());
    res.json({ ok: true });
  });
}

function candidateTokens(req) {
  const tokens = [];
  const cookieToken = parseCookieHeader(req.headers.cookie || '')[COOKIE_NAME];
  if (cookieToken) tokens.push(cookieToken);
  const header = req.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) tokens.push(header.slice(7).trim());
  return tokens;
}

export async function authenticate(req) {
  for (const token of candidateTokens(req)) {
    const session = await verifySession(token);
    if (!session) continue;
    let [user] = await query('SELECT id, open_id, name, email, role FROM users WHERE open_id = ? LIMIT 1', [session.openId]);
    if (!user) {
      // Preview auto-login can present a valid session for a user who never passed the callback.
      try {
        const info = await authPost('GetUserInfoWithJwt', { jwtToken: token, projectId: process.env.MANUS_PROJECT_ID });
        if (info.openId !== session.openId) continue;
        user = await upsertUser({ openId: info.openId, name: info.name || session.name, email: info.email, method: loginMethod(info) });
      } catch (error) {
        console.warn('[auth] user sync failed', error.message);
        continue;
      }
    } else {
      await ensurePond(user);
    }
    return user;
  }
  return null;
}

export function requireUser(req, _res, next) {
  authenticate(req).then(user => {
    if (!user) return next(gameError('unauthorized', 401));
    req.user = user;
    return next();
  }).catch(next);
}
