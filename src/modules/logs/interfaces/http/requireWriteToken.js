const crypto = require("crypto");
const AppError = require("../../../../shared/errors/AppError");
const ERROR_CODES = require("../../../../shared/errors/errorCodes");

function requireWriteToken(req, res, next) {
  const headerToken = req.headers["x-write-token"];
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.WRITE_TOKEN;

  let receivedToken = headerToken;

  if (!receivedToken && typeof authHeader === "string") {
    const bearerPrefix = "Bearer ";
    if (authHeader.startsWith(bearerPrefix)) {
      receivedToken = authHeader.slice(bearerPrefix.length).trim();
    }
  }

  if (!expectedToken) {
    return next(
      new AppError("WRITE_TOKEN não configurado no servidor.", {
        statusCode: 500,
        code: ERROR_CODES.WRITE_TOKEN_MISSING,
      })
    );
  }

  if (typeof receivedToken !== "string") {
    return next(
      new AppError("Token de escrita ausente.", {
        statusCode: 401,
        code: ERROR_CODES.TOKEN_MISSING,
      })
    );
  }

  const receivedBuffer = Buffer.from(receivedToken);
  const expectedBuffer = Buffer.from(expectedToken);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return next(
      new AppError("Token de escrita inválido.", {
        statusCode: 401,
        code: ERROR_CODES.TOKEN_INVALID,
      })
    );
  }

  return next();
}

module.exports = requireWriteToken;
