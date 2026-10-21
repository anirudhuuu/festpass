export type FestEvent = {
  id: string
  title: string
  category: 'tech' | 'cultural' | 'sports' | 'workshop'
  venue: string
  startsAt: string
  capacity: number
  seatsBooked: number
  seatsLeft: number
  status: 'open' | 'cancelled'
}

export type Student = { id: string; name: string; rollNo: string }

export type Booking = {
  id: string
  eventId: string
  studentId: string
  status: 'active' | 'cancelled'
  createdAt: string
}

export class ApiError extends Error {
  status: number
  code: string
  constructor(status: number, code: string) {
    super(code)
    this.status = status
    this.code = code
  }
}

let currentStudentId: string | null = null
export const setApiStudent = (id: string | null) => {
  currentStudentId = id
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json')
  if (currentStudentId) headers.set('x-student-id', currentStudentId)
  const res = await fetch(`/api${path}`, { ...init, headers })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, body.error ?? 'request_failed')
  return body as T
}

export const api = {
  events: () => request<FestEvent[]>('/events'),
  students: () => request<Student[]>('/students'),
  book: (eventId: string) => request<Booking>(`/events/${eventId}/bookings`, { method: 'POST' }),
  cancel: (bookingId: string) => request<Booking>(`/bookings/${bookingId}`, { method: 'DELETE' }),
  myBookings: () => request<(Booking & { event: FestEvent })[]>('/me/bookings'),
}

const messages: Record<string, string> = {
  not_implemented: 'Bookings are not built yet. That is the demo.',
  not_signed_in: 'Pick a student in the top bar first.',
  not_owner: 'That booking belongs to someone else.',
  booking_closed: 'Booking and cancelling close 1 hour before the event.',
  event_not_found: 'That event is gone.',
  booking_not_found: 'That booking is gone.',
  sold_out: 'Sold out. No seats left.',
  already_booked: 'You already have a seat at this event.',
  already_cancelled: 'This booking is already cancelled.',
  event_cancelled: 'This event was called off.',
  max_bookings: 'You can hold at most 3 bookings.',
}

export function errorMessage(err: unknown) {
  if (err instanceof ApiError) return messages[err.code] ?? `Request failed: ${err.code.split('_').join(' ')}`
  return 'Could not reach the server. Is it running?'
}
