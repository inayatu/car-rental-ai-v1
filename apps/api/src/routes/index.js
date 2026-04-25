const swaggerUi = require("swagger-ui-express");
const authRoutes = require("../modules/auth/auth.routes");
const carRoutes = require("../modules/cars/car.routes");
const bookingRoutes = require("../modules/bookings/booking.routes");
const uploadRoutes = require("../modules/uploads/upload.routes");
const openApiSpec = require("../docs/openapi");

function registerRoutes(app) {
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
  app.use("/api/v1/uploads", uploadRoutes);
}

module.exports = registerRoutes;
