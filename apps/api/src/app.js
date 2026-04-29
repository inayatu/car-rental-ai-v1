const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const requestLogger = require("./middlewares/request-logger.middleware");
const { globalApiLimiter } = require("./middlewares/rate-limit.middleware");
const logger = require("./utils/logger");
const connectDB = require("./config/db");
const env = require("./config/env");
const registerRoutes = require("./routes");
const { Messages } = require("./constants/errorMessages");
const brand = require("./constants/brand");

const app = express();
app.set("trust proxy", 1);

// API + SPA on different ports are still different origins. Helmet v7+ defaults to
// Cross-Origin-Resource-Policy: same-origin, which blocks the frontend from using JSON responses.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const fromEnv = String(process.env.CORS_ORIGIN || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (fromEnv.length > 0) {
        return callback(null, fromEnv.includes(origin));
      }
      if (env.nodeEnv === "development") {
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
      }
      // Production without CORS_ORIGIN: reflect the requesting origin (tighten via CORS_ORIGIN for deploy)
      return callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 204,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/v1", globalApiLimiter);
app.use(requestLogger);

registerRoutes(app);

app.use((error, _req, res, _next) => {
  logger.error("Unhandled API error", error);

  if (error && error.name === "ZodError") {
    return res.status(400).json({
      message: Messages.http.validationError,
      errors: error.issues,
    });
  }

  const status = error.status || 500;
  return res.status(status).json({
    message: error.message || Messages.http.internalServerError,
  });
});

async function start() {
  await connectDB();

  app.listen(env.port, () => {
    logger.info(`${brand.apiName} · http://localhost:${env.port}`, {
      env: env.nodeEnv,
      logLevel: env.logLevel,
      domain: brand.domain,
    });
  });
}

start().catch((error) => {
  logger.error("Failed to start API", error);
  process.exit(1);
});

