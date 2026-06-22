<template>
  <div class="gate-node">
    <!-- vertical guide across all lanes (non-interactive) -->
    <div class="gate-line" :style="{ height: `${h}px` }" />
    <!-- top-band diamond = drag handle -->
    <div class="gate-diamond">
      <q-tooltip anchor="bottom middle" self="top middle" :delay="200">{{ data.title }}</q-tooltip>
    </div>
    <div class="gate-caption">{{ data.title }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLandscapeStore } from '@/stores/landscape'
import { TOP_BAND_H, totalHeight } from '@/composables/useLayout'

defineProps<{ id: string; data: { id: string; title: string } }>()

const store = useLandscapeStore()
const h = computed(() => totalHeight(store.streams.length))
const diamondTop = TOP_BAND_H / 2
</script>

<style scoped>
.gate-node {
  position: relative;
  width: 0;
  height: 0;
}
.gate-line {
  position: absolute;
  left: -1px;
  top: 0;
  width: 2px;
  border-left: 2px dashed rgba(15, 92, 73, 0.45);
  pointer-events: none;
}
.gate-diamond {
  position: absolute;
  left: 0;
  top: v-bind('diamondTop + "px"');
  width: 22px;
  height: 22px;
  transform: translate(-50%, -50%) rotate(45deg);
  background: var(--pine);
  border: 2px solid var(--pine-dark);
  border-radius: 4px;
  cursor: grab;
  box-shadow: 0 2px 5px rgba(16, 40, 34, 0.3);
}
.gate-diamond:active {
  cursor: grabbing;
}
.gate-caption {
  position: absolute;
  left: 0;
  top: 2px;
  width: 150px;
  transform: translateX(-50%);
  text-align: center;
  font-size: 10px;
  line-height: 1.1;
  font-weight: 700;
  color: var(--pine-dark);
  pointer-events: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
