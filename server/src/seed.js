import mongoose from 'mongoose'
import { connectDb } from './db.js'
import { Event } from './models/Event.js'
import { Student } from './models/Student.js'
import { Booking } from './models/Booking.js'

const day = (n, hour) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(hour, 0, 0, 0)
  return d
}

const events = [
  { title: 'Hackathon kickoff: build with GenAI', category: 'tech', venue: 'Main auditorium', startsAt: day(3, 10), capacity: 10, seatsBooked: 9 },
  { title: 'MERN workshop: auth from scratch', category: 'workshop', venue: 'Lab 2, CS block', startsAt: day(4, 14), capacity: 40, seatsBooked: 22 },
  { title: 'Battle of the bands', category: 'cultural', venue: 'Open air theatre', startsAt: day(5, 18), capacity: 300, seatsBooked: 181 },
  { title: 'Inter-college cricket final', category: 'sports', venue: 'North ground', startsAt: day(6, 9), capacity: 150, seatsBooked: 150 },
  { title: 'Resume review with alumni', category: 'workshop', venue: 'Seminar hall B', startsAt: day(7, 11), capacity: 25, seatsBooked: 3 },
  { title: 'Robotics expo', category: 'tech', venue: 'Mech workshop', startsAt: day(8, 12), capacity: 80, seatsBooked: 12, status: 'cancelled' },
]

const names = [
  'Aarav Sharma', 'Diya Patel', 'Kabir Singh', 'Ananya Iyer', 'Rohan Gupta', 'Meera Nair', 'Arjun Reddy', 'Ishita Das',
  'Vihaan Joshi', 'Saanvi Rao', 'Aditya Kulkarni', 'Kavya Menon', 'Reyansh Verma', 'Myra Kapoor', 'Arnav Bose', 'Tara Pillai',
  'Dhruv Malhotra', 'Riya Chatterjee', 'Krish Agarwal', 'Nisha Hegde', 'Yash Thakur', 'Pooja Mishra', 'Siddharth Jain', 'Zara Khan',
]

await connectDb()
// Drop every collection, indexes included, so nothing from an earlier round
// survives. (Atlas readWrite users can drop collections but not the database.)
for (const c of await mongoose.connection.db.collections()) await c.drop()
await Event.syncIndexes()
await Student.syncIndexes()
await Booking.syncIndexes()
await Event.insertMany(events)
await Student.insertMany(names.map((name, i) => ({ name, rollNo: `FEST${String(i + 1).padStart(3, '0')}` })))
console.log(`Seeded ${events.length} events and ${names.length} students into ${mongoose.connection.name}`)
await mongoose.disconnect()
