import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { MarkerType, type Edge, type Node } from '@vue-flow/core'
import {
  type Connection,
  type DependencyType,
  type L2Milestone,
  type L3Milestone,
  type LandscapeSnapshot,
  type Phase,
  type ProjectMeta,
  type Role,
  type Stream,
  SCHEMA_VERSION,
} from '@/types/landscape'
import {
  DEFAULT_PHASE_MONTHS,
  L3_SIZE,
  laneCenterY,
  phaseIndexFromX,
  streamIndexFromY,
  totalHeight,
  totalWidth,
} from '@/composables/useLayout'
import { buildSample } from '@/data/sampleData'

const STORAGE_KEY = 'plm:landscape:v1'

function uid(): string {
  return crypto.randomUUID()
}

/** ISO 'YYYY-MM-01' for the first of the current month (default timeline start). */
function firstOfThisMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

/**
 * Upgrade an older snapshot to the current schema in place-ish (returns a v2 snapshot).
 * v1 had no phase durations, no project start date and no milestone dates.
 */
function migrate(snap: LandscapeSnapshot): LandscapeSnapshot {
  const s = clone(snap)
  if (s.schemaVersion === SCHEMA_VERSION) return s
  if (!s.project.startDate) s.project.startDate = firstOfThisMonth()
  for (const p of s.phases) {
    if (typeof (p as Phase).durationMonths !== 'number') p.durationMonths = DEFAULT_PHASE_MONTHS
  }
  s.schemaVersion = SCHEMA_VERSION
  return s
}

function pad(n: number): string {
  return String(n).padStart(3, '0')
}

/** Deep clone via JSON (state is plain serializable data). */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function emptySnapshot(): LandscapeSnapshot {
  return {
    schemaVersion: SCHEMA_VERSION,
    project: { id: uid(), name: 'Untitled Project', startDate: firstOfThisMonth() },
    phases: [],
    streams: [],
    roles: [],
    l2: [],
    l3: [],
    nextDisplayNumber: 1,
  }
}

export const useLandscapeStore = defineStore('landscape', () => {
  // ---- State ----------------------------------------------------------------
  const project = ref<ProjectMeta>({ id: uid(), name: 'Untitled Project', startDate: firstOfThisMonth() })
  const phases = ref<Phase[]>([])
  const streams = ref<Stream[]>([])
  const roles = ref<Role[]>([])
  const l2 = ref<L2Milestone[]>([])
  const l3 = ref<L3Milestone[]>([])
  const nextDisplayNumber = ref(1)

  let hydrating = false

  // ---- Lookups --------------------------------------------------------------
  const roleById = computed(() => new Map(roles.value.map((r) => [r.id, r])))
  const streamById = computed(() => new Map(streams.value.map((s) => [s.id, s])))
  const l2ById = computed(() => new Map(l2.value.map((g) => [g.id, g])))
  const l3ById = computed(() => new Map(l3.value.map((m) => [m.id, m])))

  function streamIndex(id: string): number {
    const i = streams.value.findIndex((s) => s.id === id)
    return i < 0 ? 0 : i
  }

  const isEmpty = computed(
    () => phases.value.length === 0 && streams.value.length === 0 && l2.value.length === 0 && l3.value.length === 0,
  )

  /** Derived phase name for an L3 (phase = where its X falls). */
  function phaseOfL3(id: string): Phase | undefined {
    const m = l3ById.value.get(id)
    if (!m || phases.value.length === 0) return undefined
    return phases.value[phaseIndexFromX(m.x, phases.value)]
  }

  // ---- Constraint helper ----------------------------------------------------
  /** Clamp an L3 X to be no greater than its parent gate's X ("finish ≤ gate"). */
  function clampToGate(x: number, parentL2Id: string): number {
    const gate = l2ById.value.get(parentL2Id)
    if (!gate) return x
    return Math.min(x, gate.x)
  }

  // ---- Flow node builder ----------------------------------------------------
  const flowNodes = computed<Node[]>(() => {
    const nodes: Node[] = []

    // Background (swimlanes + phase columns + top band). Behind everything.
    nodes.push({
      id: 'bg',
      type: 'background',
      position: { x: 0, y: 0 },
      data: {},
      draggable: false,
      selectable: false,
      focusable: false,
      zIndex: -10,
      style: {
        width: `${totalWidth(phases.value)}px`,
        height: `${totalHeight(streams.value.length)}px`,
      },
    })

    // L2 gates: vertical guide across all lanes + a top-band diamond.
    for (const gate of l2.value) {
      nodes.push({
        id: `l2:${gate.id}`,
        type: 'l2',
        position: { x: gate.x, y: 0 },
        data: { id: gate.id, title: gate.title },
        draggable: true,
        selectable: true,
        zIndex: 5,
      })
    }

    // L3 milestones: role-colored points snapped to their lane.
    for (const m of l3.value) {
      const idx = streamIndex(m.streamId)
      const color = roleById.value.get(m.roleId)?.color ?? '#9e9e9e'
      nodes.push({
        id: `l3:${m.id}`,
        type: 'l3',
        position: { x: m.x - L3_SIZE / 2, y: laneCenterY(idx) - L3_SIZE / 2 },
        data: { id: m.id, displayNumber: m.displayNumber, title: m.title, color },
        draggable: true,
        selectable: true,
        zIndex: 10,
        style: { width: `${L3_SIZE}px`, height: `${L3_SIZE}px` },
      })
    }

    return nodes
  })

  /**
   * Edges derived from each milestone's connections, oriented by direction so the
   * arrow always points supplier → customer:
   *  - `successor`   → this milestone supplies the target (this → target)
   *  - `predecessor` → the target supplies this milestone (target → this)
   * The canvas renders these on hover only (filtered to the hovered milestone).
   */
  const flowEdges = computed<Edge[]>(() =>
    l3.value.flatMap((m) =>
      m.connections.map((c) => {
        const isSuccessor = c.direction === 'successor'
        const sourceId = isSuccessor ? m.id : c.targetMilestoneId
        const targetId = isSuccessor ? c.targetMilestoneId : m.id
        return {
          id: `${m.id}->${c.targetMilestoneId}:${c.direction}`,
          source: `l3:${sourceId}`,
          target: `l3:${targetId}`,
          type: 'smoothstep',
          animated: true,
          label: c.dependencyType,
          markerEnd: MarkerType.ArrowClosed,
        }
      }),
    ),
  )

  // ---- L2 (gate) CRUD -------------------------------------------------------
  function addL2(input: { title: string; x: number }): L2Milestone {
    const gate: L2Milestone = { id: uid(), title: input.title, x: input.x }
    l2.value.push(gate)
    return gate
  }

  function updateL2(id: string, patch: Partial<Omit<L2Milestone, 'id'>>): void {
    const gate = l2.value.find((g) => g.id === id)
    if (!gate) return
    Object.assign(gate, patch)
    if (patch.x !== undefined) reclampChildren(id)
  }

  /** Move a gate to a new X and pull back any children that would sit right of it. Returns affected count. */
  function moveL2(id: string, x: number): number {
    const gate = l2.value.find((g) => g.id === id)
    if (!gate) return 0
    gate.x = x
    return reclampChildren(id)
  }

  function reclampChildren(l2Id: string): number {
    const gate = l2ById.value.get(l2Id)
    if (!gate) return 0
    let affected = 0
    for (const m of l3.value) {
      if (m.parentL2Id === l2Id && m.x > gate.x) {
        m.x = gate.x
        affected++
      }
    }
    return affected
  }

  /** Remove a gate. Blocked (returns false) if any L3 still rolls up to it. */
  function removeL2(id: string): boolean {
    if (l3.value.some((m) => m.parentL2Id === id)) return false
    l2.value = l2.value.filter((g) => g.id !== id)
    return true
  }

  // ---- L3 (milestone) CRUD --------------------------------------------------
  function addL3(input: {
    title?: string
    roleId: string
    parentL2Id: string
    streamId: string
    x: number
    description?: string
  }): L3Milestone {
    const m: L3Milestone = {
      id: uid(),
      displayNumber: pad(nextDisplayNumber.value),
      title: input.title ?? `Milestone ${pad(nextDisplayNumber.value)}`,
      roleId: input.roleId,
      parentL2Id: input.parentL2Id,
      streamId: input.streamId,
      x: clampToGate(input.x, input.parentL2Id),
      description: input.description ?? '',
      connections: [],
    }
    nextDisplayNumber.value++
    l3.value.push(m)
    return m
  }

  /**
   * Create a milestone at a canvas position, picking sensible defaults:
   * lane from Y, parent gate = first gate at/after X (else the last gate),
   * role = first role. Returns null if streams/roles/gates aren't set up yet.
   */
  function addMilestoneAt(pos: { x: number; y: number }): L3Milestone | null {
    if (!streams.value.length || !roles.value.length || !l2.value.length) return null
    const idx = streamIndexFromY(pos.y, streams.value.length)
    const sorted = [...l2.value].sort((a, b) => a.x - b.x)
    const gate = sorted.find((g) => g.x >= pos.x) ?? sorted[sorted.length - 1]
    return addL3({
      roleId: roles.value[0].id,
      parentL2Id: gate.id,
      streamId: streams.value[idx].id,
      x: pos.x,
    })
  }

  function updateL3(id: string, patch: Partial<Omit<L3Milestone, 'id' | 'displayNumber'>>): void {
    const m = l3.value.find((x) => x.id === id)
    if (!m) return
    Object.assign(m, patch)
    if (patch.parentL2Id !== undefined || patch.x !== undefined) {
      m.x = clampToGate(m.x, m.parentL2Id)
    }
  }

  function removeL3(id: string): void {
    l3.value = l3.value.filter((m) => m.id !== id)
    // Strip dangling references from every other milestone's connections.
    for (const m of l3.value) {
      m.connections = m.connections.filter((c) => c.targetMilestoneId !== id)
    }
  }

  /**
   * Commit a drag: snap Y to the nearest lane (updates stream) and clamp X to the
   * parent gate. `centerX`/`centerY` are the milestone's CENTER in graph coords.
   * Returns whether the X was clamped (so the UI can warn).
   */
  function moveMilestone(id: string, centerX: number, centerY: number): { clamped: boolean } {
    const m = l3.value.find((x) => x.id === id)
    if (!m) return { clamped: false }
    const idx = streamIndexFromY(centerY, streams.value.length)
    const targetStream = streams.value[idx]
    if (targetStream) m.streamId = targetStream.id
    const newX = clampToGate(centerX, m.parentL2Id)
    const clamped = centerX - newX > 0.5
    m.x = newX
    return { clamped }
  }

  // ---- Connections (SIPOC supplier/customer) --------------------------------
  function addConnection(l3Id: string, conn: Connection): void {
    const m = l3.value.find((x) => x.id === l3Id)
    if (!m) return
    m.connections.push(clone(conn))
  }

  function updateConnection(l3Id: string, index: number, patch: Partial<Connection>): void {
    const m = l3.value.find((x) => x.id === l3Id)
    if (!m || !m.connections[index]) return
    Object.assign(m.connections[index], patch)
  }

  function removeConnection(l3Id: string, index: number): void {
    const m = l3.value.find((x) => x.id === l3Id)
    if (!m) return
    m.connections.splice(index, 1)
  }

  // ---- Streams CRUD ---------------------------------------------------------
  function addStream(name: string): Stream {
    const s: Stream = { id: uid(), name }
    streams.value.push(s)
    return s
  }
  function renameStream(id: string, name: string): void {
    const s = streams.value.find((x) => x.id === id)
    if (s) s.name = name
  }
  function reorderStream(from: number, to: number): void {
    if (to < 0 || to >= streams.value.length || from === to) return
    const [moved] = streams.value.splice(from, 1)
    streams.value.splice(to, 0, moved)
  }
  /** Blocked (returns false) if any L3 lives in this stream. */
  function removeStream(id: string): boolean {
    if (l3.value.some((m) => m.streamId === id)) return false
    streams.value = streams.value.filter((s) => s.id !== id)
    return true
  }

  // ---- Project / timeline ---------------------------------------------------
  function setStartDate(iso: string): void {
    if (iso) project.value.startDate = iso
  }
  function updateProject(patch: Partial<Omit<ProjectMeta, 'id'>>): void {
    Object.assign(project.value, patch)
  }

  // ---- Phases CRUD (timeline columns; no foreign keys) ----------------------
  function addPhase(name: string, durationMonths = DEFAULT_PHASE_MONTHS): Phase {
    const p: Phase = { id: uid(), name, durationMonths }
    phases.value.push(p)
    return p
  }
  function renamePhase(id: string, name: string): void {
    const p = phases.value.find((x) => x.id === id)
    if (p) p.name = name
  }
  function updatePhase(id: string, patch: Partial<Omit<Phase, 'id'>>): void {
    const p = phases.value.find((x) => x.id === id)
    if (!p) return
    Object.assign(p, patch)
    if (patch.durationMonths !== undefined && !(p.durationMonths > 0)) p.durationMonths = 1
  }
  function reorderPhase(from: number, to: number): void {
    if (to < 0 || to >= phases.value.length || from === to) return
    const [moved] = phases.value.splice(from, 1)
    phases.value.splice(to, 0, moved)
  }
  function removePhase(id: string): void {
    phases.value = phases.value.filter((p) => p.id !== id)
  }

  // ---- Roles CRUD -----------------------------------------------------------
  function addRole(name: string, color: string): Role {
    const r: Role = { id: uid(), name, color }
    roles.value.push(r)
    return r
  }
  function updateRole(id: string, patch: Partial<Omit<Role, 'id'>>): void {
    const r = roles.value.find((x) => x.id === id)
    if (r) Object.assign(r, patch)
  }
  /** Blocked (returns false) if any L3 is owned by this role. */
  function removeRole(id: string): boolean {
    if (l3.value.some((m) => m.roleId === id)) return false
    roles.value = roles.value.filter((r) => r.id !== id)
    return true
  }

  // ---- Serialization / persistence -----------------------------------------
  function serialize(): LandscapeSnapshot {
    return clone({
      schemaVersion: SCHEMA_VERSION,
      project: project.value,
      phases: phases.value,
      streams: streams.value,
      roles: roles.value,
      l2: l2.value,
      l3: l3.value,
      nextDisplayNumber: nextDisplayNumber.value,
    })
  }

  function hydrate(snap: LandscapeSnapshot): void {
    hydrating = true
    const s = clone(snap)
    project.value = s.project
    phases.value = s.phases
    streams.value = s.streams
    roles.value = s.roles
    l2.value = s.l2
    l3.value = s.l3
    nextDisplayNumber.value = s.nextDisplayNumber ?? 1
    // allow the watcher to settle before re-enabling persistence
    queueMicrotask(() => {
      hydrating = false
    })
  }

  function persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize()))
    } catch {
      /* ignore quota / private-mode errors in a demo */
    }
  }

  function loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as LandscapeSnapshot
      if (parsed?.schemaVersion === SCHEMA_VERSION || parsed?.schemaVersion === 1) {
        hydrate(migrate(parsed))
      }
    } catch {
      /* ignore corrupt storage */
    }
  }

  // ---- JSON import / export -------------------------------------------------
  function exportJson(): string {
    return JSON.stringify(serialize(), null, 2)
  }

  function importJson(text: string): void {
    const parsed = JSON.parse(text) as LandscapeSnapshot
    if (parsed?.schemaVersion !== SCHEMA_VERSION && parsed?.schemaVersion !== 1) {
      throw new Error(`Unsupported schemaVersion: ${String(parsed?.schemaVersion)}`)
    }
    if (!Array.isArray(parsed.streams) || !Array.isArray(parsed.l3)) {
      throw new Error('Invalid landscape file (missing collections).')
    }
    hydrate(migrate(parsed))
  }

  function loadSample(): void {
    hydrate(buildSample())
  }

  function clearAll(): void {
    hydrate(emptySnapshot())
  }

  // ---- Auto-persist ---------------------------------------------------------
  watch(
    [project, phases, streams, roles, l2, l3, nextDisplayNumber],
    () => {
      if (!hydrating) persist()
    },
    { deep: true },
  )

  // Load any previously saved state on first use.
  loadFromStorage()

  return {
    // state
    project,
    phases,
    streams,
    roles,
    l2,
    l3,
    nextDisplayNumber,
    // lookups / derived
    roleById,
    streamById,
    l2ById,
    l3ById,
    streamIndex,
    isEmpty,
    phaseOfL3,
    flowNodes,
    flowEdges,
    // gate CRUD
    addL2,
    updateL2,
    moveL2,
    removeL2,
    // milestone CRUD
    addL3,
    addMilestoneAt,
    updateL3,
    removeL3,
    moveMilestone,
    // connections
    addConnection,
    updateConnection,
    removeConnection,
    // streams
    addStream,
    renameStream,
    reorderStream,
    removeStream,
    // project / timeline
    setStartDate,
    updateProject,
    // phases
    addPhase,
    renamePhase,
    updatePhase,
    reorderPhase,
    removePhase,
    // roles
    addRole,
    updateRole,
    removeRole,
    // persistence / io
    serialize,
    hydrate,
    exportJson,
    importJson,
    loadSample,
    clearAll,
  }
})
