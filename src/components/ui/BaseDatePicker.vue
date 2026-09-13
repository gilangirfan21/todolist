<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import BaseIcon from '../icons/BaseIcon.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

function parseDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatIso(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatDisplay(str) {
  const d = parseDate(str)
  if (!d) return ''
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function isSameDay(a, b) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const selected = computed(() => parseDate(props.modelValue))
const viewDate = ref(selected.value ?? new Date())
const today = new Date()

watch(selected, (d) => {
  if (d) viewDate.value = d
})

const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array(startOffset).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
})

const monthLabel = computed(() => viewDate.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }))

function prevMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
}
function nextMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
}

function selectDay(day) {
  if (!day) return
  emit('update:modelValue', formatIso(day))
  close()
}
function goToday() {
  viewDate.value = today
  emit('update:modelValue', formatIso(today))
  close()
}
function clearDate() {
  emit('update:modelValue', '')
  close()
}

const isOpen = ref(false)
const triggerRef = ref(null)
const popupRef = ref(null)
const popupStyle = ref({})

function computePosition() {
  const rect = triggerRef.value.getBoundingClientRect()
  const width = 256
  const height = 336
  let left = rect.left
  if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8)
  let top = rect.bottom + 4
  if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 4)
  popupStyle.value = { top: `${top}px`, left: `${left}px`, width: `${width}px` }
}

function handleClickOutside(e) {
  if (triggerRef.value?.contains(e.target)) return
  if (popupRef.value?.contains(e.target)) return
  close()
}

function open() {
  computePosition()
  isOpen.value = true
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
}

function close() {
  isOpen.value = false
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

onBeforeUnmount(close)
</script>

<template>
  <div class="relative block text-sm">
    <span v-if="label" class="mb-1 block font-medium text-slate-700 dark:text-slate-300">{{ label }}</span>
    <button
      ref="triggerRef"
      type="button"
      class="flex w-full min-w-36 items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-slate-900 shadow-sm transition-colors duration-150 hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none dark:hover:border-slate-600"
      @click="toggle"
    >
      <span class="truncate" :class="modelValue ? '' : 'text-slate-400 dark:text-slate-500'">
        {{ formatDisplay(modelValue) || 'Select date' }}
      </span>
      <BaseIcon name="calendar" size="sm" class="shrink-0 text-slate-400" />
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="popupRef"
        :style="popupStyle"
        class="fixed z-60 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        <div class="mb-2 flex items-center justify-between">
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Previous month"
            @click="prevMonth"
          >
            <BaseIcon name="chevron-down" size="sm" class="rotate-90" />
          </button>
          <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ monthLabel }}</span>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Next month"
            @click="nextMonth"
          >
            <BaseIcon name="chevron-down" size="sm" class="-rotate-90" />
          </button>
        </div>

        <div class="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 dark:text-slate-500">
          <span v-for="d in weekDays" :key="d">{{ d }}</span>
        </div>
        <div class="mt-1 grid grid-cols-7 gap-1">
          <button
            v-for="(day, i) in calendarDays"
            :key="i"
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors"
            :class="
              !day
                ? 'invisible'
                : isSameDay(day, selected)
                  ? 'bg-indigo-600 text-white'
                  : isSameDay(day, today)
                    ? 'font-semibold text-indigo-600 hover:bg-slate-100 dark:text-indigo-400 dark:hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            "
            :disabled="!day"
            @click="selectDay(day)"
          >
            {{ day?.getDate() }}
          </button>
        </div>

        <div class="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
          <button type="button" class="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400" @click="goToday">
            Today
          </button>
          <button type="button" class="text-xs font-medium text-slate-500 hover:underline dark:text-slate-400" @click="clearDate">
            Clear
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
