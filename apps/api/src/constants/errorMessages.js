/**
 * Centralized API error and validation copy (HTTP responses, thrown Error.message, Zod).
 */

const Messages = {
  http: {
    validationError: "Validation error",
    internalServerError: "Internal server error",
    notAuthenticated: "Not authenticated",
    forbidden: "Forbidden",
    invalidOrExpiredToken: "Invalid or expired token",
  },

  rateLimit: {
    default: "Too many requests. Please try again later.",
    api: "Too many API requests from this IP. Please slow down.",
    authBurst: "Too many auth requests. Please try again later.",
    loginBruteforce:
      "Too many failed login attempts. Please wait before trying again.",
    register: "Too many registration attempts. Please try again in an hour.",
    refresh: "Too many token refresh requests. Please try again shortly.",
    bookingMutation: "Too many booking changes. Please wait and try again.",
    ownerCarMutation: "Too many listing updates. Please wait and try again.",
    moderationMutation: "Too many moderation actions. Please wait and try again.",
  },

  auth: {
    missingRefreshToken: "Missing refresh token",
    invalidRoleSelfRegistration: "Invalid role for self registration",
    userAlreadyExists: "User already exists with email or phone",
    invalidCredentials: "Invalid credentials",
    invalidRefreshToken: "Invalid refresh token",
    refreshTokenNotRecognized: "Refresh token not recognized",
  },

  booking: {
    invalidStartDate: "Invalid start date",
    invalidEndDate: "Invalid end date",
    startDateNotPast: "startDate cannot be older than today",
    endDateNotPast: "endDate cannot be older than today",
    endAfterStart: "endDate must be greater than startDate",
    overlappingDates: "Car is already booked for overlapping dates",
    ownerCannotBookOwnCar: "Owner cannot create booking on own car",
    carNotAvailable: "Car is not available for booking",
    carBlacklisted: "This listing is blacklisted and cannot be booked",
    carNotVerifiedForBooking: "Car is not verified for booking",
    notFound: "Booking not found",
    statusRequired: "status is required",
    renterCancelOnly: "Renter can only cancel own booking",
    onlyActiveBookingsCancel: "Only active bookings can be cancelled",
    ownerCannotSetStatus: "Owner cannot set this booking status",
    onlyRequestedAcceptReject: "Only requested bookings can be accepted or rejected",
    onlyAcceptedComplete: "Only accepted bookings can be completed",
    deleteAllowedStatuses:
      "Only requested/cancelled/rejected bookings can be deleted",
  },

  car: {
    notFound: "Car not found",
    listingRemovedRestoreFirst: "This listing was removed. Restore it before editing.",
    notFoundOrAlreadyRemoved: "Car not found or already removed",
    notFoundOrNotRemoved: "Car not found or not removed",
    invalidModerationAction: "Invalid moderation action",
    listingNoLongerActive: "This listing is no longer active",
    reasonRequiredUnverifyBlacklist: "Reason is required for unverify/blacklist actions",
    notBlacklisted: "This listing is not blacklisted",
  },

  upload: {
    unsupportedImageType: (mimetype) => `Unsupported image type: ${mimetype}`,
    unsupportedDocumentType: (mimetype) =>
      `Unsupported document type: ${mimetype}. Only PDF allowed.`,
  },

  validation: {
    invalidFileUrl: "Invalid file URL",
    updateRequiresOneField: "At least one field is required for update.",
    renterNameRequired: "Renter name is required",
    renterNameTooLong: "Renter name is too long",
    phoneRequired: "Phone is required",
  },

  config: {
    invalidEnvironment: (issues) => `Invalid environment configuration: ${issues}`,
    mongoUserPasswordTogether:
      "MONGO_USER and MONGO_PASSWORD must be provided together.",
  },
};

function invalidField(fieldName) {
  return `Invalid ${fieldName}`;
}

module.exports = {
  Messages,
  invalidField,
};
