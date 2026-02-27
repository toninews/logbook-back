const test = require("node:test");
const assert = require("node:assert/strict");

const SoftDeleteLogUseCase = require("../../src/modules/logs/application/useCases/softDeleteLogUseCase");

test("SoftDeleteLogUseCase should return success when repository deletes", async () => {
  const logRepository = {
    async softDeleteById() {
      return true;
    },
  };

  const useCase = new SoftDeleteLogUseCase({ logRepository });
  const result = await useCase.execute({ id: "507f1f77bcf86cd799439011" });

  assert.deepEqual(result, { success: true });
});

test("SoftDeleteLogUseCase should throw 404 when log does not exist", async () => {
  const logRepository = {
    async softDeleteById() {
      return false;
    },
  };

  const useCase = new SoftDeleteLogUseCase({ logRepository });

  await assert.rejects(
    () => useCase.execute({ id: "507f1f77bcf86cd799439011" }),
    /Log não encontrado\./
  );
});
