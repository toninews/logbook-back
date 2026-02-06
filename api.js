require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const connectDB = require("./db/db");

const app = express();
const PORT = process.env.PORT || 4010;

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

function loadRoutes() {
  const directoryPath = path.join(__dirname, "app");
  const files = fs.readdirSync(directoryPath);

files.forEach((fileName) => {
   if (!fileName.endsWith(".js")) return;
  
   const routeName = fileName.replace(".js", ""); 
   const routeModule = require(path.join(directoryPath, fileName)); 
   
   app.use(`/${routeName}`, routeModule); 
   console.log(`[ROUTE LOADED] /${routeName}`); 
  });
 }

async function startServer() {
  try {
    const db = await connectDB();
    app.locals.db = db; 

    app.use((req, res, next) => { req.db = app.locals.db; next(); });

    loadRoutes();

 
    app.use((req, res) => {
      res.status(404).json({ error: "Route not found" });
    });

    app.use((err, req, res, next) => {
      console.error("[ERRO GLOBAL]", err);
      res.status(500).json({ error: "Internal server error" });
    });

    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("Gracefully shutting down server...");
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("[FATAL] Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
