<template>
  <div class="landscape-canvas">
    <VueFlow
      :nodes="nodes"
      :edges="visibleEdges"
      :min-zoom="0.15"
      :max-zoom="2.5"
      :nodes-connectable="false"
      :elements-selectable="true"
      :snap-to-grid="false"
      :delete-key-code="null"
      @node-click="onNodeClick"
      @node-mouse-enter="onNodeMouseEnter"
      @node-mouse-leave="onNodeMouseLeave"
      @dblclick="onDblClick"
    >
      <Background :gap="26" pattern-color="#d7e3de" />
      <Controls position="top-left" :show-interactive="false" />

      <template #node-background="props">
        <SwimlaneBackground v-bind="props" />
      </template>
      <template #node-l2="props">
        <L2GateNode v-bind="props" />
      </template>
      <template #node-l3="props">
        <L3MilestoneNode v-bind="props" />
      </template>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  MarkerType,
  VueFlow,
  useVueFlow,
  type Edge,
  type Node,
  type NodeMouseEvent,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import SwimlaneBackground from './SwimlaneBackground.vue'
import L2GateNode from './L2GateNode.vue'
import L3MilestoneNode from './L3MilestoneNode.vue'
import { useLandscapeStore } from '@/stores/landscape'
import { useFlowInteractions } from '@/composables/useFlowInteractions'

const emit = defineEmits<{
  (e: 'select-milestone', id: string): void
  (e: 'canvas-dblclick', pos: { x: number; y: number }): void
}>()

const store = useLandscapeStore()
const { onInit, fitView, screenToFlowCoordinate } = useVueFlow()

// Local nodes mirror the store. We clone so Vue Flow owns its own objects and
// can attach internal state without mutating the store's computed output.
function cloneNodes(src: Node[]): Node[] {
  return src.map((n) => ({ ...n, position: { ...n.position }, data: { ...n.data } }))
}
const nodes = ref<Node[]>(cloneNodes(store.flowNodes))
watch(
  () => store.flowNodes,
  (next) => {
    nodes.value = cloneNodes(next)
  },
)

// Hover-to-reveal connections: only the hovered milestone's edges are rendered.
const SUPPLIER_COLOR = '#1565C0' // incoming  (a supplier feeds this milestone)
const CUSTOMER_COLOR = '#E07A1F' // outgoing  (this milestone feeds a customer)
const hoveredL3Id = ref<string | null>(null)

const visibleEdges = computed<Edge[]>(() => {
  if (!hoveredL3Id.value) return []
  const self = `l3:${hoveredL3Id.value}`
  return store.flowEdges
    .filter((e) => e.source === self || e.target === self)
    .map((e) => {
      // Color relative to the hovered node: an edge pointing AT it is a supplier link.
      const stroke = e.target === self ? SUPPLIER_COLOR : CUSTOMER_COLOR
      return {
        ...e,
        style: { stroke, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
        labelBgStyle: { fill: '#ffffff' },
        labelStyle: { fill: stroke, fontWeight: 700, fontSize: 11 },
      }
    })
})

function onNodeMouseEnter(e: NodeMouseEvent) {
  if (e.node.type === 'l3') hoveredL3Id.value = e.node.data.id
}
function onNodeMouseLeave(e: NodeMouseEvent) {
  if (e.node.type === 'l3' && hoveredL3Id.value === e.node.data.id) {
    hoveredL3Id.value = null
  }
}

// Drag snapping + gate constraints (must run inside this VueFlow context).
useFlowInteractions()

onInit(() => {
  fitView({ padding: 0.15 })
})

function onNodeClick(e: NodeMouseEvent) {
  if (e.node.type === 'l3') emit('select-milestone', e.node.data.id)
}

function onDblClick(event: MouseEvent) {
  // Ignore double-clicks that land on an existing node; only empty canvas adds.
  const target = event.target as HTMLElement
  if (target.closest('.vue-flow__node')) return
  const pos = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  emit('canvas-dblclick', pos)
}
</script>

<style scoped>
.landscape-canvas {
  width: 100%;
  height: 100%;
}
</style>
