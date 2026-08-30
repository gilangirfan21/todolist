<script setup>
import { ref } from 'vue'
import { useCategoryStore } from '../../stores/categories'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseIcon from '../icons/BaseIcon.vue'

const emit = defineEmits(['changed'])
const categoryStore = useCategoryStore()

const newName = ref('')
const editingId = ref(null)
const editingName = ref('')

async function addCategory() {
  const name = newName.value.trim()
  if (!name) return
  await categoryStore.addCategory({ name })
  newName.value = ''
}

function startEdit(category) {
  editingId.value = category.id
  editingName.value = category.name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

async function saveEdit(category) {
  const name = editingName.value.trim()
  if (!name || name === category.name) {
    cancelEdit()
    return
  }
  await categoryStore.editCategory(category.id, { name })
  cancelEdit()
  emit('changed')
}

async function handleDelete(category) {
  if (confirm(`Delete category "${category.name}"? Todos using it will keep their other fields but lose this category.`)) {
    await categoryStore.removeCategory(category.id)
    emit('changed')
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <BaseInput v-model="newName" placeholder="New category name" @keyup.enter="addCategory" />
      <BaseButton variant="secondary" @click="addCategory">Add</BaseButton>
    </div>

    <p v-if="!categoryStore.categories.length" class="text-sm text-slate-500 dark:text-slate-400">
      No categories yet.
    </p>
    <ul v-else class="space-y-2">
      <li
        v-for="category in categoryStore.categories"
        :key="category.id"
        class="flex items-center gap-2 rounded-md border border-slate-200 p-2 dark:border-slate-800"
      >
        <template v-if="editingId === category.id">
          <BaseInput v-model="editingName" class="flex-1" @keyup.enter="saveEdit(category)" @keyup.esc="cancelEdit" />
          <BaseButton variant="secondary" @click="saveEdit(category)">Save</BaseButton>
          <BaseButton variant="ghost" @click="cancelEdit">Cancel</BaseButton>
        </template>
        <template v-else>
          <span class="flex-1 text-sm text-slate-900 dark:text-slate-100">{{ category.name }}</span>
          <div class="flex gap-3">
            <button
              type="button"
              class="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              aria-label="Rename"
              @click="startEdit(category)"
            >
              <BaseIcon name="pencil" size="lg" />
            </button>
            <button
              type="button"
              class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              aria-label="Delete"
              @click="handleDelete(category)"
            >
              <BaseIcon name="x-circle" size="lg" />
            </button>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>
