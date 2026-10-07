import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('manualAI Vector Logo and Favicon Integration', () => {
  const root = process.cwd();

  it('favicon.svg exists and is valid, non-empty SVG', () => {
    const faviconPath = path.join(root, 'favicon.svg');
    assert.ok(fs.existsSync(faviconPath), 'favicon.svg does not exist');
    const content = fs.readFileSync(faviconPath, 'utf8');
    assert.ok(content.startsWith('<svg') || content.includes('<svg'), 'favicon.svg must contain an <svg> tag');
    assert.ok(content.includes('</svg>'), 'favicon.svg must be closed with </svg>');
  });

  it('favicon.svg unites the iconic star (✦) with organic reef/pond elements', () => {
    const content = fs.readFileSync(path.join(root, 'favicon.svg'), 'utf8');
    
    // Check organic pond/reef elements
    assert.ok(
      content.includes('pond') || content.includes('reef') || content.includes('water-ripple'),
      'favicon.svg should contain organic pond, reef, or ripple elements'
    );
    
    // Check 4-point star element
    assert.ok(
      content.includes('star-core') || content.includes('starGrad') || content.includes('Q 256,220'),
      'favicon.svg should contain the 4-pointed star element'
    );

    // Check scalable viewBox
    assert.ok(content.includes('viewBox="0 0 512 512"'), 'favicon.svg should have 512x512 viewBox');
  });

  it('index.html links to /favicon.svg', () => {
    const indexPath = path.join(root, 'index.html');
    assert.ok(fs.existsSync(indexPath), 'index.html does not exist');
    const html = fs.readFileSync(indexPath, 'utf8');
    
    assert.match(
      html,
      /<link[^>]*rel=["']icon["'][^>]*href=["']\/favicon\.svg["']/i,
      'index.html must include <link rel="icon" href="/favicon.svg" ...>'
    );
  });

  it('index.html embeds the vector logo emblem in the main navigation', () => {
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    assert.ok(html.includes('class="wordmark-mark"'), 'Navigation must include .wordmark-mark');
    assert.ok(
      html.includes('class="wordmark-svg"') || html.includes('wordmark-mark'),
      'Navigation mark should contain the vector logo'
    );
  });
});
