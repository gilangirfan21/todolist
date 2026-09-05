<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true }, // [{ label, value }]
  orientation: { type: String, default: 'vertical' }, // 'vertical' | 'horizontal'
  valueSuffix: { type: String, default: '' },
})

const RADIUS = 4
const GAP = 2

const FILL_CLASSES = {
  indigo: 'fill-indigo-600 dark:fill-indigo-500',
  emerald: 'fill-emerald-600 dark:fill-emerald-500',
  red: 'fill-red-600 dark:fill-red-500',
}
function fillClass(color) {
  return FILL_CLASSES[color] ?? FILL_CLASSES.indigo
}

const maxValue = computed(() => Math.max(1, ...props.data.map((d) => d.value)))
const hasData = computed(() => props.data.length > 0 && props.data.some((d) => d.value > 0))

// Vertical layout (columns growing up from a bottom baseline)
const V_WIDTH = 600
const V_HEIGHT = 220
const V_TOP_PAD = 20
const V_BOTTOM_PAD = 28
const vBaselineY = V_HEIGHT - V_BOTTOM_PAD
const vPlotHeight = V_HEIGHT - V_TOP_PAD - V_BOTTOM_PAD

const verticalBars = computed(() => {
  const n = props.data.length || 1
  const bandWidth = V_WIDTH / n
  const barWidth = Math.min(24, bandWidth - GAP * 2)
  return props.data.map((d, i) => {
    const barHeight = (d.value / maxValue.value) * vPlotHeight
    const x = i * bandWidth + (bandWidth - barWidth) / 2
    const y = vBaselineY - barHeight
    return { ...d, x, y, width: barWidth, height: barHeight }
  })
})

// Horizontal layout (bars growing right from a left baseline)
const H_ROW_HEIGHT = 32
const H_LABEL_WIDTH = 110
const H_VALUE_WIDTH = 50
const hWidth = V_WIDTH

const horizontalBars = computed(() => {
  const plotWidth = hWidth - H_LABEL_WIDTH - H_VALUE_WIDTH
  return props.data.map((d, i) => {
    const barWidth = (d.value / maxValue.value) * plotWidth
    const y = i * H_ROW_HEIGHT + GAP
    return { ...d, x: H_LABEL_WIDTH, y, width: Math.max(barWidth, 2), height: H_ROW_HEIGHT - GAP * 2 }
  })
})
const hHeight = computed(() => Math.max(H_ROW_HEIGHT, props.data.length * H_ROW_HEIGHT))
</script>

<template>
  <p v-if="!hasData" class="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
    Belum ada data untuk ditampilkan.
  </p>

  <svg
    v-else-if="orientation === 'vertical'"
    :viewBox="`0 0 ${V_WIDTH} ${V_HEIGHT}`"
    class="w-full"
    role="img"
  >
    <line
      :x1="0"
      :y1="vBaselineY"
      :x2="V_WIDTH"
      :y2="vBaselineY"
      class="stroke-slate-200 dark:stroke-slate-800"
      stroke-width="1"
    />
    <g v-for="bar in verticalBars" :key="bar.label">
      <title>{{ bar.label }}: {{ bar.value }}{{ valueSuffix }}</title>
      <rect
        :x="bar.x"
        :y="bar.y"
        :width="bar.width"
        :height="Math.max(bar.height, 0.01)"
        :rx="RADIUS"
        :class="fillClass(bar.color)"
      />
      <rect
        v-if="bar.height > RADIUS"
        :x="bar.x"
        :y="vBaselineY - RADIUS"
        :width="bar.width"
        :height="RADIUS"
        :class="fillClass(bar.color)"
      />
      <text
        :x="bar.x + bar.width / 2"
        :y="bar.y - 6"
        text-anchor="middle"
        class="fill-slate-500 text-[9px] dark:fill-slate-400"
      >
        {{ bar.value }}
      </text>
      <text
        :x="bar.x + bar.width / 2"
        :y="vBaselineY + 14"
        text-anchor="middle"
        class="fill-slate-500 text-[8px] dark:fill-slate-400"
      >
        {{ bar.label.slice(5) }}
      </text>
    </g>
  </svg>

  <svg v-else :viewBox="`0 0 ${hWidth} ${hHeight}`" class="w-full" role="img">
    <line
      :x1="H_LABEL_WIDTH"
      :y1="0"
      :x2="H_LABEL_WIDTH"
      :y2="hHeight"
      class="stroke-slate-200 dark:stroke-slate-800"
      stroke-width="1"
    />
    <g v-for="bar in horizontalBars" :key="bar.label">
      <title>{{ bar.label }}: {{ bar.value }}{{ valueSuffix }}</title>
      <text
        :x="H_LABEL_WIDTH - 8"
        :y="bar.y + bar.height / 2 + 3"
        text-anchor="end"
        class="fill-slate-600 text-[10px] dark:fill-slate-300"
      >
        {{ bar.label }}
      </text>
      <rect
        :x="bar.x"
        :y="bar.y"
        :width="Math.max(bar.width, 0.01)"
        :height="bar.height"
        :rx="RADIUS"
        :class="fillClass(bar.color)"
      />
      <rect
        v-if="bar.width > RADIUS"
        :x="bar.x"
        :y="bar.y"
        :width="RADIUS"
        :height="bar.height"
        :class="fillClass(bar.color)"
      />
      <text
        :x="bar.x + bar.width + 8"
        :y="bar.y + bar.height / 2 + 3"
        class="fill-slate-500 text-[10px] dark:fill-slate-400"
      >
        {{ bar.value }}{{ valueSuffix }}
      </text>
    </g>
  </svg>
</template>
