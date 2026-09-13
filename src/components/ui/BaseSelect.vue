<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseIcon from '../icons/BaseIcon.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const rootRef = ref(null)

const selectedLabel = computed(
  () => props.options.find((opt) => opt.value === props.modelValue)?.label ?? '',
)

function select(value) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function handleClickOutside(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) isOpen.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="rootRef" class="relative block text-sm">
    <span v-if="label" class="mb-1 block font-medium text-slate-700 dark:text-slate-300">{{ label }}</span>
    <button
      type="button"
      class="flex w-full min-w-36 items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-slate-900 shadow-sm transition-colors duration-150 hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none dark:hover:border-slate-600"
      @click="isOpen = !isOpen"
      @keydown.escape="isOpen = false"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <BaseIcon
        name="chevron-down"
        size="sm"
        class="shrink-0 text-slate-400 transition-transform duration-150"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>
    <ul
      v-if="isOpen"
      class="absolute left-0 top-full z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-slate-900 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      <li
        v-for="opt in options"
        :key="opt.value"
        class="cursor-pointer px-3 py-2 text-sm transition-colors duration-100"
        :class="
          opt.value === modelValue
            ? 'bg-indigo-600 text-white'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        "
        @click="select(opt.value)"
      >
        {{ opt.label }}
      </li>
    </ul>
  </div>
</template>
