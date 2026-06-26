<template>
  <div class="admin-section">
    <div class="text-subtitle1 q-mb-xs">Gates (L2 synchronization milestones)</div>
    <div class="text-caption text-grey-7 q-mb-md">
      Vertical gates across all streams. Each L3 milestone rolls up to one gate and must finish at or
      before it. Drag a gate on the canvas to set its position, or fine-tune X here. A gate can’t be
      deleted while milestones still roll up to it.
    </div>

    <q-list bordered separator class="rounded-borders">
      <q-item v-for="g in gatesSorted" :key="g.id">
        <q-item-section avatar style="min-width: 36px">
          <q-icon name="flag" color="amber-8" />
        </q-item-section>
        <q-item-section>
          <q-input dense borderless :model-value="g.title" placeholder="Gate title" @update:model-value="(v) => store.updateL2(g.id, { title: String(v ?? '') })" />
        </q-item-section>
        <q-item-section side style="width: 150px">
          <q-input
            dense
            outlined
            type="date"
            label="Date"
            clearable
            :model-value="g.date ?? null"
            @update:model-value="(v) => store.updateL2(g.id, { date: (v as string) || undefined })"
          />
        </q-item-section>
        <q-item-section side style="width: 110px">
          <q-input
            dense
            outlined
            type="number"
            label="X"
            :model-value="Math.round(g.x)"
            @update:model-value="(v) => store.updateL2(g.id, { x: Number(v) || 0 })"
          />
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense round icon="delete" color="grey-7" @click="remove(g.id, g.title)" />
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="store.l2.length === 0" class="text-caption text-grey-6 q-py-md">No gates yet.</div>

    <div class="row q-gutter-sm q-mt-md items-center">
      <q-input dense outlined v-model="newTitle" label="New gate title" class="col" @keyup.enter="add" />
      <q-btn color="primary" unelevated icon="add" label="Add gate" :disable="!newTitle.trim()" @click="add" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useLandscapeStore } from '@/stores/landscape'
import { totalMonths, xFromMonth } from '@/composables/useLayout'

const store = useLandscapeStore()
const $q = useQuasar()
const newTitle = ref('')

const gatesSorted = computed(() => [...store.l2].sort((a, b) => a.x - b.x))

function add() {
  const title = newTitle.value.trim()
  if (!title) return
  // Place new gate at the end of the timeline (or shift right of the last gate).
  const lastX = store.l2.length ? Math.max(...store.l2.map((g) => g.x)) : 0
  const x = Math.max(xFromMonth(totalMonths(store.phases)), lastX + 160)
  store.addL2({ title, x })
  newTitle.value = ''
}

function remove(id: string, title: string) {
  if (!store.removeL2(id)) {
    $q.notify({
      message: `“${title}” still has milestones rolling up to it. Reassign or delete them first.`,
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
