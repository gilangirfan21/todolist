<script setup>
import { computed } from 'vue'
import draggable from 'vuedraggable'
import TodoItem from './TodoItem.vue'

const props = defineProps({
  todos: { type: Array, required: true },
  reorderable: { type: Boolean, default: false },
  getSubtasks: { type: Function, default: () => [] },
})
const emit = defineEmits([
  'toggle',
  'edit',
  'delete',
  'reorder',
  'add-subtask',
  'toggle-subtask',
  'delete-subtask',
  'rename-subtask',
  'reorder-subtasks',
])

const localTodos = computed({
  get: () => props.todos,
  set: (val) => emit('reorder', val.map((t) => t.id)),
})
</script>

<template>
  <p v-if="!todos.length" class="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
    No todos here yet.
  </p>
  <draggable
    v-else
    v-model="localTodos"
    item-key="id"
    tag="ul"
    class="space-y-2"
    :disabled="!reorderable"
    handle=".todo-drag-handle"
    :delay="150"
    :delay-on-touch-only="true"
    :touch-start-threshold="5"
  >
    <template #item="{ element }">
      <TodoItem
        :todo="element"
        :subtasks="getSubtasks(element.id)"
        :reorderable="reorderable"
        @toggle="$emit('toggle', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @add-subtask="(...args) => $emit('add-subtask', ...args)"
        @toggle-subtask="$emit('toggle-subtask', $event)"
        @delete-subtask="$emit('delete-subtask', $event)"
        @rename-subtask="(...args) => $emit('rename-subtask', ...args)"
        @reorder-subtasks="(...args) => $emit('reorder-subtasks', ...args)"
      />
    </template>
  </draggable>
</template>
