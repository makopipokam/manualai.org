import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appPaths = [
  path.join(root, 'apps', 'mydog', 'cats&dogs', 'index.html'),
  path.join(root, 'apps', 'mycat', 'cats&dogs', 'index.html'),
];

describe('Nested cats&dogs apps', () => {
  for (const filePath of appPaths) {
    it(`${path.relative(root, filePath)} exists as a self-contained app`, () => {
      assert.ok(fs.existsSync(filePath), `missing ${filePath}`);
      const html = fs.readFileSync(filePath, 'utf8');
      assert.match(html, /<title>cats &amp; dogs<\/title>/i);
      assert.match(html, /id=["']app["']/i);
      assert.match(html, /id=["']feedbackBubble["']/i);
      assert.match(html, /testMode/);
      assert.match(html, /SB_URL=.*supabase\.co/);
    });
  }

  it('both copies are byte-identical to keep the two entry points in sync', () => {
    const [dog, cat] = appPaths.map(filePath => fs.readFileSync(filePath));
    assert.deepEqual(dog, cat);
  });
});
