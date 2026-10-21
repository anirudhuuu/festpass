import { Check, X } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { demoApi, type CheckInfo, type CheckResult } from '@/demo/api'

type Row = CheckInfo & { result?: CheckResult; running?: boolean }

export function ChecksPanel() {
  const [rows, setRows] = React.useState<Row[]>([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    demoApi
      .checks()
      .then(setRows)
      .catch(() => setError('Could not load the tests. Is the server running?'))
  }, [])

  async function runAll() {
    setBusy(true)
    setRows((r) => r.map(({ result: _, ...c }) => c))
    for (const c of rows) {
      setRows((r) => r.map((x) => (x.id === c.id ? { ...x, running: true } : x)))
      let result: CheckResult
      try {
        result = await demoApi.run(c.id)
      } catch {
        result = { id: c.id, pass: false, detail: 'The server did not answer.', ms: 0 }
      }
      setRows((r) => r.map((x) => (x.id === c.id ? { ...x, running: false, result } : x)))
    }
    setBusy(false)
  }

  const finished = rows.length > 0 && rows.every((r) => r.result)
  const passed = rows.filter((r) => r.result?.pass).length
  const groups = rows.reduce<Record<string, Row[]>>((g, r) => ((g[r.rule] ??= []).push(r), g), {})

  return (
    <section aria-labelledby="checks-title" className="card-chai flex flex-col gap-6 p-5 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Test 8: everything at once</p>
          <h2 id="checks-title" className="text-2xl font-medium sm:text-[30px]">
            Does booking follow every rule?
          </h2>
          <p className="max-w-2xl text-gray-600 dark:text-gray-300">
            We act out {rows.length || 14} things real students do and check the result. <span className="highlight">Same tests</span> before and
            after OpenSpec.
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={runAll} disabled={busy || rows.length === 0} className="shrink-0">
          {busy ? 'Testing' : finished ? 'Run again' : 'Run all tests'}
        </Button>
      </header>

      {finished && (
        <p
          aria-live="polite"
          className={cn(
            'font-montserrat text-xl font-semibold sm:text-2xl',
            passed === rows.length ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400',
          )}
        >
          {passed === rows.length ? `All ${rows.length} pass.` : `${rows.length - passed} of ${rows.length} fail.`}
        </p>
      )}
      {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        {Object.entries(groups).map(([rule, items]) => (
          <div key={rule}>
            <h3 className="mb-2 font-montserrat text-sm font-semibold text-foreground">{rule}</h3>
            <ul className="divide-y divide-card-edge rounded-lg border border-card-edge">
              {items.map((r) => (
                <li key={r.id} className="flex items-start gap-3 px-4 py-3">
                  <Status row={r} />
                  <div className="min-w-0 text-sm">
                    <p className="text-foreground">{r.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Should: {r.expect}</p>
                    {r.result && !r.result.pass && <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">Actually: {r.result.detail}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function Status({ row }: { row: Row }) {
  const box = 'mt-0.5 grid size-5 shrink-0 place-items-center'
  if (row.running) return <Spinner label="Testing" className={box} />
  if (!row.result) return <span className={cn(box)} aria-label="Not run yet"><span className="size-2 rounded-full bg-neutral-400 dark:bg-neutral-600" /></span>
  return row.result.pass ? (
    <Check className={cn(box, 'text-green-700 dark:text-green-400')} aria-label="Pass" />
  ) : (
    <X className={cn(box, 'text-red-700 dark:text-red-400')} aria-label="Fail" />
  )
}
