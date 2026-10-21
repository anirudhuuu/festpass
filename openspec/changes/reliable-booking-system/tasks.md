# Tasks

## 1. Booking model

- [x] 1.1 Add `server/src/models/Booking.js` with `eventId`, `studentId`, `status` (`active` | `cancelled`), timestamps, `toPublic()`, and a partial unique index on `{ studentId, eventId }` where `status` is `active`; verify the file exports `Booking` and the index filter ignores cancelled rows
- [x] 1.2 Call `Booking.syncIndexes()` on server startup (and in `seed.js` next to Event/Student); verify the API still starts and seed still completes without dropping the new collection by accident

## 2. Book a seat

- [x] 2.1 Wire `requireStudent` and replace POST `/events/:id/bookings` 501 with the design flow (validate event, closing window, cap, conditional `$inc` on `seatsBooked`, insert, compensate on duplicate key / cap overrun); verify POST with `x-student-id` on an open event with seats returns 201 Booking and GET `/api/events/:id` shows `seatsBooked` increased by 1
- [x] 2.2 Reject unsigned, unknown event, cancelled event, sold-out, already-booked, closed (`now >= startsAt - 1h`), and 4th active booking with the status/`error` pairs in design.md; verify each case with curl and that failed books do not change `seatsBooked` or leave an extra active booking
- [x] 2.3 Document those POST rejection codes in `docs/API.md`; verify the table matches the responses from 2.2

## 3. List my bookings

- [x] 3.1 Implement GET `/me/bookings` with `requireStudent`: active bookings only, nested `event` via `toPublic()`, soonest `startsAt` first; verify 401 `not_signed_in` when unsigned, 200 `[]` when none, and 200 with two nested events after two successful books
- [x] 3.2 Document GET `/me/bookings` rejections (`not_signed_in`) in `docs/API.md`; verify they match 3.1

## 4. Cancel a seat

- [x] 4.1 Implement DELETE `/bookings/:id` with `requireStudent`, ownership, closing window, `active` → `cancelled` via `findOneAndUpdate`, and decrement only when the status actually changed; verify owner cancel returns 200 `status: cancelled`, counter is 1 lower, and GET `/me/bookings` omits it
- [x] 4.2 Reject unsigned cancel, unknown id, other student's booking, already-cancelled, and cancel inside the last hour with the design.md codes; verify two parallel DELETEs of the same booking leave the counter only 1 lower than after the book, and a sequential second DELETE is 409 `already_cancelled` with no further decrement
- [x] 4.3 Verify cancel then book-again on the same event returns 201 (partial unique index must not block rebook); document DELETE rejection codes in `docs/API.md`

## 5. Client messages

- [x] 5.1 Map the new `error` codes in `client/src/lib/api.ts` `messages` to short sentences; verify a signed-out Book tap and a sold-out Book tap show those sentences in the toast (events page already calls the API)

## 6. Concurrent integration

- [x] 6.1 Fire 20 parallel POSTs from different students at an event with 1 seat left; verify exactly one 201, `seatsBooked === capacity`, and exactly one new active booking
- [x] 6.2 Fire 5 parallel POSTs from the same student at an open event; verify exactly one active booking for that pair and `seatsBooked` increased by 1 from the start of the test
