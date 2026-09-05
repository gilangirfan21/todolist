import { formatDate, weekRange } from './date'

export function dailyCompletions(todos, days = 14) {
  const buckets = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    buckets.push({ label: formatDate(d), count: 0, weight: 0 })
  }
  const indexByLabel = new Map(buckets.map((b, i) => [b.label, i]))
  for (const t of todos) {
    if (t.is_done && t.completed_date && indexByLabel.has(t.completed_date)) {
      const bucket = buckets[indexByLabel.get(t.completed_date)]
      bucket.count++
      bucket.weight += t.weight ?? 1
    }
  }
  return buckets
}

export function weeklyCompletions(todos, weeks = 8) {
  const buckets = []
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    const { start, end } = weekRange(d)
    buckets.push({ label: start, start, end, count: 0, weight: 0 })
  }
  for (const t of todos) {
    if (!t.is_done || !t.completed_date) continue
    const bucket = buckets.find((b) => t.completed_date >= b.start && t.completed_date <= b.end)
    if (bucket) {
      bucket.count++
      bucket.weight += t.weight ?? 1
    }
  }
  return buckets
}

export function onTimeRate(todos) {
  let onTime = 0
  let late = 0
  for (const t of todos) {
    if (!t.is_done || !t.due_date || !t.completed_date) continue
    if (t.completed_date <= t.due_date) onTime++
    else late++
  }
  return [
    { label: 'Tepat waktu', value: onTime, color: 'emerald' },
    { label: 'Telat', value: late, color: 'red' },
  ]
}

export function onTimeRateByCategory(todos, categories) {
  const groups = new Map()
  groups.set(null, { label: 'No category', onTime: 0, late: 0 })
  for (const c of categories) groups.set(c.id, { label: c.name, onTime: 0, late: 0 })

  for (const t of todos) {
    if (!t.is_done || !t.due_date || !t.completed_date) continue
    const group = groups.get(t.category_id ?? null)
    if (!group) continue
    if (t.completed_date <= t.due_date) group.onTime++
    else group.late++
  }

  return [...groups.values()]
    .map((g) => ({ label: g.label, total: g.onTime + g.late, value: g.onTime + g.late ? Math.round((g.onTime / (g.onTime + g.late)) * 100) : 0 }))
    .filter((g) => g.total > 0)
    .sort((a, b) => b.value - a.value)
}

export function categoryCompletionRates(todos, categories) {
  const groups = new Map()
  groups.set(null, { label: 'No category', done: 0, total: 0 })
  for (const c of categories) groups.set(c.id, { label: c.name, done: 0, total: 0 })

  for (const t of todos) {
    const group = groups.get(t.category_id ?? null)
    if (!group) continue
    group.total++
    if (t.is_done) group.done++
  }

  return [...groups.values()]
    .filter((g) => g.total > 0)
    .map((g) => ({ label: g.label, value: Math.round((g.done / g.total) * 100), done: g.done, total: g.total }))
    .sort((a, b) => b.value - a.value)
}
