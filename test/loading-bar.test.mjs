import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('manualAI Slim Top-Aligned Loading Bar Navigation Indicator', () => {
  const root = process.cwd();
  const indexPath = path.join(root, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  it('contains top-aligned loading bar markup in body with accessibility attributes', () => {
    assert.ok(html.includes('id="loading-bar"'), 'Must have id="loading-bar"');
    assert.ok(html.includes('class="loading-bar'), 'Must have .loading-bar class');
    assert.ok(html.includes('class="loading-bar-progress"'), 'Must have .loading-bar-progress indicator');
    assert.ok(html.includes('role="progressbar"'), 'Must have role="progressbar"');
    assert.ok(html.includes('aria-valuemin="0"'), 'Must have aria-valuemin="0"');
    assert.ok(html.includes('aria-valuemax="100"'), 'Must have aria-valuemax="100"');
  });

  it('styles loading bar with slim, fixed, top-aligned positioning and brand aesthetic', () => {
    // Check top-alignment & fixed positioning
    assert.match(html, /\.loading-bar\s*\{[^}]*position:\s*fixed;/i, 'Loading bar must be position: fixed');
    assert.match(html, /\.loading-bar\s*\{[^}]*top:\s*0;/i, 'Loading bar must be top: 0');
    assert.match(html, /\.loading-bar\s*\{[^}]*height:\s*[2-4]px;/i, 'Loading bar must be slim (2-4px)');
    assert.match(html, /\.loading-bar\s*\{[^}]*pointer-events:\s*none;/i, 'Loading bar must not block user interaction');

    // Check brand gradients & glow matching manualAI palette
    assert.ok(
      html.includes('var(--green)') && html.includes('var(--coral)'),
      'Loading bar progress gradient should use manualAI green and coral accents'
    );
    assert.ok(
      html.includes('.loading-bar-glow') || html.includes('box-shadow'),
      'Loading bar should have a subtle glow effect'
    );

    // Dark theme override
    assert.ok(
      html.includes('[data-theme="dark"] .loading-bar') || html.includes('[data-theme="dark"] .loading-bar-progress'),
      'Must have dark theme styling adjustments'
    );
  });

  it('experience links are configured with identifiers and click handlers', () => {
    // Check that all 5 experience cards are present
    const experienceSlugs = ['pwnd', 'mydog', 'mycat', 'fishroyale', 'tauben'];
    for (const slug of experienceSlugs) {
      assert.ok(
        html.includes(`data-experience-link="${slug}`) || html.includes(`href="/${slug}`) || html.includes(`href="/Tauben`),
        `Experience link for ${slug} must be present`
      );
    }

    // Verify click event listeners on experience links
    assert.ok(
      html.includes("querySelectorAll('.app-card") || html.includes('data-experience-link'),
      'Must select experience cards for navigation listeners'
    );
    assert.ok(
      html.includes('startLoadingBar') || html.includes('startLoading'),
      'Clicking experience links must trigger loading bar start'
    );
  });

  it('animates loading bar on experience link click and manages state', () => {
    // Check animation progress updates
    assert.ok(
      html.includes('progressBar.style.width') || html.includes('.style.width'),
      'Must dynamically animate progress bar width'
    );
    assert.ok(
      html.includes('classList.add(\'active\')') || html.includes('is-loading'),
      'Must activate loading state'
    );

    // Check history / bfcache navigation reset
    assert.ok(
      html.includes('pageshow') || html.includes('popstate'),
      'Must handle pageshow or popstate to reset bar when navigating back'
    );

    // Check controller helper exposed on window
    assert.ok(
      html.includes('manualAiLoadingBar'),
      'Should expose manualAiLoadingBar on window for control and testability'
    );
  });
});
