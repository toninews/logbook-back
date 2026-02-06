const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

let db = null;

async function connectDB() {
  if (db) return db;

  try {
    await client.connect();
    console.log("Successfully connected to MongoDB");

    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await client.close();
    console.log("MongoDB connection closed");
  } catch (err) {
    console.error("Failed to close MongoDB connection:", err);
  }
  process.exit(0);
});

module.exports = connectDB;
