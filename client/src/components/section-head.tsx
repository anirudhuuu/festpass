import { ArrowUpRight } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

/**
 * The head of every chaicode.com landing section: a 30px medium heading and
 * a grey subtitle with one highlighted phrase. `action` adds the muted
 * "View all" button on the right (below the content on phones, so pass the
 * same action to a second link there if you need one).
 */
export function SectionHead({
  title,
  children,
  action,
  id,
  className,
}: {
  title: React.ReactNode
  /** The subtitle. One <Highlight> in it. */
  children?: React.ReactNode
  action?: { label: string; href: string }
  /** Set it and point the section's aria-labelledby here. */
  id?: string
  className?: string
}) {
  return (
    <div className={cn('mb-2 sm:mb-4', className)}>
      <h2 id={id} className="text-2xl font-medium sm:text-[30px]">
        {title}
      </h2>
      <div className="flex items-start justify-between gap-6">
        {children && <p className="text-gray-600 sm:text-lg dark:text-gray-300">{children}</p>}
        {action && (
          <a href={action.href} className={cn(buttonVariants({ variant: 'muted', size: 'lg' }), 'hidden shrink-0 sm:-mt-5 sm:inline-flex')}>
            {action.label}
            <ArrowUpRight className="-ml-1" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  )
}
