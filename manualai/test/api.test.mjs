import assert from "node:assert/strict";

process.env.ANTHROPIC_API_KEY ||= "manualai-test-key";
const { default: handler } = await import("../../api/manualai.js");

function responseStub() {
  return {
    statusCode: 200,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    json(body) { this.body = body; return this; },
    end() { this.ended = true; return this; },
  };
}

const getResponse = responseStub();
await handler({ method: "GET" }, getResponse);
assert.equal(getResponse.statusCode, 405);
assert.equal(getResponse.headers.Allow, "POST");

const tooShort = responseStub();
await handler({ method: "POST", body: { idea: "  " } }, tooShort);
assert.equal(tooShort.statusCode, 400);

const tooLong = responseStub();
await handler({ method: "POST", body: { idea: "x".repeat(6001) } }, tooLong);
assert.equal(tooLong.statusCode, 400);

console.log("manualAI API contract tests: ok");
