import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as categoryService from '../services/categoryService'
import { useSecretStore } from './secret'

export const useCategoryStore = defineStore('categories', () => {
  const secret = useSecretStore()

  const categories = ref([])
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref(null)

  const secretCategory = computed(() => categories.value.find((c) => c.is_secret) ?? null)

  // The only list components should render — never `categories` directly.
  const visibleCategories = computed(() =>
    categories.value.filter((c) => Boolean(c.is_secret) === secret.enabled),
  )

  // Without this a todo created in secret mode would save and vanish from view.
  const defaultCategoryId = computed(() =>
    secret.enabled ? (secretCategory.value?.id ?? '') : '',
  )

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      categories.value = await categoryService.fetchCategories()
      loaded.value = true
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

  // Created on demand the first time secret mode is unlocked.
  async function ensureSecretCategory() {
    if (!loaded.value) await fetchCategories()
    if (secretCategory.value) return secretCategory.value

    const taken = new Set(categories.value.map((c) => c.name.toLowerCase()))
    let name = 'Secret'
    for (let i = 2; taken.has(name.toLowerCase()); i++) name = `Secret ${i}`

    return addCategory({ name, is_secret: true })
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

  return {
    categories,
    visibleCategories,
    secretCategory,
    defaultCategoryId,
    loaded,
    loading,
    error,
    fetchCategories,
    ensureSecretCategory,
    addCategory,
    editCategory,
    removeCategory,
  }
})
