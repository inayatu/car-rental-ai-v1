const util = require("util");
const { createLogger, format, transports } = require("winston");
const env = require("../config/env");

function formatMeta(meta) {
  if (!meta) {
    return "";
  }

  if (meta instanceof Error) {
    return `\n${meta.stack || meta.message}`;
  }

  return `\n${util.inspect(meta, {
    depth: 5,
    colors: false,
    compact: false,
    breakLength: 100,
  })}`;
}

const baseLogger = createLogger({
  level: env.logLevel,
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    format.printf((info) => {
      return `[${info.timestamp}] ${info.level.toUpperCase()} ${info.message}${formatMeta(
        info.meta
      )}`;
    })
  ),
  transports: [new transports.Console()],
});

const logger = {
  info(message, meta) {
    baseLogger.log({ level: "info", message, meta });
  },
  warn(message, meta) {
    baseLogger.log({ level: "warn", message, meta });
  },
  error(message, meta) {
    baseLogger.log({ level: "error", message, meta });
  },
  debug(message, meta) {
    baseLogger.log({ level: "debug", message, meta });
  },
};

module.exports = logger;
