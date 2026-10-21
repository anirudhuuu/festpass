# FestPass API

All routes are under `/api`. JSON in, JSON out.

## Signing in (demo)

There are no passwords. The client sends the chosen student's id in a header:

```
x-student-id: <student id>
```

A missing or unknown id means "not signed in".

## Shapes

```ts
type Event = {
  id: string
  title: string
  category: 'tech' | 'cultural' | 'sports' | 'workshop'
  venue: string
  startsAt: string        // ISO date
  capacity: number
  seatsBooked: number
  seatsLeft: number       // capacity - seatsBooked, never below 0
  status: 'open' | 'cancelled'
}

type Student = { id: string; name: string; rollNo: string }

type Booking = {
  id: string
  eventId: string
  studentId: string
  status: 'active' | 'cancelled'
  createdAt: string
}

type Error = { error: string }
```

## Built

| Method | Path | Returns |
|---|---|---|
| GET | `/api/health` | `{ ok: true }` |
| GET | `/api/events` | `Event[]`, soonest first |
| GET | `/api/events/:id` | `Event`, or 404 `event_not_found` |
| GET | `/api/students` | `Student[]` |

## Bookings

Requires a signed-in student (`x-student-id`). One POST books one seat. Booking and cancelling close when `now >= startsAt - 1 hour`. A student may hold at most 3 active bookings.

| Method | Path | Success |
|---|---|---|
| POST | `/api/events/:id/bookings` | 201 `Booking` |
| DELETE | `/api/bookings/:id` | 200 `Booking` (`status: cancelled`) |
| GET | `/api/me/bookings` | 200 `(Booking & { event: Event })[]` active only, soonest first |

### POST `/api/events/:id/bookings` rejections

| Status | `error` |
|---|---|
| 401 | `not_signed_in` |
| 403 | `booking_closed` |
| 404 | `event_not_found` |
| 409 | `sold_out` |
| 409 | `already_booked` |
| 409 | `event_cancelled` |
| 409 | `max_bookings` |

### GET `/api/me/bookings` rejections

| Status | `error` |
|---|---|
| 401 | `not_signed_in` |

### DELETE `/api/bookings/:id` rejections

| Status | `error` |
|---|---|
| 401 | `not_signed_in` |
| 403 | `not_owner` |
| 403 | `booking_closed` |
| 404 | `booking_not_found` |
| 409 | `already_cancelled` |

Any rejected request returns a 4xx status with an `Error` body.
