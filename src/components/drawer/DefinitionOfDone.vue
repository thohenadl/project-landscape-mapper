<template>
  <div class="dod">
    <div class="row items-center justify-between q-mb-xs">
      <div class="canvas-label">Definition of Done</div>
      <q-btn flat dense round size="sm" icon="add" @click="addItem">
        <q-tooltip>Add criterion</q-tooltip>
      </q-btn>
    </div>

    <div v-if="items.length === 0" class="text-caption text-grey-6">
      No criteria yet.
    </div>

    <div
      v-for="(item, i) in items"
      :key="i"
      class="dod-row row items-center no-wrap q-mb-xs"
    >
      <q-icon name="check_circle_outline" color="positive" size="18px" class="q-mr-sm" />
      <q-input
        dense
        borderless
        hide-bottom-space
        class="col"
        :model-value="item"
        placeholder="Completion criterion…"
        @update:model-value="(v) => updateItem(i, String(v ?? ''))"
        @keydown.enter.prevent="addItem"
      />
      <q-btn flat dense round size="sm" icon="close" color="grey-6" @click="removeItem(i)">
        <q-tooltip>Remove</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLandscapeStore } from '@/stores/landscape'

const props = defineProps<{ l3Id: string }>()
const store = useLandscapeStore()

const items = computed<string[]>(() => store.l3ById.get(props.l3Id)?.definitionOfDone ?? [])

function commit(next: string[]) {
  store.updateL3(props.l3Id, { definitionOfDone: next })
}
function addItem() {
  commit([...items.value, ''])
}
function updateItem(index: number, value: string) {
  const next = [...items.value]
  next[index] = value
  commit(next)
}
function removeItem(index: number) {
  commit(items.value.filter((_, i) => i !== index))
}
</script>

<style scoped>
.dod-row {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0 4px 0 8px;
  background: #fbfdfc;
}
</style>
