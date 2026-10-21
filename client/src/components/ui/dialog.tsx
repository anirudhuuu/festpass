'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

/**
 * A modal panel, portalled to <body> so no header blur or card transform can
 * clip it. Escape and the backdrop close it (unless `busy`), Tab stays
 * inside, the page behind stops scrolling, and focus goes back where it was
 * on close. `initialFocus` picks what gets focus first: point it at the safe
 * choice.
 */
function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  role = 'dialog',
  busy = false,
  initialFocus,
  className,
}: {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  role?: 'dialog' | 'alertdialog'
  busy?: boolean
  initialFocus?: React.RefObject<HTMLElement | null>
  className?: string
}) {
  const titleId = React.useId()
  const bodyId = React.useId()
  const panel = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)
  const busyRef = React.useRef(busy)
  const closeRef = React.useRef(onClose)
  busyRef.current = busy
  closeRef.current = onClose

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    if (!open) return
    const before = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Wait a frame so the portal is in the DOM before focusing into it.
    const t = window.setTimeout(() => {
      const target = initialFocus?.current ?? panel.current?.querySelector<HTMLElement>('button:not([disabled]), input, a[href]') ?? panel.current
      target?.focus()
    }, 30)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busyRef.current) {
        e.preventDefault()
        closeRef.current()
      }
      if (e.key === 'Tab' && panel.current) {
        const items = panel.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
        )
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      before?.focus?.()
    }
  }, [open, initialFocus])

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="presentation">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[6px] motion-safe:animate-chai-fade"
        onClick={() => !busy && onClose()}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? bodyId : undefined}
        tabIndex={-1}
        data-slot="dialog"
        className={cn(
          'relative w-full max-w-md rounded-2xl border border-card-edge-hover bg-card p-6 text-card-foreground outline-none motion-safe:animate-chai-pop',
          className,
        )}
      >
        <h2 id={titleId} className="font-montserrat text-lg leading-snug font-semibold">
          {title}
        </h2>
        {description && (
          <div id={bodyId} className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}

/** The button row: stacked on phones (main action on top), right-aligned from sm. */
function DialogActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
}

export { Dialog, DialogActions }
