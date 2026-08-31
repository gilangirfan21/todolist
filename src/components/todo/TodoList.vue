<script setup>
import { computed } from 'vue'
import draggable from 'vuedraggable'
import TodoItem from './TodoItem.vue'

const props = defineProps({
  todos: { type: Array, required: true },
  reorderable: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle', 'edit', 'delete', 'reorder'])

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
    :delay="150"
    :delay-on-touch-only="true"
    :touch-start-threshold="5"
  >
    <template #item="{ element }">
      <TodoItem
        :todo="element"
        @toggle="$emit('toggle', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </template>
  </draggable>
</template>
