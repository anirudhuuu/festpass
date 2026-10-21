import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * The pinging dot with a label: "Live" on cohort cards (red), "Available on
 * Udemy for Business" in the udemy toolbar (purple). The ping stops for
 * people who ask for reduced motion; the dot stays.
 */
const liveDotVariants = cva('inline-flex items-center gap-1.5 font-montserrat text-xs font-medium select-none', {
  variants: {
    tone: {
      live: 'text-red-700 dark:text-red-400 [--ping:var(--color-red-400)] [--dot:var(--color-red-700)] dark:[--ping:var(--color-red-300)] dark:[--dot:var(--color-red-400)]',
      special: 'text-purple-700 dark:text-purple-400 [--ping:var(--color-purple-400)] [--dot:var(--color-purple-500)]',
      success: 'text-green-700 dark:text-green-400 [--ping:var(--color-green-400)] [--dot:var(--color-green-500)]',
    },
  },
  defaultVariants: { tone: 'live' },
})

function LiveDot({ className, tone, children, ...props }: React.ComponentProps<'span'> & VariantProps<typeof liveDotVariants>) {
  return (
    <span data-slot="live-dot" className={cn(liveDotVariants({ tone }), className)} {...props}>
      <span className="relative flex size-2 items-center justify-center" aria-hidden="true">
        <span className="absolute size-full rounded-full bg-(--ping) opacity-75 motion-safe:animate-ping" />
        <span className="relative inline-flex size-1.5 rounded-full bg-(--dot)" />
      </span>
      {children}
    </span>
  )
}

export { LiveDot, liveDotVariants }
