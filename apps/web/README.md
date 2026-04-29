# gbtrip.pk Web (PWA)

Mobile-first React PWA for car and hotel rentals.

## Features

- Public listing discovery for cars and hotels
- Booking flow from listing detail
- User auth (register/login/logout)
- Booking management screen
- Owner dashboard to manage cars and hotels
- Installable PWA with offline-ready service worker setup

## Run locally

1. Install dependencies:
   - `npm install`
2. Add environment file:
   - `cp .env.example .env`
3. Start dev server:
   - `npm run dev`

## Environment

- `VITE_API_BASE_URL` (default: `http://localhost:5000/api/v1`)

## Backend compatibility

- Cars, auth, and bookings are integrated with the existing Node API.
- Hotels are integrated with graceful fallback:
  - If `/hotels` backend endpoints exist, app uses them.
  - If not, app uses demo + locally managed hotel data so UI remains fully usable.
