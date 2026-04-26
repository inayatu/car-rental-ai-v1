const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const requestLogger = require("./middlewares/request-logger.middleware");
const logger = require("./utils/logger");
const connectDB = require("./config/db");
const env = require("./config/env");
const registerRoutes = require("./routes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);

registerRoutes(app);

app.use((error, _req, res, _next) => {
  logger.error("Unhandled API error", error);

  if (error && error.name === "ZodError") {
    return res.status(400).json({
      message: "Validation error",
      errors: error.issues,
    });
  }

  const status = error.status || 500;
  return res.status(status).json({
    message: error.message || "Internal server error",
  });
});

async function start() {
  await connectDB();

  app.listen(env.port, () => {
    logger.info(`API running on http://localhost:${env.port}`, {
      env: env.nodeEnv,
      logLevel: env.logLevel,
    });
  });
}

start().catch((error) => {
  logger.error("Failed to start API", error);
  process.exit(1);
});

