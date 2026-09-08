<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true }, // [{ label, value }]
  orientation: { type: String, default: 'vertical' }, // 'vertical' | 'horizontal'
  type: { type: String, default: 'bar' }, // 'bar' | 'line' — only applies when orientation is 'vertical'
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

const STROKE_CLASSES = {
  indigo: 'stroke-indigo-600 dark:stroke-indigo-500',
  emerald: 'stroke-emerald-600 dark:stroke-emerald-500',
  red: 'stroke-red-600 dark:stroke-red-500',
}
function strokeClass(color) {
  return STROKE_CLASSES[color] ?? STROKE_CLASSES.indigo
}

function shortLabel(label) {
  const parts = label.split('-')
  if (parts.length !== 3) return label
  const [, month, day] = parts
  return `${day}/${month}`
}

const maxValue = computed(() => Math.max(1, ...props.data.map((d) => d.value)))
const hasData = computed(() => props.data.length > 0 && props.data.some((d) => d.value > 0))

// Vertical layout (columns growing up from a bottom baseline).
// The viewBox is sized close to a phone's content width (not a wide desktop
// width) so that on mobile the SVG renders near 1:1 scale — text and marks
// stay at their authored size instead of shrinking along with a wider viewBox
// squeezed into a narrow container. Desktop just scales this up, which reads fine.
const V_WIDTH = 340
const V_HEIGHT = 220
const V_TOP_PAD = 20
const V_BOTTOM_PAD = 30
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

const linePoints = computed(() =>
  verticalBars.value.map((bar) => `${bar.x + bar.width / 2},${bar.y}`).join(' '),
)

// Horizontal layout (bars growing right from a left baseline)
const H_ROW_HEIGHT = 36
const H_LABEL_WIDTH = 96
const H_VALUE_WIDTH = 40
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
    No data to display yet.
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
    <polyline
      v-if="type === 'line'"
      :points="linePoints"
      fill="none"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="strokeClass(data[0]?.color)"
    />
    <g v-for="bar in verticalBars" :key="bar.label">
      <title>{{ bar.label }}: {{ bar.value }}{{ valueSuffix }}</title>
      <template v-if="type === 'bar'">
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
      </template>
      <circle
        v-else
        :cx="bar.x + bar.width / 2"
        :cy="bar.y"
        r="4"
        stroke-width="2"
        :class="[fillClass(bar.color), 'stroke-white dark:stroke-slate-950']"
      />
      <text
        :x="bar.x + bar.width / 2"
        :y="bar.y - 6"
        text-anchor="middle"
        class="fill-slate-500 text-[11px] dark:fill-slate-400"
      >
        {{ bar.value }}
      </text>
      <text
        :x="bar.x + bar.width / 2"
        :y="vBaselineY + 16"
        text-anchor="middle"
        class="fill-slate-500 text-[10px] dark:fill-slate-400"
      >
        {{ shortLabel(bar.label) }}
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
        class="fill-slate-600 text-[12px] dark:fill-slate-300"
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
        class="fill-slate-500 text-[12px] dark:fill-slate-400"
      >
        {{ bar.value }}{{ valueSuffix }}
      </text>
    </g>
  </svg>
</template>
