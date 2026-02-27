const test = require("node:test");
const assert = require("node:assert/strict");

const GetLogsUseCase = require("../../src/modules/logs/application/useCases/getLogsUseCase");

test("GetLogsUseCase should normalize page and call repository", async () => {
  const calls = [];
  const logRepository = {
    async findPaginated(params) {
      calls.push(params);
      return { data: [], currentPage: params.page, totalPages: 0 };
    },
  };

  const useCase = new GetLogsUseCase({ logRepository });
  const result = await useCase.execute({ page: "2", search: "docker" });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { page: 2, limit: 5, searchTerm: "docker" });
  assert.equal(result.currentPage, 2);
});

test("GetLogsUseCase should fallback to page 1 for invalid page", async () => {
  const logRepository = {
    async findPaginated(params) {
      return { data: [], currentPage: params.page, totalPages: 0 };
    },
  };

  const useCase = new GetLogsUseCase({ logRepository });
  const result = await useCase.execute({ page: "abc", search: "" });

  assert.equal(result.currentPage, 1);
});
