<script setup>
import { computed, onMounted, ref } from 'vue'
import { useTodoStore } from '../stores/todos'
import { useCategoryStore } from '../stores/categories'
import AppHeader from '../components/layout/AppHeader.vue'
import BarChart from '../components/stats/BarChart.vue'
import CollapsibleSection from '../components/stats/CollapsibleSection.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import {
  dailyCompletions,
  weeklyCompletions,
  categoryCompletionRates,
  onTimeRate,
  onTimeRateByCategory,
} from '../lib/stats'

const todoStore = useTodoStore()
const categoryStore = useCategoryStore()

onMounted(() => {
  if (!todoStore.todos.length) todoStore.fetchTodos()
  if (!categoryStore.categories.length) categoryStore.fetchCategories()
})

const categoryId = ref('all')
const metricMode = ref('count')

const categoryOptions = computed(() => [
  { value: 'all', label: 'All categories' },
  ...categoryStore.categories.map((c) => ({ value: c.id, label: c.name })),
])
const metricOptions = [
  { value: 'count', label: 'Jumlah task selesai' },
  { value: 'weight', label: 'Total bobot' },
  { value: 'both', label: 'Keduanya' },
]

const filteredTodos = computed(() =>
  categoryId.value === 'all'
    ? todoStore.todos
    : todoStore.todos.filter((t) => t.category_id === categoryId.value),
)

const daily = computed(() => dailyCompletions(filteredTodos.value))
const weekly = computed(() => weeklyCompletions(filteredTodos.value))
const byCategory = computed(() => categoryCompletionRates(todoStore.todos, categoryStore.categories))
const onTime = computed(() => onTimeRate(filteredTodos.value))
const onTimeByCategory = computed(() => onTimeRateByCategory(todoStore.todos, categoryStore.categories))

function toCountData(buckets) {
  return buckets.map((b) => ({ label: b.label, value: b.count }))
}
function toWeightData(buckets) {
  return buckets.map((b) => ({ label: b.label, value: b.weight }))
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950">
    <div class="mx-auto max-w-2xl">
      <AppHeader />
      <main class="space-y-8 p-4">
        <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Statistik produktivitas</h1>

        <div class="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <BaseSelect
            v-model="categoryId"
            label="Category"
            :options="categoryOptions"
            class="w-full sm:w-auto"
          />
          <BaseSelect
            v-model="metricMode"
            label="Metric"
            :options="metricOptions"
            class="w-full sm:w-auto"
          />
        </div>

        <CollapsibleSection title="Selesai per hari (14 hari terakhir)" :default-open="true">
          <template v-if="metricMode === 'both'">
            <div class="space-y-1">
              <p class="text-xs text-slate-500 dark:text-slate-400">Jumlah task</p>
              <BarChart :data="toCountData(daily)" />
            </div>
            <div class="space-y-1">
              <p class="text-xs text-slate-500 dark:text-slate-400">Total bobot</p>
              <BarChart :data="toWeightData(daily)" />
            </div>
          </template>
          <BarChart v-else :data="metricMode === 'weight' ? toWeightData(daily) : toCountData(daily)" />
        </CollapsibleSection>

        <CollapsibleSection title="Selesai per minggu (8 minggu terakhir)">
          <template v-if="metricMode === 'both'">
            <div class="space-y-1">
              <p class="text-xs text-slate-500 dark:text-slate-400">Jumlah task</p>
              <BarChart :data="toCountData(weekly)" />
            </div>
            <div class="space-y-1">
              <p class="text-xs text-slate-500 dark:text-slate-400">Total bobot</p>
              <BarChart :data="toWeightData(weekly)" />
            </div>
          </template>
          <BarChart v-else :data="metricMode === 'weight' ? toWeightData(weekly) : toCountData(weekly)" />
        </CollapsibleSection>

        <CollapsibleSection title="Completion rate per kategori">
          <BarChart :data="byCategory" orientation="horizontal" value-suffix="%" />
        </CollapsibleSection>

        <CollapsibleSection title="Tepat waktu vs telat">
          <BarChart :data="onTime" orientation="horizontal" />
        </CollapsibleSection>

        <CollapsibleSection title="Ketepatan waktu per kategori">
          <BarChart :data="onTimeByCategory" orientation="horizontal" value-suffix="%" />
        </CollapsibleSection>
      </main>
    </div>
  </div>
</template>
