import { Router } from 'express'
import mongoose from 'mongoose'
import { Event } from '../models/Event.js'

const router = Router()

router.get('/', async (req, res) => {
  const events = await Event.find().sort({ startsAt: 1 })
  res.json(events.map((e) => e.toPublic()))
})

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'event_not_found' })
  const event = await Event.findById(req.params.id)
  if (!event) return res.status(404).json({ error: 'event_not_found' })
  res.json(event.toPublic())
})

export default router
