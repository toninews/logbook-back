const { MongoClient, ServerApiVersion } = require("mongodb");

const url = process.env.MONGO_URI;

const client = new MongoClient(url, {
  serverApi: ServerApiVersion.v1,
});


let db = null;

async function connectDB() {
  if (db) return db;
try {
  await client.connect();
  console.log("✅ Successfully connected to MongoDB");

  db = client.db(process.env.DB_NAME);

  return db;
  } catch (err) { 
  console.error("❌ Failed to connect to MongoDB:", err);
  throw err; }
}

process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});

module.exports = connectDB;