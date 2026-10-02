import assert from 'node:assert/strict';
import handler from '../../api/pwnd-question.js';

// The production fallback must be usable without a provider key and must never pretend to be live AI.
const originalKey = process.env.ANTHROPIC_API_KEY;
const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
delete process.env.ANTHROPIC_API_KEY;
async function request(body) {
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
    end() { return this; },
  };
  await handler({ method: 'POST', body, headers: { 'x-real-ip': '127.0.0.1' } }, res);
  return res;
}
try {
  const usedIds = [];
  const usedPrompts = [];
  for (let round = 0; round < 10; round += 1) {
    const response = await request({
      mode: 'duel', opponentId: ['redfox', 'arcticfox', 'fennec'][round % 3],
      weakestSkill: ['recall', 'pattern', 'logic', 'causal', 'source', 'risk'][round % 6],
      targetDifficulty: .5, skills: {},
      recentAnswers: [{ skill: 'logic', correct: false, question: 'Test?', picked: 'A', expected: 'B' }],
      excludeIds: usedIds, excludePrompts: usedPrompts,
    });
    assert.equal(response.statusCode, 200, `duel round ${round + 1} must have a question`);
    assert.equal(response.payload.fallback, true);
    const question = response.payload.question;
    assert.equal(question.source, 'ai-static', 'the fallback must not masquerade as a newly generated question');
    assert.equal(question.options.length, 4);
    assert.ok(!usedIds.includes(question.id));
    assert.ok(!usedPrompts.includes(question.prompt));
    usedIds.push(question.id);
    usedPrompts.push(question.prompt);
  }
  for (const targetDifficulty of [.28, .88]) {
    const ids = [];
    const prompts = [];
    for (let round = 0; round < 10; round += 1) {
      const response = await request({
        mode: 'duel', opponentId: 'fennec', weakestSkill: ['recall', 'pattern', 'logic', 'causal', 'source', 'risk'][round % 6],
        targetDifficulty, skills: {}, excludeIds: ids, excludePrompts: prompts,
      });
      assert.equal(response.statusCode, 200);
      const question = response.payload.question;
      assert.ok(Math.abs(question.difficulty - targetDifficulty) <= .14, `the fallback should stay in the ${targetDifficulty} challenge corridor`);
      assert.ok(!ids.includes(question.id));
      ids.push(question.id);
      prompts.push(question.prompt);
    }
  }
  const free = await request({ mode: 'free', topicId: 'nature', weakestSkill: 'recall', targetDifficulty: .5, skills: {} });
  assert.equal(free.statusCode, 200);
  assert.equal(free.payload.question.topicId, 'nature');
  const invalid = await request({ mode: 'duel', opponentId: 'invented', weakestSkill: 'logic', targetDifficulty: .5 });
  assert.equal(invalid.statusCode, 400);
  process.env.ANTHROPIC_API_KEY = 'test-key-never-sent-to-a-real-provider';
  let generated = {
    type: 'logic', skill: 'logic', difficulty: .5,
    prompt: 'Wenn alle roten Steine rund sind und dieser Stein rot ist, was folgt?',
    options: ['Er ist rund', 'Er ist eckig', 'Er ist blau', 'Es folgt nichts'],
    answer: 0, explanation: 'Ein roter Stein gehört zur Menge der runden Steine.',
    opponentLine: 'Du hast zuletzt einen Schluss übersehen. Wie steht es mit diesem?',
  };
  let sentRequest = '';
  globalThis.fetch = async (_url, options) => {
    sentRequest = String(options?.body || '');
    return new Response(JSON.stringify({
      id: 'msg_test', type: 'message', role: 'assistant', model: 'mock-claude',
      content: [{ type: 'text', text: JSON.stringify(generated) }],
      stop_reason: 'end_turn', usage: { input_tokens: 100, output_tokens: 100 },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const aiRequest = {
    mode: 'duel', opponentId: 'redfox', weakestSkill: 'logic', targetDifficulty: .5,
    skills: { logic: .45 }, recentAnswers: [{ skill: 'logic', correct: false, picked: 'B', expected: 'A' }],
  };
  const live = await request(aiRequest);
  assert.equal(live.statusCode, 200);
  assert.equal(live.payload.question.source, 'ai', 'valid live generation must be distinguishable from the prepared pool');
  assert.equal(live.payload.question.opponentLine, generated.opponentLine);
  assert.match(sentRequest, /Rotfuchs/);
  assert.match(sentRequest, /picked/);
  console.error = () => {}; // The two expected validation failures are intentional test cases.
  const nearRepeat = await request({ ...aiRequest, excludePrompts: [generated.prompt.replace('dieser Stein rot', 'dieser rote Stein')] });
  assert.equal(nearRepeat.payload.fallback, true, 'a generated close paraphrase must fall back to a new question');
  generated = { ...generated, answer: 6 };
  const invalidAnswer = await request(aiRequest);
  assert.equal(invalidAnswer.payload.fallback, true, 'an invalid AI answer must never reach the duel');
  console.log('pwnd-question API tests: ok');
} finally {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
  if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY;
  else process.env.ANTHROPIC_API_KEY = originalKey;
}
