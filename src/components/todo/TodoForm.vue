<script setup>
import { ref, watch } from 'vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseButton from '../ui/BaseButton.vue'
import { todayStr } from '../../lib/date'

const props = defineProps({
  todo: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
})
const emit = defineEmits(['submit', 'cancel'])

const title = ref('')
const description = ref('')
const priority = ref('medium')
const dueDate = ref('')
const categoryId = ref('')
const completedDate = ref('')

watch(
  () => props.todo,
  (todo) => {
    title.value = todo?.title ?? ''
    description.value = todo?.description ?? ''
    priority.value = todo?.priority ?? 'medium'
    dueDate.value = todo ? (todo.due_date ?? '') : todayStr()
    categoryId.value = todo?.category_id ?? ''
    completedDate.value = todo?.is_done ? (todo.completed_date ?? todayStr()) : ''
  },
  { immediate: true },
)

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

function handleSubmit() {
  const payload = {
    title: title.value.trim(),
    description: description.value.trim() || null,
    priority: priority.value,
    due_date: dueDate.value || null,
    category_id: categoryId.value || null,
  }
  if (props.todo?.is_done) {
    payload.completed_date = completedDate.value || null
  }
  emit('submit', payload)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <BaseInput v-model="title" label="Title" placeholder="What needs to be done?" required />
    <BaseInput v-model="description" label="Description" placeholder="Optional details" />
    <div class="grid grid-cols-2 gap-3">
      <BaseSelect v-model="priority" label="Priority" :options="priorityOptions" />
      <BaseInput v-model="dueDate" type="date" label="Due date" />
    </div>
    <BaseSelect
      v-model="categoryId"
      label="Category"
      :options="[{ value: '', label: 'None' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]"
    />
    <BaseInput v-if="todo?.is_done" v-model="completedDate" type="date" label="Completed date" />
    <div class="flex justify-end gap-2 pt-2">
      <BaseButton type="button" variant="ghost" @click="$emit('cancel')">Cancel</BaseButton>
      <BaseButton type="submit">{{ todo ? 'Save changes' : 'Add todo' }}</BaseButton>
    </div>
  </form>
</template>
