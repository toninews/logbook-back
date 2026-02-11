require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

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

async function connectDB() {
  if (db) return db;
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    try {
      await client.connect();
      db = client.db(dbName);
      await db.command({ ping: 1 });
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
