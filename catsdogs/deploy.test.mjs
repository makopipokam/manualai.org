import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(dir);
const shell = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const continuation = fs.readFileSync(path.join(root, 'mycat', 'cats&dogs', 'index.html'), 'utf8');
const mycatServiceWorker = fs.readFileSync(path.join(root, 'mycat', 'sw.js'), 'utf8');
const genotypeMigration = fs.readFileSync(path.join(dir, 'genotype-matching-2026-10-04.sql'), 'utf8');
const script = app.match(/<script>([\s\S]*?)<\/script>/)?.[1];

assert.ok(script, 'App-Script fehlt');
assert.match(shell, /4 WEGE/);
assert.match(shell, /href="\/pwnd\/"/);
assert.match(shell, /href="\/mydog\/"/);
assert.match(shell, /href="\/mycat\/"/);
assert.doesNotMatch(shell, /href="\/catsdogs\/"/);
assert.match(shell, /href="\/fishroyale\/"/);
assert.match(shell, /03 · PROFIL/);
assert.match(shell, /MyCat/);
assert.match(app, /src="\/catsdogs\/vendor\/supabase\.js"/);
assert.doesNotMatch(app, /src="https:\/\/cdn\.jsdelivr\.net/);

// MyDog handoff: one-time, same-origin, and aggregate personality only.
assert.match(script, /myDogLaunch=testParams.get\('from'\)==='mydog',testMode=!myDogLaunch\|\|testParams.get\('test'\)==='1'/);
assert.match(script, /MYDOG_HANDOFF_KEY='manualai_mydog_handoff_v1'/);
assert.match(script, /version!==1/);
assert.match(script, /U\.importedB5/);
assert.match(script, /30\*60\*1000/);

// Genotype onboarding and private, exact-same-genotype compatibility rule.
assert.match(script, /function genotype\(\)/);
assert.match(script, /Welchen Genotyp hast du\?/);
assert.match(script, /'XX','XY','X0','XXY','XYY','XXX'/);
assert.match(script, /data-gt=/);
assert.match(script, /XX, X0 und XXX matchen mit XY, XXY und XYY/);
assert.match(script, /Dem Match wird der Genotyp nicht angezeigt/);
assert.match(script, /set_cats_dogs_genotype/);
assert.match(script, /genotype:U\.gt/);
assert.doesNotMatch(script, /function gender\(\)|data-g=|gender:U\.g/);
assert.match(script, /TX\.neutral/);
assert.match(genotypeMigration, /add column if not exists genotype text/i);
assert.match(genotypeMigration, /genotype is not null or gender is not null/i);
assert.match(genotypeMigration, /my_genotype = any \(array\['XX', 'X0', 'XXX'\]::text\[\]\)/);
assert.match(genotypeMigration, /p\.genotype = any \(array\['XY', 'XXY', 'XYY'\]::text\[\]\)/);
assert.match(genotypeMigration, /my_genotype = any \(array\['XY', 'XXY', 'XYY'\]::text\[\]\)/);
assert.match(genotypeMigration, /p\.genotype = any \(array\['XX', 'X0', 'XXX'\]::text\[\]\)/);
assert.match(genotypeMigration, /set_cats_dogs_genotype/);
assert.match(genotypeMigration, /complementary chromosome-pattern groups/i);
assert.match(genotypeMigration, /jsonb_build_object\('uid', p\.user_id, 'an', p\.animal/);

// Existing beta, age, feedback, test-mode, route, and MyCat continuation contracts.
assert.match(script, /U=testQuick\?/);
assert.doesNotMatch(script, /function orientation\(\)|data-o=|homo|gleiches Geschlecht|Dating-Präferenz/);
assert.match(script, /function quiz\(i,a\)/);
assert.match(script, /<h3>Wie alt bist du\?<\/h3><p id="agePreview"/);
assert.match(script, /\$\{petYears\(v,m\.an\)\} \$\{m\.an=='dog'\?'Hundejahre':'Katzenjahre'\}/);
assert.doesNotMatch(script, /\?petAgeText\(v,m\.an\)/);
assert.doesNotMatch(script, /Du siehst dein echtes Alter mit Tierjahren/);
assert.match(script, /a\.textContent=\(S\.ageBands&&S\.ageBands\[oid\]\)\|\|AG\[ageGroup\(Number\(o\.age\)\)\]/);
assert.doesNotMatch(script, /Altersspanne des Gegenübers:/);
assert.match(script, /rpc\('submit_cats_dogs_feedback'/);
assert.match(script, /ba=testMode\?\(U\.an=='dog'\?'cat':'dog'\)/);
assert.ok(fs.statSync(path.join(dir, 'vendor', 'supabase.js')).size > 150000);
assert.ok(fs.statSync(path.join(dir, 'vendor', 'LICENSE')).size > 500);
assert.ok(config.redirects.some(r => r.source === '/catsdogs' && r.destination === '/catsdogs/'));
assert.ok(config.rewrites.some(r => r.source === '/catsdogs' && r.destination === '/catsdogs/index.html'));
assert.ok(config.redirects.some(r => r.source === '/mycat' && r.destination === '/mycat/'));
assert.ok(config.rewrites.some(r => r.source === '/mycat' && r.destination === '/mycat/index.html'));
assert.ok(config.redirects.some(r => r.source === '/mycat/cats&dogs' && r.destination === '/mycat/cats&dogs/'));
assert.ok(config.rewrites.some(r => r.source === '/mycat/cats&dogs' && r.destination === '/mycat/cats&dogs/index.html'));
assert.match(continuation, /Oder willst du eigentlich nur Liebe\?/);
assert.match(continuation, /Die MyCat-Ergebnisse werden noch nicht an eine Dating-App übergeben\./);
assert.match(mycatServiceWorker, /'\/mycat\/cats&dogs\/index\.html'/);
assert.ok(config.redirects.some(r => r.source === '/fishroyale' && r.destination === '/fishroyale/'));
assert.ok(config.rewrites.some(r => r.source === '/fishroyale' && r.destination === '/fishroyale/index.html'));
assert.ok(config.headers.some(h => h.headers.some(v => v.key === 'Content-Security-Policy' && v.value.includes("script-src 'self'"))));
console.log('cats&dogs deployment smoke passed: genotype onboarding/migration, MyDog handoff, MyCat continuation, routes, CSP and vendored browser library.');
