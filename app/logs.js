const express = require("express");
const rateLimit = require("../middlewares/rateLimiter");
const MongoLogRepository = require("../src/modules/logs/infra/MongoLogRepository");
const GetLogsUseCase = require("../src/modules/logs/application/useCases/getLogsUseCase");
const CreateLogUseCase = require("../src/modules/logs/application/useCases/createLogUseCase");
const SoftDeleteLogUseCase = require("../src/modules/logs/application/useCases/softDeleteLogUseCase");
const makeLogsController = require("../src/modules/logs/interfaces/http/logsController");
const requireWriteToken = require("../src/modules/logs/interfaces/http/requireWriteToken");
const {
  validateGetList,
  validateCreateLog,
  validateDeleteLog,
} = require("../src/modules/logs/interfaces/http/validateLogsRequest");

function createLogsRouter({ db }) {
  const router = express.Router();

  const logRepository = new MongoLogRepository({ db });
  const logsController = makeLogsController({
    getLogsUseCase: new GetLogsUseCase({ logRepository }),
    createLogUseCase: new CreateLogUseCase({ logRepository }),
    softDeleteLogUseCase: new SoftDeleteLogUseCase({ logRepository }),
  });

  router.get("/getList", validateGetList, (req, res, next) =>
    logsController.getList(req, res, next)
  );

  router.post(
    "/insertTask",
    requireWriteToken,
    rateLimit({ windowMs: 60 * 1000, max: 5 }),
    validateCreateLog,
    (req, res, next) => logsController.create(req, res, next)
  );

  router.delete("/:id", requireWriteToken, validateDeleteLog, (req, res, next) =>
    logsController.remove(req, res, next)
  );

  return router;
}

module.exports = createLogsRouter;
