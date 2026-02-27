const assertRepositoryContract = require("../../../../shared/contracts/assertRepositoryContract");

class GetLogsUseCase {
  constructor({ logRepository }) {
    assertRepositoryContract({
      dependencyName: "logRepository",
      dependency: logRepository,
      methods: ["findPaginated"],
    });

    this.logRepository = logRepository;
  }

  async execute({ page, search }) {
    const parsedPage = Number.parseInt(page, 10);
    const safePage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    return this.logRepository.findPaginated({
      page: safePage,
      limit: 5,
      searchTerm: String(search || ""),
    });
  }
}

module.exports = GetLogsUseCase;
