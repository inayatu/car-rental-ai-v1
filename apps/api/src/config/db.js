const mongoose = require("mongoose");
const logger = require("../utils/logger");
const env = require("./env");

async function connectDB() {
  try {
    await mongoose.connect(env.db.uri, env.db.options);
    logger.info("MongoDB connected", {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } catch (error) {
    logger.error("MongoDB initial connection failed", error);
    throw error;
  }

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB runtime error", error);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
}

module.exports = connectDB;
