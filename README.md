# Car Rental AI v1

A backend-first platform for car rental operations focused on the Gilgit-Baltistan tourism market.

## What is included

- Express.js API scaffold with versioned routes under `/api/v1`.
- Authentication module with `register`, `login`, `refresh`, and `logout` endpoints.
- MongoDB integration using Mongoose with centralized environment-based configuration.
- Structured Winston logging for request lifecycle, startup, and error events.

## Tech stack

- Node.js + Express
- MongoDB + Mongoose
- Zod for validation
- JWT + bcryptjs for authentication
- Winston for logging

## Quick start

1. Go to the API app:
   - `cd apps/api`
2. Install dependencies:
   - `npm install`
3. Create local env file from template:
   - `cp .env.example .env`
4. Update secrets and DB credentials in `.env`.
5. Run the server:
   - `npm run dev`

