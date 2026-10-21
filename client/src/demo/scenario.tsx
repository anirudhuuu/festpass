import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

/** One test on the Live check page: a question, the setup, the action, and what happened. */
export function ScenarioCard<T>({
  n,
  question,
  setup,
  action,
  expected,
  button,
  run,
  children,
}: {
  n: number
  question: string
  setup: React.ReactNode
  action: React.ReactNode
  expected: React.ReactNode
  button: string
  run: () => Promise<T>
  children: (result: T) => React.ReactNode
}) {
  const [result, setResult] = React.useState<T | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function start() {
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      setResult(await run())
    } catch {
      setError('Could not reach the server. Is it running?')
    } finally {
      setBusy(false)
    }
  }

  const id = `test-${n}`
  return (
    <section aria-labelledby={id} className="card-chai flex flex-col gap-8 p-5 sm:p-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Test {n}</p>
        <h2 id={id} className="text-2xl font-medium sm:text-[30px]">
          {question}
        </h2>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Step n={1} title="The setup">
          {setup}
        </Step>
        <Step n={2} title="What we do">
          {action}
          <p>
            <strong className="font-semibold text-foreground">Expected:</strong> {expected}
          </p>
          <Button variant="outline" size="lg" onClick={start} disabled={busy} className="mt-2 w-fit">
            {busy ? 'Running' : result ? 'Try it again' : button}
          </Button>
        </Step>
      </div>

      {busy && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner label="Running" /> Running
        </p>
      )}
      {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}
      {result && (
        <Step n={3} title="What happened">
          {children(result)}
        </Step>
      )}
    </section>
  )
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 text-gray-600 sm:text-base dark:text-gray-300">
      <h3 className="flex items-center gap-2 font-montserrat text-base font-semibold text-foreground">
        <span className="grid size-6 place-items-center rounded-full border border-card-edge-hover text-xs tabular-nums">{n}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}

export type Tone = 'good' | 'bad' | 'neutral'

export function Verdict({ tone, headline, children }: { tone: Tone; headline: string; children?: React.ReactNode }) {
  return (
    <div
      role="status"
      className={cn(
        'rounded-lg border p-4 sm:p-5',
        tone === 'good' && 'border-green-600/30 dark:border-green-400/30',
        tone === 'bad' && 'border-red-600/30 dark:border-red-400/30',
        tone === 'neutral' && 'border-card-edge',
      )}
    >
      <p
        className={cn(
          'font-montserrat text-xl font-semibold sm:text-2xl',
          tone === 'good' && 'text-green-700 dark:text-green-400',
          tone === 'bad' && 'text-red-700 dark:text-red-400',
          tone === 'neutral' && 'text-foreground',
        )}
      >
        {headline}
      </p>
      {children && <p className="mt-1 text-sm sm:text-base">{children}</p>}
    </div>
  )
}

export const NotBuilt = () => (
  <Verdict tone="neutral" headline="Nothing yet: booking is not built.">
    Build the feature, then try again.
  </Verdict>
)

/** A small labelled box: a ticket, a click, a student. */
export function Chiplet({ tone, title, note }: { tone: Tone | 'muted'; title: string; note?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2',
        tone === 'good' && 'border-green-600/40 dark:border-green-400/40',
        tone === 'bad' && 'border-red-600/40 bg-red-600/10 dark:border-red-400/40 dark:bg-red-400/10',
        (tone === 'neutral' || tone === 'muted') && 'border-card-edge',
      )}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      {note && (
        <p
          className={cn(
            'text-xs',
            tone === 'good' && 'text-green-700 dark:text-green-400',
            tone === 'bad' && 'text-red-700 dark:text-red-400',
            (tone === 'neutral' || tone === 'muted') && 'text-muted-foreground',
          )}
        >
          {note}
        </p>
      )}
    </div>
  )
}
