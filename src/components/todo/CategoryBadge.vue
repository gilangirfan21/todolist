<script setup>
defineProps({
  category: { type: Object, default: null },
})
</script>

<template>
  <span
    v-if="category"
    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
    :style="{ backgroundColor: (category.color || '#6366f1') + '22', color: category.color || '#6366f1' }"
  >
    {{ category.name }}
  </span>
</template>
