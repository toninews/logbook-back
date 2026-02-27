const rateLimitMap = new Map();

function rateLimiter({ windowMs = 60_000, max = 5 } = {}) {
  return (req, res, next) => {

    if (process.env.NODE_ENV === "development") {
      return next();
    }

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress;

    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry) {
      rateLimitMap.set(ip, {
        count: 1,
        windowStart: now,
      });
      return next();
    }

    if (now - entry.windowStart >= windowMs) {
      entry.count = 1;
      entry.windowStart = now;
      return next();
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil(
        (entry.windowStart + windowMs - now) / 1000
      );

      res.setHeader("Retry-After", retryAfter);

      return res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
    }

    entry.count += 1;
    return next();
  };
}

const cleanupTimer = setInterval(() => {
  const now = Date.now();

  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > 2 * 60 * 60 * 1000) {
      rateLimitMap.delete(ip);
    }
  }
}, 15 * 60 * 1000);

// Avoid blocking process shutdown in tests/short-lived processes.
cleanupTimer.unref();

module.exports = rateLimiter;
