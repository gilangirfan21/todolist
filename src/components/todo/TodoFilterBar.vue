<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseDatePicker from '../ui/BaseDatePicker.vue'
import BaseIcon from '../icons/BaseIcon.vue'

const props = defineProps({
  filters: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:filters'])

function update(key, value) {
  emit('update:filters', { ...props.filters, [key]: value })
}

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]
const priorityOptions = [
  { value: 'all', label: 'All priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]
const sortOptions = [
  { value: 'position', label: 'Manual order' },
  { value: 'due_date', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'weight', label: 'Weight' },
  { value: 'created_at', label: 'Date created' },
]
const dateRangeOptions = [
  { value: 'all', label: 'Any time' },
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This week' },
  { value: 'monthly', label: 'This month' },
  { value: 'custom', label: 'Custom range' },
]

const optionalFilters = [
  { key: 'priority', label: 'Priority' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'due', label: 'Due' },
  { key: 'completed', label: 'Completed' },
]

const openKeys = ref(['priority', 'category'])

function isOpen(key) {
  return openKeys.value.includes(key)
}

function resetFilter(key) {
  if (key === 'priority') {
    update('priority', 'all')
  } else if (key === 'category') {
    update('categoryId', 'all')
  } else if (key === 'status') {
    update('status', 'all')
  } else if (key === 'due') {
    update('dateRange', 'all')
    update('customStart', '')
    update('customEnd', '')
  } else if (key === 'completed') {
    update('completedRange', 'all')
    update('completedCustomStart', '')
    update('completedCustomEnd', '')
  }
}

function toggleFilter(key) {
  if (isOpen(key)) {
    openKeys.value = openKeys.value.filter((k) => k !== key)
    resetFilter(key)
  } else {
    openKeys.value = [...openKeys.value, key]
  }
}

const isAddMenuOpen = ref(false)
const addMenuRef = ref(null)

function handleClickOutside(e) {
  if (addMenuRef.value && !addMenuRef.value.contains(e.target)) isAddMenuOpen.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
      <BaseSelect
        v-if="isOpen('priority')"
        class="w-full sm:w-auto"
        :model-value="filters.priority"
        label="Priority"
        :options="priorityOptions"
        @update:model-value="update('priority', $event)"
      />
      <BaseSelect
        v-if="isOpen('category')"
        class="w-full sm:w-auto"
        :model-value="filters.categoryId"
        label="Category"
        :options="[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]"
        @update:model-value="update('categoryId', $event)"
      />

      <BaseSelect
        v-if="isOpen('status')"
        class="w-full sm:w-auto"
        :model-value="filters.status"
        label="Status"
        :options="statusOptions"
        @update:model-value="update('status', $event)"
      />

      <template v-if="isOpen('due')">
        <BaseSelect
          class="w-full sm:w-auto"
          :model-value="filters.dateRange"
          label="Due"
          :options="dateRangeOptions"
          @update:model-value="update('dateRange', $event)"
        />
        <template v-if="filters.dateRange === 'custom'">
          <BaseDatePicker
            class="w-full sm:w-auto"
            label="From"
            :model-value="filters.customStart"
            @update:model-value="update('customStart', $event)"
          />
          <BaseDatePicker
            class="w-full sm:w-auto"
            label="To"
            :model-value="filters.customEnd"
            @update:model-value="update('customEnd', $event)"
          />
        </template>
      </template>

      <template v-if="isOpen('completed')">
        <BaseSelect
          class="w-full sm:w-auto"
          :model-value="filters.completedRange"
          label="Completed"
          :options="dateRangeOptions"
          @update:model-value="update('completedRange', $event)"
        />
        <template v-if="filters.completedRange === 'custom'">
          <BaseDatePicker
            class="w-full sm:w-auto"
            label="From"
            :model-value="filters.completedCustomStart"
            @update:model-value="update('completedCustomStart', $event)"
          />
          <BaseDatePicker
            class="w-full sm:w-auto"
            label="To"
            :model-value="filters.completedCustomEnd"
            @update:model-value="update('completedCustomEnd', $event)"
          />
        </template>
      </template>

      <BaseSelect
        class="w-full sm:w-auto"
        :model-value="filters.sortBy"
        label="Sort by"
        :options="sortOptions"
        @update:model-value="update('sortBy', $event)"
      />

      <div ref="addMenuRef" class="relative shrink-0">
        <button
          type="button"
          class="flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 transition-colors duration-150 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          @click="isAddMenuOpen = !isAddMenuOpen"
        >
          <span class="text-base leading-none">+</span> Filter
        </button>
        <ul
          v-if="isAddMenuOpen"
          class="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <li
            v-for="f in optionalFilters"
            :key="f.key"
            class="flex cursor-pointer items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            @click="toggleFilter(f.key)"
          >
            <span
              class="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
              :class="
                isOpen(f.key)
                  ? 'border-indigo-600 bg-indigo-600'
                  : 'border-slate-300 dark:border-slate-600'
              "
            >
              <BaseIcon v-if="isOpen(f.key)" name="check" size="sm" class="h-3 w-3 text-white" />
            </span>
            {{ f.label }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
