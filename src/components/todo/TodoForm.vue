<script setup>
import { computed, ref, watch } from 'vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseDatePicker from '../ui/BaseDatePicker.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseIcon from '../icons/BaseIcon.vue'
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
const weight = ref(1)
const subtaskTitles = ref([''])

watch(
  () => props.todo,
  (todo) => {
    title.value = todo?.title ?? ''
    description.value = todo?.description ?? ''
    priority.value = todo?.priority ?? 'medium'
    dueDate.value = todo ? (todo.due_date ?? '') : todayStr()
    categoryId.value = todo?.category_id ?? ''
    completedDate.value = todo?.status === 'done' ? (todo.completed_date ?? todayStr()) : ''
    weight.value = todo?.weight ?? 1
    subtaskTitles.value = ['']
  },
  { immediate: true },
)

function addSubtaskField() {
  subtaskTitles.value.push('')
}

function removeSubtaskField(idx) {
  subtaskTitles.value.splice(idx, 1)
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const isWeightValid = computed(() => {
  if (weight.value === '' || weight.value === null) return true
  const n = Number(weight.value)
  return Number.isInteger(n) && n >= 1 && n <= 10
})

function handleSubmit() {
  const payload = {
    title: title.value.trim(),
    description: description.value.trim() || null,
    priority: priority.value,
    due_date: dueDate.value || null,
    category_id: categoryId.value || null,
    weight: Math.min(10, Math.max(1, parseInt(weight.value, 10) || 1)),
  }
  if (props.todo?.status === 'done') {
    payload.completed_date = completedDate.value || null
  }
  const subtasks = subtaskTitles.value.map((t) => t.trim()).filter(Boolean)
  emit('submit', payload, subtasks)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <BaseInput v-model="title" label="Title" placeholder="What needs to be done?" required />
    <BaseInput v-model="description" label="Description" placeholder="Optional details" />
    <div class="grid grid-cols-2 gap-3">
      <BaseSelect v-model="priority" label="Priority" :options="priorityOptions" />
      <BaseDatePicker v-model="dueDate" label="Due date" />
    </div>
    <BaseInput
      v-model="weight"
      type="number"
      min="1"
      max="10"
      label="Weight (1-10, optional)"
      placeholder="1"
      :error="isWeightValid ? '' : 'Weight must be between 1 and 10'"
    />
    <BaseSelect
      v-model="categoryId"
      label="Category"
      :options="[{ value: '', label: 'None' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]"
    />
    <BaseDatePicker v-if="todo?.status === 'done'" v-model="completedDate" label="Completed date" />

    <div v-if="!todo" class="space-y-2">
      <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Subtasks <span class="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
      </span>
      <div v-for="(_, idx) in subtaskTitles" :key="idx" class="flex items-center gap-2">
        <BaseInput v-model="subtaskTitles[idx]" placeholder="Subtask title" class="flex-1" />
        <button
          v-if="subtaskTitles.length > 1"
          type="button"
          class="text-slate-400 hover:text-red-600 dark:hover:text-red-400"
          aria-label="Remove subtask"
          @click="removeSubtaskField(idx)"
        >
          <BaseIcon name="x" size="sm" />
        </button>
      </div>
      <button
        type="button"
        class="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        @click="addSubtaskField"
      >
        + Add subtask
      </button>
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <BaseButton type="button" variant="ghost" @click="$emit('cancel')">Cancel</BaseButton>
      <BaseButton type="submit" :disabled="!isWeightValid">{{ todo ? 'Save changes' : 'Add todo' }}</BaseButton>
    </div>
  </form>
</template>
