<script setup>
import BaseIcon from '../icons/BaseIcon.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  min: { type: [String, Number], default: undefined },
  max: { type: [String, Number], default: undefined },
})
const emit = defineEmits(['update:modelValue'])

function clamp(num) {
  let result = num
  if (props.min !== undefined) result = Math.max(Number(props.min), result)
  if (props.max !== undefined) result = Math.min(Number(props.max), result)
  return result
}

function handleInput(event) {
  let val = event.target.value
  if (props.type === 'number' && val !== '' && !Number.isNaN(Number(val))) {
    const clamped = clamp(Number(val))
    if (clamped !== Number(val)) {
      val = String(clamped)
      event.target.value = val
    }
  }
  emit('update:modelValue', val)
}

function step(delta) {
  const current = Number(props.modelValue) || 0
  emit('update:modelValue', String(clamp(current + delta)))
}
</script>

<template>
  <label class="block text-sm">
    <span v-if="label" class="mb-1 block font-medium text-slate-700 dark:text-slate-300">{{ label }}</span>
    <span class="relative flex">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :min="min"
        :max="max"
        inputmode="numeric"
        @input="handleInput"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        :class="type === 'number' ? 'appearance-none pr-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none' : ''"
      />
      <span v-if="type === 'number'" class="absolute inset-y-0 right-0 flex w-7 flex-col divide-y divide-slate-200 border-l border-slate-200 dark:divide-slate-700 dark:border-slate-700">
        <button
          type="button"
          tabindex="-1"
          class="flex flex-1 items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          aria-label="Increase"
          @click="step(1)"
        >
          <BaseIcon name="chevron-down" size="sm" class="rotate-180" />
        </button>
        <button
          type="button"
          tabindex="-1"
          class="flex flex-1 items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          aria-label="Decrease"
          @click="step(-1)"
        >
          <BaseIcon name="chevron-down" size="sm" />
        </button>
      </span>
    </span>
    <span v-if="error" class="mt-1 block text-xs text-red-600 dark:text-red-400">{{ error }}</span>
  </label>
</template>
