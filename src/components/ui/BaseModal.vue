<script setup>
import BaseIcon from '../icons/BaseIcon.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="$emit('update:modelValue', false)" />
      <div class="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-lg bg-white shadow-xl dark:bg-slate-900">
        <div class="flex items-center justify-between p-6 pb-4">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h2>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
            @click="$emit('update:modelValue', false)"
          >
            <BaseIcon name="x" />
          </button>
        </div>
        <div class="overflow-y-auto px-6 pb-6">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
