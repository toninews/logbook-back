const AppError = require("../../../../shared/errors/AppError");
const ERROR_CODES = require("../../../../shared/errors/errorCodes");

function validateGetList(req, res, next) {
  const { page, search } = req.query || {};

  if (page !== undefined) {
    const parsedPage = Number.parseInt(page, 10);
    if (Number.isNaN(parsedPage) || parsedPage < 1) {
      return next(
        new AppError("O parâmetro 'page' deve ser um inteiro positivo.", {
          statusCode: 400,
          code: ERROR_CODES.INVALID_QUERY,
        })
      );
    }
  }

  if (search !== undefined && typeof search !== "string") {
    return next(
      new AppError("O parâmetro 'search' deve ser uma string.", {
        statusCode: 400,
        code: ERROR_CODES.INVALID_QUERY,
      })
    );
  }

  return next();
}

function validateCreateLog(req, res, next) {
  const body = req.body || {};
  const { title, content, tags } = body;

  if (typeof title !== "string" || !title.trim()) {
    return next(
      new AppError("Título é obrigatório.", {
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
      })
    );
  }

  if (typeof content !== "string" || !content.trim()) {
    return next(
      new AppError("Conteúdo é obrigatório.", {
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
      })
    );
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    return next(
      new AppError("Tags deve ser um array.", {
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
      })
    );
  }

  if (Array.isArray(tags) && tags.some((tag) => typeof tag !== "string")) {
    return next(
      new AppError("Todos os itens de tags devem ser strings.", {
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
      })
    );
  }

  return next();
}

function validateDeleteLog(req, res, next) {
  const { id } = req.params || {};

  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
    return next(
      new AppError("ID inválido.", {
        statusCode: 400,
        code: ERROR_CODES.INVALID_ID,
      })
    );
  }

  return next();
}

module.exports = {
  validateGetList,
  validateCreateLog,
  validateDeleteLog,
};
