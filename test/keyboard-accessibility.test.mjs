import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('manualAI Keyboard Accessibility Support for App Cards', () => {
  const root = process.cwd();
  const indexPath = path.join(root, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  it('all app-card elements have keyboard focusability and accessible attributes', () => {
    // Assert all 5 cards have tabindex="0" and aria-label / data-i18n-aria
    const cardSlugs = ['pwnd', 'mydog', 'mycat', 'fishroyale', 'tauben'];
    for (const slug of cardSlugs) {
      assert.ok(
        html.includes(`data-experience-link="${slug}`) || html.includes(`href="/${slug}`),
        `Card ${slug} must exist`
      );
    }

    assert.ok(html.includes('tabindex="0"'), 'Cards must have tabindex="0" for natural Tab stop navigation');
    assert.ok(html.includes('data-i18n-aria="card1Aria"'), 'Card 1 must have internationalized aria label');
    assert.ok(html.includes('data-i18n-aria="card2Aria"'), 'Card 2 must have internationalized aria label');
    assert.ok(html.includes('data-i18n-aria="card3Aria"'), 'Card 3 must have internationalized aria label');
    assert.ok(html.includes('data-i18n-aria="card4Aria"'), 'Card 4 must have internationalized aria label');
    assert.ok(html.includes('data-i18n-aria="card5Aria"'), 'Card 5 must have internationalized aria label');
  });

  it('provides distinct, high-contrast focus-visible outline for keyboard navigation', () => {
    assert.match(
      html,
      /\.app-card:focus-visible\s*\{[^}]*outline:\s*2px\s*solid\s*var\(--green\);/i,
      'app-card must have a high-contrast focus-visible outline ring'
    );
    assert.match(
      html,
      /\.app-card:focus-visible\s*\{[^}]*outline-offset:\s*\d+px;/i,
      'app-card focus ring must have clean offset separation'
    );
  });

  it('implements Enter and Space keyboard event handling on app-cards', () => {
    assert.ok(
      html.includes("e.key === 'Enter'") || html.includes('keyCode === 13'),
      'Must listen for Enter key to trigger experience navigation'
    );
    assert.ok(
      html.includes("e.key === ' '") || html.includes("e.key === 'Spacebar'") || html.includes('keyCode === 32'),
      'Must listen for Space key to trigger experience navigation'
    );
    assert.ok(
      html.includes('startLoadingBar'),
      'Keyboard trigger must start loading bar animation'
    );
    assert.ok(
      html.includes('link.classList.add(\'is-pressed\')') || html.includes('link.classList.add("is-pressed")'),
      'Keyboard trigger must provide physical press visual feedback'
    );
  });

  it('I18N dictionary contains descriptive bilingual screen reader labels', () => {
    const match = html.match(/var I18N = ({[\s\S]*?});\s*var toggleBtn/);
    assert.ok(match, 'I18N dictionary must be defined');

    const I18N = (new Function('return ' + match[1]))();
    assert.ok(I18N.de.card1Aria, 'German card1Aria label must exist');
    assert.ok(I18N.en.card1Aria, 'English card1Aria label must exist');
    assert.ok(I18N.de.card4Aria, 'German card4Aria label must exist');
    assert.ok(I18N.en.card4Aria, 'English card4Aria label must exist');
  });
});
