const AppError = require("../errors/AppError");
const ERROR_CODES = require("../errors/errorCodes");

function assertRepositoryContract({ dependencyName, dependency, methods }) {
  const isObjectLike = dependency && typeof dependency === "object";

  if (!isObjectLike) {
    throw new AppError(
      `Dependência inválida: '${dependencyName}' deve ser um objeto com métodos esperados.`,
      {
        statusCode: 500,
        code: ERROR_CODES.DEPENDENCY_CONTRACT_ERROR,
      }
    );
  }

  const missingMethods = methods.filter((methodName) => typeof dependency[methodName] !== "function");

  if (missingMethods.length > 0) {
    throw new AppError(
      `Contrato inválido em '${dependencyName}'. Métodos ausentes: ${missingMethods.join(", ")}.`,
      {
        statusCode: 500,
        code: ERROR_CODES.DEPENDENCY_CONTRACT_ERROR,
      }
    );
  }
}

module.exports = assertRepositoryContract;
