const test = require("node:test");
const assert = require("node:assert/strict");

const requireWriteToken = require("../../src/modules/logs/interfaces/http/requireWriteToken");

function createReq({ writeTokenHeader, authorization }) {
  return {
    headers: {
      "x-write-token": writeTokenHeader,
      authorization,
    },
  };
}

function restoreWriteToken(previousValue) {
  if (previousValue === undefined) {
    delete process.env.WRITE_TOKEN;
    return;
  }

  process.env.WRITE_TOKEN = previousValue;
}

test("requireWriteToken should fail when WRITE_TOKEN is not configured", () => {
  const prevToken = process.env.WRITE_TOKEN;
  delete process.env.WRITE_TOKEN;

  const req = createReq({});
  let receivedError;

  requireWriteToken(req, {}, (err) => {
    receivedError = err;
  });

  restoreWriteToken(prevToken);

  assert.equal(receivedError.code, "WRITE_TOKEN_MISSING");
  assert.equal(receivedError.statusCode, 500);
});

test("requireWriteToken should fail when token is missing", () => {
  const prevToken = process.env.WRITE_TOKEN;
  process.env.WRITE_TOKEN = "abc";

  const req = createReq({});
  let receivedError;

  requireWriteToken(req, {}, (err) => {
    receivedError = err;
  });

  restoreWriteToken(prevToken);

  assert.equal(receivedError.code, "TOKEN_MISSING");
  assert.equal(receivedError.statusCode, 401);
});

test("requireWriteToken should fail when token is invalid", () => {
  const prevToken = process.env.WRITE_TOKEN;
  process.env.WRITE_TOKEN = "correct";

  const req = createReq({ writeTokenHeader: "wrong" });
  let receivedError;

  requireWriteToken(req, {}, (err) => {
    receivedError = err;
  });

  restoreWriteToken(prevToken);

  assert.equal(receivedError.code, "TOKEN_INVALID");
  assert.equal(receivedError.statusCode, 401);
});

test("requireWriteToken should pass with x-write-token", () => {
  const prevToken = process.env.WRITE_TOKEN;
  process.env.WRITE_TOKEN = "correct";

  const req = createReq({ writeTokenHeader: "correct" });
  let nextCalls = 0;

  requireWriteToken(req, {}, (err) => {
    assert.equal(err, undefined);
    nextCalls += 1;
  });

  restoreWriteToken(prevToken);

  assert.equal(nextCalls, 1);
});

test("requireWriteToken should pass with bearer token", () => {
  const prevToken = process.env.WRITE_TOKEN;
  process.env.WRITE_TOKEN = "correct";

  const req = createReq({ authorization: "Bearer correct" });
  let nextCalls = 0;

  requireWriteToken(req, {}, (err) => {
    assert.equal(err, undefined);
    nextCalls += 1;
  });

  restoreWriteToken(prevToken);

  assert.equal(nextCalls, 1);
});
