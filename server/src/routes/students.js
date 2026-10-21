import { Router } from 'express'
import { Student } from '../models/Student.js'

const router = Router()

router.get('/', async (req, res) => {
  const students = await Student.find().sort({ rollNo: 1 })
  res.json(students.map((s) => s.toPublic()))
})

export default router
