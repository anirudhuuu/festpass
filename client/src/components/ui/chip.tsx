import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * An outlined meta chip ("10.5 total hours", "Hindi"). Grey by default;
 * `special` is the purple kept for one category on a page (chaicode uses it
 * for Udemy for Business). Tones are text and a thin stroke, never a fill.
 */
const chipVariants = cva('inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] leading-4 whitespace-nowrap', {
  variants: {
    tone: {
      default: 'border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400',
      success: 'border-green-600/30 text-green-700 dark:border-green-400/30 dark:text-green-400',
      danger: 'border-red-600/30 text-red-700 dark:border-red-400/30 dark:text-red-400',
      special: 'border-purple-600/30 text-purple-700 dark:border-purple-400/30 dark:text-purple-400',
    },
  },
  defaultVariants: { tone: 'default' },
})

function Chip({ className, tone, ...props }: React.ComponentProps<'span'> & VariantProps<typeof chipVariants>) {
  return <span data-slot="chip" className={cn(chipVariants({ tone }), className)} {...props} />
}

export { Chip, chipVariants }
