const test = require("node:test");
const assert = require("node:assert/strict");

const GetLogsUseCase = require("../../src/modules/logs/application/useCases/getLogsUseCase");

test("GetLogsUseCase constructor should throw when repository contract is invalid", () => {
  assert.throws(() => new GetLogsUseCase({ logRepository: {} }), /Contrato inválido/);
});
