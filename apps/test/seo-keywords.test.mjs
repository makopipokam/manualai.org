import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('manualAI Head Meta Keywords and SEO Discoverability', () => {
  const root = process.cwd();
  const indexPath = path.join(root, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  it('contains comprehensive meta keywords tag in head', () => {
    assert.match(
      html,
      /<meta[^>]*name=["']keywords["'][^>]*content=["'][^"']+["']/i,
      'index.html head must contain <meta name="keywords" ...>'
    );
  });

  it('covers the manualAI platform and all five core experiences in keywords', () => {
    const match = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    assert.ok(match, 'Keywords meta tag must exist');
    const keywords = match[1].toLowerCase();

    // Platform
    assert.ok(keywords.includes('manualai'), 'Keywords must include manualAI');

    // Experience 1: pwnd
    assert.ok(keywords.includes('pwnd'), 'Keywords must include pwnd');

    // Experience 2: MyDog
    assert.ok(keywords.includes('mydog'), 'Keywords must include MyDog');

    // Experience 3: MyCat
    assert.ok(keywords.includes('mycat'), 'Keywords must include MyCat');

    // Experience 4: Fish Royale
    assert.ok(keywords.includes('fish royale'), 'Keywords must include Fish Royale');

    // Experience 5: Tauben vs Krähen / pidgeons & crows
    assert.ok(
      keywords.includes('tauben') || keywords.includes('pidgeons') || keywords.includes('crows'),
      'Keywords must include Tauben vs Krähen / pidgeons & crows'
    );
  });

  it('updates keywords dynamically across German and English in I18N dictionary', () => {
    const match = html.match(/var I18N = ({[\s\S]*?});\s*var toggleBtn/);
    assert.ok(match, 'I18N dictionary must be defined');

    const I18N = (new Function('return ' + match[1]))();
    assert.ok(I18N.de.metaKeywords, 'German translations must contain metaKeywords');
    assert.ok(I18N.en.metaKeywords, 'English translations must contain metaKeywords');
    assert.notStrictEqual(I18N.de.metaKeywords, I18N.en.metaKeywords, 'German and English keywords should differ');

    // Verify script updates meta[name="keywords"]
    assert.ok(
      html.includes("metaKeywords.setAttribute('content', dict.metaKeywords)"),
      'setLanguage must dynamically update meta keywords attribute'
    );
  });

  it('provides rich social sharing metadata cards in head', () => {
    assert.ok(html.includes('property="og:title"'), 'OpenGraph title must exist');
    assert.ok(html.includes('property="og:description"'), 'OpenGraph description must exist');
    assert.ok(html.includes('name="twitter:card"'), 'Twitter card tag must exist');
    assert.ok(html.includes('name="twitter:title"'), 'Twitter title tag must exist');
    assert.ok(html.includes('name="twitter:description"'), 'Twitter description tag must exist');
  });
});
