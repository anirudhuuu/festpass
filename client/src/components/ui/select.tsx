import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { inputClass } from '@/components/ui/input'

/**
 * A native <select> in the toolbar style. Native on purpose: it is the most
 * usable picker on phones and needs no portal.
 */
function Select({ className, wrapperClassName, children, ...props }: React.ComponentProps<'select'> & { wrapperClassName?: string }) {
  return (
    <div className={cn('relative w-fit max-w-full', wrapperClassName)}>
      <select data-slot="select" className={cn(inputClass, 'cursor-pointer appearance-none pr-8', className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    </div>
  )
}

export { Select }
