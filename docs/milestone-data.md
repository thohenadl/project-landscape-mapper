# Milestone Data

This document describes the data a **milestone** holds in the Project Landscape Mapper.

The domain model lives in [`src/types/landscape.ts`](../src/types/landscape.ts). There is a
strict containment hierarchy:

```
L1 project  →  L2 synchronization milestones (gates)  →  L3 core milestones
```

When people say "milestone" in the central planning pane (the numbered squares `001`,
`002`, …) they mean an **L3 milestone**. The vertical gates are **L2 milestones**.

---

## L3 core milestone (`L3Milestone`)

A single point owned by exactly one role, sitting in exactly one stream, rolling up to
exactly one parent gate. Source: [`src/types/landscape.ts`](../src/types/landscape.ts#L65-L75).

| Field | Type | Meaning |
|-------|------|---------|
| `id` | `string` | Canonical UUID. **Every** cross-reference (connections, etc.) uses this id, never the display number. |
| `displayNumber` | `string` | Cosmetic, zero-padded sequence shown on the node, e.g. `'003'`. Comes from the store's monotonic `nextDisplayNumber` counter. |
| `title` | `string` | The milestone name (e.g. "Stakeholder-Analyse durchgeführt"). Shown as the caption under the node and in the tooltip. |
| `roleId` | `string` | UUID of the **one** owning role. The role's color fills the node square. |
| `parentL2Id` | `string` | UUID of the **one** parent gate. Invariant: the milestone's `x` must be ≤ that gate's `x` (a milestone can't sit right of its deadline gate). |
| `streamId` | `string` | UUID of the **one** stream (swimlane row) it belongs to. |
| `x` | `number` | Free horizontal position in graph coordinates. The **phase is derived from this** — it is not stored. |
| `description` | `string` | The SIPOC "Process" text — what this milestone actually does. Editable in the milestone drawer. |
| `connections` | `Connection[]` | Outgoing supplier/customer links to other L3 milestones (see below). |

### Position & the derived phase

A milestone stores only a free `x` (and an implicit lane from `streamId`). The **phase**
(`Idee`, `Definition`, …) is computed from where `x` falls across the phase columns —
see `phaseOfL3()` / `phaseIndexFromX()` in
[`src/composables/useLayout.ts`](../src/composables/useLayout.ts#L60-L64). So moving a
milestone left/right can change its phase without any phase field being written.

The vertical (y) position is derived from the milestone's stream index via
`laneCenterY()`; milestones snap to the center of their lane on drag.

---

## Connections (`Connection`)

Each L3 milestone carries a list of **outgoing** connections describing
supplier/customer relationships. Source:
[`src/types/landscape.ts`](../src/types/landscape.ts#L51-L55).

| Field | Type | Meaning |
|-------|------|---------|
| `targetMilestoneId` | `string` | UUID of the linked L3 milestone. |
| `direction` | `'predecessor' \| 'successor'` | Whether the linked milestone is this one's **predecessor / supplier** (`predecessor`) or **successor / customer** (`successor`). |
| `dependencyType` | `'FS' \| 'SS' \| 'FF' \| 'SF'` | MS-Project style relation. |

**Dependency types** (`DEPENDENCY_TYPES`):

| Value | English | German (`de`) |
|-------|---------|---------------|
| `FS` | Finish → Start | Ende → Anfang |
| `SS` | Start → Start | Anfang → Anfang |
| `FF` | Finish → Finish | Ende → Ende |
| `SF` | Start → Finish | Anfang → Ende |

**Direction labels** (`CONNECTION_DIRECTIONS`): `predecessor` → "Predecessor / Supplier",
`successor` → "Successor / Customer".

### How connections are read on the canvas

Connections are edited in the milestone drawer
([`SipocConnections.vue`](../src/components/drawer/SipocConnections.vue)) and rendered as
**hover-only** lines on the canvas. The store turns them into oriented edges in
`flowEdges` ([`src/stores/landscape.ts`](../src/stores/landscape.ts)):

- `successor` → arrow points **this → target** (this milestone supplies the target).
- `predecessor` → arrow points **target → this** (the target supplies this milestone).

Because the canvas filters edges by the hovered node's id (as `source` *or* `target`),
hovering a milestone reveals **both** the connections it declares itself *and* the
connections other milestones declare toward it. See
[modelling-pane.md](./modelling-pane.md#hover-to-reveal-connections) for the interaction.

---

## L2 synchronization milestone (`L2Milestone`) — for contrast

The vertical "gate" lines are a separate, simpler type. Source:
[`src/types/landscape.ts`](../src/types/landscape.ts#L58-L62).

| Field | Type | Meaning |
|-------|------|---------|
| `id` | `string` | Canonical UUID. |
| `title` | `string` | Gate name (e.g. "Projekt ist beauftragt"). |
| `x` | `number` | Free X position; renders the vertical guide across all streams plus a top-band diamond. |

L2 gates have no role, stream, or connections — they act as deadlines that L3 milestones
roll up to. See [admin-settings.md](./admin-settings.md) for managing them.

---

## Where milestones live in the whole snapshot

All state is one serializable `LandscapeSnapshot`
([`src/types/landscape.ts`](../src/types/landscape.ts#L84-L93)) containing `project`,
`phases`, `streams`, `roles`, `l2`, `l3`, and `nextDisplayNumber`. The exact same shape
is used for localStorage persistence and JSON import/export. See
[standard-template-data.md](./standard-template-data.md) for a concrete populated example.
