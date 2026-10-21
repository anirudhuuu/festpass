import { cva, type VariantProps } from 'class-variance-authority'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * A message in the flow of the page: a notice, a warning, a failure. Like
 * every status in ChaiUI it is a thin coloured outline and coloured text on
 * the page background, never a filled block. `info` is neutral grey.
 */
const alertVariants = cva('relative flex gap-3 rounded-xl border px-4 py-3 text-sm', {
  variants: {
    tone: {
      info: 'border-card-edge-hover text-foreground [&>svg]:text-muted-foreground',
      success: 'border-green-600/30 text-green-800 dark:border-green-400/30 dark:text-green-300',
      warning: 'border-yellow-600/35 text-yellow-800 dark:border-yellow-400/30 dark:text-yellow-200',
      danger: 'border-red-600/30 text-red-800 dark:border-red-400/30 dark:text-red-300',
    },
  },
  defaultVariants: { tone: 'info' },
})

const icons = { info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleAlert }

function Alert({
  tone = 'info',
  title,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & VariantProps<typeof alertVariants> & { title?: React.ReactNode }) {
  const Icon = icons[tone ?? 'info']
  return (
    <div data-slot="alert" role={tone === 'danger' ? 'alert' : 'status'} className={cn(alertVariants({ tone }), className)} {...props}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 space-y-0.5">
        {title && <p className="font-montserrat font-semibold">{title}</p>}
        {children && <div className="leading-relaxed opacity-90">{children}</div>}
      </div>
    </div>
  )
}

export { Alert, alertVariants }
