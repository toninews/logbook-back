// api.js
require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");

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

const directoryPath = path.join(__dirname, "app");

fs.readdir(directoryPath, function (err, files) {
  if (err) {
    console.error("Erro ao ler diretório app:", err);
    process.exit(1);
  }

  files.forEach(function (fileName) {
    if (!fileName.endsWith(".js")) {
      return;
    }

    const name = fileName.split(".")[0];

    const base = require("./app/" + name);

    app.use("/" + name, base);
  });
});

app.listen(PORT, () => {
  console.log(`HTTP em http://localhost:${PORT}`);
});