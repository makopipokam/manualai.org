import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('manualAI Mobile Card Touch Press Feedback Animation', () => {
  const root = process.cwd();
  const indexPath = path.join(root, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  it('defines subtle scale-down press effect for .app-card', () => {
    // Assert active/pressed selector exists with scale-down transform
    assert.match(
      html,
      /\.app-card:(?:active|is-pressed)[^{]*\{[^}]*transform:\s*scale\(0\.9\d+\)/i,
      'Must contain scale-down transform on .app-card:active or .app-card.is-pressed'
    );
  });

  it('optimizes tap highlight and touch responsiveness for mobile devices', () => {
    assert.ok(
      html.includes('-webkit-tap-highlight-color: transparent'),
      'Must disable awkward default tap highlight rectangle on mobile'
    );
    assert.ok(
      html.includes('touch-action: manipulation'),
      'Must configure touch-action: manipulation to eliminate mobile tap latency'
    );
  });

  it('provides dedicated touch event listeners for instant mobile feedback', () => {
    assert.ok(
      html.includes("link.addEventListener('touchstart'") || html.includes('addEventListener("touchstart"'),
      'Must register touchstart listener on experience cards'
    );
    assert.ok(
      html.includes("link.addEventListener('touchend'") || html.includes('addEventListener("touchend"'),
      'Must register touchend listener on experience cards'
    );
    assert.ok(
      html.includes("link.addEventListener('touchcancel'") || html.includes('addEventListener("touchcancel"'),
      'Must register touchcancel listener on experience cards'
    );
    assert.ok(
      html.includes('is-pressed'),
      'Must toggle pressed class for touch feedback'
    );
  });

  it('includes mobile media queries and dark mode styling for touch interaction', () => {
    assert.ok(
      html.includes('@media (hover: none) and (pointer: coarse)') || html.includes('@media (max-width: 760px)'),
      'Must account for touch or mobile viewport media queries'
    );
    assert.ok(
      html.includes('[data-theme="dark"] .app-card:active') || html.includes('[data-theme="dark"] .app-card.is-pressed'),
      'Must provide dark mode box-shadow adjustments for pressed state'
    );
  });
});
