<script setup>
import { ref } from 'vue'
import BaseIcon from '../icons/BaseIcon.vue'

const props = defineProps({
  title: { type: String, required: true },
  defaultOpen: { type: Boolean, default: false },
})

const isOpen = ref(props.defaultOpen)
</script>

<template>
  <section class="space-y-3">
    <button
      type="button"
      class="flex w-full items-center justify-between text-left"
      @click="isOpen = !isOpen"
    >
      <h2 class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ title }}</h2>
      <BaseIcon
        name="chevron-down"
        size="sm"
        class="shrink-0 text-slate-400 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>
    <div v-if="isOpen" class="space-y-4">
      <slot />
    </div>
  </section>
</template>
