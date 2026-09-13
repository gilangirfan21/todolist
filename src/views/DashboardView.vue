<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTodoStore } from '../stores/todos'
import { useCategoryStore } from '../stores/categories'
import { useSubtaskStore } from '../stores/subtasks'
import AppHeader from '../components/layout/AppHeader.vue'
import TodoFilterBar from '../components/todo/TodoFilterBar.vue'
import TodoList from '../components/todo/TodoList.vue'
import TodoForm from '../components/todo/TodoForm.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import { useFilteredTodos } from '../composables/useFilteredTodos'

const todoStore = useTodoStore()
const categoryStore = useCategoryStore()
const subtaskStore = useSubtaskStore()

onMounted(() => {
  todoStore.fetchTodos()
  categoryStore.fetchCategories()
  subtaskStore.fetchSubtasks()
})

const filters = ref({
  status: 'all',
  priority: 'all',
  categoryId: 'all',
  sortBy: 'position',
  dateRange: 'all',
  customStart: '',
  customEnd: '',
  completedRange: 'all',
  completedCustomStart: '',
  completedCustomEnd: '',
})

const filteredTodos = useFilteredTodos(() => todoStore.todos, filters)

const isReorderable = computed(() => filters.value.sortBy === 'position' && filters.value.status === 'all')
const showSplit = computed(() => filters.value.status === 'all')
const activeTodos = computed(() => filteredTodos.value.filter((t) => t.status === 'active'))
const reviewTodos = computed(() => filteredTodos.value.filter((t) => t.status === 'review'))
const doneTodos = computed(() => filteredTodos.value.filter((t) => t.status === 'done'))

const isModalOpen = ref(false)
const editingTodo = ref(null)

function openCreateModal() {
  editingTodo.value = null
  isModalOpen.value = true
}

function openEditModal(todo) {
  editingTodo.value = todo
  isModalOpen.value = true
}

async function handleSubmit(payload, subtaskTitles = []) {
  if (editingTodo.value) {
    await todoStore.editTodo(editingTodo.value.id, payload)
  } else {
    const created = await todoStore.addTodo(payload)
    for (const title of subtaskTitles) {
      await subtaskStore.addSubtask(created.id, title)
    }
  }
  isModalOpen.value = false
}

function handleAddSubtask(todo, title) {
  subtaskStore.addSubtask(todo.id, title)
}

const deleteTarget = ref(null)
const isDeleteModalOpen = ref(false)

function handleDelete(todo) {
  deleteTarget.value = todo
  isDeleteModalOpen.value = true
}

async function confirmDelete() {
  if (deleteTarget.value) {
    await todoStore.removeTodo(deleteTarget.value.id)
    subtaskStore.removeForTodo(deleteTarget.value.id)
    deleteTarget.value = null
  }
}

const deleteMessage = computed(() =>
  deleteTarget.value ? `Delete "${deleteTarget.value.title}"? This can't be undone.` : '',
)
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950">
    <div class="mx-auto max-w-2xl">
      <AppHeader />
      <main class="space-y-4 p-4">
        <div class="flex flex-col gap-3">
          <TodoFilterBar v-model:filters="filters" :categories="categoryStore.categories" />
          <div class="flex justify-end">
            <BaseButton class="min-w-24" @click="openCreateModal">+ New</BaseButton>
          </div>
        </div>

        <p v-if="todoStore.loading" class="text-sm text-slate-500 dark:text-slate-400">Loading todos…</p>
        <p v-else-if="todoStore.error" class="text-sm text-red-600 dark:text-red-400">{{ todoStore.error }}</p>
        <template v-else-if="showSplit">
          <TodoList
            :todos="activeTodos"
            :reorderable="isReorderable"
            :get-subtasks="subtaskStore.byTodoId"
            @status-change="todoStore.setStatus"
            @edit="openEditModal"
            @delete="handleDelete"
            @reorder="todoStore.reorder"
            @add-subtask="handleAddSubtask"
            @toggle-subtask="subtaskStore.toggleSubtask"
            @delete-subtask="(subtask) => subtaskStore.removeSubtask(subtask.id)"
            @rename-subtask="subtaskStore.editSubtask"
            @reorder-subtasks="subtaskStore.reorder"
          />
          <div v-if="reviewTodos.length" class="flex items-center gap-3 pt-2">
            <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Review ({{ reviewTodos.length }})
            </span>
            <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
          <TodoList
            v-if="reviewTodos.length"
            :todos="reviewTodos"
            :reorderable="false"
            :get-subtasks="subtaskStore.byTodoId"
            @status-change="todoStore.setStatus"
            @edit="openEditModal"
            @delete="handleDelete"
            @add-subtask="handleAddSubtask"
            @toggle-subtask="subtaskStore.toggleSubtask"
            @delete-subtask="(subtask) => subtaskStore.removeSubtask(subtask.id)"
            @rename-subtask="subtaskStore.editSubtask"
            @reorder-subtasks="subtaskStore.reorder"
          />
          <div v-if="doneTodos.length" class="flex items-center gap-3 pt-2">
            <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Done ({{ doneTodos.length }})
            </span>
            <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
          <TodoList
            v-if="doneTodos.length"
            :todos="doneTodos"
            :reorderable="false"
            :get-subtasks="subtaskStore.byTodoId"
            @status-change="todoStore.setStatus"
            @edit="openEditModal"
            @delete="handleDelete"
            @add-subtask="handleAddSubtask"
            @toggle-subtask="subtaskStore.toggleSubtask"
            @delete-subtask="(subtask) => subtaskStore.removeSubtask(subtask.id)"
            @rename-subtask="subtaskStore.editSubtask"
            @reorder-subtasks="subtaskStore.reorder"
          />
        </template>
        <TodoList
          v-else
          :todos="filteredTodos"
          :reorderable="isReorderable"
          :get-subtasks="subtaskStore.byTodoId"
          @status-change="todoStore.setStatus"
          @edit="openEditModal"
          @delete="handleDelete"
          @reorder="todoStore.reorder"
          @add-subtask="handleAddSubtask"
          @toggle-subtask="subtaskStore.toggleSubtask"
          @delete-subtask="(subtask) => subtaskStore.removeSubtask(subtask.id)"
          @rename-subtask="subtaskStore.editSubtask"
          @reorder-subtasks="subtaskStore.reorder"
        />
      </main>

      <BaseModal v-model="isModalOpen" :title="editingTodo ? 'Edit todo' : 'New todo'">
        <TodoForm :todo="editingTodo" :categories="categoryStore.categories" @submit="handleSubmit" @cancel="isModalOpen = false" />
      </BaseModal>

      <ConfirmDialog
        v-model="isDeleteModalOpen"
        title="Delete todo"
        :message="deleteMessage"
        confirm-label="Delete"
        @confirm="confirmDelete"
      />
    </div>
  </div>
</template>
