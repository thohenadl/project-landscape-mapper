<template>
  <div class="admin-root">
    <q-tabs
      v-model="tab"
      align="left"
      class="qo-admin-tabs"
      active-color="primary"
      indicator-color="primary"
      narrow-indicator
      dense
    >
      <q-tab name="streams" icon="view_stream" label="Streams" no-caps />
      <q-tab name="phases" icon="view_week" label="Phases" no-caps />
      <q-tab name="gates" icon="flag" label="Gates (L2)" no-caps />
      <q-tab name="roles" icon="palette" label="Roles" no-caps />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated keep-alive class="col scroll qo-admin-panels">
      <q-tab-panel name="streams"><StreamsAdmin /></q-tab-panel>
      <q-tab-panel name="phases"><PhasesAdmin /></q-tab-panel>
      <q-tab-panel name="gates"><GatesAdmin /></q-tab-panel>
      <q-tab-panel name="roles"><RolesAdmin /></q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StreamsAdmin from '@/components/admin/StreamsAdmin.vue'
import PhasesAdmin from '@/components/admin/PhasesAdmin.vue'
import GatesAdmin from '@/components/admin/GatesAdmin.vue'
import RolesAdmin from '@/components/admin/RolesAdmin.vue'

const tab = ref<'streams' | 'phases' | 'gates' | 'roles'>('streams')
</script>

<style scoped>
.admin-root {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.qo-admin-tabs {
  background: var(--surface);
  color: var(--muted);
  padding: 0 8px;
}
.qo-admin-panels {
  background: var(--bg);
}
.qo-admin-panels :deep(.q-tab-panel) {
  padding: 22px;
}
</style>
