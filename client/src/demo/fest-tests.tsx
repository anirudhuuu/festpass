import { scenarioApi } from '@/demo/api'
import { Chiplet, NotBuilt, ScenarioCard, Verdict } from '@/demo/scenario'
import { cn } from '@/lib/utils'

const ok = (s: number) => s >= 200 && s < 300
const refused = (s: number) => s >= 400 && s < 500

/** The last 3 hours before an event: open, then the closed last hour, with "now" marked. */
function Timeline({ minutesBefore, action, verdict }: { minutesBefore: number; action: string; verdict?: 'allowed' | 'refused' }) {
  const span = 180
  const nowPct = ((span - minutesBefore) / span) * 100
  const closePct = ((span - 60) / span) * 100
  return (
    <figure className="flex flex-col gap-2">
      <div className="relative pt-7 pb-6">
        <div className="flex h-3 overflow-hidden rounded-full">
          <div className="bg-green-600/30 dark:bg-green-400/30" style={{ width: `${closePct}%` }} />
          <div className="flex-1 bg-red-600/30 dark:bg-red-400/30" />
        </div>
        <Marker pct={closePct} label="Closes" below="1 hour before" />
        <Marker pct={100} label="Event starts" align="right" />
        <div className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${nowPct}%` }}>
          <p
            className={cn(
              'rounded-md border px-1.5 text-[11px] font-semibold whitespace-nowrap',
              verdict === 'allowed' && 'border-red-600/50 text-red-700 dark:border-red-400/50 dark:text-red-400',
              verdict === 'refused' && 'border-green-600/50 text-green-700 dark:border-green-400/50 dark:text-green-400',
              !verdict && 'border-card-edge-hover text-foreground',
            )}
          >
            Now: {action}
          </p>
          <span className="mx-auto mt-0.5 block h-8 w-px bg-foreground" />
        </div>
      </div>
      <figcaption className="flex justify-between text-xs text-muted-foreground">
        <span>Open for booking and cancelling</span>
        <span>Last hour: closed</span>
      </figcaption>
    </figure>
  )
}

function Marker({ pct, label, below, align }: { pct: number; label: string; below?: string; align?: 'right' }) {
  return (
    <div className={cn('absolute bottom-0 text-[11px] text-muted-foreground', align === 'right' ? 'right-0 text-right' : '-translate-x-1/2 text-center')} style={align === 'right' ? undefined : { left: `${pct}%` }}>
      <span className={cn('block h-3 w-px bg-muted-foreground', align === 'right' ? 'ml-auto' : 'mx-auto')} />
      <span className="whitespace-nowrap">{label}</span>
      {below && <span className="block whitespace-nowrap opacity-70">{below}</span>}
    </div>
  )
}

export function LateBookingTest() {
  return (
    <ScenarioCard
      n={5}
      question="Can someone book 30 minutes before the event?"
      setup={
        <>
          <p>
            Fest rule: <strong className="font-semibold text-foreground">booking closes 1 hour before an event starts</strong>, so the
            organisers can print the final list.
          </p>
          <Timeline minutesBefore={30} action="30 min to go" />
        </>
      }
      action={<p>Diya tries to book an event that starts in 30 minutes. It still has free seats.</p>}
      expected="Refused: booking has closed."
      button="Book 30 minutes before"
      run={scenarioApi.lateBooking}
    >
      {(r) => {
        if (r.status === 501) return <NotBuilt />
        const good = refused(r.status)
        return (
          <>
            <Verdict tone={good ? 'good' : 'bad'} headline={good ? 'Refused. Booking had closed.' : 'Diya got a seat 30 minutes before the start.'}>
              {good ? `The server knew the 1-hour rule and said no (${r.status}).` : 'The final list was already printed. Nobody told the app about the 1-hour rule.'}
            </Verdict>
            <Timeline minutesBefore={r.minutesBefore} action={good ? 'refused' : 'booked'} verdict={good ? 'refused' : 'allowed'} />
          </>
        )
      }}
    </ScenarioCard>
  )
}

export function MaxThreeTest() {
  return (
    <ScenarioCard
      n={6}
      question="Can one student grab seats at 4 events?"
      setup={
        <p>
          Fest rule: <strong className="font-semibold text-foreground">a student can hold at most 3 bookings</strong>, so popular events are
          shared fairly.
        </p>
      }
      action={<p>Kabir books 4 different events, one after another.</p>}
      expected="The first 3 work. The 4th is refused."
      button="Book 4 events"
      run={scenarioApi.maxThree}
    >
      {(r) => {
        if (r.statuses[0] === 501) return <NotBuilt />
        const fourth = r.statuses[3]
        const good = r.statuses.slice(0, 3).every(ok) && refused(fourth)
        return (
          <>
            <Verdict tone={good ? 'good' : 'bad'} headline={good ? '3 bookings, then refused.' : `Kabir holds ${r.statuses.filter(ok).length} bookings.`}>
              {good ? 'The 4th booking hit the limit.' : 'There was no limit, so one student can take seats from everyone else.'}
            </Verdict>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {r.statuses.map((s, i) => (
                <Chiplet
                  key={i}
                  tone={i < 3 ? (ok(s) ? 'good' : 'muted') : ok(s) ? 'bad' : 'good'}
                  title={`Event ${i + 1}`}
                  note={ok(s) ? (i < 3 ? 'Booked' : 'Booked: over the limit') : refused(s) ? 'Refused' : `Error ${s}`}
                />
              ))}
            </div>
          </>
        )
      }}
    </ScenarioCard>
  )
}

export function LateCancelTest() {
  return (
    <ScenarioCard
      n={7}
      question="Can someone cancel 30 minutes before the event?"
      setup={
        <>
          <p>
            Fest rule: <strong className="font-semibold text-foreground">cancelling also closes 1 hour before</strong>. A seat freed that late
            can't be filled, so it would just sit empty.
          </p>
          <Timeline minutesBefore={30} action="30 min to go" />
        </>
      }
      action={<p>Meera booked days ago. Now, 30 minutes before the start, she cancels.</p>}
      expected="Refused: she keeps the seat."
      button="Cancel 30 minutes before"
      run={scenarioApi.lateCancel}
    >
      {(r) => {
        if (!r.built) return <NotBuilt />
        const good = refused(r.status) && r.stillBooked
        return (
          <>
            <Verdict tone={good ? 'good' : 'bad'} headline={good ? 'Refused. The seat stays booked.' : 'Cancelled. The seat will sit empty.'}>
              {good ? `The server knew the 1-hour rule and said no (${r.status}).` : 'Too late for anyone else to take it. Nobody told the app about this rule.'}
            </Verdict>
            <Timeline minutesBefore={r.minutesBefore} action={good ? 'refused' : 'cancelled'} verdict={good ? 'refused' : 'allowed'} />
          </>
        )
      }}
    </ScenarioCard>
  )
}
