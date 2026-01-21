const { MongoClient, ServerApiVersion } = require("mongodb");

const url = process.env.MONGO_URI;

const client = new MongoClient(url, {
  serverApi: ServerApiVersion.v1,
});


async function connect() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

connect();

const exec = client.db(process.env.DB_NAME);

process.on("SIGINT", async () => {
  try {
    await client.close();
    console.log("MongoDB connection closed");
  } catch (err) {
    console.error("Failed to close MongoDB connection:", err);
  }
  process.exit(0);
});

module.exports = { exec };