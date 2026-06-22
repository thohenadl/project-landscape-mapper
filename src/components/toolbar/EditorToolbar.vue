<template>
  <div class="editor-toolbar row items-center no-wrap">
    <q-btn
      unelevated
      rounded
      no-caps
      color="primary"
      icon="add_location_alt"
      label="Add milestone"
      class="q-mr-sm add-btn"
      :disable="!canAdd"
      @click="emit('add-milestone')"
    >
      <q-tooltip v-if="!canAdd">Add at least one stream, role and gate first (in Admin).</q-tooltip>
      <q-tooltip v-else>Add a milestone (or double-click the canvas)</q-tooltip>
    </q-btn>

    <q-btn flat rounded no-caps class="qo-btn" icon="auto_awesome" label="Load sample" @click="loadSample" />
    <q-btn flat rounded no-caps class="qo-btn" icon="delete_sweep" label="Clear" @click="clearAll" />

    <q-separator vertical inset class="q-mx-sm" />

    <q-btn flat rounded no-caps class="qo-btn" icon="upload_file" label="Import" @click="pickFile" />
    <q-btn flat rounded no-caps class="qo-btn" icon="download" label="Export" @click="exportJson" />

    <q-space />

    <div class="stat-chips row items-center no-wrap">
      <div class="stat">
        <div class="stat-ic" style="background: var(--tint-green); color: var(--ink-green)">
          <q-icon name="flag" size="18px" />
        </div>
        <div class="stat-tx">
          <div class="stat-num">{{ store.l2.length }}</div>
          <div class="stat-lb">Gates</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-ic" style="background: var(--tint-amber); color: var(--ink-amber)">
          <q-icon name="place" size="18px" />
        </div>
        <div class="stat-tx">
          <div class="stat-num">{{ store.l3.length }}</div>
          <div class="stat-lb">Milestones</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-ic" style="background: var(--tint-blue); color: var(--ink-blue)">
          <q-icon name="view_stream" size="18px" />
        </div>
        <div class="stat-tx">
          <div class="stat-num">{{ store.streams.length }}</div>
          <div class="stat-lb">Streams</div>
        </div>
      </div>
    </div>

    <input ref="fileInput" type="file" accept="application/json,.json" class="hidden-file" @change="onFile" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useLandscapeStore } from '@/stores/landscape'

const emit = defineEmits<{ (e: 'add-milestone'): void }>()

const store = useLandscapeStore()
const $q = useQuasar()

const canAdd = computed(
  () => store.streams.length > 0 && store.roles.length > 0 && store.l2.length > 0,
)

function loadSample() {
  if (!store.isEmpty) {
    $q.dialog({
      title: 'Load sample',
      message: 'This replaces the current landscape with the sample data. Continue?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      store.loadSample()
      $q.notify({ message: 'Sample landscape loaded.', color: 'positive', icon: 'check', position: 'top' })
    })
  } else {
    store.loadSample()
    $q.notify({ message: 'Sample landscape loaded.', color: 'positive', icon: 'check', position: 'top' })
  }
}

function clearAll() {
  $q.dialog({
    title: 'Clear all',
    message: 'Remove every stream, phase, role and milestone from the canvas?',
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Clear' },
  }).onOk(() => {
    store.clearAll()
    $q.notify({ message: 'Canvas cleared.', color: 'grey-8', icon: 'delete', position: 'top' })
  })
}

function exportJson() {
  const text = store.exportJson()
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const slug = store.project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'landscape'
  a.href = url
  a.download = `${slug}.landscape.json`
  a.click()
  URL.revokeObjectURL(url)
}

const fileInput = ref<HTMLInputElement | null>(null)
function pickFile() {
  fileInput.value?.click()
}
async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    store.importJson(text)
    $q.notify({ message: 'Landscape imported.', color: 'positive', icon: 'check', position: 'top' })
  } catch (err) {
    $q.notify({
      message: `Import failed: ${err instanceof Error ? err.message : 'invalid file'}`,
      color: 'negative',
      icon: 'error',
      position: 'top',
    })
  } finally {
    input.value = ''
  }
}
</script>

<style scoped>
.editor-toolbar {
  height: 60px;
  flex: 0 0 auto;
  padding: 0 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  gap: 2px;
}
.add-btn {
  padding: 0 16px;
  box-shadow: var(--shadow-sm);
}
.qo-btn {
  color: var(--text);
  padding: 0 12px;
}
.qo-btn:hover {
  color: var(--pine);
}
.stat-chips {
  gap: 10px;
}
.stat {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 14px 6px 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.stat-ic {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-num {
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
  color: var(--text);
}
.stat-lb {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
}
.hidden-file {
  display: none;
}
</style>
