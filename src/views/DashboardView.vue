<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTodoStore } from '../stores/todos'
import { useCategoryStore } from '../stores/categories'
import AppHeader from '../components/layout/AppHeader.vue'
import TodoFilterBar from '../components/todo/TodoFilterBar.vue'
import TodoList from '../components/todo/TodoList.vue'
import TodoForm from '../components/todo/TodoForm.vue'
import CategoryManager from '../components/todo/CategoryManager.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import { todayStr, weekRange, monthRange } from '../lib/date'
import { todosToCsv, downloadCsv } from '../lib/csv'

const todoStore = useTodoStore()
const categoryStore = useCategoryStore()

onMounted(() => {
  todoStore.fetchTodos()
  categoryStore.fetchCategories()
})

const filters = ref({
  status: 'all',
  priority: 'all',
  categoryId: 'all',
  sortBy: 'position',
  dateRange: 'all',
  customStart: '',
  customEnd: '',
})

const priorityRank = { high: 0, medium: 1, low: 2 }

const dateRangeBounds = computed(() => {
  const dr = filters.value.dateRange
  if (dr === 'daily') {
    const t = todayStr()
    return { start: t, end: t }
  }
  if (dr === 'weekly') return weekRange()
  if (dr === 'monthly') return monthRange()
  if (dr === 'custom') {
    if (!filters.value.customStart || !filters.value.customEnd) return null
    return { start: filters.value.customStart, end: filters.value.customEnd }
  }
  return null
})

const filteredTodos = computed(() => {
  const range = dateRangeBounds.value
  let result = todoStore.todos.filter((t) => {
    if (filters.value.status === 'active' && t.is_done) return false
    if (filters.value.status === 'done' && !t.is_done) return false
    if (filters.value.priority !== 'all' && t.priority !== filters.value.priority) return false
    if (filters.value.categoryId !== 'all' && t.category_id !== filters.value.categoryId) return false
    if (range) {
      if (!t.due_date || t.due_date < range.start || t.due_date > range.end) return false
    }
    return true
  })

  const sortBy = filters.value.sortBy
  if (sortBy === 'due_date') {
    result = [...result].sort((a, b) => ((a.due_date ?? '9999') > (b.due_date ?? '9999') ? 1 : -1))
  } else if (sortBy === 'priority') {
    result = [...result].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
  } else if (sortBy === 'created_at') {
    result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } else {
    result = [...result].sort((a, b) => a.position - b.position)
  }
  return result
})

const isReorderable = computed(() => filters.value.sortBy === 'position' && filters.value.status === 'all')
const showSplit = computed(() => filters.value.status === 'all')
const activeTodos = computed(() => filteredTodos.value.filter((t) => !t.is_done))
const doneTodos = computed(() => filteredTodos.value.filter((t) => t.is_done))

const isModalOpen = ref(false)
const editingTodo = ref(null)

function openCreateModal() {
  editingTodo.value = null
  isModalOpen.value = true
}

function openEditModal(todo) {
  editingTodo.value = todo
  isModalOpen.value = true
}

async function handleSubmit(payload) {
  if (editingTodo.value) {
    await todoStore.editTodo(editingTodo.value.id, payload)
  } else {
    await todoStore.addTodo(payload)
  }
  isModalOpen.value = false
}

const deleteTarget = ref(null)
const isDeleteModalOpen = ref(false)

function handleDelete(todo) {
  deleteTarget.value = todo
  isDeleteModalOpen.value = true
}

async function confirmDelete() {
  if (deleteTarget.value) {
    await todoStore.removeTodo(deleteTarget.value.id)
    deleteTarget.value = null
  }
}

const deleteMessage = computed(() =>
  deleteTarget.value ? `Delete "${deleteTarget.value.title}"? This can't be undone.` : '',
)

const isCategoryModalOpen = ref(false)

function exportCsv() {
  const csv = todosToCsv(filteredTodos.value)
  downloadCsv(`todos-${todayStr()}.csv`, csv)
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950">
    <div class="mx-auto max-w-2xl">
      <AppHeader />
      <main class="space-y-4 p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <TodoFilterBar v-model:filters="filters" :categories="categoryStore.categories" />
          <div class="flex flex-wrap gap-2">
            <BaseButton variant="secondary" @click="isCategoryModalOpen = true">Manage categories</BaseButton>
            <BaseButton variant="secondary" @click="exportCsv">Export CSV</BaseButton>
            <BaseButton @click="openCreateModal">+ New</BaseButton>
          </div>
        </div>

        <p v-if="todoStore.loading" class="text-sm text-slate-500 dark:text-slate-400">Loading todos…</p>
        <p v-else-if="todoStore.error" class="text-sm text-red-600 dark:text-red-400">{{ todoStore.error }}</p>
        <template v-else-if="showSplit">
          <TodoList
            :todos="activeTodos"
            :reorderable="isReorderable"
            @toggle="todoStore.toggleDone"
            @edit="openEditModal"
            @delete="handleDelete"
            @reorder="todoStore.reorder"
          />
          <div v-if="doneTodos.length" class="flex items-center gap-3 pt-2">
            <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Done ({{ doneTodos.length }})
            </span>
            <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
          <TodoList
            v-if="doneTodos.length"
            :todos="doneTodos"
            :reorderable="false"
            @toggle="todoStore.toggleDone"
            @edit="openEditModal"
            @delete="handleDelete"
          />
        </template>
        <TodoList
          v-else
          :todos="filteredTodos"
          :reorderable="isReorderable"
          @toggle="todoStore.toggleDone"
          @edit="openEditModal"
          @delete="handleDelete"
          @reorder="todoStore.reorder"
        />
      </main>

      <BaseModal v-model="isModalOpen" :title="editingTodo ? 'Edit todo' : 'New todo'">
        <TodoForm :todo="editingTodo" :categories="categoryStore.categories" @submit="handleSubmit" @cancel="isModalOpen = false" />
      </BaseModal>

      <BaseModal v-model="isCategoryModalOpen" title="Manage categories">
        <CategoryManager @changed="todoStore.fetchTodos" />
      </BaseModal>

      <ConfirmDialog
        v-model="isDeleteModalOpen"
        title="Delete todo"
        :message="deleteMessage"
        confirm-label="Delete"
        @confirm="confirmDelete"
      />
    </div>
  </div>
</template>
