<script setup>
import { computed } from 'vue'
import BaseCheckbox from '../ui/BaseCheckbox.vue'
import CategoryBadge from './CategoryBadge.vue'
import BaseIcon from '../icons/BaseIcon.vue'

const props = defineProps({
  todo: { type: Object, required: true },
})
defineEmits(['toggle', 'edit', 'delete'])

const priorityColor = {
  high: 'text-red-600 dark:text-red-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-slate-500 dark:text-slate-400',
}

const isOverdue = computed(
  () =>
    !props.todo.is_done &&
    props.todo.due_date &&
    new Date(props.todo.due_date) < new Date(new Date().toDateString()),
)
</script>

<template>
  <li
    class="flex items-start gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800"
    :class="{ 'opacity-60': todo.is_done }"
  >
    <BaseCheckbox class="mt-1" :model-value="todo.is_done" @update:model-value="$emit('toggle', todo)" />
    <div class="min-w-0 flex-1">
      <p
        class="truncate font-medium text-slate-900 dark:text-slate-100"
        :class="{ 'line-through': todo.is_done }"
      >
        {{ todo.title }}
      </p>
      <p v-if="todo.description" class="truncate text-sm text-slate-500 dark:text-slate-400">
        {{ todo.description }}
      </p>
      <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
        <span :class="priorityColor[todo.priority]">{{ todo.priority }}</span>
        <span
          v-if="todo.due_date"
          :class="isOverdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'"
        >
          Due {{ todo.due_date }}
        </span>
        <span v-if="todo.is_done && todo.completed_date" class="text-slate-500 dark:text-slate-400">
          Completed {{ todo.completed_date }}
        </span>
        <CategoryBadge :category="todo.category" />
      </div>
    </div>
    <div class="flex gap-3">
      <button
        type="button"
        class="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        aria-label="Edit"
        @click="$emit('edit', todo)"
      >
        <BaseIcon name="pencil" size="lg" />
      </button>
      <button
        type="button"
        class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        aria-label="Delete"
        @click="$emit('delete', todo)"
      >
        <BaseIcon name="x-circle" size="lg" />
      </button>
    </div>
  </li>
</template>
