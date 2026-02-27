const AppError = require("../../../../shared/errors/AppError");
const ERROR_CODES = require("../../../../shared/errors/errorCodes");
const assertRepositoryContract = require("../../../../shared/contracts/assertRepositoryContract");

class VerifySessionUseCase {
  constructor({ userRepository }) {
    assertRepositoryContract({
      dependencyName: "userRepository",
      dependency: userRepository,
      methods: ["findById"],
    });

    this.userRepository = userRepository;
  }

  async execute({ tokenPayload }) {
    const userId = tokenPayload?.usId;

    if (!userId) {
      throw new AppError("Sessão inválida.", {
        statusCode: 401,
        code: ERROR_CODES.INVALID_SESSION,
      });
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("Sessão inválida.", {
        statusCode: 401,
        code: ERROR_CODES.INVALID_SESSION,
      });
    }

    if (user.usStatus !== "active") {
      throw new AppError("Usuário bloqueado ou inativo.", {
        statusCode: 403,
        code: ERROR_CODES.USER_INACTIVE,
      });
    }

    return {
      user,
      usId: tokenPayload.usId,
      usRole: tokenPayload.usRole,
    };
  }
}

module.exports = VerifySessionUseCase;
