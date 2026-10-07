import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('manualAI Scroll-Triggered Fade-In Animation for App Cards', () => {
  const root = process.cwd();
  const indexPath = path.join(root, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  it('defines subtle initial transform and opacity state for .app-card', () => {
    assert.match(
      html,
      /\.app-card\s*\{[^}]*opacity:\s*0;/i,
      '.app-card must initially have opacity: 0 for scroll reveal'
    );
    assert.match(
      html,
      /\.app-card\s*\{[^}]*transform:\s*translateY\(\s*\d+px\s*\);/i,
      '.app-card must initially be translated downwards for subtle entrance'
    );
  });

  it('defines revealed state that restores full opacity and transform', () => {
    assert.match(
      html,
      /\.app-card\.(?:revealed|is-visible)[^{]*\{[^}]*opacity:\s*1;/i,
      '.app-card revealed state must transition opacity to 1'
    );
    assert.match(
      html,
      /\.app-card\.(?:revealed|is-visible)[^{]*\{[^}]*transform:\s*translateY\(\s*0\s*\);/i,
      '.app-card revealed state must transition translateY to 0'
    );
  });

  it('implements staggered transition delays for graceful entrance sequence', () => {
    assert.ok(
      html.includes('transition-delay: 75ms') || html.includes('transition-delay: 70ms') || html.includes('data-index'),
      'Must configure staggered transition delays across experience cards'
    );
    assert.ok(
      html.includes('transition-delay: 0s !important') || html.includes('transition-delay: 0'),
      'Must disable transition delays when hovering or pressing cards for instant response'
    );
  });

  it('implements IntersectionObserver to trigger animation when cards enter viewport', () => {
    assert.ok(
      html.includes('IntersectionObserver'),
      'Must use IntersectionObserver to detect cards entering viewport'
    );
    assert.ok(
      html.includes('.classList.add(\'revealed\')') || html.includes('.classList.add("revealed")') || html.includes('is-visible'),
      'Observer must add revealed class upon intersection'
    );
    assert.ok(
      html.includes('observer.unobserve'),
      'Must unobserve cards once revealed so animation only triggers on first appearance'
    );
  });

  it('respects prefers-reduced-motion accessibility preference', () => {
    assert.match(
      html,
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.app-card\s*\{[^}]*opacity:\s*1\s*!important/i,
      'Must force opacity 1 when prefers-reduced-motion is requested'
    );
  });
});
