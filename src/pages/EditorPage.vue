<template>
  <div class="editor-root">
    <EditorToolbar @add-milestone="onAddMilestone" />

    <div class="canvas-wrap">
      <LandscapeCanvas
        @select-milestone="onSelect"
        @canvas-dblclick="onCanvasDblClick"
      />

      <div v-if="store.isEmpty" class="empty-state qo-card column items-center">
        <div class="empty-icon"><q-icon name="map" size="34px" /></div>
        <div class="text-h6 q-mt-md text-weight-bold">No landscape yet</div>
        <div class="text-body2 q-mt-xs qo-muted text-center">
          Click <strong>Load sample</strong> above, or configure streams / phases / roles in
          <strong>Admin</strong>.
        </div>
      </div>
    </div>

    <MilestoneDrawer v-model="selectedId" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import EditorToolbar from '@/components/toolbar/EditorToolbar.vue'
import LandscapeCanvas from '@/components/canvas/LandscapeCanvas.vue'
import MilestoneDrawer from '@/components/drawer/MilestoneDrawer.vue'
import { useLandscapeStore } from '@/stores/landscape'
import { laneCenterY } from '@/composables/useLayout'

const store = useLandscapeStore()
const $q = useQuasar()
const selectedId = ref<string | null>(null)

function onSelect(id: string) {
  selectedId.value = id
}

function onCanvasDblClick(pos: { x: number; y: number }) {
  const m = store.addMilestoneAt(pos)
  if (m) selectedId.value = m.id
  else notifyCannotAdd()
}

function onAddMilestone() {
  // Default placement: first lane, just left of the earliest gate.
  const firstGate = [...store.l2].sort((a, b) => a.x - b.x)[0]
  const pos = { x: (firstGate?.x ?? 320) - 90, y: laneCenterY(0) }
  const m = store.addMilestoneAt(pos)
  if (m) selectedId.value = m.id
  else notifyCannotAdd()
}

function notifyCannotAdd() {
  $q.notify({
    message: 'Add at least one stream, role and gate first (use Admin or Load sample).',
    color: 'warning',
    icon: 'info',
    position: 'top',
  })
}
</script>

<style scoped>
.editor-root {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.canvas-wrap {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  background: var(--bg);
}
.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 32px 40px;
  max-width: 380px;
}
.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--pine-tint);
  color: var(--pine);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
