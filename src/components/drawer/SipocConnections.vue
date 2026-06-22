<template>
  <div class="sipoc">
    <div class="row items-center justify-between q-mb-xs">
      <div class="text-subtitle2">Connections (predecessors / successors)</div>
      <q-btn
        flat
        dense
        round
        size="sm"
        icon="add"
        :disable="otherOptions.length === 0"
        @click="addRow"
      >
        <q-tooltip>Add a connection to another milestone</q-tooltip>
      </q-btn>
    </div>

    <div v-if="connections.length === 0" class="text-caption text-grey-6 q-pa-sm">
      No connections yet.
    </div>

    <q-card
      v-for="(c, i) in connections"
      :key="i"
      flat
      bordered
      class="q-pa-sm q-mb-sm conn-card"
    >
      <div class="row q-col-gutter-sm items-center">
        <div class="col">
          <q-select
            dense
            outlined
            emit-value
            map-options
            label="Direction"
            :model-value="c.direction"
            :options="directionOptions"
            @update:model-value="(v) => store.updateConnection(l3Id, i, { direction: v })"
          />
        </div>
        <div class="col-auto">
          <q-btn flat dense round size="sm" icon="delete" color="grey-7" @click="store.removeConnection(l3Id, i)">
            <q-tooltip>Remove connection</q-tooltip>
          </q-btn>
        </div>
      </div>

      <q-select
        dense
        outlined
        emit-value
        map-options
        class="q-mt-xs"
        label="Milestone"
        :model-value="c.targetMilestoneId"
        :options="otherOptions"
        @update:model-value="(v) => store.updateConnection(l3Id, i, { targetMilestoneId: v })"
      />

      <q-select
        dense
        outlined
        emit-value
        map-options
        class="q-mt-xs"
        label="Relation"
        :model-value="c.dependencyType"
        :options="depOptions"
        @update:model-value="(v) => store.updateConnection(l3Id, i, { dependencyType: v })"
      />
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLandscapeStore } from '@/stores/landscape'
import { DEPENDENCY_TYPES, CONNECTION_DIRECTIONS } from '@/types/landscape'

const props = defineProps<{ l3Id: string }>()
const store = useLandscapeStore()

const connections = computed(() => store.l3ById.get(props.l3Id)?.connections ?? [])

const otherOptions = computed(() =>
  store.l3
    .filter((m) => m.id !== props.l3Id)
    .map((m) => ({ label: `${m.displayNumber} · ${m.title}`, value: m.id })),
)

const directionOptions = CONNECTION_DIRECTIONS.map((d) => ({ label: d.label, value: d.value }))
const depOptions = DEPENDENCY_TYPES.map((d) => ({ label: `${d.value} — ${d.de}`, value: d.value }))

function addRow() {
  const first = otherOptions.value[0]
  if (!first) return
  store.addConnection(props.l3Id, {
    targetMilestoneId: first.value,
    direction: 'successor',
    dependencyType: 'FS',
  })
}
</script>

<style scoped>
.conn-card {
  background: #f6faf8;
  border-radius: 12px;
}
</style>
