<template>
  <div class="conn-col">
    <div class="row items-center justify-between q-mb-xs">
      <div class="canvas-label">{{ heading }}</div>
      <q-btn
        flat
        dense
        round
        size="sm"
        icon="add"
        :disable="otherOptions.length === 0"
        @click="addRow"
      >
        <q-tooltip>{{ addTooltip }}</q-tooltip>
      </q-btn>
    </div>

    <div v-if="rows.length === 0" class="text-caption text-grey-6">
      {{ emptyText }}
    </div>

    <div
      v-for="row in rows"
      :key="row.index"
      class="conn-chip row items-center no-wrap q-mb-xs"
    >
      <span class="swatch q-mr-sm" :style="{ background: roleColor(row.target?.roleId) }" />
      <q-select
        dense
        borderless
        emit-value
        map-options
        hide-bottom-space
        class="col conn-target"
        :model-value="row.targetMilestoneId"
        :options="otherOptions"
        @update:model-value="(v) => store.updateConnection(l3Id, row.index, { targetMilestoneId: v })"
      >
        <template #selected-item="scope">
          <div class="conn-label ellipsis">
            {{ scope.opt.label }}
            <q-tooltip>{{ scope.opt.label }}</q-tooltip>
          </div>
        </template>
      </q-select>
      <q-select
        dense
        borderless
        emit-value
        map-options
        hide-bottom-space
        class="conn-dep"
        :model-value="row.dependencyType"
        :options="depOptions"
        @update:model-value="(v) => store.updateConnection(l3Id, row.index, { dependencyType: v })"
      >
        <q-tooltip>Dependency type</q-tooltip>
      </q-select>
      <q-btn
        flat
        dense
        round
        size="sm"
        icon="close"
        color="grey-6"
        @click="store.removeConnection(l3Id, row.index)"
      >
        <q-tooltip>Remove</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLandscapeStore } from '@/stores/landscape'
import { DEPENDENCY_TYPES, type ConnectionDirection } from '@/types/landscape'

const props = defineProps<{ l3Id: string; direction: ConnectionDirection }>()
const store = useLandscapeStore()

const heading = computed(() => (props.direction === 'predecessor' ? 'Suppliers' : 'Customers'))
const emptyText = computed(() =>
  props.direction === 'predecessor' ? 'No suppliers yet.' : 'No customers yet.',
)
const addTooltip = computed(() =>
  props.direction === 'predecessor' ? 'Add a supplier (predecessor)' : 'Add a customer (successor)',
)

// Connections of this milestone in the given direction, keeping their original
// index in the full connections array (the store edits/removes by index).
const rows = computed(() => {
  const m = store.l3ById.get(props.l3Id)
  if (!m) return []
  return m.connections
    .map((c, index) => ({ ...c, index, target: store.l3ById.get(c.targetMilestoneId) }))
    .filter((c) => c.direction === props.direction)
})

const otherOptions = computed(() =>
  store.l3
    .filter((m) => m.id !== props.l3Id)
    .map((m) => ({ label: `${m.displayNumber} · ${m.title}`, value: m.id })),
)

const depOptions = DEPENDENCY_TYPES.map((d) => ({ label: `${d.value} — ${d.de}`, value: d.value }))

function roleColor(roleId?: string): string {
  return (roleId && store.roleById.get(roleId)?.color) || '#cfd8d4'
}

function addRow() {
  const first = otherOptions.value[0]
  if (!first) return
  store.addConnection(props.l3Id, {
    targetMilestoneId: first.value,
    direction: props.direction,
    dependencyType: 'FS',
  })
}
</script>

<style scoped>
.conn-chip {
  background: #f6faf8;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 2px 4px 2px 8px;
}
.conn-target :deep(.q-field__control),
.conn-dep :deep(.q-field__control) {
  min-height: 28px;
}
/* Let the target select shrink so its label can truncate instead of overflowing. */
.conn-target {
  min-width: 0;
}
.conn-target :deep(.q-field__native) {
  flex-wrap: nowrap;
  min-width: 0;
}
.conn-label {
  max-width: 100%;
}
.conn-dep {
  width: 64px;
  flex: 0 0 auto;
}
.swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  flex: 0 0 auto;
}
</style>
