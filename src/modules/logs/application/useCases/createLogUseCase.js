const buildLogEntity = require("../../domain/buildLogEntity");
const assertRepositoryContract = require("../../../../shared/contracts/assertRepositoryContract");

class CreateLogUseCase {
  constructor({ logRepository }) {
    assertRepositoryContract({
      dependencyName: "logRepository",
      dependency: logRepository,
      methods: ["create"],
    });

    this.logRepository = logRepository;
  }

  async execute({ title, content, tags }) {
    const logEntity = buildLogEntity({ title, content, tags });
    return this.logRepository.create(logEntity);
  }
}

module.exports = CreateLogUseCase;
