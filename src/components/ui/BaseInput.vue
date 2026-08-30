<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block text-sm">
    <span v-if="label" class="mb-1 block font-medium text-slate-700 dark:text-slate-300">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    />
    <span v-if="error" class="mt-1 block text-xs text-red-600 dark:text-red-400">{{ error }}</span>
  </label>
</template>
