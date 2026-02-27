const AppError = require("../../../../shared/errors/AppError");
const ERROR_CODES = require("../../../../shared/errors/errorCodes");
const assertRepositoryContract = require("../../../../shared/contracts/assertRepositoryContract");

class SoftDeleteLogUseCase {
  constructor({ logRepository }) {
    assertRepositoryContract({
      dependencyName: "logRepository",
      dependency: logRepository,
      methods: ["softDeleteById"],
    });

    this.logRepository = logRepository;
  }

  async execute({ id }) {
    if (typeof id !== "string" || !id.trim()) {
      throw new AppError("ID inválido.", {
        statusCode: 400,
        code: ERROR_CODES.INVALID_ID,
      });
    }

    const wasDeleted = await this.logRepository.softDeleteById(id);

    if (!wasDeleted) {
      throw new AppError("Log não encontrado.", {
        statusCode: 404,
        code: ERROR_CODES.LOG_NOT_FOUND,
      });
    }

    return { success: true };
  }
}

module.exports = SoftDeleteLogUseCase;
