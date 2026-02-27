const { ok, created } = require("../../../../shared/http/response");

function makeLogsController({ getLogsUseCase, createLogUseCase, softDeleteLogUseCase }) {
  return {
    async getList(req, res, next) {
      try {
        const result = await getLogsUseCase.execute({
          page: req.query.page,
          search: req.query.search,
        });

        return ok(res, result.data, {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
        });
      } catch (err) {
        return next(err);
      }
    },

    async create(req, res, next) {
      try {
        const result = await createLogUseCase.execute(req.body || {});
        return created(res, result);
      } catch (err) {
        return next(err);
      }
    },

    async remove(req, res, next) {
      try {
        const result = await softDeleteLogUseCase.execute({
          id: req.params.id,
        });

        return ok(res, result);
      } catch (err) {
        return next(err);
      }
    },
  };
}

module.exports = makeLogsController;
