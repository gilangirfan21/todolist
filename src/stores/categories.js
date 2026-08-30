import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as categoryService from '../services/categoryService'

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      categories.value = await categoryService.fetchCategories()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addCategory(category) {
    const created = await categoryService.createCategory(category)
    categories.value.push(created)
    return created
  }

  async function editCategory(id, changes) {
    const updated = await categoryService.updateCategory(id, changes)
    const idx = categories.value.findIndex((c) => c.id === id)
    if (idx !== -1) categories.value[idx] = updated
    return updated
  }

  async function removeCategory(id) {
    await categoryService.deleteCategory(id)
    categories.value = categories.value.filter((c) => c.id !== id)
  }

  return { categories, loading, error, fetchCategories, addCategory, editCategory, removeCategory }
})
