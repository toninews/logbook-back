const test = require("node:test");
const assert = require("node:assert/strict");

const makeLogsController = require("../../src/modules/logs/interfaces/http/logsController");
const { createMockRes } = require("../helpers/httpMocks");

test("logsController.getList should map use case output to success/data/meta", async () => {
  const controller = makeLogsController({
    getLogsUseCase: {
      async execute() {
        return {
          data: [{ title: "A" }],
          currentPage: 2,
          totalPages: 5,
        };
      },
    },
    createLogUseCase: { async execute() {} },
    softDeleteLogUseCase: { async execute() {} },
  });

  const req = { query: { page: "2", search: "a" } };
  const res = createMockRes();
  let nextCalled = false;

  await controller.getList(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    success: true,
    data: [{ title: "A" }],
    meta: {
      currentPage: 2,
      totalPages: 5,
    },
  });
});

test("logsController.create should return 201 and success payload", async () => {
  const controller = makeLogsController({
    getLogsUseCase: { async execute() {} },
    createLogUseCase: {
      async execute() {
        return { _id: "1", title: "T" };
      },
    },
    softDeleteLogUseCase: { async execute() {} },
  });

  const req = { body: { title: "T", content: "C" } };
  const res = createMockRes();

  await controller.create(req, res, () => {});

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, {
    success: true,
    data: { _id: "1", title: "T" },
  });
});

test("logsController.remove should call next when use case throws", async () => {
  const err = new Error("boom");

  const controller = makeLogsController({
    getLogsUseCase: { async execute() {} },
    createLogUseCase: { async execute() {} },
    softDeleteLogUseCase: {
      async execute() {
        throw err;
      },
    },
  });

  const req = { params: { id: "1" } };
  const res = createMockRes();
  let receivedErr;

  await controller.remove(req, res, (e) => {
    receivedErr = e;
  });

  assert.equal(receivedErr, err);
});
