const ERROR_CODES = require("../errors/errorCodes");

function ok(res, data, meta) {
  const payload = { success: true, data };
  if (meta && typeof meta === "object") {
    payload.meta = meta;
  }
  return res.status(200).json(payload);
}

function created(res, data, meta) {
  const payload = { success: true, data };
  if (meta && typeof meta === "object") {
    payload.meta = meta;
  }
  return res.status(201).json(payload);
}

function fail(
  res,
  { statusCode = 500, code = ERROR_CODES.INTERNAL_ERROR, message = "Erro interno do servidor." }
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

module.exports = { ok, created, fail };
