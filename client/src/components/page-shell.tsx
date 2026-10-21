import { Activity, CalendarDays, Ticket } from 'lucide-react'
import * as React from 'react'

import { Footer, type FooterSection } from '@/components/footer'
import { Navbar, type NavLink } from '@/components/navbar'
import { Backdrop } from '@/components/backdrop'
import { Logo } from '@/components/logo'
import { StudentPicker } from '@/components/student-picker'

/**
 * The frame every page sits in: the background image, the sticky navbar,
 * one max-w-6xl column with p-6 sm:p-12, and the footer.
 */
export const NAV_LINKS: NavLink[] = [
  { label: 'Events', href: '/', icon: <CalendarDays className="size-4" /> },
  { label: 'My bookings', href: '/bookings', icon: <Ticket className="size-4" /> },
  { label: 'Live check', href: '/check', icon: <Activity className="size-4" /> },
]

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'FestPass',
    links: [
      { label: 'Events', href: '/' },
      { label: 'My bookings', href: '/bookings' },
    ],
  },
  {
    title: 'Talk',
    wide: true,
    links: [{ label: 'Spec-driven development with AI', href: 'https://docs.chaicode.com/sdd/intro', external: true }],
  },
]

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Backdrop />
      <div className="sm:max-w-6xl lg:mx-auto">
        <Navbar
          logo={
            <a href="/" aria-label="Home" className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
              <Logo />
            </a>
          }
          links={NAV_LINKS}
          actions={<StudentPicker />}
        />
        <main className="flex flex-col gap-y-4 p-6 sm:p-12">{children}</main>
        <Footer logo={<Logo />} tagline="Seats for the college fest" owner="FestPass" sections={FOOTER_SECTIONS} />
      </div>
    </div>
  )
}
