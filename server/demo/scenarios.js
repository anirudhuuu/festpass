// Small visual scenarios for the Live check page. Each returns plain data
// the page can draw. Like the checks, they make their own data and clean up.
import { bookingDocs, call, moveStart, Scratch, seats } from './harness.js'

const book = (eventId, studentId) => call('POST', `/events/${eventId}/bookings`, studentId)
const cancel = (bookingId, studentId) => call('DELETE', `/bookings/${bookingId}`, studentId)

async function withScratch(fn) {
  const s = new Scratch()
  try {
    return await fn(s)
  } finally {
    await s.cleanup().catch(() => {})
  }
}

/** One student taps Book 5 times at once. */
export const doubleClick = () =>
  withScratch(async (s) => {
    const e = await s.event({ capacity: 10, seatsBooked: 0 })
    const [me] = await s.students(1, 'Aarav')
    const results = await Promise.all(Array.from({ length: 5 }, () => book(e, me.id)))
    return {
      clicks: results.map((r) => r.status),
      bookings: await bookingDocs(e),
      counter: await seats(e),
    }
  })

/** A full event: B is turned away, A cancels, B tries again. */
export const cancelFrees = () =>
  withScratch(async (s) => {
    const e = await s.event({ capacity: 10, seatsBooked: 9 })
    const [a, b] = await s.students(2, 'Student')
    const steps = []
    const snap = async (label, status) => steps.push({ label, status, seats: await seats(e) })

    const aBook = await book(e, a.id)
    await snap('A books the last seat', aBook.status)
    const bFirst = await book(e, b.id)
    await snap('B tries to book', bFirst.status)
    const aCancel = aBook.status === 201 ? await cancel(aBook.body.id, a.id) : { status: aBook.status }
    await snap('A cancels', aCancel.status)
    const bAgain = await book(e, b.id)
    await snap('B tries again', bAgain.status)

    return { capacity: 10, steps }
  })

/** B tries to cancel A's booking. */
export const friendCancel = () =>
  withScratch(async (s) => {
    const e = await s.event({ capacity: 10, seatsBooked: 4 })
    const [a, b] = await s.students(2, 'Student')
    const aBook = await book(e, a.id)
    if (aBook.status !== 201) return { built: false, bookStatus: aBook.status }
    const attempt = await cancel(aBook.body.id, b.id)
    return {
      built: true,
      attemptStatus: attempt.status,
      aStillBooked: (await bookingDocs(e)) === 1,
      seats: await seats(e),
    }
  })

/** Fest rule: booking closes 1 hour before the start. Tries 30 minutes before. */
export const lateBooking = () =>
  withScratch(async (s) => {
    const e = await s.event({ capacity: 10, seatsBooked: 3, startsInMinutes: 30 })
    const [me] = await s.students(1, 'Diya')
    const res = await book(e, me.id)
    return { minutesBefore: 30, status: res.status, seats: await seats(e) }
  })

/** Fest rule: at most 3 bookings per student. Books 4 different events. */
export const maxThree = () =>
  withScratch(async (s) => {
    const events = [await s.event(), await s.event(), await s.event(), await s.event()]
    const [me] = await s.students(1, 'Kabir')
    const statuses = []
    for (const e of events) statuses.push((await book(e, me.id)).status)
    return { statuses }
  })

/** Fest rule: cancelling closes 1 hour before the start. Cancels 30 minutes before. */
export const lateCancel = () =>
  withScratch(async (s) => {
    const e = await s.event({ capacity: 10, seatsBooked: 3 })
    const [me] = await s.students(1, 'Meera')
    const b = await book(e, me.id)
    if (b.status !== 201) return { built: false, bookStatus: b.status }
    await moveStart(e, 30)
    const res = await cancel(b.body.id, me.id)
    return { built: true, minutesBefore: 30, status: res.status, stillBooked: (await bookingDocs(e)) === 1 }
  })

export const scenarios = {
  'double-click': doubleClick,
  'cancel-frees': cancelFrees,
  'friend-cancel': friendCancel,
  'late-booking': lateBooking,
  'max-three': maxThree,
  'late-cancel': lateCancel,
}
