<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const confirmSent = ref(false)

async function handleSubmit() {
  submitting.value = true
  try {
    const data = await auth.signUp(email.value, password.value)
    if (data.session) {
      router.push({ name: 'dashboard' })
    } else {
      confirmSent.value = true
    }
  } catch {
    // error surfaced via auth.error
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-slate-950">
    <form v-if="!confirmSent" class="w-full max-w-sm space-y-4" @submit.prevent="handleSubmit">
      <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Create account</h1>
      <BaseInput v-model="email" type="email" label="Email" required />
      <BaseInput v-model="password" type="password" label="Password" required />
      <p v-if="auth.error" class="text-sm text-red-600 dark:text-red-400">{{ auth.error }}</p>
      <BaseButton type="submit" :disabled="submitting" class="w-full">Register</BaseButton>
      <p class="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?
        <router-link to="/login" class="text-indigo-600 dark:text-indigo-400">Log in</router-link>
      </p>
    </form>
    <p v-else class="text-center text-slate-700 dark:text-slate-300">
      Check your email to confirm your account, then log in.
    </p>
  </div>
</template>
