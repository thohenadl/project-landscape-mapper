<template>
  <div class="swimlane-bg" :style="{ width: `${w}px`, height: `${h}px` }">
    <!-- Phase columns (vertical tint + separators), widths scale with their months -->
    <div
      v-for="(p, j) in store.phases"
      :key="p.id"
      class="phase-col"
      :class="{ alt: j % 2 === 1 }"
      :style="{ left: `${phaseLeftX(store.phases, j)}px`, top: '0px', width: `${phaseWidthPx(p)}px`, height: `${h}px` }"
    />

    <!-- Swimlane rows (horizontal separators + left-gutter labels) -->
    <div
      v-for="(s, i) in store.streams"
      :key="s.id"
      class="lane"
      :style="{ left: '0px', top: `${laneTopY(i)}px`, width: `${w}px`, height: `${LANE_HEIGHT}px` }"
    >
      <div class="lane-label" :style="{ width: `${GUTTER_W}px` }">{{ s.name }}</div>
    </div>

    <!-- Top band: phase headers (top) + month ruler (bottom) -->
    <div
      class="top-band"
      :style="{ left: `${GUTTER_W}px`, top: '0px', width: `${w - GUTTER_W}px`, height: `${TOP_BAND_H}px` }"
    >
      <div
        v-for="(p, j) in store.phases"
        :key="p.id"
        class="phase-label"
        :style="{
          left: `${phaseLeftX(store.phases, j) - GUTTER_W}px`,
          width: `${phaseWidthPx(p)}px`,
          height: `${PHASE_LABEL_H}px`,
        }"
      >
        {{ p.name }}
      </div>

      <!-- Month ruler: one tick per calendar month, aligned to the column scale -->
      <div
        v-for="m in months"
        :key="m.index"
        class="month-tick"
        :style="{ left: `${m.index * PX_PER_MONTH}px`, top: `${PHASE_LABEL_H}px`, width: `${PX_PER_MONTH}px`, height: `${RULER_H}px` }"
      >
        {{ m.label }}
      </div>
    </div>

    <!-- Gutter corner -->
    <div class="corner" :style="{ width: `${GUTTER_W}px`, height: `${TOP_BAND_H}px` }">Meilensteine</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLandscapeStore } from '@/stores/landscape'
import {
  GUTTER_W,
  LANE_HEIGHT,
  PX_PER_MONTH,
  TOP_BAND_H,
  laneTopY,
  phaseLeftX,
  phaseWidthPx,
  totalHeight,
  totalMonths,
  totalWidth,
} from '@/composables/useLayout'
import { monthList } from '@/composables/useTimeline'

// Top band splits into a phase-name row and the month ruler beneath it.
const PHASE_LABEL_H = 52
const RULER_H = TOP_BAND_H - PHASE_LABEL_H

const store = useLandscapeStore()
const w = computed(() => totalWidth(store.phases))
const h = computed(() => totalHeight(store.streams.length))
const months = computed(() => monthList(store.project.startDate, totalMonths(store.phases)))
</script>

<style scoped>
/* Non-interactive so canvas double-click / node clicks pass through. */
.swimlane-bg {
  position: relative;
  pointer-events: none;
  background: var(--surface);
}
.phase-col {
  position: absolute;
  border-right: 1px solid var(--border);
  background: #ffffff;
}
.phase-col.alt {
  background: #f7faf9;
}
.lane {
  position: absolute;
  border-top: 1px solid var(--border);
}
.lane-label {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 14px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 700;
  color: #2c3d37;
  border-right: 1px solid var(--border);
  background: #f1f6f4;
  line-height: 1.2;
}
.top-band {
  position: absolute;
  background: var(--pine-tint);
  border-bottom: 2px solid var(--pine-tint-2);
}
.phase-label {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: var(--pine-dark);
  text-transform: uppercase;
}
.month-tick {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-right: 1px solid var(--pine-tint-2);
  border-top: 1px solid var(--pine-tint-2);
  font-size: 11px;
  font-weight: 600;
  color: var(--pine-dark);
  white-space: nowrap;
  overflow: hidden;
}
.corner {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  padding: 0 14px;
  box-sizing: border-box;
  font-size: 12px;
  font-weight: 700;
  color: var(--pine-dark);
  background: var(--pine-tint-2);
  border-right: 1px solid var(--border);
  border-bottom: 2px solid var(--pine-tint-2);
}
</style>
