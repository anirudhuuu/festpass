import { LoaderCircle } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

/** A small turning ring for work that takes a moment. It carries a label for screen readers; pass your own when "Loading" is too vague. */
function Spinner({ label = 'Loading', className, ...props }: React.ComponentProps<'span'> & { label?: string }) {
  return (
    <span data-slot="spinner" role="status" className={cn('inline-flex text-muted-foreground', className)} {...props}>
      <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export { Spinner }
