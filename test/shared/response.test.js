const test = require("node:test");
const assert = require("node:assert/strict");

const { ok, created, fail } = require("../../src/shared/http/response");
const { createMockRes } = require("../helpers/httpMocks");

test("ok should return status 200 with success payload", () => {
  const res = createMockRes();
  ok(res, [{ id: 1 }], { page: 1 });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    success: true,
    data: [{ id: 1 }],
    meta: { page: 1 },
  });
});

test("created should return status 201 with success payload", () => {
  const res = createMockRes();
  created(res, { id: "abc" });

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, {
    success: true,
    data: { id: "abc" },
  });
});

test("fail should return error contract", () => {
  const res = createMockRes();
  fail(res, { statusCode: 401, code: "TOKEN_INVALID", message: "Token inválido" });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    success: false,
    error: {
      code: "TOKEN_INVALID",
      message: "Token inválido",
    },
  });
});
