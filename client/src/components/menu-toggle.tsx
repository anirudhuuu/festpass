'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * chaicode.com's menu button (navbar/mobile-navigation.tsx): two short bars
 * and a long one that morph into an X, with a little overshoot. It is a
 * plain button. To make a Radix trigger look like it, give the trigger
 * `menuToggleClass` and put a MenuGlyph inside.
 */
/** Shared with triggers that must be the button themselves, like a Radix DropdownMenuTrigger. */
export const menuToggleClass =
  'inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

export function MenuToggle({ open, className, ...props }: React.ComponentProps<'button'> & { open: boolean }) {
  return (
    <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} className={cn(menuToggleClass, className)} {...props}>
      <MenuGlyph open={open} />
    </button>
  )
}

/** The bars alone. */
export function MenuGlyph({ open }: { open: boolean }) {
  const bar = 'origin-center transition-all duration-300 motion-reduce:transition-none'
  return (
    <svg aria-hidden="true" className="pointer-events-none size-4.5 fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect
        className={cn(bar, 'ease-[cubic-bezier(.5,.85,.25,1.1)]', open ? 'translate-x-0 translate-y-0 rotate-[315deg]' : 'translate-x-[7px] -translate-y-[5px]')}
        y="7"
        width="9"
        height="2"
        rx="1"
      />
      <rect className={cn(bar, 'ease-[cubic-bezier(.5,.85,.25,1.8)]', open ? 'rotate-45' : 'rotate-0')} y="7" width="16" height="2" rx="1" />
      <rect
        className={cn(bar, 'ease-[cubic-bezier(.5,.85,.25,1.1)]', open ? 'translate-y-0 rotate-[135deg]' : 'translate-y-[5px]')}
        y="7"
        width="9"
        height="2"
        rx="1"
      />
    </svg>
  )
}
