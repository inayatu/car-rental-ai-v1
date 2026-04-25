const swaggerUi = require("swagger-ui-express");
const path = require("path");
const authRoutes = require("../modules/auth/auth.routes");
const carRoutes = require("../modules/cars/car.routes");
const bookingRoutes = require("../modules/bookings/booking.routes");
const openApiSpec = require("../docs/openapi");
const env = require("../config/env");

function registerRoutes(app) {
  app.use(
    env.uploads.publicBasePath,
    require("express").static(path.join(process.cwd(), env.uploads.dir))
  );

  app.get("/health", (_req, res) => {
    return res.status(200).json({ ok: true });
  });

  app.get("/api/docs.json", (_req, res) => {
    return res.status(200).json(openApiSpec);
  });
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/cars", carRoutes);
  app.use("/api/v1/bookings", bookingRoutes);
}

module.exports = registerRoutes;
