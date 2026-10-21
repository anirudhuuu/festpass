import mongoose from 'mongoose'
import { Student } from '../models/Student.js'

// Demo sign-in: the client sends the chosen student's id in the x-student-id header.
// Sets req.student when the header names a real student, otherwise leaves it null.
export async function currentStudent(req, res, next) {
  req.student = null
  const id = req.get('x-student-id')
  if (id && mongoose.isValidObjectId(id)) {
    req.student = await Student.findById(id)
  }
  next()
}

export function requireStudent(req, res, next) {
  if (!req.student) return res.status(401).json({ error: 'not_signed_in' })
  next()
}
