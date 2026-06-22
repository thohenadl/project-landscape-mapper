// Domain model for the Project Landscape Map.
//
// Hierarchy (strict containment tree):
//   L1 project  ->  L2 synchronization milestones (gates)  ->  L3 core milestones
//
// A single `LandscapeSnapshot` is the entire serialized state. localStorage,
// JSON export and JSON import all use this exact shape (one source of truth).

/** MS-Project style dependency relation between two milestones. */
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

export const DEPENDENCY_TYPES: { value: DependencyType; label: string; de: string }[] = [
  { value: 'FS', label: 'Finish → Start', de: 'Ende → Anfang' },
  { value: 'SS', label: 'Start → Start', de: 'Anfang → Anfang' },
  { value: 'FF', label: 'Finish → Finish', de: 'Ende → Ende' },
  { value: 'SF', label: 'Start → Finish', de: 'Anfang → Ende' },
]

/** An ordered X-axis column. Geometry is derived from layout constants, not stored. */
export interface Phase {
  id: string
  name: string
}

/** An ordered Y-axis row (swimlane). Geometry is derived from layout constants. */
export interface Stream {
  id: string
  name: string
}

/** A role = name + color only. The owning role's color fills its L3 milestone node. */
export interface Role {
  id: string
  name: string
  color: string // hex, e.g. '#C8281E'
}

/**
 * A connection from one L3 milestone to another. Declaring it populates the
 * SIPOC supplier/customer relationship; `flowLabel` is the Input/Output that flows.
 * Connections are stored but NOT rendered on the canvas in draft 1.
 */
export interface Connection {
  targetMilestoneId: string // canonical UUID of the downstream (customer) L3 milestone
  dependencyType: DependencyType
  flowLabel: string // the Output→Input that flows (free text)
}

/** L2 synchronization milestone (gate): a vertical line across all streams + a top-band diamond. */
export interface L2Milestone {
  id: string // canonical UUID
  title: string
  x: number // free X position (graph coords); renders the vertical guide + diamond
}

/** L3 core milestone: a single point owned by exactly one role, in one stream, under one gate. */
export interface L3Milestone {
  id: string // canonical UUID — used for ALL references (connections, etc.)
  displayNumber: string // cosmetic, zero-padded sequence, e.g. '003'
  title: string
  roleId: string // exactly one owning role (drives node color)
  parentL2Id: string // exactly one parent gate; invariant: x <= that L2's x
  streamId: string // exactly one stream (lane)
  x: number // free X (graph coords); the phase is derived from this
  description: string // SIPOC "Process" — what this milestone does
  connections: Connection[] // outgoing Output→Input flows (suppliers/customers)
}

/** L1 = the single project / the whole map. */
export interface ProjectMeta {
  id: string
  name: string
}

/** The complete serialized state of the application. */
export interface LandscapeSnapshot {
  schemaVersion: 1
  project: ProjectMeta
  phases: Phase[]
  streams: Stream[]
  roles: Role[]
  l2: L2Milestone[]
  l3: L3Milestone[]
  nextDisplayNumber: number // monotonic counter for L3 display numbers
}

export const SCHEMA_VERSION = 1 as const
