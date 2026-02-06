function getDB(req) {
  return req.app.locals.db;
}

module.exports = { getDB };
