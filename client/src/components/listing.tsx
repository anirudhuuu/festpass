import * as React from 'react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'

/**
 * The listing pattern from chaicode.com's udemy page, shared by every index
 * in Chai Prep (components/listing/kit.tsx):
 *
 *   ListingHead   centred title, grey subtitle with one highlighted phrase
 *   Toolbar       "Showing N things" on the left, controls on the right,
 *                 an optional quieter filters row underneath
 *   CardGrid      1, 2 then 3 columns, gap-6
 *   ListCard      a text card: top line, Montserrat title, two-line summary,
 *                 outlined chips, a note and an action at the foot
 *   ClearFilters  shown only while something is filtered
 */
export function ListingHead({ title, children, center = true, className }: { title: React.ReactNode; children?: React.ReactNode; center?: boolean; className?: string }) {
  return (
    <div className={cn('space-y-3', center && 'sm:text-center', className)}>
      <h1 className="text-2xl font-medium sm:text-3xl">{title}</h1>
      {children && (
        <p className={cn('max-w-3xl text-base text-neutral-700 sm:text-lg md:text-xl dark:text-neutral-400', center && 'mx-auto')}>{children}</p>
      )}
    </div>
  )
}

export function Toolbar({
  count,
  noun,
  aside,
  children,
  filters,
  className,
}: {
  count: number
  /** Plural, or [singular, plural] when dropping the "s" is not enough. */
  noun: string | readonly [string, string]
  /** Beside the count after a divider, e.g. a LiveDot or "Past and upcoming". */
  aside?: React.ReactNode
  /** The controls on the right: search, select, segmented. */
  children?: React.ReactNode
  /** A second, quieter row: dropdown filters and ClearFilters. */
  filters?: React.ReactNode
  className?: string
}) {
  const [one, many] = typeof noun === 'string' ? [noun.replace(/s$/, ''), noun] : noun
  return (
    <div className={cn('mt-6', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <p className="shrink-0 text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
            Showing <span className="font-semibold text-gray-900 tabular-nums dark:text-gray-100">{count}</span> {count === 1 ? one : many}
          </p>
          {aside && (
            <>
              <span className="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-700" aria-hidden="true" />
              <div className="hidden min-w-0 truncate text-sm text-gray-500 sm:block dark:text-gray-400">{aside}</div>
            </>
          )}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2 sm:gap-3">{children}</div>}
      </div>
      {filters && <div className="mt-3 flex flex-wrap items-center gap-2">{filters}</div>}
    </div>
  )
}

export function ClearFilters({ active, onClear }: { active: boolean; onClear: () => void }) {
  if (!active) return null
  return (
    <button type="button" onClick={onClear} className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground">
      Clear filters
    </button>
  )
}

/** Columns follow the grid's own width (container queries), so it also fits a sidebar layout. */
export function CardGrid({ children, columns = 3, className }: { children: React.ReactNode; columns?: 2 | 3; className?: string }) {
  return (
    <div className={cn('@container mt-4 w-full', className)}>
      <div className={cn('grid grid-cols-1 gap-6 @2xl:grid-cols-2', columns === 3 && '@4xl:grid-cols-3')}>{children}</div>
    </div>
  )
}

/**
 * A text card for an index. With `href` the whole card is the link and
 * `action` is drawn as its button; without it, put a real button in
 * `actionNode`.
 */
export function ListCard({
  href,
  topLeft,
  topRight,
  title,
  summary,
  chips,
  note,
  action,
  actionNode,
  children,
  className,
}: {
  href?: string
  topLeft?: React.ReactNode
  topRight?: React.ReactNode
  title: React.ReactNode
  summary?: React.ReactNode
  chips?: React.ReactNode[]
  note?: React.ReactNode
  action?: string
  actionNode?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  const shown = chips?.filter(Boolean) ?? []
  const body = (
    <>
      {(topLeft || topRight) && (
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0">{topLeft}</span>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{topRight}</span>
        </div>
      )}
      <h3 className={cn('font-montserrat text-base leading-snug font-semibold text-gray-900 dark:text-gray-50', (topLeft || topRight) && 'mt-3')}>{title}</h3>
      {summary && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{summary}</p>}
      {shown.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {shown.map((c, i) => (
            <Chip key={i}>{c}</Chip>
          ))}
        </div>
      )}
      {children}
      {(note || action || actionNode) && (
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="min-w-0 text-xs text-muted-foreground">{note}</span>
          {action && <span className={cn(buttonVariants({ size: 'sm' }), 'min-w-24')}>{action}</span>}
          {actionNode}
        </div>
      )}
    </>
  )
  const base = 'card-chai group flex flex-col p-4 sm:opacity-90 sm:hover:opacity-100'
  return href ? (
    <a href={href} className={cn(base, 'outline-none focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50', className)}>
      {body}
    </a>
  ) : (
    <div className={cn(base, className)}>{body}</div>
  )
}
