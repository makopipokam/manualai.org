import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('manualAI Adapted Warcraft 3 Custom Games Suite', () => {
  const root = process.cwd();

  const games = [
    { dir: 'biomancer', name: 'Biomancer Garrison (Legion TD)', canvasId: 'gameCanvas' },
    { dir: 'riftvanguard', name: 'Rift Vanguard (Hero Line Wars)', canvasId: 'riftCanvas' },
    { dir: 'malltd', name: 'MegaMall Rush TD (Shopping Mall TD)', canvasId: 'mallCanvas' },
    { dir: 'citadelwars', name: 'Citadel Dominion (Castle Wars)', canvasId: 'citadelCanvas' },
    { dir: 'celestialarena', name: 'Celestial Colosseum (Angel Arena)', canvasId: 'arenaCanvas' }
  ];

  function getGamePath(dir) {
    const appsPath = path.join(root, 'apps', dir, 'index.html');
    if (fs.existsSync(appsPath)) return appsPath;
    return path.join(root, dir, 'index.html');
  }

  it('all five adapted game directories contain valid standalone index.html entrypoints', () => {
    for (const game of games) {
      const p = getGamePath(game.dir);
      assert.ok(fs.existsSync(p), `${game.name} index.html must exist at apps/${game.dir}/index.html`);
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(html.includes('<!doctype html>'), `${game.name} must contain DOCTYPE`);
      assert.ok(html.includes(game.canvasId), `${game.name} must contain canvas #${game.canvasId}`);
    }
  });

  it('all adapted games include back-navigation to the manualAI hub', () => {
    for (const game of games) {
      const p = getGamePath(game.dir);
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(
        html.includes('href="/"') && html.includes('manualAI'),
        `${game.name} must include a navigation link back to manualAI hub`
      );
    }
  });

  it('all adapted games support bilingual internationalization (DE / EN)', () => {
    for (const game of games) {
      const p = getGamePath(game.dir);
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(
        html.includes('langToggle') || html.includes('DE / EN'),
        `${game.name} must provide language toggling`
      );
      assert.ok(
        html.includes("localStorage.getItem('manualai_lang')"),
        `${game.name} must read manualai_lang from localStorage`
      );
      assert.ok(
        html.includes("localStorage.setItem('manualai_lang'"),
        `${game.name} must write manualai_lang to localStorage`
      );
    }
  });

  it('all adapted games synchronize with manualAI dark/light theme and sound settings', () => {
    for (const game of games) {
      const p = getGamePath(game.dir);
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(
        html.includes('manualai_theme') && html.includes('data-theme'),
        `${game.name} must inherit or synchronize manualai_theme`
      );
      assert.ok(
        html.includes('manualai_sound'),
        `${game.name} must read/write manualai_sound`
      );
    }
  });
});
