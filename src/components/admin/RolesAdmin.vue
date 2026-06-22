<template>
  <div class="admin-section">
    <div class="text-subtitle1 q-mb-xs">Roles</div>
    <div class="text-caption text-grey-7 q-mb-md">
      Each role is a name + color. A milestone is owned by exactly one role and is filled with that
      color. A role can’t be deleted while it owns milestones.
    </div>

    <q-list bordered separator class="rounded-borders">
      <q-item v-for="r in store.roles" :key="r.id">
        <q-item-section avatar style="min-width: 52px">
          <q-btn round dense :style="{ background: r.color, width: '28px', height: '28px' }">
            <q-popup-proxy>
              <q-color
                :model-value="r.color"
                no-header
                default-view="palette"
                format-model="hex"
                @update:model-value="(v) => store.updateRole(r.id, { color: v ?? r.color })"
              />
            </q-popup-proxy>
            <q-tooltip>Change color</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section>
          <q-input dense borderless :model-value="r.name" @update:model-value="(v) => store.updateRole(r.id, { name: String(v ?? '') })" />
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense round icon="delete" color="grey-7" @click="remove(r.id, r.name)" />
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="store.roles.length === 0" class="text-caption text-grey-6 q-py-md">No roles yet.</div>

    <div class="row q-gutter-sm q-mt-md items-center">
      <q-btn round dense :style="{ background: newColor, width: '32px', height: '32px' }">
        <q-popup-proxy>
          <q-color v-model="newColor" no-header default-view="palette" format-model="hex" />
        </q-popup-proxy>
        <q-tooltip>Pick color</q-tooltip>
      </q-btn>
      <q-input dense outlined v-model="newName" label="New role name" class="col" @keyup.enter="add" />
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
const newColor = ref('#1976D2')

function add() {
  const name = newName.value.trim()
  if (!name) return
  store.addRole(name, newColor.value)
  newName.value = ''
}

function remove(id: string, name: string) {
  if (!store.removeRole(id)) {
    $q.notify({
      message: `“${name}” still owns milestones. Reassign them to another role first.`,
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
