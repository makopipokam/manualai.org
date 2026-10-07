import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load custom environment variables from .env if present
try {
  process.loadEnvFile?.();
} catch (e) {
  // .env is optional
}

import chatHandler from './api/chat.js';
import pwndQuestionHandler from './api/pwnd-question.js';
import suggestHandler from './api/suggest.js';
import keepaliveHandler from './api/keepalive.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Application-owned environment variables configuration
export const appConfig = {
  appName: process.env.MANUALAI_APP_NAME || 'manualAI',
  tagline: process.env.MANUALAI_TAGLINE || 'fünf erfahrungen · ein ort',
  env: process.env.NODE_ENV || 'development',
  taubenTurnTimerSeconds: parseInt(process.env.TAUBEN_TURN_TIMER_SECONDS || '30', 10),
  taubenAiDelayMs: parseInt(process.env.TAUBEN_AI_DELAY_MS || '2000', 10),
  taubenWinTerritories: parseInt(process.env.TAUBEN_WIN_TERRITORIES || '4', 10),
  pwndDefaultDifficulty: parseFloat(process.env.PWND_DEFAULT_DIFFICULTY || '0.50'),
  pwndMaxStreakBonus: parseFloat(process.env.PWND_MAX_STREAK_BONUS || '1.5'),
  fishRoyaleMaxEnergy: parseInt(process.env.FISHROYALE_MAX_ENERGY || '3', 10),
  fishRoyaleRounds: parseInt(process.env.FISHROYALE_ROUNDS || '6', 10),
  petsRecommendationCount: parseInt(process.env.PETS_RECOMMENDATION_COUNT || '3', 10),
  chatDefaultLevel: process.env.CHAT_DEFAULT_LEVEL || 'coach',
  chatDefaultDepth: process.env.CHAT_DEFAULT_DEPTH || 'normal',
  chatDefaultStyle: process.env.CHAT_DEFAULT_STYLE || 'standard',
  enableSoundEffects: process.env.ENABLE_SOUND_EFFECTS !== 'false',
  features: {
    onlinePond: process.env.FEATURE_POND_ONLINE === 'true',
    petDatingProfiles: process.env.FEATURE_PET_DATING_PROFILES !== 'false',
  },
};

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Permissive framing headers to work seamlessly inside AI Studio preview iframe
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Custom Config Endpoint to provide safe client-side environment settings
app.get(['/api/config', '/api/config.json'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(appConfig);
});

// API Routes
app.all(['/api/chat', '/api/chat.js'], async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await chatHandler(req, res);
  } catch (err) {
    console.error('API /api/chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

app.all(['/api/pwnd-question', '/api/pwnd-question.js'], async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await pwndQuestionHandler(req, res);
  } catch (err) {
    console.error('API /api/pwnd-question error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

app.all(['/api/suggest', '/api/suggest.js'], async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await suggestHandler(req, res);
  } catch (err) {
    console.error('API /api/suggest error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

app.all(['/api/keepalive', '/api/keepalive.js'], async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await keepaliveHandler(req, res);
  } catch (err) {
    console.error('API /api/keepalive error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Static file serving for apps folder and root assets
const APP_NAMES = [
  'pwnd',
  'mydog',
  'mycat',
  'fishroyale',
  'TaubenVSKrähen',
  'biomancer',
  'riftvanguard',
  'malltd',
  'citadelwars',
  'celestialarena'
];

const staticOptions = {
  index: 'index.html',
  redirect: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.wasm')) {
      res.setHeader('Content-Type', 'application/wasm');
    } else if (filePath.endsWith('.pck')) {
      res.setHeader('Content-Type', 'application/octet-stream');
    } else if (filePath.includes('/images/v1/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
};

// Serve subfolder apps from /apps/
app.use('/apps', express.static(path.join(__dirname, 'apps'), staticOptions));

// Direct friendly routes for all 10 apps (e.g. /mydog, /malltd, etc.)
for (const appName of APP_NAMES) {
  app.use(`/${appName}`, express.static(path.join(__dirname, 'apps', appName), staticOptions));
}

// Root static assets (index.html, favicon, logo)
app.use(express.static(__dirname, staticOptions));

// Fallback to index.html for root or client routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`manualAI server running on http://0.0.0.0:${PORT}`);
});

if (process.env.PORT && Number(process.env.PORT) !== 3000) {
  const envPort = Number(process.env.PORT);
  app.listen(envPort, '0.0.0.0', () => {
    console.log(`manualAI server also listening on http://0.0.0.0:${envPort}`);
  });
}
