import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as todoService from '../services/todoService'
import { todayStr } from '../lib/date'
import { useCategoryStore } from './categories'
import { useSecretStore } from './secret'

export const useTodoStore = defineStore('todos', () => {
  const categoryStore = useCategoryStore()
  const secret = useSecretStore()

  const todos = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Single choke point for secret mode — every view reads this, never `todos`.
  const visibleTodos = computed(() => {
    // Until categories load, secret is indistinguishable from normal — show nothing.
    if (!categoryStore.loaded) return []
    const secretId = categoryStore.secretCategory?.id ?? null
    return todos.value.filter((t) => (secretId !== null && t.category_id === secretId) === secret.enabled)
  })

  async function fetchTodos() {
    loading.value = true
    error.value = null
    try {
      todos.value = await todoService.fetchTodos()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addTodo(todo) {
    const position = todos.value.length
      ? Math.max(...todos.value.map((t) => t.position)) + 1
      : 0
    const created = await todoService.createTodo({ ...todo, position })
    todos.value.push(created)
    return created
  }

  async function editTodo(id, changes) {
    const updated = await todoService.updateTodo(id, changes)
    const idx = todos.value.findIndex((t) => t.id === id)
    if (idx !== -1) todos.value[idx] = updated
  }

  async function removeTodo(id) {
    await todoService.deleteTodo(id)
    todos.value = todos.value.filter((t) => t.id !== id)
  }

  async function setStatus(todo, status) {
    const changes = { status }
    if (status === 'done') changes.completed_date = todayStr()
    else if (todo.status === 'done') changes.completed_date = null
    await editTodo(todo.id, changes)
  }

  async function reorder(orderedIds) {
    const positionById = new Map(orderedIds.map((id, index) => [id, index]))
    todos.value = todos.value.map((t) =>
      positionById.has(t.id) ? { ...t, position: positionById.get(t.id) } : t,
    )
    const items = orderedIds.map((id, index) => ({ id, position: index }))
    await todoService.reorderTodos(items)
  }

  return { todos, visibleTodos, loading, error, fetchTodos, addTodo, editTodo, removeTodo, setStatus, reorder }
})
