import { Select } from '@/components/ui/select'
import { useStudent } from '@/lib/student'

/** The demo sign-in: pick who you are. Sends x-student-id on every request. */
export function StudentPicker() {
  const { students, student, setStudentId } = useStudent()
  return (
    <Select
      aria-label="Signed in as"
      value={student?.id ?? ''}
      onChange={(e) => setStudentId(e.target.value || null)}
      className="max-w-32 sm:max-w-56"
    >
      <option value="">Not signed in</option>
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} ({s.rollNo})
        </option>
      ))}
    </Select>
  )
}
