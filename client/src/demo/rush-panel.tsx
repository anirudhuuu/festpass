import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { demoApi, type RushResult } from '@/demo/api'
import { SeatLegend, SeatMap } from '@/demo/seat-map'
import { Step, Verdict } from '@/demo/scenario'

export function RushPanel() {
  const [result, setResult] = React.useState<RushResult | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function start() {
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      setResult(await demoApi.rush())
    } catch {
      setError('Could not reach the server. Is it running?')
    } finally {
      setBusy(false)
    }
  }

  const told = result?.students.filter((s) => s.status === 201).length ?? 0
  const notBuilt = !!result && result.students.every((s) => s.status === 501)
  const added = result ? result.bookings - result.already : 0
  const broken = !!result && !notBuilt && (told > 1 || result.bookings > result.capacity)

  return (
    <section aria-labelledby="rush-title" className="card-chai flex flex-col gap-8 p-5 sm:p-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Test 1</p>
        <h2 id="rush-title" className="text-2xl font-medium sm:text-[30px]">
          Can two students get the same last seat?
        </h2>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Step n={1} title="The setup">
          <p>
            Hackathon kickoff has 10 seats. 9 are already booked, so <strong className="font-semibold text-foreground">1 seat is left</strong>.
          </p>
          <SeatMap capacity={10} taken={9} added={0} caption="Before: 9 booked, 1 free." />
        </Step>
        <Step n={2} title="What we do">
          <p>20 students press Book at the exact same moment, like the second registrations open.</p>
          <p>
            <strong className="font-semibold text-foreground">Expected:</strong> 1 student gets the seat, 19 are told it is sold out.
          </p>
          <Button variant="solid" size="lg" onClick={start} disabled={busy} className="mt-2 w-fit">
            {busy ? 'Sending 20 bookings' : result ? 'Try it again' : 'Send 20 students at once'}
          </Button>
        </Step>
      </div>

      {busy && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner label="Booking" /> 20 bookings in flight
        </p>
      )}
      {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}

      {result && (
        <Step n={3} title="What happened">
          {notBuilt ? (
            <Verdict tone="neutral" headline="Nothing yet: booking is not built.">
              All 20 students were told the feature does not exist. Build it, then try again.
            </Verdict>
          ) : broken ? (
            <Verdict tone="bad" headline={`${told} students were told "You're in" for 1 seat.`}>
              The app now has {result.bookings} bookings for a {result.capacity}-seat room.{' '}
              {result.bookings - result.capacity > 0 && `${result.bookings - result.capacity} students will turn up with no seat.`}
            </Verdict>
          ) : (
            <Verdict tone="good" headline="1 student got the seat. 19 were told it is sold out.">
              {result.bookings} bookings for {result.capacity} seats. Exactly right.
            </Verdict>
          )}

          {!notBuilt && (
            <>
              <SeatMap
                capacity={result.capacity}
                taken={result.already}
                added={added}
                caption={`After: ${result.bookings} bookings for ${result.capacity} seats.`}
              />
              <SeatLegend />
            </>
          )}

          {broken && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-card-edge p-4">
                <p className="font-montserrat text-sm font-semibold text-foreground">Why it happens</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                  <li>All 20 requests read "9 booked" at the same time.</li>
                  <li>Each one decides "there is a seat left".</li>
                  <li>Each one saves its booking. Nobody re-checks.</li>
                </ol>
              </div>
              {result.counter <= result.capacity && (
                <div className="rounded-lg border border-card-edge p-4">
                  <p className="font-montserrat text-sm font-semibold text-foreground">Why nobody notices</p>
                  <p className="mt-2 text-sm">
                    The event page still says {result.counter} / {result.capacity}, sold out. The extra bookings are only in the database, so
                    the app looks perfectly fine.
                  </p>
                </div>
              )}
            </div>
          )}
        </Step>
      )}
    </section>
  )
}
