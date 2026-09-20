import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { forceDark } from '../composables/useDarkMode'

// In memory only, never persisted: a reload always lands back in normal mode.
export const useSecretStore = defineStore('secret', () => {
  const enabled = ref(false)

  watch(enabled, (on) => {
    forceDark.value = on
  })

  function toggle() {
    enabled.value = !enabled.value
    return enabled.value
  }

  function exit() {
    enabled.value = false
  }

  return { enabled, toggle, exit }
})
