// Demo-only calls behind the Live check page (server/demo).
export type CheckInfo = { id: string; rule: string; title: string; expect: string }
export type CheckResult = { id: string; pass: boolean; detail: string; ms: number }
export type RushResult = {
  capacity: number
  already: number
  counter: number
  bookings: number
  students: { name: string; status: number; error: string | null }[]
}

async function json<T>(path: string, method = 'GET'): Promise<T> {
  const res = await fetch(`/api/demo${path}`, { method })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export const demoApi = {
  checks: () => json<CheckInfo[]>('/checks'),
  run: (id: string) => json<CheckResult>(`/checks/${id}`, 'POST'),
  rush: () => json<RushResult>('/rush', 'POST'),
}

export type DoubleClickResult = { clicks: number[]; bookings: number; counter: number }
export type CancelFreesResult = { capacity: number; steps: { label: string; status: number; seats: number }[] }
export type FriendCancelResult =
  | { built: false; bookStatus: number }
  | { built: true; attemptStatus: number; aStillBooked: boolean; seats: number }

export type LateBookingResult = { minutesBefore: number; status: number; seats: number }
export type MaxThreeResult = { statuses: number[] }
export type LateCancelResult =
  | { built: false; bookStatus: number }
  | { built: true; minutesBefore: number; status: number; stillBooked: boolean }

export const scenarioApi = {
  doubleClick: () => json<DoubleClickResult>('/scenarios/double-click', 'POST'),
  cancelFrees: () => json<CancelFreesResult>('/scenarios/cancel-frees', 'POST'),
  friendCancel: () => json<FriendCancelResult>('/scenarios/friend-cancel', 'POST'),
  lateBooking: () => json<LateBookingResult>('/scenarios/late-booking', 'POST'),
  maxThree: () => json<MaxThreeResult>('/scenarios/max-three', 'POST'),
  lateCancel: () => json<LateCancelResult>('/scenarios/late-cancel', 'POST'),
}
