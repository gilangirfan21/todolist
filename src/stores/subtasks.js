import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as subtaskService from '../services/subtaskService'

export const useSubtaskStore = defineStore('subtasks', () => {
  const subtasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchSubtasks() {
    loading.value = true
    error.value = null
    try {
      subtasks.value = await subtaskService.fetchSubtasks()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function byTodoId(todoId) {
    return subtasks.value.filter((s) => s.todo_id === todoId).sort((a, b) => a.position - b.position)
  }

  async function addSubtask(todoId, title) {
    const siblings = byTodoId(todoId)
    const position = siblings.length ? Math.max(...siblings.map((s) => s.position)) + 1 : 0
    const created = await subtaskService.createSubtask({ todo_id: todoId, title, position })
    subtasks.value.push(created)
  }

  async function editSubtask(subtask, title) {
    const updated = await subtaskService.updateSubtask(subtask.id, { title })
    const idx = subtasks.value.findIndex((s) => s.id === subtask.id)
    if (idx !== -1) subtasks.value[idx] = updated
  }

  async function toggleSubtask(subtask) {
    const updated = await subtaskService.updateSubtask(subtask.id, { is_done: !subtask.is_done })
    const idx = subtasks.value.findIndex((s) => s.id === subtask.id)
    if (idx !== -1) subtasks.value[idx] = updated
  }

  async function removeSubtask(id) {
    await subtaskService.deleteSubtask(id)
    subtasks.value = subtasks.value.filter((s) => s.id !== id)
  }

  function removeForTodo(todoId) {
    subtasks.value = subtasks.value.filter((s) => s.todo_id !== todoId)
  }

  async function reorder(todoId, orderedIds) {
    const positionById = new Map(orderedIds.map((id, index) => [id, index]))
    subtasks.value = subtasks.value.map((s) =>
      positionById.has(s.id) ? { ...s, position: positionById.get(s.id) } : s,
    )
    const items = orderedIds.map((id, index) => ({ id, position: index }))
    await subtaskService.reorderSubtasks(items)
  }

  return {
    subtasks,
    loading,
    error,
    fetchSubtasks,
    byTodoId,
    addSubtask,
    editSubtask,
    toggleSubtask,
    removeSubtask,
    removeForTodo,
    reorder,
  }
})
