import * as React from 'react'

import { api, setApiStudent, type Student } from '@/lib/api'

const KEY = 'festpass-student'

type StudentState = {
  students: Student[]
  student: Student | null
  setStudentId: (id: string | null) => void
}

const StudentContext = React.createContext<StudentState | null>(null)

function readStored() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = React.useState<Student[]>([])
  const [studentId, setId] = React.useState<string | null>(readStored)

  React.useEffect(() => {
    api.students().then(setStudents).catch(() => setStudents([]))
  }, [])

  // Set synchronously so the header is on the very next request.
  setApiStudent(studentId)

  const setStudentId = React.useCallback((id: string | null) => {
    try {
      if (id) localStorage.setItem(KEY, id)
      else localStorage.removeItem(KEY)
    } catch {
      // Storage can be blocked; the choice still holds for this tab.
    }
    setApiStudent(id)
    setId(id)
  }, [])

  const student = students.find((s) => s.id === studentId) ?? null
  const value = React.useMemo(() => ({ students, student, setStudentId }), [students, student, setStudentId])
  return <StudentContext value={value}>{children}</StudentContext>
}

export function useStudent() {
  const ctx = React.use(StudentContext)
  if (!ctx) throw new Error('useStudent must be used inside <StudentProvider>')
  return ctx
}
