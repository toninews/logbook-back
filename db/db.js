require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const logTtlSeconds = Number(process.env.LOG_TTL_SECONDS ?? 3600);

if (!uri) {
  throw new Error("Missing required env var: MONGO_URI");
}

if (!dbName) {
  throw new Error("Missing required env var: DB_NAME");
}

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

let db = null;
let connectingPromise = null;

async function ensureLogIndexes(database) {
  if (!Number.isFinite(logTtlSeconds) || logTtlSeconds <= 0) {
    return;
  }

  await database.collection("logs").createIndex(
    { createdAt: 1 },
    {
      expireAfterSeconds: logTtlSeconds,
      name: "logs_createdAt_ttl",
    }
  );
}

async function connectDB() {
  if (db) return db;
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    try {
      await client.connect();
      db = client.db(dbName);
      await db.command({ ping: 1 });
      await ensureLogIndexes(db);
      console.log("Successfully connected to MongoDB");
      return db;
    } catch (err) {
      db = null;
      throw err;
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
}

async function closeDB() {
  try {
    await client.close();
    db = null;
    console.log("MongoDB connection closed");
  } catch (err) {
    console.error("Failed to close MongoDB connection:", err);
    throw err;
  }
}

module.exports = { connectDB, closeDB };
