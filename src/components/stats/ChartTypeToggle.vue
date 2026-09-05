<script setup>
defineProps({
  modelValue: { type: String, required: true },
})
defineEmits(['update:modelValue'])

const options = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
]
</script>

<template>
  <div class="inline-flex rounded-md border border-slate-300 p-0.5 text-xs dark:border-slate-700">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="rounded px-2.5 py-1 font-medium transition-colors"
      :class="
        modelValue === opt.value
          ? 'bg-indigo-600 text-white'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
      "
      @click="$emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
