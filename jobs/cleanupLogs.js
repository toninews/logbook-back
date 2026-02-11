const connectDB = require("../db/db");

async function cleanup() {
  try {
    const db = await connectDB();
    const result = await db.collection("logs").deleteMany({});
    console.log(`[CLEANUP] Logs removidos: ${result.deletedCount}`);
  } catch (err) {
    console.error("[CLEANUP ERROR]", err);
  }
}

cleanup();

setInterval(cleanup, 1000 * 60 * 60);
