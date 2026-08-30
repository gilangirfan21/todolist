<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    :class="{
      'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600': variant === 'primary',
      'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700': variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600': variant === 'danger',
      'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800': variant === 'ghost',
    }"
  >
    <slot />
  </button>
</template>
