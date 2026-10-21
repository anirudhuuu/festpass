// The on-stage race, run from the Live check page: one seat left on a
// 10-seat event, and 20 students press Book at the same moment.
import { bookingDocs, call, Scratch, seats } from './harness.js'

export async function rush({ racers = 20 } = {}) {
  const s = new Scratch()
  try {
    const capacity = 10
    const already = 9
    const eventId = await s.event({ capacity, seatsBooked: already, title: 'Hackathon kickoff (rush test)' })
    const students = await s.students(racers, 'Student')

    // Fire every request before awaiting any of them.
    const results = await Promise.all(students.map((st) => call('POST', `/events/${eventId}/bookings`, st.id)))

    const newBookings = await bookingDocs(eventId)
    return {
      capacity,
      already,
      counter: await seats(eventId),
      bookings: already + newBookings,
      students: students.map((st, i) => ({ name: st.name, status: results[i].status, error: results[i].body?.error ?? null })),
    }
  } finally {
    await s.cleanup().catch(() => {})
  }
}
