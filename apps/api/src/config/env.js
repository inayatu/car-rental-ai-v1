const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    LOG_LEVEL: z.string().default("info"),

    MONGO_URI: z.preprocess((value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    }, z.string().optional()),
    MONGO_HOST: z.string().default("127.0.0.1"),
    MONGO_PORT: z.coerce.number().int().positive().default(27017),
    MONGO_DB_NAME: z.string().default("car_rental_ai"),
    MONGO_USER: z.string().optional(),
    MONGO_PASSWORD: z.string().optional(),
    MONGO_AUTH_SOURCE: z.string().default("admin"),
    MONGO_MAX_POOL_SIZE: z.coerce.number().int().positive().default(20),
    MONGO_MIN_POOL_SIZE: z.coerce.number().int().nonnegative().default(2),
    MONGO_SERVER_SELECTION_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(5000),
    MONGO_SOCKET_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),

    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_ACCESS_TTL: z.string().default("15m"),
    JWT_REFRESH_TTL: z.string().default("7d"),

    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    CLOUDINARY_FOLDER: z.string().default("car-rental-ai-v1"),
    UPLOAD_URL_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues.map((issue) => issue.message).join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

const rawEnv = parsedEnv.data;

function buildMongoUri() {
  if (rawEnv.MONGO_URI) {
    return rawEnv.MONGO_URI;
  }

  const hasUser = Boolean(rawEnv.MONGO_USER);
  const hasPassword = Boolean(rawEnv.MONGO_PASSWORD);

  if (hasUser !== hasPassword) {
    throw new Error("MONGO_USER and MONGO_PASSWORD must be provided together.");
  }

  const credentials = hasUser
    ? `${encodeURIComponent(rawEnv.MONGO_USER)}:${encodeURIComponent(
        rawEnv.MONGO_PASSWORD
      )}@`
    : "";

  const query = hasUser ? `?authSource=${encodeURIComponent(rawEnv.MONGO_AUTH_SOURCE)}` : "";
  return `mongodb://${credentials}${rawEnv.MONGO_HOST}:${rawEnv.MONGO_PORT}/${rawEnv.MONGO_DB_NAME}${query}`;
}

const env = {
  nodeEnv: rawEnv.NODE_ENV,
  port: rawEnv.PORT,
  logLevel: rawEnv.LOG_LEVEL,
  jwt: {
    accessSecret: rawEnv.JWT_ACCESS_SECRET,
    refreshSecret: rawEnv.JWT_REFRESH_SECRET,
    accessTtl: rawEnv.JWT_ACCESS_TTL,
    refreshTtl: rawEnv.JWT_REFRESH_TTL,
  },
  uploads: {
    cloudName: rawEnv.CLOUDINARY_CLOUD_NAME,
    apiKey: rawEnv.CLOUDINARY_API_KEY,
    apiSecret: rawEnv.CLOUDINARY_API_SECRET,
    folder: rawEnv.CLOUDINARY_FOLDER,
    urlTtlMinutes: rawEnv.UPLOAD_URL_TTL_MINUTES,
  },
  db: {
    uri: buildMongoUri(),
    options: {
      maxPoolSize: rawEnv.MONGO_MAX_POOL_SIZE,
      minPoolSize: rawEnv.MONGO_MIN_POOL_SIZE,
      serverSelectionTimeoutMS: rawEnv.MONGO_SERVER_SELECTION_TIMEOUT_MS,
      socketTimeoutMS: rawEnv.MONGO_SOCKET_TIMEOUT_MS,
    },
  },
};

module.exports = env;
