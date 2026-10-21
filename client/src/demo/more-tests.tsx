import { ArrowRight } from 'lucide-react'

import { scenarioApi } from '@/demo/api'
import { Chiplet, NotBuilt, ScenarioCard, Verdict } from '@/demo/scenario'
import { SeatMap } from '@/demo/seat-map'

const ok = (s: number) => s >= 200 && s < 300
const refused = (s: number) => s >= 400 && s < 500

export function DoubleClickTest() {
  return (
    <ScenarioCard
      n={2}
      question="What if a student double-clicks Book?"
      setup={<p>Aarav has no bookings yet. The page is slow, so he taps Book again and again.</p>}
      action={<p>Aarav's browser sends 5 booking requests at the same moment.</p>}
      expected="1 booking. The other 4 taps are refused."
      button="Tap Book 5 times"
      run={scenarioApi.doubleClick}
    >
      {(r) => {
        if (r.clicks.every((s) => s === 501)) return <NotBuilt />
        const good = r.bookings === 1
        return (
          <>
            <Verdict
              tone={good ? 'good' : 'bad'}
              headline={good ? '5 taps, 1 booking.' : `5 taps, ${r.bookings} bookings for one student.`}
            >
              {good ? 'The extra taps were refused.' : `Aarav now holds ${r.bookings} seats at the same event and blocks ${r.bookings - 1} other ${r.bookings - 1 === 1 ? 'student' : 'students'}.`}
            </Verdict>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {r.clicks.map((s, i) => (
                <Chiplet
                  key={i}
                  tone={ok(s) ? (good ? 'good' : 'bad') : 'muted'}
                  title={`Tap ${i + 1}`}
                  note={ok(s) ? 'Booked' : refused(s) ? 'Refused' : `Error ${s}`}
                />
              ))}
            </div>
          </>
        )
      }}
    </ScenarioCard>
  )
}

export function CancelFreesTest() {
  return (
    <ScenarioCard
      n={3}
      question="Does cancelling give the seat back?"
      setup={
        <>
          <p>An event has 1 seat left. Student A takes it, so student B is turned away.</p>
          <SeatMap capacity={10} taken={9} added={0} caption="Before: 9 booked, 1 free." />
        </>
      }
      action={<p>A cancels. Then B tries to book again.</p>}
      expected="B gets the seat A gave back."
      button="Play it out"
      run={scenarioApi.cancelFrees}
    >
      {(r) => {
        if (r.steps[0].status === 501) return <NotBuilt />
        const last = r.steps[r.steps.length - 1]
        const good = ok(last.status) && last.seats === r.capacity
        return (
          <>
            <Verdict tone={good ? 'good' : 'bad'} headline={good ? 'B got the seat A gave back.' : 'B still could not get in.'}>
              {good ? 'The seat went back to the pool the moment A cancelled.' : 'The seat A gave up was never released.'}
            </Verdict>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {r.steps.map((st, i) => (
                <li key={i} className="flex flex-col gap-2 rounded-lg border border-card-edge p-3">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <span className="text-muted-foreground tabular-nums">{i + 1}.</span> {st.label}
                    {i < r.steps.length - 1 && <ArrowRight className="ml-auto hidden size-3.5 text-muted-foreground lg:block" aria-hidden="true" />}
                  </p>
                  <p className={ok(st.status) ? 'text-xs text-green-700 dark:text-green-400' : 'text-xs text-muted-foreground'}>
                    {ok(st.status) ? (st.label.includes('cancel') ? 'Cancelled' : 'Booked') : refused(st.status) ? 'Refused: sold out' : `Error ${st.status}`}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Seats: {st.seats} / {r.capacity}
                  </p>
                </li>
              ))}
            </ol>
          </>
        )
      }}
    </ScenarioCard>
  )
}

export function FriendCancelTest() {
  return (
    <ScenarioCard
      n={4}
      question="Can a student cancel someone else's booking?"
      setup={<p>Student A has a seat. Student B knows A's booking id (it is visible in the network tab).</p>}
      action={<p>B sends a cancel request for A's booking.</p>}
      expected="Refused. A keeps the seat."
      button="Try as student B"
      run={scenarioApi.friendCancel}
    >
      {(r) => {
        if (!r.built) return <NotBuilt />
        const good = refused(r.attemptStatus) && r.aStillBooked
        return (
          <>
            <Verdict tone={good ? 'good' : 'bad'} headline={good ? "Refused. A's seat is safe." : "B cancelled A's booking."}>
              {good ? `The server checked who owns the booking and said no (${r.attemptStatus}).` : 'Anyone who can see a booking id can take a seat away from someone else.'}
            </Verdict>
            <div className="grid max-w-xl grid-cols-2 gap-3">
              <Chiplet tone="muted" title="Student B" note={`Cancel A's booking: ${refused(r.attemptStatus) ? 'refused' : 'went through'}`} />
              <Chiplet tone={r.aStillBooked ? 'good' : 'bad'} title="Student A" note={r.aStillBooked ? 'Still booked' : 'Booking gone'} />
            </div>
          </>
        )
      }}
    </ScenarioCard>
  )
}
