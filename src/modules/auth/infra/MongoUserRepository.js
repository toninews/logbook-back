const { ObjectId } = require("mongodb");
const AppError = require("../../../shared/errors/AppError");
const ERROR_CODES = require("../../../shared/errors/errorCodes");
const UserRepositoryPort = require("../application/ports/UserRepositoryPort");

class MongoUserRepository extends UserRepositoryPort {
  constructor({ db }) {
    super();
    this.collection = db.collection("users");
  }

  async findById(id) {
    let objectId;

    try {
      objectId = new ObjectId(id);
    } catch {
      throw new AppError("Sessão inválida.", {
        statusCode: 401,
        code: ERROR_CODES.INVALID_SESSION,
      });
    }

    return this.collection.findOne({ _id: objectId });
  }
}

module.exports = MongoUserRepository;
