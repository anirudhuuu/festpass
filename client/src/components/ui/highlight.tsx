import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * The signature move: one pale-cream Montserrat phrase per paragraph, so the
 * eye finds the point of a sentence without bold or colour shouting.
 * Capitalised, as on chaicode.com. Never more than one per paragraph.
 */
function Highlight({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="highlight" className={cn('highlight', className)} {...props} />
}

export { Highlight }
