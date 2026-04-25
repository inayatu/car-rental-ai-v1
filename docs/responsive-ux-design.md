# Responsive UX Design - Car Rental Launch

## Design Principles
- Mobile-first layouts for travelers on weak networks and smaller phones.
- Fast search flow in fewer taps.
- Clear trust signals: verified owner badge, document-checked indicator.
- Simple booking and communication flow with visible response timer.

## Information Architecture

### Public (Renter)
- Home
- Search Results
- Car Details
- Booking Request
- My Bookings
- Support/Help

### Owner
- Owner Onboarding
- KYC Verification
- Listings Manager
- Booking Requests
- Payment Log

### Admin
- Verification Queue
- Listings Moderation
- Booking Oversight
- Offline Payment Reconciliation
- Reports and Audit Trail

## Mobile Breakpoints
- `xs`: 0-479px (small phones)
- `sm`: 480-767px (large phones)
- `md`: 768-1023px (tablets)
- `lg`: 1024px+ (desktop)

## Core Screens and Behaviors

### 1) Home
- Sticky top search bar (location, pickup/drop dates).
- Category chips (Cars now, Jeeps/Hotels/Cafes marked "Coming soon").
- Featured verified listings.
- Short trust section explaining verification checks.

### 2) Search Results
- Card-based list on mobile, grid on desktop.
- Filters: price, car type, transmission, seats, verified owner.
- Sort: price low-high, rating, newest.
- Infinite scroll on mobile; paginated fallback on poor networks.

### 3) Car Details
- Swipeable gallery.
- Vehicle specs and rental rules.
- Owner trust profile with verification status.
- Availability calendar and booking CTA.

### 4) Booking Request
- Pre-filled trip summary.
- Pickup/drop details.
- Optional notes to owner.
- Final amount estimate (payment offline).
- Confirmation state: "Request sent; waiting for owner approval."

### 5) Owner Dashboard
- Pending requests with countdown to respond.
- Accept/reject actions.
- Availability calendar editing.
- Offline payment logs and booking history.

### 6) Admin Dashboard
- KYC queue with document preview.
- Quick approve/reject actions with reason.
- Booking dispute panel.
- Payment reconciliation tracker.

## Component System (Scalable)
- Use reusable UI primitives:
  - `AppShell`, `TopNav`, `BottomNav`, `SearchBar`, `FilterDrawer`.
  - `ListingCard`, `OwnerBadge`, `AvailabilityCalendar`.
  - `BookingTimeline`, `PaymentStatusTag`, `VerificationStatusTag`.
- Theme tokens for spacing/typography/colors.
- Localization-ready text keys for English/Urdu in future.

## Accessibility
- WCAG-friendly contrast.
- Proper labels and keyboard support.
- Touch targets >= 44px on mobile.
- Meaningful empty/error states.

## Performance Requirements
- LCP target: <2.5s on 4G-like network.
- Lazy load galleries and map widgets.
- Cached listing/search responses.
- Optimized image variants (webp, responsive sizes).

## Future Category Expansion UX
- Reuse search + detail + booking templates.
- Category-specific fields rendered dynamically from schema.
- Unified account and booking center across cars/hotels/cafes.

