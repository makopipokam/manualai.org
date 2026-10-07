import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('manualAI Cross-Platform & Device Filter System', () => {
  const root = process.cwd();
  const indexPath = path.join(root, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  it('contains platform filter container with accessibility attributes', () => {
    assert.ok(html.includes('id="platform-filter"'), 'Must have id="platform-filter"');
    assert.ok(html.includes('class="filter-bar"'), 'Must have .filter-bar class');
    assert.ok(html.includes('role="group"'), 'Filter bar must have role="group"');
  });

  it('provides filter buttons for all, universal, mobile, and desktop categories', () => {
    const requiredFilters = ['all', 'universal', 'mobile', 'desktop'];
    for (const filter of requiredFilters) {
      assert.ok(
        html.includes(`data-platform-filter="${filter}"`),
        `Filter button for ${filter} must exist`
      );
    }
  });

  it('all experience cards are annotated with data-platform attributes and platform pills', () => {
    assert.ok(html.includes('data-platform="universal"'), 'Universal cards must have data-platform="universal"');
    assert.ok(html.includes('data-platform="mobile"'), 'Mobile cards must have data-platform="mobile"');
    assert.ok(html.includes('data-platform="desktop"'), 'Desktop cards must have data-platform="desktop"');
    assert.ok(html.includes('class="platform-pill"'), 'Cards must display platform badges/pills');
  });

  it('I18N dictionary contains bilingual translations for platform filters and pills', () => {
    const match = html.match(/var I18N = ({[\s\S]*?});\s*var toggleBtn/);
    assert.ok(match, 'I18N dictionary must be defined');

    const I18N = (new Function('return ' + match[1]))();
    const filterKeys = ['filterAll', 'filterUniversal', 'filterMobile', 'filterDesktop', 'pillUniversal', 'pillMobile', 'pillDesktop'];
    for (const key of filterKeys) {
      assert.ok(I18N.de[key], `German translation must include ${key}`);
      assert.ok(I18N.en[key], `English translation must include ${key}`);
    }
  });

  it('script handles filter switching and toggles filtered-out class', () => {
    assert.ok(html.includes('data-platform-filter'), 'Must query platform filter attribute');
    assert.ok(html.includes('filtered-out'), 'Must toggle filtered-out CSS class on cards');
  });
});
