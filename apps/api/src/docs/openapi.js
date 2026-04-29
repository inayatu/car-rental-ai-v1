const env = require("../config/env");
const brand = require("../constants/brand");

const apiBaseUrl =
  env.nodeEnv === "production" ? brand.productionApiOrigin : `http://localhost:${env.port}`;

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: brand.apiName,
    version: "1.0.0",
    description: brand.openapiDescription,
    contact: {
      name: brand.domain,
      url: `https://${brand.domain}`,
    },
  },
  servers: [
    {
      url: apiBaseUrl,
      description: env.nodeEnv === "production" ? "Production API" : "Local development",
    },
  ],
  tags: [
    { name: "Health", description: "Service health checks" },
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Bookings", description: "Booking create/read/update/delete endpoints" },
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
        properties: {
          refreshToken: {
            type: "string",
            description: "Optional if refreshToken cookie is set",
          },
        },
      },
      LogoutRequest: {
        type: "object",
        properties: {
          refreshToken: {
            type: "string",
            description: "Optional if refreshToken cookie is set",
          },
        },
      },
      MeResponse: {
        type: "object",
        properties: {
          user: {
            anyOf: [{ $ref: "#/components/schemas/User" }, { type: "null" }],
          },
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
          vehicleType: {
            type: "string",
            enum: ["suv_4wd", "jeep", "sedan", "van_coaster", "pickup", "other"],
            description: "Body style for public filters",
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
          "vehicleType",
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
          vehicleType: {
            type: "string",
            enum: ["suv_4wd", "jeep", "sedan", "van_coaster", "pickup", "other"],
            example: "suv_4wd",
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
      CreateBookingRequest: {
        type: "object",
        required: [
          "carId",
          "startDate",
          "endDate",
          "renterName",
          "numberOfPersons",
          "renterPhone",
          "renterEmail",
        ],
        properties: {
          carId: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          renterName: { type: "string" },
          numberOfPersons: { type: "integer", minimum: 1, maximum: 50 },
          renterPhone: { type: "string" },
          renterEmail: { type: "string", format: "email" },
          notes: { type: "string", maxLength: 2000, description: "Optional message for the owner" },
        },
      },
      UpdateBookingRequest: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["accepted", "rejected", "cancelled", "completed"],
          },
          cancellationReason: { type: "string" },
          note: { type: "string" },
        },
      },
      Booking: {
        type: "object",
        properties: {
          id: { type: "string" },
          carId: { type: "string" },
          ownerId: {
            type: "string",
            description: "Only included when status is accepted or completed (confirmed rental).",
          },
          renterId: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          renterName: { type: "string" },
          numberOfPersons: { type: "integer" },
          renterPhone: { type: "string" },
          renterEmail: { type: "string", format: "email" },
          notes: { type: "string" },
          totalDays: { type: "integer" },
          quotedAmount: { type: "number" },
          currency: { type: "string", example: "PKR" },
          status: {
            type: "string",
            enum: ["requested", "accepted", "rejected", "cancelled", "completed"],
          },
          cancellationReason: { type: "string" },
          timeline: {
            type: "array",
            items: { type: "object" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          car: {
            type: "object",
            description: "Populated car summary (list/detail)",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              brand: { type: "string" },
              model: { type: "string" },
              year: { type: "integer" },
              image: { type: "string" },
              images: { type: "array", items: { type: "string" } },
              basePricePerDay: { type: "number" },
              currency: { type: "string" },
              location: { type: "object" },
              color: { type: "string" },
              vehicleType: { type: "string" },
              registrationNumber: { type: "string" },
            },
          },
          renterAccount: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
            },
          },
          ownerAccount: {
            type: "object",
            description: "Host contact only when status is accepted or completed; omitted for requested/rejected/cancelled.",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
            },
          },
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
                  properties: {
                    ok: { type: "boolean", example: true },
                    service: { type: "string", example: "gbtrip.pk-api" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current session (reads access/refresh cookies; may rotate refresh)",
        responses: {
          200: {
            description: "user is null when not logged in",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/MeResponse" } },
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
        summary: "Refresh access token (body or refreshToken cookie)",
        requestBody: {
          required: false,
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
        summary: "Logout user (clears cookies; body optional if refreshToken cookie is set)",
        requestBody: {
          required: false,
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
    "/api/v1/bookings": {
      post: {
        tags: ["Bookings"],
        summary: "Create booking (renter only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBookingRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Booking created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    booking: { $ref: "#/components/schemas/Booking" },
                  },
                },
              },
            },
          },
          409: { description: "Car unavailable or overlapping booking" },
        },
      },
    },
    "/api/v1/bookings/mine": {
      get: {
        tags: ["Bookings"],
        summary: "List my bookings",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Bookings fetched",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    bookings: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Booking" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/bookings/{id}": {
      get: {
        tags: ["Bookings"],
        summary: "Get booking by ID",
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
            description: "Booking details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    booking: { $ref: "#/components/schemas/Booking" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Bookings"],
        summary: "Update booking status by role",
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
              schema: { $ref: "#/components/schemas/UpdateBookingRequest" },
            },
          },
        },
        responses: {
          200: { description: "Booking updated" },
          403: { description: "Forbidden for requested status" },
          409: { description: "Invalid status transition" },
        },
      },
      delete: {
        tags: ["Bookings"],
        summary: "Delete booking (renter for limited statuses, or admin/staff)",
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
          200: { description: "Booking deleted" },
          409: { description: "Booking cannot be deleted in current status" },
        },
      },
    },
    "/api/v1/cars": {
      get: {
        tags: ["Cars"],
        summary: "Public: list active, verified cars (filters, pagination)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12, maximum: 50 } },
          { name: "q", in: "query", schema: { type: "string" }, description: "Search title, brand, model" },
          { name: "district", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          {
            name: "fuelType",
            in: "query",
            schema: { type: "string", enum: ["petrol", "diesel", "hybrid", "electric"] },
          },
          {
            name: "transmission",
            in: "query",
            schema: { type: "string", enum: ["manual", "automatic"] },
          },
          {
            name: "vehicleType",
            in: "query",
            description: "Filter by body / vehicle class",
            schema: {
              type: "string",
              enum: ["suv_4wd", "jeep", "sedan", "van_coaster", "pickup", "other"],
            },
          },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["newest", "price_asc", "price_desc"], default: "newest" },
          },
        ],
        responses: {
          200: {
            description: "Paginated list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    cars: { type: "array", items: { $ref: "#/components/schemas/Car" } },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    total: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Cars"],
        summary: "Create car (owner only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: [
                  "title",
                  "brand",
                  "model",
                  "year",
                  "registrationNumber",
                  "basePricePerDay",
                  "district",
                  "vehicleType",
                ],
                properties: {
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
                  vehicleType: {
                    type: "string",
                    enum: ["suv_4wd", "jeep", "sedan", "van_coaster", "pickup", "other"],
                  },
                  basePricePerDay: { type: "number" },
                  currency: { type: "string" },
                  district: { type: "string" },
                  city: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string", enum: ["draft", "active", "paused"] },
                  documentTypes: {
                    type: "string",
                    description: "Comma-separated or JSON array of document types matching documents[] order",
                  },
                  images: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                  documents: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                },
              },
            },
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
    "/api/v1/cars/public/{id}": {
      get: {
        tags: ["Cars"],
        summary: "Public: get a single active, verified car by id",
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
            description: "Public car",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { car: { $ref: "#/components/schemas/Car" } },
                },
              },
            },
          },
          404: { description: "Not found or not publicly visible" },
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
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
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
                  currency: { type: "string" },
                  district: { type: "string" },
                  city: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string", enum: ["draft", "active", "paused"] },
                  documentTypes: { type: "string" },
                  images: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                  documents: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                },
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
