import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('manualAI All Five Games & Interactive Experiences', () => {
  const root = process.cwd();

  const games = [
    { dir: 'pwnd', name: 'pwnd', keyElement: 'pondCanvas' },
    { dir: 'fishroyale', name: 'Fish Royale', keyElement: 'btnEndTurn' },
    { dir: 'TaubenVSKrähen', name: 'pidgeons & crows', keyElement: 'districtsContainer' },
    { dir: 'mydog', name: 'MyDog', keyElement: 'quizSection' },
    { dir: 'mycat', name: 'MyCat', keyElement: 'catGrid' }
  ];

  function getGamePath(dir, filename = 'index.html') {
    const appsPath = path.join(root, 'apps', dir, filename);
    if (fs.existsSync(appsPath)) return appsPath;
    return path.join(root, dir, filename);
  }

  it('all five game directories contain valid index.html entrypoints', () => {
    for (const game of games) {
      const p = getGamePath(game.dir, 'index.html');
      assert.ok(fs.existsSync(p), `${game.name} index.html must exist at apps/${game.dir}/index.html`);
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(html.includes('<!doctype html>'), `${game.name} must contain DOCTYPE`);
      assert.ok(html.includes(game.keyElement), `${game.name} must contain its primary element #${game.keyElement}`);
    }
  });

  it('all games include back-navigation to the manualAI hub', () => {
    for (const game of games) {
      const p = getGamePath(game.dir, 'index.html');
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(
        html.includes('href="/"') && html.includes('manualAI'),
        `${game.name} must include a navigation link back to manualAI hub`
      );
    }
  });

  it('all games support bilingual internationalization (DE / EN)', () => {
    for (const game of games) {
      const p = getGamePath(game.dir, 'index.html');
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(
        html.includes('langToggle') || html.includes('DE / EN'),
        `${game.name} must provide language toggling`
      );
    }
  });

  it('all games synchronize with manualAI dark/light theme system', () => {
    for (const game of games) {
      const p = getGamePath(game.dir, 'index.html');
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(
        html.includes('manualai_theme') && html.includes('data-theme'),
        `${game.name} must inherit or synchronize manualai_theme`
      );
    }
  });

  it('TaubenVSKrähen favicon.png exists and is non-empty', () => {
    const iconPath = getGamePath('TaubenVSKrähen', 'favicon.png');
    assert.ok(fs.existsSync(iconPath), 'TaubenVSKrähen/favicon.png must exist in apps folder');
    const stat = fs.statSync(iconPath);
    assert.ok(stat.size > 100, 'TaubenVSKrähen/favicon.png must be non-empty');
  });
});
