import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * The listing card from chaicode.com (routes/udemy UdemyCourseCard): a warm
 * hairline, a faint fill with a touch of blur, and no shadow. It sits a
 * little dimmed on wide screens and comes to full on hover; the media zooms
 * 3% over 300ms.
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'card-chai group relative flex flex-col overflow-hidden text-card-foreground sm:opacity-90 sm:hover:opacity-100 sm:has-focus-visible:opacity-100',
        className,
      )}
      {...props}
    />
  )
}

/** An aspect-video frame for the card's image. Pass the <img> as the child. */
function CardMedia({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-media"
      className={cn(
        'relative aspect-video w-full shrink-0 overflow-hidden [&>img]:size-full [&>img]:object-cover [&>img]:transition-transform [&>img]:duration-300 motion-safe:group-hover:[&>img]:scale-[1.03]',
        className,
      )}
      {...props}
    />
  )
}

function CardBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-body" className={cn('flex min-w-0 flex-1 flex-col gap-1.5 p-4', className)} {...props} />
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="card-title"
      className={cn('font-montserrat text-base leading-snug font-semibold text-gray-900 dark:text-gray-50', className)}
      {...props}
    />
  )
}

function CardText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-text"
      className={cn('line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400', className)}
      {...props}
    />
  )
}

/** Pinned to the bottom: a note or price on the left, the action on the right. */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('mt-auto flex items-end justify-between gap-3 pt-3', className)} {...props} />
}

export { Card, CardBody, CardFooter, CardMedia, CardText, CardTitle }
