const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { ObjectId } = require("mongodb");
const rateLimit = require("../middlewares/rateLimiter");


router.get("/getList", async (req, res) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search || "";

  const baseFilter = { isDeleted: false };

    const searchFilter = searchTerm
      ? {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { content: { $regex: searchTerm, $options: "i" } },
            { tags: { $in: [new RegExp(searchTerm, "i")] } },
          ],
        }
      : {};
    const finalFilter = { ...baseFilter, ...searchFilter };

    const logsCollection = db.exec.collection("logs");

    const totalLogs = await logsCollection.countDocuments(finalFilter);

    const logs = await logsCollection

      .find(finalFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({
      data: logs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/insertTask", rateLimit({ windowMs: 60 * 1000, max: 5 }), async (req, res) => { //nome da rota
  try {
    console.log('body', req?.body)
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const now = new Date();

    const logObject = {
      title: String(title),
      content: String(content),
      tags: Array.isArray(tags) ? tags : [],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      isDeleted: false, 
    };

    const result = await db.exec.collection("logs").insertOne(logObject);

    res.status(201).json({
      _id: result.insertedId,
      ...logObject,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao criar" });
  }
});

router.delete("/:id", async (req, res) => { //nome da rota
  try {
    const { id } = req.params;
    console.log('id:', id);

    const result = await db.exec.collection("logs").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
            isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Log não encontrado" });
    }

    res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: "ID inválido" });
  }
});

module.exports = router;
