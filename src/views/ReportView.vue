<script setup>
import { ref, onMounted } from 'vue'
import { useTodoStore } from '../stores/todos'
import { useCategoryStore } from '../stores/categories'
import AppHeader from '../components/layout/AppHeader.vue'
import TodoFilterBar from '../components/todo/TodoFilterBar.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { useFilteredTodos } from '../composables/useFilteredTodos'
import { todayStr } from '../lib/date'
import { todosToCsv, downloadCsv } from '../lib/csv'

const todoStore = useTodoStore()
const categoryStore = useCategoryStore()

onMounted(() => {
  if (!todoStore.todos.length) todoStore.fetchTodos()
  if (!categoryStore.categories.length) categoryStore.fetchCategories()
})

const filters = ref({
  status: 'all',
  priority: 'all',
  categoryId: 'all',
  sortBy: 'position',
  dateRange: 'all',
  customStart: '',
  customEnd: '',
  completedRange: 'all',
  completedCustomStart: '',
  completedCustomEnd: '',
})

const filteredTodos = useFilteredTodos(() => todoStore.todos, filters)

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
        <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Report</h1>
        <TodoFilterBar v-model:filters="filters" :categories="categoryStore.categories" />

        <div class="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            {{ filteredTodos.length }} todo{{ filteredTodos.length === 1 ? '' : 's' }} match this filter
          </p>
          <BaseButton @click="exportCsv">Export CSV</BaseButton>
        </div>
      </main>
    </div>
  </div>
</template>
