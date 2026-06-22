<template>
  <div class="admin-section">
    <div class="text-subtitle1 q-mb-xs">Phases (columns)</div>
    <div class="text-caption text-grey-7 q-mb-md">
      Ordered background columns, left to right. A milestone’s phase is derived from where it sits, so
      phases are purely visual — removing one just narrows the canvas.
    </div>

    <q-list bordered separator class="rounded-borders">
      <q-item v-for="(p, i) in store.phases" :key="p.id">
        <q-item-section avatar style="min-width: 40px">
          <div class="column items-center">
            <q-btn flat dense round size="sm" icon="keyboard_arrow_left" :disable="i === 0" @click="store.reorderPhase(i, i - 1)" />
            <q-btn flat dense round size="sm" icon="keyboard_arrow_right" :disable="i === store.phases.length - 1" @click="store.reorderPhase(i, i + 1)" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-input dense borderless :model-value="p.name" @update:model-value="(v) => store.renamePhase(p.id, String(v ?? ''))" />
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense round icon="delete" color="grey-7" @click="store.removePhase(p.id)" />
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="store.phases.length === 0" class="text-caption text-grey-6 q-py-md">No phases yet.</div>

    <div class="row q-gutter-sm q-mt-md items-center">
      <q-input dense outlined v-model="newName" label="New phase name" class="col" @keyup.enter="add" />
      <q-btn color="primary" unelevated icon="add" label="Add" :disable="!newName.trim()" @click="add" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLandscapeStore } from '@/stores/landscape'

const store = useLandscapeStore()
const newName = ref('')

function add() {
  const name = newName.value.trim()
  if (!name) return
  store.addPhase(name)
  newName.value = ''
}
</script>

<style scoped>
.admin-section {
  max-width: 700px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px 22px;
}
</style>
