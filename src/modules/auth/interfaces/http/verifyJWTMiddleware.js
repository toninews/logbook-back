const jwt = require("jsonwebtoken");
const AppError = require("../../../../shared/errors/AppError");
const ERROR_CODES = require("../../../../shared/errors/errorCodes");
const VerifySessionUseCase = require("../../application/useCases/verifySessionUseCase");
const MongoUserRepository = require("../../infra/MongoUserRepository");

async function verifyJWTMiddleware(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;
  const token = req.cookies?.access_token;

  if (!token) {
    return next(
      new AppError("Não autenticado.", {
        statusCode: 401,
        code: ERROR_CODES.UNAUTHENTICATED,
      })
    );
  }

  if (!jwtSecret) {
    return next(
      new AppError("JWT_SECRET não configurado no servidor.", {
        statusCode: 500,
        code: ERROR_CODES.JWT_SECRET_MISSING,
      })
    );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userRepository = new MongoUserRepository({ db: req.db });
    const verifySessionUseCase = new VerifySessionUseCase({ userRepository });

    const { user, usId, usRole } = await verifySessionUseCase.execute({
      tokenPayload: decoded,
    });

    req.user = user;
    req.usId = usId;
    req.usRole = usRole;

    return next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }

    return next(
      new AppError("Sessão inválida.", {
        statusCode: 401,
        code: ERROR_CODES.INVALID_SESSION,
      })
    );
  }
}

module.exports = verifyJWTMiddleware;
