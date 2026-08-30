<script setup>
import { useDarkMode } from '../../composables/useDarkMode'
import BaseIcon from '../icons/BaseIcon.vue'

const { isDark, toggle } = useDarkMode()
</script>

<template>
  <button
    type="button"
    class="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <BaseIcon :name="isDark ? 'sun' : 'moon'" />
  </button>
</template>
