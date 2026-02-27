const { ObjectId } = require("mongodb");
const AppError = require("../../../shared/errors/AppError");
const ERROR_CODES = require("../../../shared/errors/errorCodes");
const LogRepositoryPort = require("../application/ports/LogRepositoryPort");

class MongoLogRepository extends LogRepositoryPort {
  constructor({ db }) {
    super();
    this.collection = db.collection("logs");
  }

  async findPaginated({ page, limit, searchTerm }) {
    const skip = (page - 1) * limit;
    const baseFilter = { isDeleted: false };

    const searchFilter = searchTerm
      ? {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { content: { $regex: searchTerm, $options: "i" } },
            { tags: { $in: [new RegExp(searchTerm, "i")] } },
          ],
        }
      : {};

    const finalFilter = { ...baseFilter, ...searchFilter };

    const totalLogs = await this.collection.countDocuments(finalFilter);
    const logs = await this.collection
      .find(finalFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      data: logs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
    };
  }

  async create(logEntity) {
    const result = await this.collection.insertOne(logEntity);
    return { _id: result.insertedId, ...logEntity };
  }

  async softDeleteById(id) {
    let objectId;

    try {
      objectId = new ObjectId(id);
    } catch {
      throw new AppError("ID inválido.", {
        statusCode: 400,
        code: ERROR_CODES.INVALID_ID,
      });
    }

    const result = await this.collection.updateOne(
      { _id: objectId, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return result.matchedCount > 0;
  }
}

module.exports = MongoLogRepository;
