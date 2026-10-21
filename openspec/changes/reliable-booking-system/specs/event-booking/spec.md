# Spec Delta

## Purpose

Lets a signed-in student book one seat at a fest event, see their active bookings, and cancel a seat, while the server keeps capacity and fest rules consistent under concurrent use.

## ADDED Requirements

### Requirement: Signed-in student books an open event
The system MUST create an active booking when a signed-in student books an open event that has a free seat and the request does not violate uniqueness, the 3-booking cap, or the closing window. The response MUST be 201 with a Booking (`id`, `eventId`, `studentId`, `status: active`, `createdAt`).

#### Scenario: One student books a seat
- **WHEN** a signed-in student books an open event with free seats and fewer than 3 active bookings
- **THEN** the system returns 201 with an active Booking for that student and event

#### Scenario: Unknown event
- **WHEN** a signed-in student books an event id that does not exist or is not a valid id
- **THEN** the system returns 404 with `{ error: "event_not_found" }` and creates no booking

### Requirement: Successful book increments the seat counter
On a successful book, the system MUST increment that event's `seatsBooked` by exactly 1. It MUST NOT recompute `seatsBooked` from booking documents.

#### Scenario: Counter goes up by one
- **WHEN** a student successfully books an event whose `seatsBooked` was N
- **THEN** a subsequent read of the event shows `seatsBooked` of N + 1

### Requirement: Sold-out events reject booking
When `seatsBooked` is already at `capacity`, the system MUST refuse the book with 409 `{ error: "sold_out" }` and MUST NOT change `seatsBooked` or create a booking.

#### Scenario: Someone books a sold-out event
- **WHEN** a signed-in student books an event with `seatsBooked` equal to `capacity`
- **THEN** the system returns 409 `sold_out` and the seat counter is unchanged

### Requirement: Last seat is granted to exactly one concurrent booker
When more students than remaining seats book at the same time, the system MUST accept at most as many bookings as remaining seats, refuse the rest with 409 `sold_out`, and leave `seatsBooked` no higher than `capacity`.

#### Scenario: Twenty students grab the last seat together
- **WHEN** 20 signed-in students book an event with 1 seat left at the same moment
- **THEN** exactly 1 request returns 201, the others are 4xx, exactly 1 active booking exists for that new seat, and `seatsBooked` equals `capacity`

### Requirement: One active booking per student per event
The system MUST refuse a second active booking of the same event by the same student with 409 `{ error: "already_booked" }`. At most one active booking document MAY exist for that pair.

#### Scenario: A student books the same event twice
- **WHEN** a student who already holds an active booking for an event books it again
- **THEN** the system returns 409 `already_booked` and still only one active booking exists

#### Scenario: A student double-clicks Book
- **WHEN** the same student sends 5 book requests for the same open event at the same moment
- **THEN** exactly 1 active booking exists for that student and event

### Requirement: Student lists own active bookings
When a signed-in student requests their bookings, the system MUST return 200 with an array of each active booking plus its nested Event. Cancelled bookings MUST be omitted. Unsigned requests MUST return 401 `{ error: "not_signed_in" }`.

#### Scenario: Student with bookings
- **WHEN** a signed-in student with two active bookings calls GET `/api/me/bookings`
- **THEN** the system returns 200 with those two bookings, each including the event

#### Scenario: Empty list
- **WHEN** a signed-in student with no active bookings calls GET `/api/me/bookings`
- **THEN** the system returns 200 with an empty array

#### Scenario: List while signed out
- **WHEN** GET `/api/me/bookings` is called without a signed-in student
- **THEN** the system returns 401 `not_signed_in`

### Requirement: Student cancels own booking
The system MUST set the booking to `cancelled` and return 200 with that Booking when the signed-in owner cancels before the closing window. `seatsBooked` MUST decrease by exactly 1. The cancelled row MUST NOT appear in GET `/api/me/bookings`.

#### Scenario: A student cancels
- **WHEN** the owner cancels an active booking more than 1 hour before the event starts
- **THEN** the system returns 200 with `status: cancelled`, the event counter is 1 lower, and My bookings no longer includes it

### Requirement: Cancel is idempotent on the seat counter
Cancelling an already-cancelled booking, or two concurrent cancels of the same booking, MUST NOT decrease `seatsBooked` more than once. A later cancel of an already-cancelled booking MUST be 4xx and MUST NOT change the counter.

#### Scenario: A student hits Cancel twice quickly
- **WHEN** the owner sends two cancel requests for the same active booking at the same moment
- **THEN** `seatsBooked` returns to the value from before the booking, not one lower than that

#### Scenario: Cancel after already cancelled
- **WHEN** the owner cancels a booking that is already `cancelled`
- **THEN** the system returns 4xx and `seatsBooked` is unchanged

### Requirement: Student can rebook after cancelling
After a student's booking for an event is cancelled, the system MUST allow that student to book the same event again (subject to capacity, the cap, and the closing window).

#### Scenario: A student cancels, then books again
- **WHEN** a student cancels their active booking and then books the same still-open event
- **THEN** the new book returns 201 with a new active booking

### Requirement: Unsigned book is refused
The system MUST refuse POST `/api/events/:id/bookings` without a signed-in student with 401 `{ error: "not_signed_in" }` and MUST NOT create a booking or change `seatsBooked`. A missing, malformed, or unknown `x-student-id` is not signed in.

#### Scenario: Someone books without signing in
- **WHEN** a book request is sent with no valid student
- **THEN** the system returns 401 `not_signed_in` and the seat counter is unchanged

### Requirement: Student cannot cancel another student's booking
The system MUST refuse cancel when the signed-in student is not the booking owner with 403 `{ error: "not_owner" }`. The booking MUST stay active and `seatsBooked` MUST NOT change.

#### Scenario: A student tries to cancel a friend's booking
- **WHEN** student B sends DELETE for student A's active booking
- **THEN** the system returns 403 `not_owner`, A's booking remains active, and the counter is unchanged

#### Scenario: Cancel while signed out
- **WHEN** DELETE `/api/bookings/:id` is called without a signed-in student
- **THEN** the system returns 401 `not_signed_in` and the booking is unchanged

#### Scenario: Unknown booking
- **WHEN** a signed-in student cancels a booking id that does not exist or is not a valid id
- **THEN** the system returns 404 `{ error: "booking_not_found" }`

### Requirement: Cancelled events cannot be booked
The system MUST refuse booking an event whose `status` is `cancelled` with 409 `{ error: "event_cancelled" }`.

#### Scenario: Someone books an event that was called off
- **WHEN** a signed-in student books an event with `status: cancelled`
- **THEN** the system returns 409 `event_cancelled` and no booking is created

### Requirement: Booking closes one hour before start
The system MUST refuse a book when `now >= startsAt - 1 hour` (including exactly 1 hour before, after start, and after end) with 403 `{ error: "booking_closed" }`. It MUST NOT create a booking or change `seatsBooked`.

#### Scenario: Someone books 30 minutes before the event starts
- **WHEN** a signed-in student books an open event that starts in 30 minutes and still has free seats
- **THEN** the system returns 403 `booking_closed` and the seat counter is unchanged

#### Scenario: Book exactly one hour before start
- **WHEN** a signed-in student books an open event that starts in exactly 60 minutes
- **THEN** the system returns 403 `booking_closed`

### Requirement: Cancelling closes one hour before start
The system MUST refuse cancel of an active booking when `now >= event.startsAt - 1 hour` with 403 `{ error: "booking_closed" }`. The booking MUST stay active and `seatsBooked` MUST NOT change.

#### Scenario: A student cancels 30 minutes before the event
- **WHEN** the owner cancels an active booking for an event that now starts in 30 minutes
- **THEN** the system returns 403 `booking_closed`, the booking stays active, and the seat counter is unchanged

### Requirement: At most three active bookings per student
The system MUST refuse a book that would give the student a fourth active booking with 409 `{ error: "max_bookings" }`. Cancelled bookings MUST NOT count. Concurrent books MUST not create more than 3 active bookings for that student.

#### Scenario: A student books a 4th event
- **WHEN** a student with 3 active bookings on different events books a 4th different open event
- **THEN** the system returns 409 `max_bookings` and still has 3 active bookings

#### Scenario: Fourth slot after a cancel
- **WHEN** a student with 3 active bookings cancels one and then books a different open event
- **THEN** the new book returns 201
