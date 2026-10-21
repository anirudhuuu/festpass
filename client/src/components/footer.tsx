import * as React from 'react'

import { cn } from '@/lib/utils'

export type FooterLink = { label: string; href: string; external?: boolean; icon?: React.ReactNode }
export type FooterSection = { title: string; links: FooterLink[]; /** Two columns wide, with links in two columns (Social on chaicode.com). */ wide?: boolean }

/**
 * chaicode.com's footer (navigation/footer.tsx), in Montserrat. A 1px warm
 * hairline at 10% runs along the top and fades out at both ends. The logo
 * column sits on the left; up to four columns of links on the right, whose
 * heads are the one place uppercase is allowed. Links hover to the brand.
 */
export function Footer({
  logo,
  tagline = 'Home for Programmers',
  owner = 'ChaiCode',
  sections,
  className,
}: {
  logo: React.ReactNode
  tagline?: React.ReactNode
  /** For the copyright line. */
  owner?: string
  sections: FooterSection[]
  className?: string
}) {
  return (
    <footer
      className={cn(
        'relative z-10 mx-auto w-full px-6 py-2 font-montserrat sm:px-12',
        'before:absolute before:top-0 before:left-1/2 before:h-px before:w-full before:max-w-[1440px] before:-translate-x-1/2 before:opacity-10',
        'before:[mask-image:linear-gradient(90deg,transparent_0%,black_40%,black_60%,transparent_100%)]',
        'before:bg-amber-600 dark:before:bg-orange-300',
        className,
      )}
    >
      <div className="relative mx-auto flex flex-col justify-between gap-x-10 gap-y-8 pt-10 pb-[51px] sm:py-8 lg:flex-row lg:pb-9 xl:pt-9">
        <div className="flex flex-col items-start justify-between lg:w-full lg:max-w-sm">
          <div className="flex flex-1 flex-col items-start justify-between">
            <div className="relative mb-6 shrink-0">{logo}</div>
            <span className="text-sm leading-none tracking-tight whitespace-nowrap text-black dark:text-white">{tagline}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-1 gap-y-2 text-[13px] leading-none tracking-tight text-gray-500">
            <p>
              © {new Date().getFullYear()} {owner}.
            </p>
            <p>All rights reserved.</p>
          </div>
        </div>

        <div className="mt-2 grid w-full grid-cols-2 justify-between gap-8 sm:grid-cols-4 sm:gap-4">
          {sections.map((section) => (
            <nav key={section.title} aria-label={section.title} className={cn('flex flex-col', section.wide ? 'col-span-2' : 'col-span-1')}>
              <h2 className="relative mb-6 text-xs leading-none font-semibold tracking-normal text-gray-800 uppercase dark:text-white">{section.title}</h2>
              <ul className={cn('grid gap-4', section.wide ? 'grid-cols-2 gap-x-8' : 'grid-cols-1')}>
                {section.links.map((link) => (
                  <li key={link.href} className="flex w-fit">
                    <a
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="relative flex items-center gap-2 text-[15px] leading-none tracking-tight whitespace-nowrap text-gray-500 transition-colors duration-200 hover:text-brand dark:text-gray-400 dark:hover:text-brand [&_svg]:size-4 [&_svg]:opacity-70"
                    >
                      {link.icon}
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  )
}
