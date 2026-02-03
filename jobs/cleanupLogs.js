const { exec } = require("../db/db");

async function cleanup() {
  try {
    const result = await exec.collection("logs").deleteMany({});
    console.log(`[CLEANUP] Logs removidos: ${result.deletedCount}`);
  } catch (err) {
    console.error("[CLEANUP ERROR]", err);
  }
}

cleanup();

setInterval(cleanup, 1000 * 60 * 60);
