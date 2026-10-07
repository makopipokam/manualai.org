import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('manualAI Language Toggle and Internationalization', () => {
  const root = process.cwd();
  const indexPath = path.join(root, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  it('navigation bar contains the language toggle component', () => {
    assert.ok(html.includes('class="lang-toggle"'), 'Navigation must contain .lang-toggle');
    assert.ok(html.includes('id="lang-toggle"'), 'Language toggle must have id="lang-toggle"');
    assert.ok(html.includes('data-lang="de"'), 'Language toggle must have German option (data-lang="de")');
    assert.ok(html.includes('data-lang="en"'), 'Language toggle must have English option (data-lang="en")');
  });

  it('language toggle buttons have accessible attributes', () => {
    assert.match(
      html,
      /<button[^>]*class="[^"]*lang-btn[^"]*"[^>]*data-lang="de"[^>]*>DE<\/button>/i,
      'German button must be properly structured'
    );
    assert.match(
      html,
      /<button[^>]*class="[^"]*lang-btn[^"]*"[^>]*data-lang="en"[^>]*>EN<\/button>/i,
      'English button must be properly structured'
    );
    assert.match(html, /role="group"/, 'Toggle container should have role="group"');
    assert.match(html, /aria-label="[^"]*Sprachauswahl[^"]*"/i, 'Toggle container must have descriptive aria-label');
  });

  it('contains comprehensive translation dictionary for German and English', () => {
    const match = html.match(/var I18N = ({[\s\S]*?});\s*var toggleBtn/);
    assert.ok(match, 'I18N dictionary must be defined in index.html');
    
    const I18N = (new Function('return ' + match[1]))();
    assert.ok(I18N.de, 'German translations must exist');
    assert.ok(I18N.en, 'English translations must exist');

    // Key structural translations
    const requiredKeys = [
      'metaTitle',
      'metaDesc',
      'heroTitle',
      'heroCopy',
      'heroKicker',
      'experiencesTitle',
      'card1Desc',
      'card2Desc',
      'card3Desc',
      'card4Desc',
      'card5Desc',
      'card1Launch',
      'card2Launch',
      'card3Launch',
      'card4Launch',
      'card5Launch',
      'themeLabelLight',
      'themeLabelDark'
    ];

    for (const key of requiredKeys) {
      assert.ok(I18N.de[key], `German translation missing for "${key}"`);
      assert.ok(I18N.en[key], `English translation missing for "${key}"`);
      assert.notStrictEqual(I18N.de[key], I18N.en[key], `German and English should differ for "${key}"`);
    }
  });

  it('persists selected language in localStorage with key manualai_lang', () => {
    assert.ok(
      html.includes("localStorage.getItem('manualai_lang')"),
      'Must read manualai_lang from localStorage'
    );
    assert.ok(
      html.includes("localStorage.setItem('manualai_lang'"),
      'Must write manualai_lang to localStorage'
    );
  });

  it('anti-FOUC script in head initializes document lang early', () => {
    const headSection = html.slice(0, html.indexOf('</head>'));
    assert.ok(
      headSection.includes("localStorage.getItem('manualai_lang')") || headSection.includes("document.documentElement.setAttribute('lang'"),
      'Head section must contain early language initialization'
    );
  });
});
