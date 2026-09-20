import { ref, watchEffect } from 'vue'

const isDark = ref(localStorage.getItem('theme') !== 'light')

// Secret mode pins the app dark without touching the user's own theme choice.
export const forceDark = ref(false)

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value || forceDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
  }
  return { isDark, toggle }
}
