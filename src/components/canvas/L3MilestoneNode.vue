<template>
  <div
    class="l3-node"
    :class="{ selected }"
    :style="{ background: data.color, color: textColor }"
  >
    {{ data.displayNumber }}
    <q-tooltip anchor="top middle" self="bottom middle" :delay="150" max-width="220px">
      <div class="text-weight-bold">{{ data.displayNumber }} · {{ data.title }}</div>
    </q-tooltip>
    <div v-if="data.title" class="l3-caption">{{ data.title }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  selected?: boolean
  data: { id: string; displayNumber: string; title: string; color: string }
}>()

/** Choose black/white label for contrast against the role color. */
const textColor = computed(() => {
  const hex = props.data.color.replace('#', '')
  if (hex.length < 6) return '#fff'
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#1d1d1d' : '#ffffff'
})
</script>

<style scoped>
.l3-node {
  width: 100%;
  height: 100%;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 2px 6px rgba(16, 40, 34, 0.22);
  cursor: grab;
  user-select: none;
  transition: box-shadow 0.12s ease, transform 0.12s ease;
}
.l3-node:hover {
  box-shadow: 0 4px 12px rgba(16, 40, 34, 0.3);
  transform: translateY(-1px);
}
.l3-node:active {
  cursor: grabbing;
}
.l3-caption {
  position: absolute;
  top: calc(100% + 3px);
  left: 50%;
  transform: translateX(-50%);
  width: 96px;
  text-align: center;
  font-size: 9px;
  font-weight: 600;
  line-height: 1.15;
  color: var(--text);
  pointer-events: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.l3-node.selected {
  outline: 3px solid var(--pine);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(15, 92, 73, 0.18), 0 4px 12px rgba(16, 40, 34, 0.3);
}
</style>
