import { ref, watchEffect } from 'vue'

const isDark = ref(
  localStorage.getItem('theme')
    ? localStorage.getItem('theme') === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches,
)

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
  }
  return { isDark, toggle }
}
