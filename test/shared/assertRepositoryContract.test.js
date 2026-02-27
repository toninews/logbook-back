const test = require("node:test");
const assert = require("node:assert/strict");

const assertRepositoryContract = require("../../src/shared/contracts/assertRepositoryContract");

test("assertRepositoryContract should throw for non-object dependency", () => {
  assert.throws(
    () =>
      assertRepositoryContract({
        dependencyName: "logRepository",
        dependency: null,
        methods: ["findPaginated"],
      }),
    /Dependência inválida/
  );
});

test("assertRepositoryContract should throw when method is missing", () => {
  assert.throws(
    () =>
      assertRepositoryContract({
        dependencyName: "logRepository",
        dependency: {},
        methods: ["findPaginated", "create"],
      }),
    /Métodos ausentes/
  );
});

test("assertRepositoryContract should pass when all methods exist", () => {
  assert.doesNotThrow(() =>
    assertRepositoryContract({
      dependencyName: "logRepository",
      dependency: {
        async findPaginated() {},
        async create() {},
      },
      methods: ["findPaginated", "create"],
    })
  );
});
