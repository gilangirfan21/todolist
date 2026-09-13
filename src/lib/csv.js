function escapeCsvValue(value) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function todosToCsv(todos) {
  const headers = [
    'Title',
    'Description',
    'Status',
    'Priority',
    'Due date',
    'Completed date',
    'Category',
    'Created at',
  ]
  const statusLabel = { active: 'Active', review: 'Review', done: 'Done' }
  const rows = todos.map((t) => [
    t.title,
    t.description ?? '',
    statusLabel[t.status] ?? t.status,
    t.priority,
    t.due_date ?? '',
    t.completed_date ?? '',
    t.category?.name ?? '',
    t.created_at,
  ])
  return [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n')
}

export function downloadCsv(filename, csvContent) {
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
