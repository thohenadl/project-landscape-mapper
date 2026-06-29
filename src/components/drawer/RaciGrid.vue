<template>
  <div class="raci">
    <div class="canvas-label q-mb-xs">RACI</div>

    <div v-if="store.roles.length === 0" class="text-caption text-grey-6">
      No roles defined yet.
    </div>

    <table v-else class="raci-table">
      <thead>
        <tr>
          <th class="role-col" />
          <th v-for="l in RACI_LETTERS" :key="l.value" class="letter-col">
            {{ l.value }}
            <q-tooltip>{{ l.label }}</q-tooltip>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="role in store.roles" :key="role.id">
          <td class="role-col">
            <span class="swatch q-mr-xs" :style="{ background: role.color }" />
            <span class="role-name">{{ role.name }}</span>
            <q-badge v-if="role.id === owningRoleId" outline color="grey-7" class="q-ml-xs">owner</q-badge>
          </td>
          <td v-for="l in RACI_LETTERS" :key="l.value" class="letter-col">
            <q-checkbox
              dense
              size="xs"
              :model-value="has(role.id, l.value)"
              @update:model-value="() => store.toggleRaci(l3Id, role.id, l.value)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLandscapeStore } from '@/stores/landscape'
import { RACI_LETTERS, type RaciLetter } from '@/types/landscape'

const props = defineProps<{ l3Id: string }>()
const store = useLandscapeStore()

const milestone = computed(() => store.l3ById.get(props.l3Id) ?? null)
const owningRoleId = computed(() => milestone.value?.roleId ?? '')

function has(roleId: string, letter: RaciLetter): boolean {
  const entry = milestone.value?.raci.find((r) => r.roleId === roleId)
  return entry?.letters.includes(letter) ?? false
}
</script>

<style scoped>
.raci-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.raci-table th,
.raci-table td {
  padding: 1px 4px;
  text-align: center;
}
.role-col {
  text-align: left;
  white-space: nowrap;
}
.role-name {
  vertical-align: middle;
}
.letter-col {
  width: 34px;
  color: var(--muted);
  font-weight: 700;
}
.swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  vertical-align: middle;
}
</style>
