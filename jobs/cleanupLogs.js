const { connectDB } = require("../db/db");
const cleanupIntervalMs = Number(process.env.CLEANUP_INTERVAL_MS) || 1000 * 60 * 60;
const cleanupRetentionDays = Number(process.env.CLEANUP_RETENTION_DAYS) || 30;
let isRunning = false;

async function cleanup() {
  if (isRunning) return;
  isRunning = true;

  try {
    const db = await connectDB();
    const cutoffDate = new Date(Date.now() - cleanupRetentionDays * 24 * 60 * 60 * 1000);

    const result = await db.collection("logs").deleteMany({
      isDeleted: true,
      deletedAt: { $lte: cutoffDate },
    });

    console.log(
      `[CLEANUP] Logs removidos: ${result.deletedCount} (soft-deleted ate ${cutoffDate.toISOString()})`
    );
  } catch (err) {
    console.error("[CLEANUP ERROR]", err);
  } finally {
    isRunning = false;
  }
}

cleanup();
setInterval(cleanup, cleanupIntervalMs);
