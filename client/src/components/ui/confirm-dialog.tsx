'use client'

import { TriangleAlert } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogActions } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

/**
 * A confirmation for actions that cannot be undone (from Chai Prep's
 * ConfirmDialog). Say exactly what will happen in `children`. Focus starts on
 * the safe choice. With `typeToConfirm`, the confirm button stays disabled
 * until that word is typed: use it when other people are affected too.
 */
function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  busyLabel = 'Working',
  cancelLabel = 'Cancel',
  tone = 'danger',
  typeToConfirm,
  busy = false,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: React.ReactNode
  children?: React.ReactNode
  confirmLabel: string
  busyLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'neutral'
  /** A word the person must type before the confirm button works. */
  typeToConfirm?: string
  busy?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}) {
  const cancelBtn = React.useRef<HTMLButtonElement>(null)
  const input = React.useRef<HTMLInputElement>(null)
  const [typed, setTyped] = React.useState('')
  const inputId = React.useId()

  React.useEffect(() => {
    if (open) setTyped('')
  }, [open])

  const ready = !typeToConfirm || typed.trim().toLowerCase() === typeToConfirm.toLowerCase()

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      role="alertdialog"
      busy={busy}
      initialFocus={typeToConfirm ? input : cancelBtn}
      title={
        <span className="flex items-start gap-4">
          {tone === 'danger' && (
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-500/12 text-red-600 dark:text-red-400" aria-hidden="true">
              <TriangleAlert className="size-5" />
            </span>
          )}
          <span className="min-w-0 flex-1 pt-2">{title}</span>
        </span>
      }
      description={children ? <div className={tone === 'danger' ? 'sm:pl-14' : undefined}>{children}</div> : undefined}
    >
      {typeToConfirm && (
        <div className="mt-5">
          <label htmlFor={inputId} className="text-sm text-muted-foreground">
            Type <span className="font-semibold text-foreground">{typeToConfirm}</span> to confirm
          </label>
          <Input
            id={inputId}
            ref={input}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && ready && !busy) onConfirm()
            }}
            autoComplete="off"
            spellCheck={false}
            className="mt-1.5"
          />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <DialogActions>
        <Button ref={cancelBtn} variant="ghost" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'soft'} onClick={onConfirm} disabled={!ready || busy} aria-busy={busy || undefined}>
          {busy ? busyLabel : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export { ConfirmDialog }
