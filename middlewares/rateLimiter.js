const rateLimitMap = new Map();

function rateLimiter({ windowMs = 60_000, max = 5 } = {}) {
  return (req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const now = Date.now();

    const requests = rateLimitMap.get(ip) || [];

    const validRequests = requests.filter(
      (timestamp) => now - timestamp < windowMs
    );

    validRequests.push(now);
    rateLimitMap.set(ip, validRequests);

    if (validRequests.length > max) {
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
    }

    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.startTime > 60 * 60 * 1000) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

module.exports = rateLimiter;
