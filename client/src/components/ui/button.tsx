import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowUpRight } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * chaicode.com's buttons (ui/button.tsx and landing/hero.tsx).
 *
 * - `soft` is the default: the shadcn primary, light grey on dark. It is the
 *   button on cards ("View details", "Start").
 * - `solid` is the white one with asymmetric corners. Use it once per screen,
 *   for the main action. It carries ArrowUpRight unless `iconRight={null}`.
 * - `outline` mirrors the corners and sits beside `solid`.
 * - `danger` is only for the confirm button of a destructive action.
 *
 * There is no colour prop on purpose: orange never fills a button.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        soft: 'rounded-md bg-primary font-semibold text-primary-foreground hover:bg-primary/90',
        solid: 'btn-asym bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-200',
        outline:
          'btn-asym-mirror border border-neutral-200 bg-transparent text-foreground hover:bg-neutral-100 dark:border-white/10 dark:hover:bg-black/90',
        muted:
          'rounded-md bg-[#d4d4d866] font-montserrat text-[#52525b] hover:bg-[#d4d4d8] dark:bg-[#71717a33] dark:text-[#d4d4d8] dark:hover:bg-black/70',
        ghost: 'rounded-md text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        danger: 'rounded-md bg-red-600 font-semibold text-white hover:bg-red-600/90 dark:bg-red-500 dark:hover:bg-red-500/90',
      },
      size: {
        sm: 'h-8 gap-1.5 px-3',
        md: 'h-9 px-4',
        lg: 'h-10 px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'soft',
      size: 'md',
    },
  },
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** An icon after the label, tucked in with -ml-1. `solid` defaults to ArrowUpRight; pass null to drop it. */
    iconRight?: React.ReactNode
  }

function Button({ className, variant, size, asChild = false, iconRight, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const icon = iconRight === undefined && variant === 'solid' && size !== 'icon' ? <ArrowUpRight /> : iconRight
  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props}>
      <Slottable>{children}</Slottable>
      {icon ? (
        <span aria-hidden="true" className="-ml-1 inline-flex">
          {icon}
        </span>
      ) : null}
    </Comp>
  )
}

export { Button, buttonVariants }
