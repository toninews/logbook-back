const test = require("node:test");
const assert = require("node:assert/strict");

const buildLogEntity = require("../../src/modules/logs/domain/buildLogEntity");

test("buildLogEntity should create a valid entity", () => {
  const entity = buildLogEntity({
    title: "  title ",
    content: " content ",
    tags: ["a", 2],
  });

  assert.equal(entity.title, "title");
  assert.equal(entity.content, "content");
  assert.deepEqual(entity.tags, ["a", "2"]);
  assert.equal(entity.isDeleted, false);
  assert.equal(entity.deletedAt, null);
  assert.ok(entity.createdAt instanceof Date);
  assert.ok(entity.updatedAt instanceof Date);
});

test("buildLogEntity should throw when title is missing", () => {
  assert.throws(
    () => buildLogEntity({ title: "", content: "ok", tags: [] }),
    /Título e conteúdo são obrigatórios\./
  );
});

test("buildLogEntity should throw when content is missing", () => {
  assert.throws(
    () => buildLogEntity({ title: "ok", content: "", tags: [] }),
    /Título e conteúdo são obrigatórios\./
  );
});
