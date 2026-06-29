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

/** Whether the linked milestone comes before (supplies) or after (consumes) this one. */
export type ConnectionDirection = 'predecessor' | 'successor'

export const CONNECTION_DIRECTIONS: { value: ConnectionDirection; label: string }[] = [
  { value: 'predecessor', label: 'Predecessor / Supplier' },
  { value: 'successor', label: 'Successor / Customer' },
]

/**
 * An ordered X-axis column on the timeline. Phases tile the timeline back-to-back;
 * `durationMonths` sets how many months wide the column is (and thus its pixel width).
 */
export interface Phase {
  id: string
  name: string
  durationMonths: number // how many calendar months this phase spans (drives column width)
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
 * A reusable SIPOC artifact / deliverable. Referenced (by id) from an L3's
 * `inputElementIds` and `outputElementIds`. Living in a single shared list lets
 * the map be measured: e.g. an element consumed as an input but produced as an
 * output nowhere is a traceability gap.
 */
export interface FlowElement {
  id: string
  name: string
}

/** RACI responsibility letter. */
export type RaciLetter = 'R' | 'A' | 'C' | 'I'

export const RACI_LETTERS: { value: RaciLetter; label: string }[] = [
  { value: 'R', label: 'Responsible' },
  { value: 'A', label: 'Accountable' },
  { value: 'C', label: 'Consulted' },
  { value: 'I', label: 'Informed' },
]

/** RACI assignment for one role on one milestone (a role may hold several letters). */
export interface RaciEntry {
  roleId: string
  letters: RaciLetter[]
}

/**
 * A connection from one L3 milestone to another. `direction` says whether the
 * linked milestone is this one's predecessor (supplier) or successor (customer);
 * `dependencyType` is the MS-Project relation. Stored but NOT rendered in draft 1.
 */
export interface Connection {
  targetMilestoneId: string // canonical UUID of the linked L3 milestone
  direction: ConnectionDirection // is the target a predecessor or successor of this milestone
  dependencyType: DependencyType
}

/** L2 synchronization milestone (gate): a vertical line across all streams + a top-band diamond. */
export interface L2Milestone {
  id: string // canonical UUID
  title: string
  x: number // free X position (graph coords); renders the vertical guide + diamond
  date?: string // optional ISO 'YYYY-MM-DD'; metadata only, does not drive position
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
  date?: string // optional ISO 'YYYY-MM-DD'; metadata only, does not drive position
  summary: string // short one-line description (canvas top row)
  description: string // SIPOC "Process detail" — rich-text HTML of what this milestone does
  inputElementIds: string[] // FlowElement ids consumed by this milestone (SIPOC Inputs)
  outputElementIds: string[] // FlowElement ids produced by this milestone (SIPOC Outputs)
  definitionOfDone: string[] // list of completion criteria
  raci: RaciEntry[] // RACI assignments; only roles with ≥1 letter are stored
  connections: Connection[] // predecessor (supplier) / successor (customer) links
}

/** L1 = the single project / the whole map. */
export interface ProjectMeta {
  id: string
  name: string
  startDate: string // ISO 'YYYY-MM-DD' (first of the start month); anchors the timeline
}

/** The complete serialized state of the application. */
export interface LandscapeSnapshot {
  schemaVersion: 3
  project: ProjectMeta
  phases: Phase[]
  streams: Stream[]
  roles: Role[]
  elements: FlowElement[] // shared SIPOC input/output artifacts
  l2: L2Milestone[]
  l3: L3Milestone[]
  nextDisplayNumber: number // monotonic counter for L3 display numbers
}

export const SCHEMA_VERSION = 3 as const
