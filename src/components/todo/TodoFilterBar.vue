<script setup>
import BaseSelect from '../ui/BaseSelect.vue'
import BaseInput from '../ui/BaseInput.vue'

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
  { value: 'created_at', label: 'Date created' },
]
const dateRangeOptions = [
  { value: 'all', label: 'Any time' },
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This week' },
  { value: 'monthly', label: 'This month' },
  { value: 'custom', label: 'Custom range' },
]
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
    <BaseSelect
      class="w-full sm:w-auto"
      :model-value="filters.status"
      label="Status"
      :options="statusOptions"
      @update:model-value="update('status', $event)"
    />
    <BaseSelect
      class="w-full sm:w-auto"
      :model-value="filters.priority"
      label="Priority"
      :options="priorityOptions"
      @update:model-value="update('priority', $event)"
    />
    <BaseSelect
      class="w-full sm:w-auto"
      :model-value="filters.categoryId"
      label="Category"
      :options="[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]"
      @update:model-value="update('categoryId', $event)"
    />
    <BaseSelect
      class="w-full sm:w-auto"
      :model-value="filters.dateRange"
      label="Due"
      :options="dateRangeOptions"
      @update:model-value="update('dateRange', $event)"
    />
    <template v-if="filters.dateRange === 'custom'">
      <BaseInput
        class="w-full sm:w-auto"
        type="date"
        label="From"
        :model-value="filters.customStart"
        @update:model-value="update('customStart', $event)"
      />
      <BaseInput
        class="w-full sm:w-auto"
        type="date"
        label="To"
        :model-value="filters.customEnd"
        @update:model-value="update('customEnd', $event)"
      />
    </template>
    <BaseSelect
      class="w-full sm:w-auto"
      :model-value="filters.sortBy"
      label="Sort by"
      :options="sortOptions"
      @update:model-value="update('sortBy', $event)"
    />
  </div>
</template>
