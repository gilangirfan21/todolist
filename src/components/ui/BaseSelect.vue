<script setup>
import BaseIcon from '../icons/BaseIcon.vue'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block text-sm">
    <span v-if="label" class="mb-1 block font-medium text-slate-700 dark:text-slate-300">{{ label }}</span>
    <span class="relative flex">
      <select
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        class="w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 pr-9 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <BaseIcon
        name="chevron-down"
        size="sm"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </span>
  </label>
</template>
