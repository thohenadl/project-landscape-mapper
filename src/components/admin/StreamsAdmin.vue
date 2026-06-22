<template>
  <div class="admin-section">
    <div class="text-subtitle1 q-mb-xs">Streams (swimlanes)</div>
    <div class="text-caption text-grey-7 q-mb-md">
      Rows of the landscape, top to bottom. Reorder with the arrows; a stream can’t be deleted while
      milestones live in it.
    </div>

    <q-list bordered separator class="rounded-borders">
      <q-item v-for="(s, i) in store.streams" :key="s.id">
        <q-item-section avatar style="min-width: 40px">
          <div class="column items-center">
            <q-btn flat dense round size="sm" icon="keyboard_arrow_up" :disable="i === 0" @click="store.reorderStream(i, i - 1)" />
            <q-btn flat dense round size="sm" icon="keyboard_arrow_down" :disable="i === store.streams.length - 1" @click="store.reorderStream(i, i + 1)" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-input dense borderless :model-value="s.name" @update:model-value="(v) => store.renameStream(s.id, String(v ?? ''))" />
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense round icon="delete" color="grey-7" @click="remove(s.id, s.name)" />
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="store.streams.length === 0" class="text-caption text-grey-6 q-py-md">No streams yet.</div>

    <div class="row q-gutter-sm q-mt-md items-center">
      <q-input dense outlined v-model="newName" label="New stream name" class="col" @keyup.enter="add" />
      <q-btn color="primary" unelevated icon="add" label="Add" :disable="!newName.trim()" @click="add" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useLandscapeStore } from '@/stores/landscape'

const store = useLandscapeStore()
const $q = useQuasar()
const newName = ref('')

function add() {
  const name = newName.value.trim()
  if (!name) return
  store.addStream(name)
  newName.value = ''
}

function remove(id: string, name: string) {
  if (!store.removeStream(id)) {
    $q.notify({
      message: `“${name}” still has milestones. Reassign or delete them first.`,
      color: 'negative',
      icon: 'block',
      position: 'top',
    })
  }
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
