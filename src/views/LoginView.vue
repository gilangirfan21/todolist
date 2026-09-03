<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import AppLogo from '../components/AppLogo.vue'
import DarkModeToggle from '../components/layout/DarkModeToggle.vue'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const submitting = ref(false)

async function handleSubmit() {
  submitting.value = true
  try {
    await auth.signIn(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch {
    // error surfaced via auth.error
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center bg-white p-4 dark:bg-slate-950">
    <DarkModeToggle class="absolute right-4 top-4" />
    <form class="w-full max-w-sm space-y-4" @submit.prevent="handleSubmit">
      <div class="flex justify-center">
        <AppLogo :size="48" />
      </div>
      <h1 class="text-center text-xl font-semibold text-slate-900 dark:text-slate-100">Log in</h1>
      <BaseInput v-model="email" type="email" label="Email" required />
      <BaseInput v-model="password" type="password" label="Password" required />
      <p v-if="auth.error" class="text-sm text-red-600 dark:text-red-400">{{ auth.error }}</p>
      <BaseButton type="submit" :disabled="submitting" class="w-full">Log in</BaseButton>
      <p class="text-center text-sm text-slate-500 dark:text-slate-400">
        No account?
        <router-link to="/register" class="text-indigo-600 dark:text-indigo-400">Register</router-link>
      </p>
    </form>
  </div>
</template>
