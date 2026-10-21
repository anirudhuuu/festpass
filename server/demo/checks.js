// The definition of done for bookings. The Live check page and `bun run check`
// both run these. Each check sets up its own data and cleans up after itself.
import { bookingDocs, call, isRejected, moveStart, myBookings, Scratch, seats } from './harness.js'

const NOT_BUILT = 'Booking is not built yet.'

const book = (eventId, studentId) => call('POST', `/events/${eventId}/bookings`, studentId)
const cancel = (bookingId, studentId) => call('DELETE', `/bookings/${bookingId}`, studentId)

/** Books once and fails the check early if booking does not work at all. */
async function mustBook(eventId, studentId) {
  const res = await book(eventId, studentId)
  if (res.status === 501) throw new Fail(NOT_BUILT)
  if (res.status !== 201) throw new Fail(`Booking an open event returned ${res.status}, expected 201.`)
  return res.body
}

class Fail extends Error {}
const pass = (detail) => ({ pass: true, detail })
const fail = (detail) => ({ pass: false, detail })

export const checks = [
  {
    id: 'book-open',
    rule: 'No overbooking',
    title: 'One student books a seat',
    expect: 'Booking works and the seat count goes up by 1',
    async run(s) {
      const e = await s.event({ capacity: 10 })
      const [me] = await s.students(1)
      await mustBook(e, me.id)
      const n = await seats(e)
      return n === 1 ? pass('Booked. Counter went 0 to 1.') : fail(`Booked, but the counter shows ${n} instead of 1.`)
    },
  },
  {
    id: 'full-rejects',
    rule: 'No overbooking',
    title: 'Someone books a sold-out event',
    expect: 'They are told it is sold out',
    async run(s) {
      const e = await s.event({ capacity: 5, seatsBooked: 5 })
      const [me] = await s.students(1)
      const res = await book(e, me.id)
      if (res.status === 501) return fail(NOT_BUILT)
      if (!isRejected(res.status)) return fail(`A sold-out event accepted the booking (${res.status}).`)
      return (await seats(e)) === 5 ? pass(`Rejected with ${res.status}.`) : fail('Rejected, but the counter changed.')
    },
  },
  {
    id: 'last-seat-rush',
    rule: 'No overbooking',
    title: '20 students grab the last seat together',
    expect: 'Exactly 1 gets it',
    async run(s) {
      const e = await s.event({ capacity: 10, seatsBooked: 9 })
      const racers = await s.students(20, 'Racer')
      const results = await Promise.all(racers.map((r) => book(e, r.id)))
      if (results.every((r) => r.status === 501)) return fail(NOT_BUILT)
      const wins = results.filter((r) => r.status === 201).length
      const docs = await bookingDocs(e)
      if (wins === 1 && docs === 1) return pass('1 student got the seat, 19 were turned away.')
      return fail(`${wins} students were told they got the last seat. ${9 + docs} bookings now exist for 10 seats.`)
    },
  },
  {
    id: 'no-duplicate',
    rule: 'One booking per student',
    title: 'A student books the same event twice',
    expect: 'The second try is refused',
    async run(s) {
      const e = await s.event()
      const [me] = await s.students(1)
      await mustBook(e, me.id)
      const second = await book(e, me.id)
      if (!isRejected(second.status)) return fail(`The second booking was accepted (${second.status}).`)
      return (await bookingDocs(e)) === 1 ? pass(`Second attempt rejected with ${second.status}.`) : fail('Rejected, but two bookings exist.')
    },
  },
  {
    id: 'double-click',
    rule: 'One booking per student',
    title: 'A student double-clicks Book (5 fast clicks)',
    expect: 'Only 1 booking is made',
    async run(s) {
      const e = await s.event()
      const [me] = await s.students(1)
      const results = await Promise.all(Array.from({ length: 5 }, () => book(e, me.id)))
      if (results.every((r) => r.status === 501)) return fail(NOT_BUILT)
      const docs = await bookingDocs(e)
      return docs === 1 ? pass('5 clicks, 1 booking.') : fail(`5 clicks created ${docs} bookings for one student.`)
    },
  },
  {
    id: 'cancel-frees',
    rule: 'Cancelling frees the seat',
    title: 'A student cancels',
    expect: 'The seat goes back for someone else',
    async run(s) {
      const e = await s.event({ capacity: 10, seatsBooked: 3 })
      const [me] = await s.students(1)
      const b = await mustBook(e, me.id)
      const res = await cancel(b.id, me.id)
      if (res.status === 501) return fail('Cancelling is not built yet (501).')
      if (res.status !== 200) return fail(`Cancelling returned ${res.status}, expected 200.`)
      const n = await seats(e)
      const mine = await myBookings(me.id)
      if (n !== 3) return fail(`After cancelling, the counter shows ${n} instead of 3.`)
      if (mine && mine.length) return fail('The cancelled booking still shows in My bookings.')
      return pass('Seat returned. Counter back to 3.')
    },
  },
  {
    id: 'rebook',
    rule: 'Cancelling frees the seat',
    title: 'A student cancels, then books again',
    expect: 'The new booking works',
    async run(s) {
      const e = await s.event()
      const [me] = await s.students(1)
      const b = await mustBook(e, me.id)
      const c = await cancel(b.id, me.id)
      if (c.status !== 200) return fail(`Cancelling returned ${c.status}.`)
      const again = await book(e, me.id)
      return again.status === 201 ? pass('Booked again after cancelling.') : fail(`Booking again was refused (${again.status}).`)
    },
  },
  {
    id: 'cancel-twice',
    rule: 'Cancelling frees the seat',
    title: 'A student hits Cancel twice quickly',
    expect: 'Only 1 seat is given back',
    async run(s) {
      const e = await s.event({ capacity: 10, seatsBooked: 4 })
      const [me] = await s.students(1)
      const b = await mustBook(e, me.id)
      await Promise.all([cancel(b.id, me.id), cancel(b.id, me.id)])
      const n = await seats(e)
      return n === 4 ? pass('Counter back to 4, not 3.') : fail(`Counter shows ${n}: one booking freed ${5 - n} seats.`)
    },
  },
  {
    id: 'signed-out',
    rule: 'Sign-in and permissions',
    title: 'Someone books without signing in',
    expect: 'Refused',
    async run(s) {
      const e = await s.event()
      const res = await book(e, null)
      if (res.status === 501) return fail(NOT_BUILT)
      return isRejected(res.status) && (await seats(e)) === 0 ? pass(`Rejected with ${res.status}.`) : fail(`A signed-out request was accepted (${res.status}).`)
    },
  },
  {
    id: 'cancel-others',
    rule: 'Sign-in and permissions',
    title: "A student tries to cancel a friend's booking",
    expect: 'Refused',
    async run(s) {
      const e = await s.event()
      const [owner, other] = await s.students(2)
      const b = await mustBook(e, owner.id)
      const res = await cancel(b.id, other.id)
      if (!isRejected(res.status)) return fail(`Another student cancelled it (${res.status}).`)
      return (await bookingDocs(e)) === 1 ? pass(`Refused with ${res.status}.`) : fail('Refused, but the booking is gone.')
    },
  },
  {
    id: 'cancelled-event',
    rule: 'Sign-in and permissions',
    title: 'Someone books an event that was called off',
    expect: 'Refused',
    async run(s) {
      const e = await s.event({ status: 'cancelled' })
      const [me] = await s.students(1)
      const res = await book(e, me.id)
      if (res.status === 501) return fail(NOT_BUILT)
      return isRejected(res.status) ? pass(`Rejected with ${res.status}.`) : fail(`A cancelled event accepted the booking (${res.status}).`)
    },
  },
  {
    id: 'closes-before-start',
    rule: 'Fest rules (decided by the organisers)',
    title: 'Someone books 30 minutes before the event starts',
    expect: 'Refused: booking closes 1 hour before the start',
    async run(s) {
      const e = await s.event({ startsInMinutes: 30 })
      const [me] = await s.students(1)
      const res = await book(e, me.id)
      if (res.status === 501) return fail(NOT_BUILT)
      if (!isRejected(res.status)) return fail(`The booking went through (${res.status}), 30 minutes before the start.`)
      return (await seats(e)) === 0 ? pass(`Refused with ${res.status}.`) : fail('Refused, but a seat was taken.')
    },
  },
  {
    id: 'max-three',
    rule: 'Fest rules (decided by the organisers)',
    title: 'A student books a 4th event',
    expect: 'Refused: at most 3 bookings per student',
    async run(s) {
      const events = [await s.event(), await s.event(), await s.event(), await s.event()]
      const [me] = await s.students(1)
      for (const e of events.slice(0, 3)) await mustBook(e, me.id)
      const fourth = await book(events[3], me.id)
      if (!isRejected(fourth.status)) return fail(`The 4th booking went through (${fourth.status}).`)
      return pass(`3 bookings worked, the 4th was refused with ${fourth.status}.`)
    },
  },
  {
    id: 'late-cancel',
    rule: 'Fest rules (decided by the organisers)',
    title: 'A student cancels 30 minutes before the event',
    expect: 'Refused: cancelling closes 1 hour before the start',
    async run(s) {
      const e = await s.event({ capacity: 10, seatsBooked: 3 })
      const [me] = await s.students(1)
      const b = await mustBook(e, me.id)
      await moveStart(e, 30)
      const res = await cancel(b.id, me.id)
      if (res.status === 501) return fail('Cancelling is not built yet.')
      if (!isRejected(res.status)) return fail(`The cancel went through (${res.status}), 30 minutes before the start.`)
      return (await seats(e)) === 4 ? pass(`Refused with ${res.status}. The seat stays booked.`) : fail('Refused, but the seat count changed.')
    },
  },
]

export async function runCheck(check) {
  const s = new Scratch()
  const started = Date.now()
  try {
    const result = await check.run(s)
    return { ...result, ms: Date.now() - started }
  } catch (err) {
    const detail = err instanceof Fail ? err.message : `Crashed: ${err.message}`
    return { pass: false, detail, ms: Date.now() - started }
  } finally {
    await s.cleanup().catch(() => {})
  }
}
