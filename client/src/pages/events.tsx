import * as React from 'react'

import { CardGrid, ClearFilters, ListCard, ListingHead, Toolbar } from '@/components/listing'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Highlight } from '@/components/ui/highlight'
import { Progress } from '@/components/ui/progress'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { api, errorMessage, type FestEvent } from '@/lib/api'
import { categoryLabel, formatWhen } from '@/lib/format'

export function EventsPage() {
  const toast = useToast()
  const [events, setEvents] = React.useState<FestEvent[] | null>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [category, setCategory] = React.useState('')
  const [pending, setPending] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    api
      .events()
      .then((e) => {
        setEvents(e)
        setLoadError(null)
      })
      .catch((err) => setLoadError(errorMessage(err)))
  }, [])

  React.useEffect(load, [load])

  async function book(event: FestEvent) {
    setPending(event.id)
    try {
      await api.book(event.id)
      toast(`Booked: ${event.title}`, { tone: 'success' })
    } catch (err) {
      toast(errorMessage(err), { tone: 'danger' })
    } finally {
      setPending(null)
      load()
    }
  }

  const shown = (events ?? []).filter((e) => !category || e.category === category)

  return (
    <>
      <ListingHead title="Fest events">
        Grab a seat before they are gone. <Highlight>Seats are limited</Highlight> for every event.
      </ListingHead>

      {loadError && (
        <Alert tone="danger" title="Could not load events" className="mt-6">
          {loadError}
        </Alert>
      )}

      <Toolbar
        count={shown.length}
        noun="events"
        filters={<ClearFilters active={!!category} onClear={() => setCategory('')} />}
      >
        <Select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {Object.entries(categoryLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Toolbar>

      <CardGrid>
        {shown.map((e) => {
          const cancelled = e.status === 'cancelled'
          const full = e.seatsLeft === 0
          return (
            <ListCard
              key={e.id}
              topLeft={cancelled ? <Chip tone="danger">Cancelled</Chip> : <Chip>{categoryLabel[e.category]}</Chip>}
              topRight={formatWhen(e.startsAt)}
              title={e.title}
              summary={e.venue}
              note={
                <span className={full && !cancelled ? 'text-red-700 dark:text-red-400' : undefined}>
                  {full ? 'Sold out' : `${e.seatsLeft} of ${e.capacity} seats left`}
                </span>
              }
              actionNode={
                // Disabling here is only a hint for the user. The server must still enforce the rules.
                <Button size="sm" className="min-w-24" disabled={full || cancelled || pending === e.id} onClick={() => book(e)}>
                  {pending === e.id ? 'Booking' : 'Book seat'}
                </Button>
              }
            >
              <Progress
                value={Math.min(e.seatsBooked, e.capacity)}
                max={e.capacity}
                aria-label={`${e.seatsBooked} of ${e.capacity} seats booked`}
                className="mt-4"
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground tabular-nums">
                {e.seatsBooked} / {e.capacity} booked
              </p>
            </ListCard>
          )
        })}
      </CardGrid>
    </>
  )
}
