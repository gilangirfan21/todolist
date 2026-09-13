import { computed } from 'vue'
import { resolveDateRange } from '../lib/date'

const priorityRank = { high: 0, medium: 1, low: 2 }

export function useFilteredTodos(getTodos, filters) {
  const dateRangeBounds = computed(() =>
    resolveDateRange(filters.value.dateRange, filters.value.customStart, filters.value.customEnd),
  )
  const completedRangeBounds = computed(() =>
    resolveDateRange(
      filters.value.completedRange,
      filters.value.completedCustomStart,
      filters.value.completedCustomEnd,
    ),
  )

  return computed(() => {
    const range = dateRangeBounds.value
    const completedRange = completedRangeBounds.value
    let result = getTodos().filter((t) => {
      if (filters.value.status !== 'all' && t.status !== filters.value.status) return false
      if (filters.value.priority !== 'all' && t.priority !== filters.value.priority) return false
      if (filters.value.categoryId !== 'all' && t.category_id !== filters.value.categoryId) return false
      if (range) {
        if (!t.due_date || t.due_date < range.start || t.due_date > range.end) return false
      }
      if (completedRange) {
        if (!t.completed_date || t.completed_date < completedRange.start || t.completed_date > completedRange.end)
          return false
      }
      return true
    })

    const sortBy = filters.value.sortBy
    if (sortBy === 'due_date') {
      result = [...result].sort((a, b) => ((a.due_date ?? '9999') > (b.due_date ?? '9999') ? 1 : -1))
    } else if (sortBy === 'priority') {
      result = [...result].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    } else if (sortBy === 'weight') {
      result = [...result].sort((a, b) => (b.weight ?? 1) - (a.weight ?? 1))
    } else if (sortBy === 'created_at') {
      result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else {
      result = [...result].sort((a, b) => a.position - b.position)
    }
    return result
  })
}
