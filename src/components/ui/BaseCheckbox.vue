<script setup>
import BaseIcon from '../icons/BaseIcon.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="relative inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-colors duration-150 checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-indigo-500 dark:checked:border-indigo-500 dark:checked:bg-indigo-500"
    />
    <BaseIcon
      name="check"
      size="sm"
      class="pointer-events-none relative h-3.5 w-3.5 scale-50 text-white opacity-0 transition-all duration-150 peer-checked:scale-100 peer-checked:opacity-100"
    />
  </label>
</template>
