const dateFmt = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

export const formatWhen = (iso: string) => dateFmt.format(new Date(iso))

export const categoryLabel: Record<string, string> = {
  tech: 'Tech',
  cultural: 'Cultural',
  sports: 'Sports',
  workshop: 'Workshop',
}
