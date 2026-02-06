const connectDB = require("../db/db");

async function dbMiddleware(req, res, next) {
  try {
    const db = await connectDB();
    req.db = db;
    next();
  } catch (error) {
    console.error("Database middleware error:", error);    

    res.status(500).json({ error: "Database connection error" });
  }
}

module.exports = dbMiddleware;
