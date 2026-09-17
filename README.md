# PSS User — Airline Booking Web App

Passenger-facing booking site for an airline Passenger Service System (PSS): search flights, book, select seats, pay (including an in-app wallet), and manage bookings — no account required to book, optional login for wallet/history.

> Part of a 3-service PSS platform: this booking app, the [staff admin console](../pss_admin), and a `pss_modular_cqrs` backend API. See [Related services](#related-services) below.

## Features

- **Flight search & results** — search by route/date/passenger count, browse itineraries and fare classes.
- **Guest booking flow** — a multi-step flow (search → itinerary/fare → passengers & contact → seat selection → PNR) held in a Zustand store so navigating back doesn't lose progress. No login required: since there's no guest-lookup endpoint, the confirmation screen (with the resulting PNR) is the only record of the trip the guest gets — worth saving or screenshotting.
- **Seat selection** — per-segment, per-passenger seat map picking.
- **Payment** — checkout tied to the created PNR.
- **Wallet** (requires login) — balance, top-up, paginated transaction history (top-ups, refunds, payment debits, adjustments) with polling for status updates.
- **Booking history** (requires login) — past bookings for the logged-in user.
- **Polish** — animated transitions (`framer-motion`), toasts/dialogs (`sweetalert2`), skeleton loading states.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript, built with Vite |
| Routing | React Router v7 |
| State | Zustand (persisted booking-flow + auth stores) |
| Styling | Tailwind CSS v4 |
| HTTP | Axios |
| Testing | Vitest + Testing Library |
| Deploy | Multi-stage Docker build → static files served by Nginx |

## Getting started

### Prerequisites

- Node.js 20+
- A running instance of the backend API (`pss_modular_cqrs`) — this app is a pure SPA client and does nothing useful without it.

### Local development

```bash
npm install
npm run dev        # http://localhost:5174
```

Create a `.env` (not committed) if the API isn't on the default:

```
VITE_API_URL=http://localhost:8080/api/v1
```

### Other scripts

```bash
npm run build       # tsc -b && vite build -> dist/
npm run lint         # eslint .
npm run preview      # serve the production build locally
npm run test         # vitest
```

### Run with Docker

```bash
docker compose up --build
# booking app -> http://localhost:3000
```

Assumes the backend API is already running and reachable (default: host port 8080). `VITE_API_URL` and `USER_PORT` can be overridden via env vars or a `.env` file. Note `VITE_API_URL` is baked into the static bundle at **build** time — it must be a URL the *end user's browser* can reach, not a Docker-internal hostname like `http://api:8080`.

To run all three services (backend + admin + this app) together, use the root-level `docker-compose.yml` one level above both frontend repos instead of this standalone file.

## Project structure

```
src/
  components/
    auth/         # login/auth UI
    booking/      # passenger form, seat map, fare/summary widgets
    search/       # flight search form + results
    layout/       # shared shell (header/nav/footer)
    animations/   # transition wrappers
  hooks/          # useAuth (zustand), useBookingFlow (multi-step booking state)
  pages/          # HomePage, ResultsPage, BookingPage, ConfirmationPage, WalletPage, HistoryPage
  services/       # axios client + one api-services module per resource (flight, booking, payment, wallet, ancillary, class, auth)
```

## Related services

- **`pss_modular_cqrs`** — the Go backend (CQRS/DDD-flavored) this app talks to. Not included in this repo; must be running and reachable at `VITE_API_URL`.
- **`pss_admin`** — the staff-facing back-office console (flight ops, bookings, payments, RBAC, reports), same tech stack.

## Known gaps

- No screenshots or live demo linked yet.
- No CI pipeline (lint/test/build) configured.
- No automated tests currently exist in this repo (the `vitest`/Testing Library setup is wired up but unused).
- No license file.
