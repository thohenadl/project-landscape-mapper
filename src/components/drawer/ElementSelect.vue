<template>
  <div class="el-select">
    <div class="canvas-label q-mb-xs">{{ kind === 'input' ? 'Inputs' : 'Outputs' }}</div>
    <q-select
      :model-value="selectedIds"
      multiple
      outlined
      dense
      use-input
      use-chips
      emit-value
      map-options
      hide-dropdown-icon
      input-debounce="0"
      new-value-mode="add-unique"
      :options="filteredOptions"
      :placeholder="selectedIds.length ? '' : placeholder"
      @update:model-value="onUpdate"
      @new-value="onNewValue"
      @filter="onFilter"
    >
      <template #selected-item="scope">
        <q-chip
          dense
          removable
          :tabindex="scope.tabindex"
          class="el-chip"
          @remove="scope.removeAtIndex(scope.index)"
        >
          <q-icon
            v-if="isUnsourced(scope.opt.value)"
            name="warning"
            color="warning"
            size="16px"
            class="q-mr-xs"
          >
            <q-tooltip>This input is not produced as an output by any milestone.</q-tooltip>
          </q-icon>
          <span class="el-chip-label ellipsis">
            {{ scope.opt.label }}
            <q-tooltip>{{ scope.opt.label }}</q-tooltip>
          </span>
        </q-chip>
      </template>

      <template #no-option>
        <q-item>
          <q-item-section class="text-caption text-grey-6">
            Type a name and press Enter to add a new element.
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLandscapeStore } from '@/stores/landscape'

const props = defineProps<{ l3Id: string; kind: 'input' | 'output' }>()
const store = useLandscapeStore()

const placeholder = computed(() =>
  props.kind === 'input' ? 'Add input element…' : 'Add output element…',
)

const selectedIds = computed<string[]>(() => {
  const m = store.l3ById.get(props.l3Id)
  if (!m) return []
  return props.kind === 'input' ? m.inputElementIds : m.outputElementIds
})

const allOptions = computed(() => store.elements.map((e) => ({ label: e.name, value: e.id })))

// q-select filtering: narrow the option list by the typed needle.
const needle = ref('')
const filteredOptions = computed(() => {
  const n = needle.value.toLowerCase()
  if (!n) return allOptions.value
  return allOptions.value.filter((o) => o.label.toLowerCase().includes(n))
})
function onFilter(val: string, update: (cb: () => void) => void) {
  update(() => {
    needle.value = val
  })
}

function commit(ids: string[]) {
  const unique = [...new Set(ids)]
  if (props.kind === 'input') store.setL3Inputs(props.l3Id, unique)
  else store.setL3Outputs(props.l3Id, unique)
}

// Existing options selected/removed → array of element ids.
function onUpdate(ids: string[]) {
  commit(ids)
}

// A typed-in value that isn't an existing option: create (or reuse) the element,
// then add its id. `done` injects the value q-select will append to the model.
function onNewValue(
  inputValue: string,
  done: (item?: unknown, mode?: 'add' | 'add-unique' | 'toggle') => void,
) {
  const el = store.addElement(inputValue)
  // We commit the new element id ourselves, then call done() with no item so
  // q-select doesn't also append the raw typed string to the model.
  if (el && !selectedIds.value.includes(el.id)) commit([...selectedIds.value, el.id])
  done()
}

// Warning only meaningful for inputs: element never appears as any milestone's output.
function isUnsourced(elementId: string): boolean {
  if (props.kind !== 'input') return false
  return (store.elementUsage.get(elementId)?.asOutput.length ?? 0) === 0
}
</script>

<style scoped>
.el-chip {
  background: var(--pine-tint);
  color: var(--text);
  max-width: 100%;
}
.el-chip-label {
  max-width: 220px;
}
</style>
