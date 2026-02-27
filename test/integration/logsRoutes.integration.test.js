const test = require("node:test");
const assert = require("node:assert/strict");

const createLogsRouter = require("../../app/logs");
const { fail } = require("../../src/shared/http/response");

function createMockReq({ headers = {}, body = {}, query = {}, params = {} }) {
  return {
    headers,
    body,
    query,
    params,
    socket: { remoteAddress: "127.0.0.1" },
  };
}

function createMockRes() {
  let onSend = null;

  return {
    statusCode: 200,
    headers: {},
    body: null,
    sent: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    json(payload) {
      this.body = payload;
      this.sent = true;
      if (typeof onSend === "function") {
        onSend();
      }
      return this;
    },
    setOnSend(callback) {
      onSend = callback;
    },
  };
}

function makeLogsCollection(overrides = {}) {
  return {
    async countDocuments() {
      return 2;
    },
    find() {
      return {
        sort() {
          return this;
        },
        skip() {
          return this;
        },
        limit() {
          return this;
        },
        async toArray() {
          return [
            { _id: "1", title: "A", content: "a", isDeleted: false },
            { _id: "2", title: "B", content: "b", isDeleted: false },
          ];
        },
      };
    },
    async insertOne() {
      return { insertedId: "abc123" };
    },
    async updateOne() {
      return { matchedCount: 1 };
    },
    ...overrides,
  };
}

function createLogsRouterForTest(logsCollectionOverrides = {}) {
  const db = {
    collection(name) {
      if (name !== "logs") {
        throw new Error("Collection not mocked");
      }
      return makeLogsCollection(logsCollectionOverrides);
    },
  };

  return createLogsRouter({ db });
}

function findRouteLayer(router, path, method) {
  return router.stack.find((layer) => {
    if (!layer.route) {
      return false;
    }

    return layer.route.path === path && layer.route.methods[method] === true;
  });
}

async function runHandlers(handlers, req, res) {
  async function runSingle(handler) {
    return new Promise((resolve, reject) => {
      let settled = false;

      const next = (err) => {
        if (settled) {
          return;
        }

        settled = true;
        if (err) {
          return reject(err);
        }

        return resolve();
      };

      res.setOnSend(() => {
        if (settled) {
          return;
        }

        settled = true;
        return resolve();
      });

      try {
        const maybePromise = handler(req, res, next);

        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise
            .then(() => {
              if (!settled && res.sent) {
                settled = true;
                resolve();
              }
            })
            .catch((error) => {
              if (!settled) {
                settled = true;
                reject(error);
              }
            });
        } else if (!settled && res.sent) {
          settled = true;
          resolve();
        }
      } catch (error) {
        if (!settled) {
          settled = true;
          reject(error);
        }
      }
    });
  }

  for (const handler of handlers) {
    await runSingle(handler);
    if (res.sent) {
      break;
    }
  }
}

async function runRoute({ router, method, path, req }) {
  const routeLayer = findRouteLayer(router, path, method);

  if (!routeLayer) {
    throw new Error(`Route not found for ${method.toUpperCase()} ${path}`);
  }

  const handlers = routeLayer.route.stack.map((stackLayer) => stackLayer.handle);
  const res = createMockRes();

  try {
    await runHandlers(handlers, req, res);
  } catch (err) {
    fail(res, {
      statusCode: err?.statusCode || 500,
      code: err?.code || "INTERNAL_ERROR",
      message: err?.message || "Internal server error",
    });
  }

  return res;
}

test("GET /logs/getList returns success contract", async () => {
  process.env.NODE_ENV = "development";
  process.env.WRITE_TOKEN = "test-token";

  const router = createLogsRouterForTest();
  const req = createMockReq({ query: { page: "1", search: "log" } });

  const res = await runRoute({ method: "get", path: "/getList", req, router });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.equal(res.body.meta.currentPage, 1);
  assert.equal(res.body.meta.totalPages, 1);
});

test("GET /logs/getList returns 400 for invalid page", async () => {
  const router = createLogsRouterForTest();
  const req = createMockReq({ query: { page: "0" } });

  const res = await runRoute({ method: "get", path: "/getList", req, router });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, "INVALID_QUERY");
});

test("POST /logs/insertTask returns 201 with created payload", async () => {
  process.env.NODE_ENV = "development";
  process.env.WRITE_TOKEN = "test-token";

  const router = createLogsRouterForTest();
  const req = createMockReq({
    headers: { "x-write-token": "test-token" },
    body: {
      title: "Task",
      content: "Do thing",
      tags: ["node"],
    },
  });

  const res = await runRoute({ method: "post", path: "/insertTask", req, router });

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data._id, "abc123");
  assert.equal(res.body.data.title, "Task");
});

test("POST /logs/insertTask returns 400 for invalid tags", async () => {
  process.env.NODE_ENV = "development";
  process.env.WRITE_TOKEN = "test-token";

  const router = createLogsRouterForTest();
  const req = createMockReq({
    headers: { "x-write-token": "test-token" },
    body: {
      title: "Task",
      content: "Do thing",
      tags: "invalid",
    },
  });

  const res = await runRoute({ method: "post", path: "/insertTask", req, router });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, "VALIDATION_ERROR");
});

test("DELETE /logs/:id returns 401 without token", async () => {
  process.env.NODE_ENV = "development";
  process.env.WRITE_TOKEN = "test-token";

  const router = createLogsRouterForTest();
  const req = createMockReq({ params: { id: "507f1f77bcf86cd799439011" } });

  const res = await runRoute({ method: "delete", path: "/:id", req, router });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, "TOKEN_MISSING");
});

test("DELETE /logs/:id returns 400 for invalid id", async () => {
  process.env.NODE_ENV = "development";
  process.env.WRITE_TOKEN = "test-token";

  const router = createLogsRouterForTest();
  const req = createMockReq({
    headers: { "x-write-token": "test-token" },
    params: { id: "1" },
  });

  const res = await runRoute({ method: "delete", path: "/:id", req, router });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, "INVALID_ID");
});

test("DELETE /logs/:id returns success with valid token", async () => {
  process.env.NODE_ENV = "development";
  process.env.WRITE_TOKEN = "test-token";

  const router = createLogsRouterForTest();
  const req = createMockReq({
    headers: { "x-write-token": "test-token" },
    params: { id: "507f1f77bcf86cd799439011" },
  });

  const res = await runRoute({ method: "delete", path: "/:id", req, router });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    success: true,
    data: { success: true },
  });
});
