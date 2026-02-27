const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

function loadVerifyJWTMiddlewareWithMockedJwt(mockJwt) {
  const modulePath = require.resolve("../../src/modules/auth/interfaces/http/verifyJWTMiddleware");
  const originalLoad = Module._load;

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "jsonwebtoken") {
      return mockJwt;
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  delete require.cache[modulePath];

  try {
    return require(modulePath);
  } finally {
    Module._load = originalLoad;
    delete require.cache[modulePath];
  }
}

function createReq({ token, user }) {
  return {
    cookies: token ? { access_token: token } : {},
    db: {
      collection(name) {
        if (name !== "users") {
          throw new Error("Collection not mocked");
        }

        return {
          async findOne() {
            return user;
          },
        };
      },
    },
  };
}

test("verifyJWTMiddleware should fail when token is missing", async () => {
  const middleware = loadVerifyJWTMiddlewareWithMockedJwt({
    verify() {
      throw new Error("should not call verify");
    },
  });

  const req = createReq({});
  process.env.JWT_SECRET = "secret";

  let receivedError;
  await middleware(req, {}, (err) => {
    receivedError = err;
  });

  assert.equal(receivedError.code, "UNAUTHENTICATED");
  assert.equal(receivedError.statusCode, 401);
});

test("verifyJWTMiddleware should fail when JWT_SECRET is missing", async () => {
  const middleware = loadVerifyJWTMiddlewareWithMockedJwt({
    verify() {
      throw new Error("should not call verify");
    },
  });

  const previousSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  const req = createReq({ token: "abc" });
  let receivedError;

  await middleware(req, {}, (err) => {
    receivedError = err;
  });

  if (previousSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = previousSecret;
  }

  assert.equal(receivedError.code, "JWT_SECRET_MISSING");
  assert.equal(receivedError.statusCode, 500);
});

test("verifyJWTMiddleware should fail when jwt.verify throws", async () => {
  const middleware = loadVerifyJWTMiddlewareWithMockedJwt({
    verify() {
      throw new Error("bad token");
    },
  });

  process.env.JWT_SECRET = "secret";
  const req = createReq({ token: "abc" });

  let receivedError;
  await middleware(req, {}, (err) => {
    receivedError = err;
  });

  assert.equal(receivedError.code, "INVALID_SESSION");
  assert.equal(receivedError.statusCode, 401);
});

test("verifyJWTMiddleware should fail when user is inactive", async () => {
  const middleware = loadVerifyJWTMiddlewareWithMockedJwt({
    verify() {
      return { usId: "507f1f77bcf86cd799439011", usRole: "admin" };
    },
  });

  process.env.JWT_SECRET = "secret";
  const req = createReq({
    token: "abc",
    user: { _id: "507f1f77bcf86cd799439011", usStatus: "blocked" },
  });

  let receivedError;
  await middleware(req, {}, (err) => {
    receivedError = err;
  });

  assert.equal(receivedError.code, "USER_INACTIVE");
  assert.equal(receivedError.statusCode, 403);
});

test("verifyJWTMiddleware should attach user context when session is valid", async () => {
  const middleware = loadVerifyJWTMiddlewareWithMockedJwt({
    verify(token, secret) {
      assert.equal(token, "valid-token");
      assert.equal(secret, "secret");
      return { usId: "507f1f77bcf86cd799439011", usRole: "admin" };
    },
  });

  process.env.JWT_SECRET = "secret";
  const activeUser = { _id: "507f1f77bcf86cd799439011", usStatus: "active", name: "Ana" };
  const req = createReq({ token: "valid-token", user: activeUser });

  let nextCalls = 0;
  await middleware(req, {}, (err) => {
    assert.equal(err, undefined);
    nextCalls += 1;
  });

  assert.equal(nextCalls, 1);
  assert.equal(req.usId, "507f1f77bcf86cd799439011");
  assert.equal(req.usRole, "admin");
  assert.deepEqual(req.user, activeUser);
});
