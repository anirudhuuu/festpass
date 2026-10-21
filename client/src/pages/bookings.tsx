import * as React from 'react'

import { CardGrid, ListCard, ListingHead } from '@/components/listing'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Highlight } from '@/components/ui/highlight'
import { useToast } from '@/components/ui/toast'
import { api, errorMessage, type Booking, type FestEvent } from '@/lib/api'
import { categoryLabel, formatWhen } from '@/lib/format'
import { useStudent } from '@/lib/student'

type Row = Booking & { event: FestEvent }

export function BookingsPage() {
  const toast = useToast()
  const { student } = useStudent()
  const [rows, setRows] = React.useState<Row[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [cancelling, setCancelling] = React.useState<Row | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [cancelError, setCancelError] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    if (!student) return
    api
      .myBookings()
      .then((r) => {
        setRows(r)
        setError(null)
      })
      .catch((err) => setError(errorMessage(err)))
  }, [student])

  React.useEffect(load, [load])

  async function confirmCancel() {
    if (!cancelling) return
    setBusy(true)
    setCancelError(null)
    try {
      await api.cancel(cancelling.id)
      toast('Booking cancelled. Your seat is free for someone else.', { tone: 'success' })
      setCancelling(null)
      load()
    } catch (err) {
      setCancelError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <ListingHead title="My bookings">
        {student ? (
          <>
            Signed in as <Highlight>{student.name}</Highlight>.
          </>
        ) : (
          'Pick a student in the top bar to see their bookings.'
        )}
      </ListingHead>

      {student && error && (
        <Alert tone="info" title="Nothing to show yet" className="mt-6">
          {error}
        </Alert>
      )}

      {student && !error && rows.length === 0 && <p className="mt-6 text-center text-sm text-muted-foreground">No bookings yet.</p>}

      <CardGrid>
        {rows.map((r) => (
          <ListCard
            key={r.id}
            topLeft={<Chip tone="success">Booked</Chip>}
            topRight={formatWhen(r.event.startsAt)}
            title={r.event.title}
            summary={r.event.venue}
            chips={[categoryLabel[r.event.category]]}
            actionNode={
              <Button size="sm" variant="ghost" onClick={() => setCancelling(r)}>
                Cancel booking
              </Button>
            }
          />
        ))}
      </CardGrid>

      <ConfirmDialog
        open={!!cancelling}
        title="Cancel this booking?"
        confirmLabel="Cancel booking"
        busyLabel="Cancelling"
        cancelLabel="Keep my seat"
        tone="danger"
        busy={busy}
        error={cancelError}
        onConfirm={confirmCancel}
        onCancel={() => {
          setCancelling(null)
          setCancelError(null)
        }}
      >
        Your seat at {cancelling?.event.title} goes back to the pool and someone else can book it.
      </ConfirmDialog>
    </>
  )
}
