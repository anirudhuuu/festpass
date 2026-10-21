// Helpers for the live checks. Test data is written straight to MongoDB and
// the booking API is called over HTTP, so the checks work with whatever
// booking code the agent writes. Everything a check creates is removed after.
import mongoose from 'mongoose'

const { ObjectId } = mongoose.Types
const BASE = () => `http://127.0.0.1:${process.env.PORT || 4000}/api`
const db = () => mongoose.connection.db
const FIXED = ['events', 'students']
const EVENT_FIELDS = ['event', 'eventId', 'event_id', 'eventID']

export class Scratch {
  eventIds = []
  studentIds = []

  async event({ capacity = 10, seatsBooked = 0, status = 'open', title, startsInMinutes = 24 * 60 } = {}) {
    const _id = new ObjectId()
    await db().collection('events').insertOne({
      _id,
      title: title ?? `Check ${_id.toString().slice(-4)}`,
      category: 'tech',
      venue: 'Check hall',
      startsAt: new Date(Date.now() + startsInMinutes * 60000),
      capacity,
      seatsBooked,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    this.eventIds.push(_id)
    return _id.toString()
  }

  async students(n, prefix = 'Student') {
    const docs = Array.from({ length: n }, (_, i) => {
      const _id = new ObjectId()
      return { _id, name: `${prefix} ${i + 1}`, rollNo: `CHK-${_id}` }
    })
    await db().collection('students').insertMany(docs)
    this.studentIds.push(...docs.map((d) => d._id))
    return docs.map((d) => ({ id: d._id.toString(), name: d.name }))
  }

  async cleanup() {
    const refs = refQuery(this.eventIds)
    for (const c of await db().collections()) {
      if (!FIXED.includes(c.collectionName)) await c.deleteMany(refs)
    }
    await db().collection('events').deleteMany({ _id: { $in: this.eventIds } })
    await db().collection('students').deleteMany({ _id: { $in: this.studentIds } })
  }
}

function refQuery(ids) {
  const values = ids.flatMap((id) => [id, id.toString()])
  return { $or: EVENT_FIELDS.map((f) => ({ [f]: { $in: values } })) }
}

/** Moves an event's start time, as if the clock had moved on. */
export async function moveStart(eventId, startsInMinutes) {
  await db()
    .collection('events')
    .updateOne({ _id: new ObjectId(eventId) }, { $set: { startsAt: new Date(Date.now() + startsInMinutes * 60000) } })
}

export async function call(method, url, studentId) {
  const headers = { 'content-type': 'application/json' }
  if (studentId) headers['x-student-id'] = studentId
  const res = await fetch(`${BASE()}${url}`, { method, headers })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

export async function seats(eventId) {
  const { body } = await call('GET', `/events/${eventId}`)
  return body?.seatsBooked
}

/** Active booking documents for an event, wherever the app stores them. */
export async function bookingDocs(eventId) {
  const id = new ObjectId(eventId)
  let n = 0
  for (const c of await db().collections()) {
    if (FIXED.includes(c.collectionName)) continue
    n += await c.countDocuments({ ...refQuery([id]), status: { $nin: ['cancelled', 'canceled'] } })
  }
  return n
}

export async function myBookings(studentId) {
  const { status, body } = await call('GET', '/me/bookings', studentId)
  return status === 200 && Array.isArray(body) ? body : null
}

export const isRejected = (status) => status >= 400 && status < 500
