const test = require("node:test");
const assert = require("node:assert/strict");

const VerifySessionUseCase = require("../../src/modules/auth/application/useCases/verifySessionUseCase");

test("VerifySessionUseCase should return session context for active user", async () => {
  const userRepository = {
    async findById(id) {
      return { _id: id, usStatus: "active" };
    },
  };

  const useCase = new VerifySessionUseCase({ userRepository });

  const result = await useCase.execute({
    tokenPayload: { usId: "507f1f77bcf86cd799439011", usRole: "admin" },
  });

  assert.equal(result.usId, "507f1f77bcf86cd799439011");
  assert.equal(result.usRole, "admin");
  assert.equal(result.user.usStatus, "active");
});

test("VerifySessionUseCase should reject missing user", async () => {
  const userRepository = {
    async findById() {
      return null;
    },
  };

  const useCase = new VerifySessionUseCase({ userRepository });

  await assert.rejects(
    () =>
      useCase.execute({
        tokenPayload: { usId: "507f1f77bcf86cd799439011", usRole: "admin" },
      }),
    /Sessão inválida\./
  );
});

test("VerifySessionUseCase should reject inactive user", async () => {
  const userRepository = {
    async findById() {
      return { usStatus: "blocked" };
    },
  };

  const useCase = new VerifySessionUseCase({ userRepository });

  await assert.rejects(
    () =>
      useCase.execute({
        tokenPayload: { usId: "507f1f77bcf86cd799439011", usRole: "admin" },
      }),
    /Usuário bloqueado ou inativo\./
  );
});
