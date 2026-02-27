const AppError = require("../../../shared/errors/AppError");
const ERROR_CODES = require("../../../shared/errors/errorCodes");

function buildLogEntity({ title, content, tags }) {
  if (typeof title !== "string" || !title.trim()) {
    throw new AppError("Título e conteúdo são obrigatórios.", {
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  if (typeof content !== "string" || !content.trim()) {
    throw new AppError("Título e conteúdo são obrigatórios.", {
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  const now = new Date();

  return {
    title: title.trim(),
    content: content.trim(),
    tags: Array.isArray(tags) ? tags.map(String) : [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    isDeleted: false,
  };
}

module.exports = buildLogEntity;
