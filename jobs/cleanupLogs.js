const { connectDB } = require("../db/db");
const cleanupIntervalMs = Number(process.env.CLEANUP_INTERVAL_MS) || 1000 * 60 * 60;
let isRunning = false;

async function cleanup() {
  if (isRunning) return;
  isRunning = true;

  try {
    const db = await connectDB();
    const result = await db.collection("logs").deleteMany({});
    console.log(`[CLEANUP] Logs removidos: ${result.deletedCount}`);
  } catch (err) {
    console.error("[CLEANUP ERROR]", err);
  } finally {
    isRunning = false;
  }
}

cleanup();
setInterval(cleanup, cleanupIntervalMs);
