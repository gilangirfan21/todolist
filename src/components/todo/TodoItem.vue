<script setup>
import { computed, ref } from 'vue'
import draggable from 'vuedraggable'
import BaseCheckbox from '../ui/BaseCheckbox.vue'
import BaseInput from '../ui/BaseInput.vue'
import CategoryBadge from './CategoryBadge.vue'
import BaseIcon from '../icons/BaseIcon.vue'

const props = defineProps({
  todo: { type: Object, required: true },
  subtasks: { type: Array, default: () => [] },
  reorderable: { type: Boolean, default: false },
})
const emit = defineEmits([
  'toggle',
  'edit',
  'delete',
  'add-subtask',
  'toggle-subtask',
  'delete-subtask',
  'rename-subtask',
  'reorder-subtasks',
])

const localSubtasks = computed({
  get: () => props.subtasks,
  set: (val) => emit('reorder-subtasks', props.todo.id, val.map((s) => s.id)),
})

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

const doneCount = computed(() => props.subtasks.filter((s) => s.is_done).length)

const completionTiming = computed(() => {
  const t = props.todo
  if (!t.is_done || !t.due_date || !t.completed_date) return null
  if (t.completed_date <= t.due_date) return { onTime: true }
  const daysLate = Math.round((new Date(t.completed_date) - new Date(t.due_date)) / 86400000)
  return { onTime: false, daysLate }
})

const isExpanded = ref(false)
const newSubtaskTitle = ref('')

function submitNewSubtask() {
  const title = newSubtaskTitle.value.trim()
  if (!title) return
  emit('add-subtask', props.todo, title)
  newSubtaskTitle.value = ''
}

const editingSubtaskId = ref(null)
const editingTitle = ref('')

function startRename(subtask) {
  editingSubtaskId.value = subtask.id
  editingTitle.value = subtask.title
}

function cancelRename() {
  editingSubtaskId.value = null
}

function submitRename(subtask) {
  if (editingSubtaskId.value !== subtask.id) return
  const title = editingTitle.value.trim()
  editingSubtaskId.value = null
  if (title && title !== subtask.title) {
    emit('rename-subtask', subtask, title)
  }
}
</script>

<template>
  <li
    class="flex flex-wrap items-start gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800"
    :class="{ 'opacity-60': todo.is_done }"
  >
    <button
      v-if="reorderable"
      type="button"
      class="todo-drag-handle mt-1 cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      aria-label="Reorder todo"
    >
      <BaseIcon name="grip-vertical" size="sm" />
    </button>
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
        <span
          v-if="completionTiming"
          :class="completionTiming.onTime ? 'text-emerald-600 dark:text-emerald-400' : 'font-medium text-red-600 dark:text-red-400'"
        >
          {{ completionTiming.onTime ? 'On time' : `Late ${completionTiming.daysLate} day${completionTiming.daysLate === 1 ? '' : 's'}` }}
        </span>
        <CategoryBadge :category="todo.category" />
        <button
          type="button"
          class="flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          @click="isExpanded = !isExpanded"
        >
          <span>{{ subtasks.length ? `${doneCount}/${subtasks.length}` : 'Subtasks' }}</span>
          <BaseIcon
            name="chevron-down"
            size="sm"
            class="transition-transform"
            :class="{ 'rotate-180': isExpanded }"
          />
        </button>
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

    <div
      v-if="isExpanded"
      class="mt-2 w-full basis-full space-y-1.5 border-t border-slate-100 pt-2 dark:border-slate-800"
      :class="reorderable ? 'pl-7' : ''"
    >
      <draggable
        v-model="localSubtasks"
        item-key="id"
        tag="div"
        class="space-y-1.5"
        handle=".subtask-drag-handle"
        :delay="150"
        :delay-on-touch-only="true"
        :touch-start-threshold="5"
      >
        <template #item="{ element: subtask }">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="subtask-drag-handle cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="Reorder subtask"
            >
              <BaseIcon name="grip-vertical" size="sm" />
            </button>
            <BaseCheckbox
              :model-value="subtask.is_done"
              @update:model-value="$emit('toggle-subtask', subtask)"
            />
            <input
              v-if="editingSubtaskId === subtask.id"
              v-model="editingTitle"
              autofocus
              class="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              @keydown.enter="submitRename(subtask)"
              @keydown.escape="cancelRename"
              @blur="submitRename(subtask)"
            />
            <span
              v-else
              class="flex-1 truncate text-sm text-slate-700 dark:text-slate-300"
              :class="{ 'text-slate-400 line-through dark:text-slate-500': subtask.is_done }"
            >
              {{ subtask.title }}
            </span>
            <button
              v-if="editingSubtaskId !== subtask.id"
              type="button"
              class="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              aria-label="Rename subtask"
              @click="startRename(subtask)"
            >
              <BaseIcon name="pencil" size="sm" />
            </button>
            <button
              type="button"
              class="text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              aria-label="Delete subtask"
              @click="$emit('delete-subtask', subtask)"
            >
              <BaseIcon name="x" size="sm" />
            </button>
          </div>
        </template>
      </draggable>
      <form class="flex items-center gap-2 pt-1" @submit.prevent="submitNewSubtask">
        <BaseInput v-model="newSubtaskTitle" placeholder="Add a subtask…" class="flex-1" />
      </form>
    </div>
  </li>
</template>
