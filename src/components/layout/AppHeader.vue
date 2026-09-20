<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useCategoryStore } from '../../stores/categories'
import { useSecretStore } from '../../stores/secret'
import AppLogo from '../AppLogo.vue'
import DarkModeToggle from './DarkModeToggle.vue'
import BaseIcon from '../icons/BaseIcon.vue'

const auth = useAuthStore()
const categoryStore = useCategoryStore()
const secret = useSecretStore()
const router = useRouter()
const menuOpen = ref(false)

async function handleSignOut() {
  menuOpen.value = false
  await auth.signOut()
  router.push({ name: 'login' })
}

// Five knocks on the logo toggle secret mode; a pause resets the count.
const KNOCKS_TO_TOGGLE = 5
const KNOCK_WINDOW_MS = 3000
let knocks = 0
let knockTimer = null

function resetKnocks() {
  clearTimeout(knockTimer)
  knockTimer = null
  knocks = 0
}

async function handleLogoKnock() {
  // Elsewhere the logo keeps its old job: go home (which also clears the count).
  if (router.currentRoute.value.name !== 'dashboard') {
    router.push({ name: 'dashboard' })
    return
  }

  knocks += 1
  clearTimeout(knockTimer)

  if (knocks < KNOCKS_TO_TOGGLE) {
    knockTimer = setTimeout(resetKnocks, KNOCK_WINDOW_MS)
    return
  }

  resetKnocks()
  if (secret.toggle()) await categoryStore.ensureSecretCategory()
}

onBeforeUnmount(resetKnocks)
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b backdrop-blur"
    :class="
      secret.enabled
        ? 'border-slate-700 bg-slate-900/95'
        : 'border-slate-200 bg-white/85 dark:border-slate-800 dark:bg-slate-950/85'
    "
  >
    <div class="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
      <button
        type="button"
        class="flex items-center gap-2.5 rounded-md"
        :aria-label="secret.enabled ? 'Leave secret mode' : 'Todo List'"
        @click="handleLogoKnock"
      >
        <AppLogo :size="30" :class="secret.enabled ? 'text-white!' : ''" />
        <span
          class="text-base font-semibold tracking-tight"
          :class="secret.enabled ? 'text-slate-100' : 'text-slate-900 dark:text-slate-100'"
          >Todo List</span
        >
      </button>

      <span
        v-if="secret.enabled"
        class="flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-amber-300"
      >
        <BaseIcon name="lock-closed" size="sm" /> Secret
      </span>

      <div class="ml-auto flex items-center gap-1">
        <RouterLink
          :to="{ name: 'stats' }"
          class="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
          aria-label="Productivity stats"
        >
          <BaseIcon name="chart-bar" size="md" />
        </RouterLink>
        <DarkModeToggle v-if="!secret.enabled" />

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
            <RouterLink
              :to="{ name: 'categories' }"
              class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              @click="menuOpen = false"
            >
              <BaseIcon name="tag" size="sm" /> Manage categories
            </RouterLink>
            <RouterLink
              :to="{ name: 'report' }"
              class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              @click="menuOpen = false"
            >
              <BaseIcon name="document-text" size="sm" /> Report
            </RouterLink>
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
