import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../server/app.mjs';

async function withServer(run) {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('GET /Pi/helloworld/pi/ liefert die Hello-World-Seite', () => withServer(async base => {
  const response = await fetch(`${base}/Pi/helloworld/pi/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  const html = await response.text();
  assert.match(html, /Hello, <em>World!<\/em>/);
}));

test('/Pi/helloworld/pi ohne Schrägstrich leitet relativ auf die Variante mit Schrägstrich um', () => withServer(async base => {
  const response = await fetch(`${base}/Pi/helloworld/pi`, { redirect: 'manual' });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), '/Pi/helloworld/pi/');
}));

test('die Route ist case-sensitiv', () => withServer(async base => {
  const response = await fetch(`${base}/pi/helloworld/pi/`);
  assert.equal(response.status, 404);
}));

test('GET /api/health antwortet ohne Login mit ok', () => withServer(async base => {
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
}));

test('manus-routes.json enthält die neue Route', () => withServer(async base => {
  const response = await fetch(`${base}/manus-routes.json`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.routes.some(route => route.path === '/Pi/helloworld/pi/'));
}));
