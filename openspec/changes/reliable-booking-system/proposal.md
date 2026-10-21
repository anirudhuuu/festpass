# Proposal

## Why

FestPass can list events, but booking and cancelling still return 501. A college fest with limited seats cannot run on a client hint: the last seat will be raced, students will double-click, and a denormalized counter will drift unless the server enforces capacity, ownership, and the fest rules atomically.

## What Changes

- Implement `POST /api/events/:id/bookings`, `DELETE /api/bookings/:id`, and `GET /api/me/bookings` to the shapes already documented in `docs/API.md` (replace 501 `not_implemented`).
- Persist bookings as documents with `active` / `cancelled` status. Successful book increments `Event.seatsBooked`; successful cancel decrements it. Never recompute the counter from booking rows (seed occupancy has no booking documents).
- Enforce, on the server: sign-in, no overbooking under concurrency, one active booking per student per event, cancel frees exactly one seat, students cannot cancel someone else's booking, cancelled events cannot be booked, booking and cancelling close 1 hour before `startsAt`, at most 3 active bookings per student.
- Return stable 4xx `{ error }` codes the client can display. Map those codes in the existing toast/error helper. Disabled Book buttons stay a hint; the server is the source of truth.
- No new public routes. No waitlist, payment, multi-seat cart, or admin event-cancel API.

## Capabilities

### New Capabilities

- `event-booking`: Sign in, book one seat, list own active bookings, and cancel a seat, with capacity, uniqueness, ownership, and fest closing rules enforced by the server.

### Modified Capabilities

- (none — `openspec/specs/` has no capabilities yet)

## Impact

- **Server:** `server/src/routes/bookings.js` (currently 501), new Booking model, atomic updates to `Event.seatsBooked`, `requireStudent` on booking routes. Existing `GET /api/events` public shape is unchanged.
- **Client:** `client/src/lib/api.ts` error-code messages. Events and My bookings pages already call the three routes.
- **Docs:** `docs/API.md` success table is already correct; document rejection codes.
- **Out of scope:** waitlist, payments, booking more than one seat per request, reconstructing seed occupancy from booking documents, new auth beyond `x-student-id`.
