import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * How far along something is. The bar is the neutral primary (light grey on
 * dark): DESIGN.md rules out orange progress bars. Give it an aria-label or
 * put a visible label next to it.
 */
function Progress({ value = 0, max = 100, className, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const pct = Math.min(100, Math.max(0, ((value ?? 0) / (max ?? 100)) * 100))
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-black/[0.08] dark:bg-white/10', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
