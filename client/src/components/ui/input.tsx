import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * The toolbar field from chaicode.com's udemy page and Chai Prep's
 * `.cc-input`: h-9, rounded-md, a grey hairline, near-black glass on dark.
 */
const inputClass =
  'h-9 w-full min-w-0 rounded-md border border-gray-200 bg-white px-3 text-sm text-foreground transition-colors duration-150 outline-none placeholder:text-muted-foreground focus-visible:border-gray-300 focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500/60 dark:border-gray-800 dark:bg-black/50 dark:focus-visible:border-gray-700'

function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return <input data-slot="input" type={type} className={cn(inputClass, className)} {...props} />
}

export { Input, inputClass }
