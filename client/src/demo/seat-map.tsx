import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'

type Seat = 'taken' | 'free' | 'new' | 'extra'

/**
 * The room as dots. 10 seats in a row, and any booking past capacity drawn
 * outside the room in red, so "more bookings than seats" is visible at a glance.
 */
export function SeatMap({ capacity, taken, added, caption }: { capacity: number; taken: number; added: number; caption: string }) {
  const still = useReducedMotion() ?? false
  const total = taken + added
  const inRoom: Seat[] = Array.from({ length: capacity }, (_, i) => (i < taken ? 'taken' : i < total ? 'new' : 'free'))
  const extra = Math.max(0, total - capacity)

  return (
    <figure className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="rounded-xl border border-card-edge-hover px-3 py-3">
          <p className="mb-2 text-[11px] text-muted-foreground">The room: {capacity} seats</p>
          <div className="flex gap-1.5" role="img" aria-label={`${Math.min(total, capacity)} of ${capacity} seats filled`}>
            {inRoom.map((s, i) => (
              <Dot key={i} kind={s} />
            ))}
          </div>
        </div>
        {extra > 0 && (
          <div className="min-w-0">
            <p className="mb-2 text-[11px] text-red-700 dark:text-red-400">Booked, but no seat: {extra}</p>
            <div className="flex flex-wrap gap-1.5" role="img" aria-label={`${extra} bookings with no seat`}>
              {Array.from({ length: extra }, (_, i) => (
                <motion.span
                  key={i}
                  initial={still ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: still ? 0 : 0.3 + i * 0.05 }}
                >
                  <Dot kind="extra" />
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
      <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>
    </figure>
  )
}

function Dot({ kind }: { kind: Seat }) {
  return (
    <span
      className={cn(
        'block size-5 rounded-md border sm:size-6',
        kind === 'taken' && 'border-transparent bg-neutral-400 dark:bg-neutral-500',
        kind === 'free' && 'border-dashed border-neutral-400 dark:border-neutral-500',
        kind === 'new' && 'border-green-600 bg-green-600/25 dark:border-green-400 dark:bg-green-400/25',
        kind === 'extra' && 'border-red-600 bg-red-600/20 dark:border-red-400 dark:bg-red-400/20',
      )}
    />
  )
}

export function SeatLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <li className="flex items-center gap-1.5"><Dot kind="taken" /> Already booked</li>
      <li className="flex items-center gap-1.5"><Dot kind="free" /> Free</li>
      <li className="flex items-center gap-1.5"><Dot kind="new" /> Booked in the rush</li>
      <li className="flex items-center gap-1.5"><Dot kind="extra" /> Booked, but no seat</li>
    </ul>
  )
}
