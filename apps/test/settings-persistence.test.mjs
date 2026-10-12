import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('manualAI Game Settings Persistence in localStorage', () => {
  const root = process.cwd();

  const gameDirs = ['pwnd', 'fishroyale', 'TaubenVSKrähen', 'mydog', 'mycat'];

  function getPath(dir) {
    const appsPath = path.join(root, 'apps', dir, 'index.html');
    if (fs.existsSync(appsPath)) return appsPath;
    return path.join(root, dir, 'index.html');
  }

  it('all games read preferred sound settings from localStorage (manualai_sound)', () => {
    for (const dir of gameDirs) {
      const p = getPath(dir);
      assert.ok(fs.existsSync(p), `${dir}/index.html must exist`);
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(
        html.includes("localStorage.getItem('manualai_sound')") || html.includes('manualai_sound'),
        `${dir} must read manualai_sound from localStorage`
      );
    }
  });

  it('all games store updated sound preference in localStorage when toggled', () => {
    for (const dir of gameDirs) {
      const p = getPath(dir);
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(
        html.includes("localStorage.setItem('manualai_sound'") || html.includes('manualai_sound'),
        `${dir} must persist manualai_sound to localStorage`
      );
    }
  });

  it('all games read preferred language settings from localStorage (manualai_lang)', () => {
    for (const dir of gameDirs) {
      const p = getPath(dir);
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(
        html.includes("localStorage.getItem('manualai_lang')") || html.includes('manualai_lang'),
        `${dir} must read manualai_lang from localStorage`
      );
    }
  });

  it('all games store updated language preference in localStorage when toggled', () => {
    for (const dir of gameDirs) {
      const p = getPath(dir);
      const html = fs.readFileSync(p, 'utf8');
      assert.ok(
        html.includes("localStorage.setItem('manualai_lang'"),
        `${dir} must persist manualai_lang to localStorage`
      );
    }
  });

  it('main hub index.html persists theme and language in localStorage', () => {
    const indexPath = path.join(root, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8');
    assert.ok(html.includes("localStorage.getItem('manualai_lang')"), 'Hub must read manualai_lang');
    assert.ok(html.includes("localStorage.setItem('manualai_lang'"), 'Hub must save manualai_lang');
    assert.ok(html.includes("localStorage.getItem('manualai_theme')"), 'Hub must read manualai_theme');
    assert.ok(html.includes("localStorage.setItem('manualai_theme'"), 'Hub must save manualai_theme');
  });
});
