'use client'

import { X } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

type ToastTone = 'default' | 'success' | 'danger'
type ToastItem = { id: number; message: React.ReactNode; tone: ToastTone }

const ToastContext = React.createContext<((message: React.ReactNode, opts?: { tone?: ToastTone; duration?: number }) => void) | null>(null)

const toneClass: Record<ToastTone, string> = {
  default: '',
  success: '[&_[data-toast-dot]]:bg-green-500',
  danger: '[&_[data-toast-dot]]:bg-red-500',
}

/**
 * Short confirmations ("Link copied", "Sheet deleted"), bottom centre, in
 * the card style. They leave on their own after `duration` ms (4s by
 * default) and are announced politely to screen readers.
 */
function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([])
  const next = React.useRef(0)

  const dismiss = React.useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), [])

  const toast = React.useCallback(
    (message: React.ReactNode, opts?: { tone?: ToastTone; duration?: number }) => {
      const id = ++next.current
      setItems((all) => [...all.slice(-2), { id, message, tone: opts?.tone ?? 'default' }])
      window.setTimeout(() => dismiss(id), opts?.duration ?? 4000)
    },
    [dismiss],
  )

  return (
    <ToastContext value={toast}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[110] flex flex-col items-center gap-2 px-4"
      >
        {items.map((t) => (
          <div
            key={t.id}
            data-slot="toast"
            className={cn(
              'pointer-events-auto flex w-fit max-w-md items-center gap-3 rounded-xl border border-card-edge-hover bg-card/90 py-2.5 pr-2 pl-4 text-sm text-card-foreground backdrop-blur-md motion-safe:animate-chai-pop',
              toneClass[t.tone],
            )}
          >
            {t.tone !== 'default' && <span data-toast-dot="" className="size-1.5 shrink-0 rounded-full" aria-hidden="true" />}
            <span className="min-w-0">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  )
}

function useToast() {
  const ctx = React.use(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

export { ToastProvider, useToast }
