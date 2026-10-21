# Design

## Context

See proposal.md (Why) and `specs/event-booking/spec.md` for behavior. Constraints that shape the approach:

- Booking routes in `server/src/routes/bookings.js` always return 501. There is no Booking model. `requireStudent` exists but is unused.
- `Event.seatsBooked` is a denormalized counter. Seed data sets it (hackathon 9/10, cricket full, robotics cancelled) with **no** booking documents. The counter MUST be incremented/decremented, never rebuilt from bookings.
- Client pages already call the three API routes. Auth is the demo header `x-student-id`.
- MongoDB is Atlas (replica set). Stack stays Express + Mongoose; no new dependencies.

## Goals / Non-Goals

**Goals:**

- Make book/cancel/list correct under concurrent requests using atomic document updates and a unique active-booking index.
- Keep seed occupancy intact when nobody has booked through the API yet.
- One implementation path for POST that the live checks can hit over HTTP.

**Non-Goals:**

- MongoDB multi-document transactions (see Decisions).
- Recomputing `seatsBooked` from booking rows, waitlists, payments, or an admin cancel-event API.
- Client-side disabling for every fest rule (signed out, last hour, already booked, cap of 3). Server remains the source of truth; client only maps error codes.

## Decisions

### 1. Soft-cancel Booking documents

New `Booking` model: `eventId`, `studentId`, `status` (`active` | `cancelled`), timestamps. DELETE sets `status: cancelled` and returns that document. GET `/me/bookings` filters `status: active` and populates the event.

**Why:** The public Booking type already has `active | cancelled`. Keeping the row makes cancel-twice and rebook straightforward.

**Alternative:** Hard-delete on cancel. Rejected: unique-index history and DELETE body would need extra work, and the type includes `cancelled`.

### 2. Partial unique index for one active booking per student per event

Unique index on `{ studentId, eventId }` with partial filter `{ status: 'active' }`. Cancelled rows do not participate, so rebook after cancel is allowed.

**Why:** Application checks alone lose the double-click race. The index is the last line.

**Alternative:** Unique on `{ studentId, eventId }` with no filter. Rejected: it would block rebook after cancel.

### 3. Conditional increment, then insert, then compensate

Do **not** use a multi-document transaction. Book:

1. `requireStudent`; invalid/missing event id → 404 `event_not_found`.
2. Load event. Missing → 404. `status === 'cancelled'` → 409 `event_cancelled`. `Date.now() >= startsAt - 1 hour` → 403 `booking_closed`.
3. Count this student's active bookings. If `>= 3` → 409 `max_bookings`.
4. `findOneAndUpdate` on Event: filter `{ _id, status: 'open', seatsBooked: { $lt: capacity } }`, `$inc: { seatsBooked: 1 }`. No document → 409 `sold_out` (event was open when loaded; a concurrent cancel-event is out of scope).
5. Insert Booking `{ eventId, studentId, status: 'active' }`.
6. Duplicate key (11000): `$inc: { seatsBooked: -1 }` with `seatsBooked: { $gte: 1 }`, return 409 `already_booked`.
7. After insert, recount active bookings. If `> 3`, mark this booking cancelled, decrement, return 409 `max_bookings`.

Cancel:

1. `requireStudent`; invalid id → 404 `booking_not_found`.
2. Load booking. Missing → 404. Other owner → 403 `not_owner`. Already `cancelled` → 409 `already_cancelled`.
3. Load event. If `now >= startsAt - 1 hour` → 403 `booking_closed` (booking stays active).
4. `findOneAndUpdate` booking `{ _id, status: 'active', studentId }` → `cancelled`. If nothing matched, treat as already cancelled (parallel cancel won).
5. Only if the status actually changed: `$inc: { seatsBooked: -1 }` with `seatsBooked: { $gte: 1 }`.

**Why increment-first:** Remaining seats are serialized on one Event document. Twenty racers for the last seat: one update matches, nineteen get `sold_out`, at most one insert. Double-click may temporarily bump the counter, then duplicate-key compensation brings it back; the live checks assert final state.

**Alternative:** Insert-first, then increment. Rejected: twenty different students would all insert before the counter ran, leaving extra active docs until compensation.

**Alternative:** Multi-document transactions. Rejected for this change: Atlas supports them, but compensation on a single Event document plus the unique index meets the spec with less operational surface for the demo.

### 4. Closing window uses the server clock

Closed when `Date.now() >= event.startsAt.getTime() - 60 * 60 * 1000`. Exactly 1 hour before, after start, and after end are all closed. Same predicate for book and cancel (`booking_closed`).

**Why:** Spec pins the inclusive boundary. Organisers print the list at T-60; a request that commits at or after that instant is too late.

### 5. Error codes

| Status | `error` | When |
|---|---|---|
| 401 | `not_signed_in` | Missing/unknown student (existing middleware) |
| 403 | `not_owner` | Cancel of someone else's booking |
| 403 | `booking_closed` | Book or cancel at or after T-60 |
| 404 | `event_not_found` | Bad or missing event id |
| 404 | `booking_not_found` | Bad or missing booking id |
| 409 | `sold_out` | No seat left |
| 409 | `already_booked` | Active booking already exists |
| 409 | `already_cancelled` | Second cancel |
| 409 | `event_cancelled` | Event `status` is cancelled |
| 409 | `max_bookings` | Fourth active booking |

Client `errorMessage` maps these to short sentences. `docs/API.md` lists the same table.

### 6. List shape and order

GET `/me/bookings` uses `requireStudent`, finds `{ studentId, status: 'active' }`, populates `eventId`, returns `Booking & { event: Event.toPublic() }`. Sort by nested event `startsAt` ascending (soonest first), matching GET `/events`.

## Risks / Trade-offs

- **[Risk] Double-click temporarily increments** `seatsBooked` **more than once before compensation** → Mitigation: unique index + decrement on 11000; capacity still cannot pass the conditional increment. Live checks look at the final counter and docs.
- **[Risk] Crash after increment and before insert (or after cancel status change and before decrement)** → Mitigation: rare on a demo; no background reconciler in this change. Do not "fix" by recounting from bookings (seed occupancy would collapse).
- **[Risk] Max-3 TOCTOU before insert** → Mitigation: post-insert recount; extras compensate and return `max_bookings`.
- **[Risk] Decrement below seed occupancy** → Mitigation: only decrement when this request previously incremented (successful book) or when this request won the active→cancelled transition.
- **[Trade-off] Client can still tap Book while signed out or in the last hour** → Server rejects; mapping error codes is enough for this change.

## Migration Plan

- Deploy is additive: new `bookings` collection and indexes (`syncIndexes` on boot or first request). Seed is unchanged.
- Rollback: restore 501 handlers. `seatsBooked` may have moved if anyone booked; re-seed if the demo needs a clean counter.
- No backfill. Existing seeded occupancy stays as-is with zero booking documents.
