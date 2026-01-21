// utils/verify.js
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const { ObjectId } = require("mongodb");

const JWT_SECRET = process.env.JWT_SECRET;

const verifyJWT = async (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ message: "Não autenticado." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = db.exec.collection("users");
    const user = await users.findOne({ _id: new ObjectId(decoded.usId) });
    if (!user) {
      return res.status(401).json({ message: "Sessão inválida." });
    }
    if (user.usStatus !== "active") {
      return res.status(403).json({ message: "Usuário bloqueado ou inativo." });
    }
    req.user = user;
    req.usId = decoded.usId;
    req.usRole = decoded.usRole;
    return next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Sessão inválida." });
  }
};

module.exports = verifyJWT;