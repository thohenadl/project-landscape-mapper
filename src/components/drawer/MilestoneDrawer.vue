<template>
  <q-dialog v-model="open">
    <q-card v-if="milestone" class="ms-dialog column no-wrap">
      <!-- Header -->
      <div class="ms-header row items-center q-px-md q-py-sm">
        <q-chip dense square class="text-weight-bold" :style="chipStyle">
          {{ milestone.displayNumber }}
        </q-chip>
        <div class="text-subtitle1 q-ml-sm ellipsis col">{{ milestone.title || 'Milestone' }}</div>
        <q-chip dense outline color="grey-7" class="text-caption q-mr-sm">
          id: {{ shortId }}
          <q-tooltip>{{ milestone.id }}</q-tooltip>
        </q-chip>
        <q-btn flat dense round icon="close" @click="close" />
      </div>

      <q-separator />

      <!-- Canvas body -->
      <q-card-section class="ms-body col scroll q-pa-md">
        <!-- Top row: name + short description + meta strip -->
        <div class="canvas-cell head-cell q-mb-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input v-model="title" outlined dense label="Title" />
            </div>
            <div class="col-12 col-md-7">
              <q-input v-model="summary" outlined dense label="Short description" />
            </div>
          </div>

          <div class="row q-col-gutter-sm items-center q-mt-sm">
            <div class="col">
              <q-select
                v-model="roleId"
                outlined
                dense
                emit-value
                map-options
                label="Owning role"
                :options="roleOptions"
              >
                <template #selected>
                  <div class="row items-center no-wrap">
                    <span class="swatch q-mr-sm" :style="{ background: selectedRoleColor }" />
                    {{ selectedRoleName }}
                  </div>
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <span class="swatch" :style="{ background: scope.opt.color }" />
                    </q-item-section>
                    <q-item-section>{{ scope.opt.label }}</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col">
              <q-select
                v-model="parentL2Id"
                outlined
                dense
                emit-value
                map-options
                label="Parent gate"
                :options="gateOptions"
              />
            </div>
            <div class="col">
              <q-select
                v-model="streamId"
                outlined
                dense
                emit-value
                map-options
                label="Stream"
                :options="streamOptions"
              />
            </div>
            <div class="col">
              <q-input v-model="date" outlined dense type="date" label="Date" clearable />
            </div>
            <div class="col-auto">
              <q-chip dense icon="view_week" color="blue-grey-2" text-color="blue-grey-9">
                {{ phaseName }}
              </q-chip>
            </div>
          </div>
        </div>

        <!-- Canvas grid: left (S/I) · process · right (O/C) -->
        <div class="bmc-grid">
          <div class="canvas-cell area-left">
            <ConnectionColumn :l3-id="milestone.id" direction="predecessor" />
            <q-separator class="q-my-sm" />
            <ElementSelect :l3-id="milestone.id" kind="input" />
          </div>

          <div class="canvas-cell area-process column no-wrap">
            <div class="canvas-label q-mb-xs">Process detail</div>
            <q-editor
              v-model="description"
              min-height="220px"
              class="col process-editor"
              :dense="$q.screen.lt.md"
              :toolbar="[
                ['bold', 'italic', 'underline', 'strike'],
                ['unordered', 'ordered'],
                [{ list: 'no-icons', options: ['h2', 'h3', 'p'] }],
                ['removeFormat'],
              ]"
            />
          </div>

          <div class="canvas-cell area-right">
            <ElementSelect :l3-id="milestone.id" kind="output" />
            <q-separator class="q-my-sm" />
            <ConnectionColumn :l3-id="milestone.id" direction="successor" />
          </div>

          <div class="canvas-cell area-dod">
            <DefinitionOfDone :l3-id="milestone.id" />
          </div>

          <div class="canvas-cell area-raci">
            <RaciGrid :l3-id="milestone.id" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Footer -->
      <div class="ms-footer row items-center q-pa-sm">
        <q-btn flat dense no-caps color="negative" icon="delete" label="Delete milestone" @click="remove" />
        <q-space />
        <q-btn flat dense no-caps color="primary" label="Close" @click="close" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import ConnectionColumn from './ConnectionColumn.vue'
import ElementSelect from './ElementSelect.vue'
import RaciGrid from './RaciGrid.vue'
import DefinitionOfDone from './DefinitionOfDone.vue'
import { useLandscapeStore } from '@/stores/landscape'

const props = defineProps<{ modelValue: string | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string | null): void }>()

const store = useLandscapeStore()
const $q = useQuasar()

const milestone = computed(() => (props.modelValue ? store.l3ById.get(props.modelValue) ?? null : null))

// Dialog visibility derives from whether a (still-existing) milestone is selected.
const open = computed<boolean>({
  get: () => !!milestone.value,
  set: (v) => {
    if (!v) emit('update:modelValue', null)
  },
})

// Auto-close if the selected milestone disappears (e.g. deleted, cleared).
watch(
  () => props.modelValue,
  (id) => {
    if (id && !store.l3ById.get(id)) emit('update:modelValue', null)
  },
)
watch(
  () => store.l3.length,
  () => {
    if (props.modelValue && !store.l3ById.get(props.modelValue)) emit('update:modelValue', null)
  },
)

function close() {
  emit('update:modelValue', null)
}

function field<K extends 'title' | 'summary' | 'description'>(key: K) {
  return computed<string>({
    get: () => milestone.value?.[key] ?? '',
    set: (v) => milestone.value && store.updateL3(milestone.value.id, { [key]: v }),
  })
}
const title = field('title')
const summary = field('summary')
const description = field('description')

const roleId = computed<string>({
  get: () => milestone.value?.roleId ?? '',
  set: (v) => milestone.value && store.updateL3(milestone.value.id, { roleId: v }),
})
const parentL2Id = computed<string>({
  get: () => milestone.value?.parentL2Id ?? '',
  set: (v) => milestone.value && store.updateL3(milestone.value.id, { parentL2Id: v }),
})
const streamId = computed<string>({
  get: () => milestone.value?.streamId ?? '',
  set: (v) => milestone.value && store.updateL3(milestone.value.id, { streamId: v }),
})
const date = computed<string | null>({
  get: () => milestone.value?.date ?? null,
  set: (v) => milestone.value && store.updateL3(milestone.value.id, { date: v || undefined }),
})

const roleOptions = computed(() =>
  store.roles.map((r) => ({ label: r.name, value: r.id, color: r.color })),
)
const gateOptions = computed(() => store.l2.map((g) => ({ label: g.title, value: g.id })))
const streamOptions = computed(() => store.streams.map((s) => ({ label: s.name, value: s.id })))

const selectedRoleColor = computed(() => store.roleById.get(roleId.value)?.color ?? '#9e9e9e')
const selectedRoleName = computed(() => store.roleById.get(roleId.value)?.name ?? '—')
const phaseName = computed(() =>
  milestone.value ? store.phaseOfL3(milestone.value.id)?.name ?? '—' : '—',
)
const shortId = computed(() => (milestone.value ? milestone.value.id.slice(0, 8) : ''))
const chipStyle = computed(() => ({
  background: selectedRoleColor.value,
  color: '#fff',
}))

function remove() {
  if (!milestone.value) return
  const id = milestone.value.id
  $q.dialog({
    title: 'Delete milestone',
    message: `Delete “${milestone.value.displayNumber} · ${milestone.value.title}”?`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(() => {
    store.removeL3(id)
    close()
  })
}
</script>

<style scoped>
.ms-dialog {
  width: 1120px;
  max-width: 95vw;
  max-height: 90vh;
  border-radius: var(--radius);
}
.ms-header {
  background: var(--pine-tint);
  border-top-left-radius: var(--radius);
  border-top-right-radius: var(--radius);
}
.ms-body {
  min-height: 0;
  background: var(--bg);
}
.ms-footer {
  background: var(--surface);
}

/* ---- Canvas tiles --------------------------------------------------------- */
.canvas-cell {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 12px 14px;
}
.canvas-label {
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--pine);
}

.bmc-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr 1.5fr 1fr;
  grid-template-areas:
    'left process right'
    'dod  dod     raci';
}
.area-left {
  grid-area: left;
}
.area-process {
  grid-area: process;
}
.area-right {
  grid-area: right;
}
.area-dod {
  grid-area: dod;
}
.area-raci {
  grid-area: raci;
}
.process-editor {
  min-height: 0;
}

/* Stack the canvas into one column on narrow screens. */
@media (max-width: 900px) {
  .bmc-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      'left'
      'process'
      'right'
      'dod'
      'raci';
  }
}

.swatch {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  vertical-align: middle;
}
</style>
