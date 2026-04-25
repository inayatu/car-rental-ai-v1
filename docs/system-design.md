# Gilgit-Baltistan Tourism Platform - System Design

## 1) Product Scope

### Phase 1 (Launch)
- Marketplace for **verified car owners** to list rental cars.
- Tourists search and request bookings by date/location.
- Owner accepts or rejects requests.
- Notifications sent via email/SMS.
- Payments handled offline; platform tracks expected/received status.

### Phase 2+
- Add online gateway (Stripe/JazzCash/EasyPaisa/PayFast or local partner).
- Add commission model (fixed fee or percentage).
- Expand inventory categories: jeeps, hotels, cafes, activities.

## 2) Architecture (Node.js + Express + MongoDB + Redis)

### High-Level Services
- **API Gateway (Express)**: REST APIs, validation, auth, rate limiting.
- **Auth Service**: user registration/login, roles, JWT refresh tokens.
- **Listing Service**: create/update/search listings (cars first).
- **Verification Service**: owner KYC flow and admin approval workflow.
- **Booking Service**: request -> accept/reject -> reserve lifecycle.
- **Notification Service**: email/SMS events and retries.
- **Payments Ledger Service**: offline payment logs and audit trail.
- **Admin Service**: moderation, verification queue, reports.

### Data Layer
- **MongoDB**: source of truth for users, listings, bookings, payments, audits.
- **Redis**:
  - OTP/session/token blacklist.
  - Search cache and frequently viewed listings.
  - Distributed locking for booking race-condition prevention.
  - Queue backing for notifications and async jobs.

## 3) Multi-Tenant, Category-Scalable Data Model

Use one generic `Listing` model to support future categories.

### Collections
- `users`:
  - `_id`, `role` (`renter|owner|admin`), name, phone, email, password hash.
  - `verificationStatus` (`pending|under_review|verified|rejected`).
  - `kycDocs[]`, `address`, `createdAt`, `updatedAt`.
- `owner_profiles`:
  - `userId`, businessName, taxId (optional), payoutPreference, riskFlags[].
- `listings`:
  - `_id`, `ownerId`, `category` (`car|jeep|hotel|cafe`), status (`draft|active|paused`).
  - title, description, location (district + geo).
  - media[], basePrice, currency, rules, availabilityCalendar.
  - `attributes` (category-specific object; car fields for launch).
- `bookings`:
  - `_id`, `listingId`, `ownerId`, `renterId`.
  - startDate, endDate, totalDays, quotedAmount.
  - status (`requested|accepted|rejected|reserved|cancelled|completed`).
  - ownerResponseDeadline, cancellationReason, timeline[].
- `payment_records`:
  - `bookingId`, mode (`offline|online`), expectedAmount, paidAmount.
  - settlementStatus (`unpaid|partial|paid`), proof[], notes.
  - `platformFeeType` (`fixed|percent`), `platformFeeValue`, `platformFeeAmount`.
- `notifications`:
  - recipientId, channel (`email|sms|push`), templateKey, payload, status, retries.
- `verification_audits`:
  - ownerId, checkedBy, source (`manual|gov_api|field_call`), decision, remarks.

### Critical Indexes
- `listings`: `{ category: 1, status: 1, "location.district": 1, basePrice: 1 }`
- `bookings`: `{ listingId: 1, startDate: 1, endDate: 1, status: 1 }`
- `users`: `{ role: 1, verificationStatus: 1 }`
- `payment_records`: `{ bookingId: 1, settlementStatus: 1 }`

## 4) Booking and Reservation Workflow

1. Renter submits booking request.
2. System places short lock in Redis (listing + date range) to prevent collisions.
3. Booking created in `requested` state.
4. Email/SMS sent to owner with response window.
5. Owner accepts:
   - Booking moves to `reserved`.
   - Overlapping pending requests auto-expire/reject.
6. Owner rejects:
   - Booking moves to `rejected`.
7. Admin can override for disputes.
8. Offline payment recorded by admin/owner with proof.

## 5) Verification Workflow (Owner Trust)

1. Owner signs up and uploads CNIC/license/vehicle docs.
2. Status = `pending`.
3. Admin starts checks (manual + optional government channel).
4. Status = `under_review`.
5. On success: `verified`, owner can publish active listings.
6. On failure: `rejected`, with reason and re-submit flow.

## 6) API Design (Versioned REST)

Use `/api/v1` base path.

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Owner Verification
- `POST /owners/kyc`
- `GET /owners/me/verification-status`
- `POST /admin/owners/:ownerId/approve`
- `POST /admin/owners/:ownerId/reject`

### Listings
- `POST /listings` (owner)
- `PATCH /listings/:listingId` (owner)
- `GET /listings` (public search/filter)
- `GET /listings/:listingId` (public detail)
- `PATCH /admin/listings/:listingId/status` (admin moderation)

### Bookings
- `POST /bookings` (renter request)
- `GET /bookings/me` (renter/owner history)
- `POST /bookings/:id/accept` (owner)
- `POST /bookings/:id/reject` (owner)
- `POST /bookings/:id/cancel` (renter/owner/admin)

### Payments (Offline First)
- `POST /payments/offline-record`
- `GET /payments/booking/:bookingId`
- `PATCH /admin/payments/:id/reconcile`

## 7) Security and Abuse Prevention
- Role-based access control with route guards.
- Input validation (`zod` or `joi`) at API boundary.
- Rate limiting and IP throttling for auth and booking endpoints.
- Encrypted document URLs (signed URLs for KYC files).
- Audit logs for verification and booking status changes.
- Redis-backed idempotency keys for booking creation.

## 8) Ops and Deployment
- API as containerized service (Docker).
- MongoDB Atlas (managed) recommended for production.
- Redis Cloud/managed Redis for queue + caching + locks.
- Worker process for notifications and async jobs.
- Observability: request logs, metrics, error tracking.

## 9) Future-Proofing for Hotels/Cafes
- Keep booking engine generic (`resourceId`, date-time slots).
- Add `listing_categories` config collection for per-category forms.
- Build pricing module with strategy pattern:
  - daily car rates now.
  - nightly hotels and seat-based cafes later.

