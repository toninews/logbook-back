const test = require("node:test");
const assert = require("node:assert/strict");

const CreateLogUseCase = require("../../src/modules/logs/application/useCases/createLogUseCase");

test("CreateLogUseCase should create and return repository result", async () => {
  const logRepository = {
    async create(entity) {
      return { _id: "123", ...entity };
    },
  };

  const useCase = new CreateLogUseCase({ logRepository });
  const result = await useCase.execute({
    title: "title",
    content: "content",
    tags: ["node"],
  });

  assert.equal(result._id, "123");
  assert.equal(result.title, "title");
  assert.equal(result.content, "content");
  assert.deepEqual(result.tags, ["node"]);
});
