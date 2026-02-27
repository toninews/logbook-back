const test = require("node:test");
const assert = require("node:assert/strict");

const VerifySessionUseCase = require("../../src/modules/auth/application/useCases/verifySessionUseCase");

test("VerifySessionUseCase constructor should throw when repository contract is invalid", () => {
  assert.throws(() => new VerifySessionUseCase({ userRepository: {} }), /Contrato inválido/);
});
