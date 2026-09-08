<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AppLogo from '../AppLogo.vue'
import DarkModeToggle from './DarkModeToggle.vue'
import BaseIcon from '../icons/BaseIcon.vue'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

async function handleSignOut() {
  menuOpen.value = false
  await auth.signOut()
  router.push({ name: 'login' })
}
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85"
  >
    <div class="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
      <RouterLink :to="{ name: 'dashboard' }" class="flex items-center gap-2.5">
        <AppLogo :size="30" />
        <span class="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">Todo List</span>
      </RouterLink>

      <div class="ml-auto flex items-center gap-1">
        <RouterLink
          :to="{ name: 'stats' }"
          class="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
          aria-label="Productivity stats"
        >
          <BaseIcon name="chart-bar" size="md" />
        </RouterLink>
        <DarkModeToggle />

        <div class="relative">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white"
            aria-label="Account menu"
            @click="menuOpen = !menuOpen"
          >
            {{ (auth.user?.email ?? '?').charAt(0).toUpperCase() }}
          </button>

          <div
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <p class="truncate border-b border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">
              {{ auth.user?.email }}
            </p>
            <a
              href="https://gilangirfan21.github.io/superapp/"
              class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              @click="menuOpen = false"
            >
              <BaseIcon name="external-link" size="sm" /> SuperApp
            </a>
            <button
              type="button"
              class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-slate-100 dark:text-red-400 dark:hover:bg-slate-800"
              @click="handleSignOut"
            >
              <BaseIcon name="logout" size="sm" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- click outside to close menu -->
  <div v-if="menuOpen" class="fixed inset-0 z-10" @click="menuOpen = false"></div>
</template>
