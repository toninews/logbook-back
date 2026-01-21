require("dotenv").config();
const db = require("../db/db");

async function cleanup() {
  try {
    const result = await db.exec.collection("logs").deleteMany({});
    console.log(`[CLEANUP] Logs removidos: ${result.deletedCount}`);
  } catch (err) {
    console.error("[CLEANUP ERROR]", err);
  }
}

cleanup();
