<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import DarkModeToggle from './DarkModeToggle.vue'
import BaseButton from '../ui/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()

async function handleSignOut() {
  await auth.signOut()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
    <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Todo List</h1>
    <div class="flex items-center gap-2">
      <DarkModeToggle />
      <BaseButton variant="ghost" @click="handleSignOut">Sign out</BaseButton>
    </div>
  </header>
</template>
