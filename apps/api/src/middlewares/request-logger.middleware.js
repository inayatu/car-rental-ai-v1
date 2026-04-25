const { randomUUID } = require("crypto");
const logger = require("../utils/logger");

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  const requestId = req.headers["x-request-id"] || randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    logger.info("HTTP request completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  });

  next();
}

module.exports = requestLogger;
