import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { MenuGlyph, MenuToggle, menuToggleClass } from '@/components/menu-toggle'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export type NavLink = { label: string; href: string; external?: boolean; icon?: React.ReactNode }
export type NavItem = { label: string; description?: string; href: string; icon?: React.ReactNode; active?: boolean }
export type NavGroup = { label: string; href?: string; items?: NavItem[]; columns?: 1 | 2; active?: boolean }

/**
 * The site header in both chaicode layouts. Sticky and transparent; the blur
 * arrives only once the page has scrolled (navigation/navbar/index.tsx).
 *
 * - `layout="menu"` (chaicode.com): logo on the left; the theme switcher and
 *   a menu button holding every link on the right.
 * - `layout="inline"` (Chai Prep): logo plus dropdown groups on the left,
 *   `actions` (sign in, avatar) on the right. Better for a product with many
 *   sections. Below lg the groups fold into a panel under the menu button.
 *
 * Links are plain <a> elements; swap in your router's Link if you have one.
 */
export function Navbar({
  logo,
  layout = 'menu',
  links = [],
  groups = [],
  actions,
  className,
}: {
  /** Usually <a href="/" aria-label="Home"><Logo /></a>. */
  logo: React.ReactNode
  layout?: 'menu' | 'inline'
  /** For the menu layout. */
  links?: NavLink[]
  /** For the inline layout: a group with `items` opens a menu, one with only `href` is a link. */
  groups?: NavGroup[]
  /** Right-hand side extras, such as a sign-in button. */
  actions?: React.ReactNode
  className?: string
}) {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 0)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header
      data-scrolled={scrolled || mobileOpen}
      className={cn(
        'sticky inset-x-0 top-0 z-50 bg-transparent transition-[backdrop-filter,background-color] duration-300 ease-in-out',
        'data-[scrolled=true]:bg-background/60 data-[scrolled=true]:backdrop-blur-md',
        className,
      )}
    >
      <nav aria-label="Main" className="flex w-full items-center justify-between gap-5 px-6 py-5 sm:px-12">
        <div className="flex items-center gap-6">
          {logo}
          {layout === 'inline' && (
            <div className="hidden items-center gap-0.5 lg:flex">
              {groups.map((g) =>
                g.items?.length ? (
                  <NavMenu key={g.label} group={g} />
                ) : (
                  <a key={g.label} href={g.href} className={navLink} data-active={g.active || undefined} aria-current={g.active ? 'page' : undefined}>
                    {g.label}
                  </a>
                ),
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {actions}
          <ThemeSwitcher />
          {layout === 'menu' ? (
            <MenuDropdown links={links} />
          ) : (
            <MenuToggle open={mobileOpen} onClick={() => setMobileOpen((v) => !v)} className="lg:hidden" />
          )}
        </div>
      </nav>

      <AnimatePresence>
        {layout === 'inline' && mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="border-t border-border px-6 py-4 sm:px-12 lg:hidden"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              {groups.map((g) => (
                <div key={g.label}>
                  {g.items?.length ? (
                    <>
                      <p className="mb-1.5 px-1 text-xs text-muted-foreground">{g.label}</p>
                      <ul>
                        {g.items.map((it) => (
                          <li key={it.href}>
                            <a href={it.href} className={cn(menuItem, 'items-center')} onClick={() => setMobileOpen(false)} aria-current={it.active ? 'page' : undefined}>
                              {it.icon}
                              <span className="text-sm font-medium">{it.label}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <a href={g.href} className={cn(menuItem, 'text-sm font-medium')} onClick={() => setMobileOpen(false)}>
                      {g.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

const navLink =
  'inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 outline-none hover:bg-accent/60 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-expanded:bg-accent/60 aria-expanded:text-foreground data-[active]:text-foreground'

const menuItem =
  'flex items-start gap-3 rounded-lg px-3 py-2 outline-none transition-colors duration-150 hover:bg-accent/60 hover:text-brand focus-visible:bg-accent/60 focus-visible:text-brand aria-[current=page]:bg-accent/60'

const panel = 'rounded-xl border border-gray-400/20 bg-background/80 p-2 backdrop-blur-lg dark:border-orange-50/10'

/** chaicode.com's single menu: every link behind the morphing button. */
function MenuDropdown({ links }: { links: NavLink[] }) {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger aria-label={open ? 'Close menu' : 'Open menu'} className={menuToggleClass}>
        <MenuGlyph open={open} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2 max-sm:w-[85dvw]">
        {links.map((l) => (
          // The item takes the pointer and the keyboard, then follows its
          // link, so Enter works and an external link opens only once.
          <DropdownMenuItem
            key={l.href}
            className="p-2 px-3 text-base focus:bg-transparent"
            onSelect={(e) => (e.currentTarget as HTMLElement).querySelector('a')?.click()}
          >
            <a href={l.href} tabIndex={-1} className="pointer-events-none flex items-center gap-2" {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {l.icon}
              {l.label}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * One inline group. Hover opens it, a click pins it open, Escape or a click
 * outside closes it. A click on a menu that hover already opened keeps it
 * open, or every mouse user would shut it with the click they meant to open it.
 */
function NavMenu({ group }: { group: NavGroup }) {
  const [open, setOpenState] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const openRef = React.useRef(false)
  const byHover = React.useRef(false)
  const closeTimer = React.useRef<number | undefined>(undefined)
  const menuId = React.useId()

  const setOpen = (v: boolean) => {
    openRef.current = v
    setOpenState(v)
  }
  const show = () => {
    window.clearTimeout(closeTimer.current)
    if (!openRef.current) byHover.current = true
    setOpen(true)
  }
  const hide = () => {
    if (!byHover.current) return
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }
  const toggle = () => {
    window.clearTimeout(closeTimer.current)
    if (openRef.current && byHover.current) {
      byHover.current = false
      return
    }
    byHover.current = false
    setOpen(!openRef.current)
  }

  React.useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        ref.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className="relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && hide()}
    >
      <button type="button" onClick={toggle} aria-expanded={open} aria-controls={menuId} data-active={group.active || undefined} className={navLink}>
        {group.label}
        <ChevronDown className="size-3 opacity-70" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.14 }}
            className={cn(panel, 'absolute top-full left-0 mt-2', group.columns === 2 ? 'grid w-[34rem] grid-cols-2 gap-0.5' : 'w-[19rem]')}
          >
            {group.items!.map((it) => (
              <a key={it.href} href={it.href} className={menuItem} onClick={() => setOpen(false)} aria-current={it.active ? 'page' : undefined}>
                {it.icon && <span className="mt-0.5 shrink-0 text-muted-foreground">{it.icon}</span>}
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium">{it.label}</span>
                  {it.description && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{it.description}</span>}
                </span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
