import express from 'express'
import { currentStudent } from './middleware/currentStudent.js'
import eventsRouter from './routes/events.js'
import studentsRouter from './routes/students.js'
import bookingsRouter from './routes/bookings.js'
import demoRouter from '../demo/router.js'

export const app = express()

app.use(express.json())
app.use(currentStudent)

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/events', eventsRouter)
app.use('/api/students', studentsRouter)
app.use('/api', bookingsRouter)

// Internal tooling for the talk. Not part of FestPass.
app.use('/api/demo', demoRouter)

app.use((req, res) => res.status(404).json({ error: 'not_found' }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'server_error' })
})
