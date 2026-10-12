import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerAuthRoutes } from './auth.mjs';
import { apiRouter } from './routes/api.mjs';
import { GameError } from './shared.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);
  app.use(express.json({ limit: '64kb' }));

  registerAuthRoutes(app);
  app.use('/api', apiRouter());
  app.use('/api', (_req, res) => res.status(404).json({ error: { code: 'not_found', message: 'Unbekannter Endpunkt.' } }));

  const staticOptions = { maxAge: 0, etag: true, index: 'index.html' };
  app.use('/shared', express.static(path.join(ROOT, 'shared'), { ...staticOptions,
    index: false, setHeaders: res => res.set('Cache-Control', 'no-cache') }));
  app.use(express.static(path.join(ROOT, 'public'), { ...staticOptions,
    setHeaders: (res, file) => { if (/\.(html|js|css|json)$/.test(file)) res.set('Cache-Control', 'no-cache'); } }));
  app.get('/', (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(ROOT, 'public', 'index.html'));
  });
  app.use((_req, res) => {
    res.status(404).set('Cache-Control', 'no-cache');
    res.sendFile(path.join(ROOT, 'public', '404.html'), error => {
      if (error) res.type('text/plain').send('Nicht gefunden');
    });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((error, _req, res, _next) => {
    if (error instanceof GameError) {
      return res.status(error.status).json({ error: { code: error.code, message: error.message, details: error.details } });
    }
    if (error?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: { code: 'bad_request', message: 'Ungültige Anfrage.' } });
    }
    console.error('[api] unexpected error', error);
    return res.status(500).json({ error: { code: 'server_error', message: 'Da ist etwas schiefgelaufen. Bitte versuche es erneut.' } });
  });
  return app;
}
