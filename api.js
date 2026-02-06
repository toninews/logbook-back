// api.js
require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs/promises");

const connectDB = require("./db/db");
const dbMiddleware = require("./middlewares/dbMiddleware");

const PORT = process.env.PORT || 4010;


app.use(express.json({ limit: "2mb" }));

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "20mb" }));


async function loadRoutes() {
  const directoryPath = path.join(__dirname, "app");

  try {
    const files = (await fs.readdir(directoryPath)).sort();

    for (const fileName of files) {
      if (!fileName.endsWith(".js")) continue;

      const routeName = fileName.replace(".js", "");
      const filePath = path.resolve(directoryPath, fileName);

      try {

        delete require.cache[require.resolve(filePath)];

        const routeModule = require(filePath);

        if (!routeModule || !routeModule.stack) {
          console.error(`[ERROR] ${fileName} does not export a valid Express Router`);
          continue;
        }

        app.use(`/${routeName}`, routeModule);

        console.log(`[ROUTE LOADED] /${routeName}`);

      } catch (routeError) {
        console.error(`[ERROR] Failed to load route ${fileName}:`, routeError.message);
      }
    }

  } catch (err) {
    console.error("[ERROR] Failed to read routes directory:", err.message);
    throw err;
  }
}

async function startServer() {
  try {
    await connectDB();

    app.use(dbMiddleware);

    await loadRoutes();


    app.use((req, res) => {
      res.status(404).json({
        error: "Route not found"
      });
    });

    app.use((err, req, res, next) => {
      console.error("[GLOBAL ERROR]", err);
      res.status(500).json({
        error: "Internal server error"
      });
    });

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });


    process.on("SIGINT", async () => {
      console.log("🛑 Gracefully shutting down server...");
      server.close(() => process.exit(0));
    });

  } catch (error) {
    console.error("[FATAL] Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
