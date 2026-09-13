export function formatDate(d) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function todayStr() {
  return formatDate(new Date())
}

export function weekRange(date = new Date()) {
  const day = date.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(date)
  start.setDate(date.getDate() + diffToMonday)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start: formatDate(start), end: formatDate(end) }
}

export function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { start: formatDate(start), end: formatDate(end) }
}

export function resolveDateRange(range, customStart, customEnd) {
  if (range === 'daily') {
    const t = todayStr()
    return { start: t, end: t }
  }
  if (range === 'weekly') return weekRange()
  if (range === 'monthly') return monthRange()
  if (range === 'custom') {
    if (!customStart || !customEnd) return null
    return { start: customStart, end: customEnd }
  }
  return null
}
