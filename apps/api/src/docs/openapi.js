const env = require("../config/env");

const apiBaseUrl =
  env.nodeEnv === "production"
    ? "https://api.example.com"
    : `http://localhost:${env.port}`;

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Car Rental AI API",
    version: "1.0.0",
    description:
      "API documentation for auth, owner car management, and admin/govt moderation workflows.",
  },
  servers: [
    {
      url: apiBaseUrl,
      description: "Current environment",
    },
  ],
  tags: [
    { name: "Health", description: "Service health checks" },
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Cars", description: "Owner car management endpoints" },
    {
      name: "Car Moderation",
      description: "Admin/govt staff verification and moderation endpoints",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Invalid credentials" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          role: {
            type: "string",
            enum: ["renter", "owner", "admin", "govt_staff"],
          },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          verificationStatus: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "phone", "password"],
        properties: {
          name: { type: "string", example: "Ali Khan" },
          email: { type: "string", format: "email", example: "ali@example.com" },
          phone: { type: "string", example: "+923001234567" },
          password: { type: "string", example: "strongPassword123" },
          role: { type: "string", enum: ["renter", "owner"], example: "owner" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["emailOrPhone", "password"],
        properties: {
          emailOrPhone: { type: "string", example: "ali@example.com" },
          password: { type: "string", example: "strongPassword123" },
        },
      },
      RefreshRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      LogoutRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      CarDocument: {
        type: "object",
        required: ["docType", "url"],
        properties: {
          docType: { type: "string", example: "registration_certificate" },
          url: { type: "string", format: "uri" },
          number: { type: "string", example: "ABC-12345" },
          issuedBy: { type: "string", example: "Excise Department" },
          expiresAt: { type: "string", format: "date-time" },
        },
      },
      CarLocation: {
        type: "object",
        required: ["district"],
        properties: {
          district: { type: "string", example: "Gilgit" },
          city: { type: "string", example: "Gilgit City" },
        },
      },
      Car: {
        type: "object",
        properties: {
          id: { type: "string" },
          ownerId: { type: "string" },
          title: { type: "string" },
          brand: { type: "string" },
          model: { type: "string" },
          year: { type: "integer" },
          registrationNumber: { type: "string" },
          color: { type: "string" },
          seats: { type: "integer" },
          transmission: { type: "string", enum: ["manual", "automatic"] },
          fuelType: {
            type: "string",
            enum: ["petrol", "diesel", "hybrid", "electric"],
          },
          basePricePerDay: { type: "number" },
          currency: { type: "string", example: "PKR" },
          location: { $ref: "#/components/schemas/CarLocation" },
          status: { type: "string", enum: ["draft", "active", "paused"] },
          description: { type: "string" },
          images: { type: "array", items: { type: "string", format: "uri" } },
          documents: { type: "array", items: { $ref: "#/components/schemas/CarDocument" } },
          verification: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["pending", "verified", "unverified", "blacklisted"],
              },
              verifiedBadge: { type: "boolean" },
              notes: { type: "string" },
            },
          },
          moderationHistory: {
            type: "array",
            items: { type: "object" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateCarRequest: {
        type: "object",
        required: [
          "title",
          "brand",
          "model",
          "year",
          "registrationNumber",
          "basePricePerDay",
          "location",
          "documents",
        ],
        properties: {
          title: { type: "string", example: "Toyota Prado TX 2018" },
          brand: { type: "string", example: "Toyota" },
          model: { type: "string", example: "Prado TX" },
          year: { type: "integer", example: 2018 },
          registrationNumber: { type: "string", example: "GB-1234" },
          color: { type: "string", example: "White" },
          seats: { type: "integer", example: 7 },
          transmission: { type: "string", enum: ["manual", "automatic"] },
          fuelType: {
            type: "string",
            enum: ["petrol", "diesel", "hybrid", "electric"],
          },
          basePricePerDay: { type: "number", example: 15000 },
          currency: { type: "string", example: "PKR" },
          location: { $ref: "#/components/schemas/CarLocation" },
          status: { type: "string", enum: ["draft", "active", "paused"] },
          description: { type: "string" },
          images: { type: "array", items: { type: "string", format: "uri" } },
          documents: { type: "array", items: { $ref: "#/components/schemas/CarDocument" } },
        },
      },
      ModerateCarRequest: {
        type: "object",
        properties: {
          reason: { type: "string", example: "Invalid registration document." },
          notes: { type: "string", example: "Cross-checked with authority records." },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } },
          },
        },
        responses: {
          201: {
            description: "Registered successfully",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
          400: { description: "Validation error" },
          403: { description: "Invalid role for self-registration" },
          409: { description: "User already exists" },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: {
          200: {
            description: "Logged in successfully",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RefreshRequest" } },
          },
        },
        responses: {
          200: {
            description: "Tokens refreshed",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
          401: { description: "Invalid refresh token" },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LogoutRequest" } },
          },
        },
        responses: {
          200: {
            description: "Logged out",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/cars": {
      post: {
        tags: ["Cars"],
        summary: "Create car (owner only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateCarRequest" } },
          },
        },
        responses: {
          201: {
            description: "Car created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { car: { $ref: "#/components/schemas/Car" } },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/v1/cars/mine": {
      get: {
        tags: ["Cars"],
        summary: "List my cars (owner only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Cars list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    cars: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Car" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/cars/{id}": {
      get: {
        tags: ["Cars"],
        summary: "Get my car by ID (owner only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Car details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { car: { $ref: "#/components/schemas/Car" } },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Cars"],
        summary: "Update my car (owner only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [{ $ref: "#/components/schemas/CreateCarRequest" }],
              },
            },
          },
        },
        responses: {
          200: { description: "Car updated" },
        },
      },
      delete: {
        tags: ["Cars"],
        summary: "Delete my car (owner only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Car deleted" },
        },
      },
    },
    "/api/v1/cars/moderation/pending": {
      get: {
        tags: ["Car Moderation"],
        summary: "List cars pending moderation (admin/govt staff)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Pending moderation cars" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/v1/cars/{id}/verify": {
      post: {
        tags: ["Car Moderation"],
        summary: "Verify car and assign badge (admin/govt staff)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ModerateCarRequest" } },
          },
        },
        responses: {
          200: { description: "Car verified" },
        },
      },
    },
    "/api/v1/cars/{id}/unverify": {
      post: {
        tags: ["Car Moderation"],
        summary: "Mark verified car as unverified (admin/govt staff)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ModerateCarRequest" } },
          },
        },
        responses: {
          200: { description: "Car unverified" },
          400: { description: "Reason required" },
        },
      },
    },
    "/api/v1/cars/{id}/blacklist": {
      post: {
        tags: ["Car Moderation"],
        summary: "Blacklist car (admin/govt staff)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ModerateCarRequest" } },
          },
        },
        responses: {
          200: { description: "Car blacklisted" },
          400: { description: "Reason required" },
        },
      },
    },
  },
};

module.exports = openApiSpec;
