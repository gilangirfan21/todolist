<script setup>
import { onMounted } from 'vue'
import { useTodoStore } from '../stores/todos'
import { useCategoryStore } from '../stores/categories'
import AppHeader from '../components/layout/AppHeader.vue'
import CategoryManager from '../components/todo/CategoryManager.vue'

const todoStore = useTodoStore()
const categoryStore = useCategoryStore()

onMounted(() => {
  if (!categoryStore.categories.length) categoryStore.fetchCategories()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950">
    <div class="mx-auto max-w-2xl">
      <AppHeader />
      <main class="space-y-4 p-4">
        <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Manage categories</h1>
        <CategoryManager @changed="todoStore.fetchTodos" />
      </main>
    </div>
  </div>
</template>
