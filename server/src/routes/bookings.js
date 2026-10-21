import { Router } from 'express'
import mongoose from 'mongoose'
import { requireStudent } from '../middleware/currentStudent.js'
import { Booking } from '../models/Booking.js'
import { Event } from '../models/Event.js'

const router = Router()
const HOUR_MS = 60 * 60 * 1000
const MAX_ACTIVE = 3

const isDuplicateKey = (err) => err && (err.code === 11000 || err.code === 11001)
const isClosed = (event) => Date.now() >= event.startsAt.getTime() - HOUR_MS

async function releaseSeat(eventId) {
  await Event.findOneAndUpdate({ _id: eventId, seatsBooked: { $gte: 1 } }, { $inc: { seatsBooked: -1 } })
}

async function takeSeat(eventId) {
  return Event.findOneAndUpdate(
    { _id: eventId, status: 'open', $expr: { $lt: ['$seatsBooked', '$capacity'] } },
    { $inc: { seatsBooked: 1 } },
    { new: true },
  )
}

router.post('/events/:id/bookings', requireStudent, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'event_not_found' })

  const event = await Event.findById(req.params.id)
  if (!event) return res.status(404).json({ error: 'event_not_found' })
  if (event.status === 'cancelled') return res.status(409).json({ error: 'event_cancelled' })
  if (isClosed(event)) return res.status(403).json({ error: 'booking_closed' })

  const studentId = req.student._id
  const activeCount = await Booking.countDocuments({ studentId, status: 'active' })
  if (activeCount >= MAX_ACTIVE) return res.status(409).json({ error: 'max_bookings' })

  const taken = await takeSeat(event._id)
  if (!taken) return res.status(409).json({ error: 'sold_out' })

  let booking
  try {
    booking = await Booking.create({ eventId: event._id, studentId, status: 'active' })
  } catch (err) {
    await releaseSeat(event._id)
    if (isDuplicateKey(err)) return res.status(409).json({ error: 'already_booked' })
    throw err
  }

  const after = await Booking.countDocuments({ studentId, status: 'active' })
  if (after > MAX_ACTIVE) {
    const reverted = await Booking.findOneAndUpdate(
      { _id: booking._id, status: 'active' },
      { status: 'cancelled' },
      { new: true },
    )
    if (reverted) await releaseSeat(event._id)
    return res.status(409).json({ error: 'max_bookings' })
  }

  res.status(201).json(booking.toPublic())
})

router.get('/me/bookings', requireStudent, async (req, res) => {
  const rows = await Booking.find({ studentId: req.student._id, status: 'active' }).populate('eventId')
  const listed = rows
    .filter((row) => row.eventId)
    .sort((a, b) => a.eventId.startsAt - b.eventId.startsAt)
    .map((row) => ({ ...row.toPublic(), event: row.eventId.toPublic() }))
  res.json(listed)
})

router.delete('/bookings/:id', requireStudent, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'booking_not_found' })

  const booking = await Booking.findById(req.params.id)
  if (!booking) return res.status(404).json({ error: 'booking_not_found' })
  if (!booking.studentId.equals(req.student._id)) return res.status(403).json({ error: 'not_owner' })
  if (booking.status === 'cancelled') return res.status(409).json({ error: 'already_cancelled' })

  const event = await Event.findById(booking.eventId)
  if (event && isClosed(event)) return res.status(403).json({ error: 'booking_closed' })

  const cancelled = await Booking.findOneAndUpdate(
    { _id: booking._id, studentId: req.student._id, status: 'active' },
    { status: 'cancelled' },
    { new: true },
  )
  if (!cancelled) return res.status(409).json({ error: 'already_cancelled' })

  await releaseSeat(cancelled.eventId)
  res.json(cancelled.toPublic())
})

export default router
