# Modelling Pane (Landscape Editor)

The modelling pane is the central canvas where the project landscape is drawn and edited.
It is the **Editor** view (sidebar → "Editor"), as opposed to the **Admin** configuration
view. Entry point: [`src/pages/EditorPage.vue`](../src/pages/EditorPage.vue).

```
EditorPage
 ├─ EditorToolbar           (add / load sample / clear / import / export + stats)
 ├─ LandscapeCanvas         (the Vue Flow canvas)
 │   ├─ SwimlaneBackground  (phase columns, swimlane rows, top band labels)
 │   ├─ L2GateNode          (vertical gate line + top-band diamond)   × each gate
 │   └─ L3MilestoneNode     (the numbered colored square)             × each milestone
 └─ MilestoneDrawer         (dialog to edit the selected milestone)
     └─ SipocConnections    (predecessor / successor editor)
```

It is built on **Vue Flow** (a zoom/pan graph canvas). Everything — background, gates,
milestones — lives in one shared "graph space" so the whole diagram pans and zooms
together.

---

## Layout geometry

All positions are **derived** from a small set of constants plus array order; no
screen coordinates are stored in the domain model. See
[`src/composables/useLayout.ts`](../src/composables/useLayout.ts).

| Constant | Value | Purpose |
|----------|-------|---------|
| `LANE_HEIGHT` | `120` | Height of one swimlane row. |
| `PHASE_WIDTH` | `320` | Width of one phase column. |
| `TOP_BAND_H` | `64` | Height of the top band (phase headers + L2 diamonds). |
| `GUTTER_W` | `180` | Width of the left gutter holding stream names. |
| `L3_SIZE` | `40` | Rendered size of a milestone square. |
| `CONTENT_X0` | `= GUTTER_W` | Graph X where phase columns begin. |
| `CONTENT_Y0` | `= TOP_BAND_H` | Graph Y where swimlanes begin. |

Helper functions derive everything else: `laneCenterY(i)` (vertical snap target for a
lane), `phaseLeftX(i)` / `phaseBoundsX(i)`, `phaseIndexFromX(x)` (which phase an x falls
in — this is how a milestone's phase is computed), `streamIndexFromY(y)`, and
`totalWidth()` / `totalHeight()` (canvas extent).

---

## The nodes

The store builds the Vue Flow `nodes` array in `flowNodes`
([`src/stores/landscape.ts`](../src/stores/landscape.ts#L100-L146)):

- **Background** (`type: 'background'`, [`SwimlaneBackground.vue`](../src/components/canvas/SwimlaneBackground.vue)) — non-interactive layer behind everything: alternating phase columns, swimlane rows, the top "Meilensteine" band with phase labels (IDEE, DEFINITION, …) and the left gutter with stream names.
- **L2 gate** (`type: 'l2'`, [`L2GateNode.vue`](../src/components/canvas/L2GateNode.vue)) — a vertical dashed line across all lanes plus a rotated diamond in the top band. Draggable horizontally only (y pinned to the top band).
- **L3 milestone** (`type: 'l3'`, [`L3MilestoneNode.vue`](../src/components/canvas/L3MilestoneNode.vue)) — a 40×40 rounded square filled with the owning role's color, showing the `displayNumber`, with the title captioned below and a tooltip. Draggable, snaps to its lane.

The canvas clones the store's nodes so Vue Flow owns its own objects, and re-syncs via a
`watch` whenever `store.flowNodes` changes
([`LandscapeCanvas.vue`](../src/components/canvas/LandscapeCanvas.vue#L52-L61)).

---

## Interactions

Drag behavior is wired in
[`src/composables/useFlowInteractions.ts`](../src/composables/useFlowInteractions.ts),
which must run inside the `<VueFlow>` context:

- **Gates (L2):** drag horizontally only. On drop, `store.moveL2()` repositions the gate and **pulls back** any child milestones that would end up right of it (with a warning toast).
- **Milestones (L3):** on drop, `store.moveMilestone()` snaps the node to the nearest lane and clamps its x to `≤ parent gate.x` (warns if clamped).

Other canvas interactions ([`LandscapeCanvas.vue`](../src/components/canvas/LandscapeCanvas.vue)):

- **Click** an L3 node → emits `select-milestone` → opens the milestone drawer.
- **Double-click empty canvas** → `store.addMilestoneAt()` creates a milestone at that point and selects it. (Double-clicking an existing node is ignored.)
- Zoom range `0.15`–`2.5`; `fitView` runs once on init; connections are **not** user-editable on the canvas (`:nodes-connectable="false"`).

---

## Hover-to-reveal connections

By default the canvas shows **no** connection lines (`:edges` is empty at rest). When the
pointer enters a milestone, the lines to its suppliers and customers appear; when the
pointer leaves, they vanish. Nothing is persisted — this is presentation only.

Implementation:

1. **Anchors** — [`L3MilestoneNode.vue`](../src/components/canvas/L3MilestoneNode.vue) carries two invisible Vue Flow `<Handle>`s (a target on the left, a source on the right) so edges have something to attach to. They are `opacity: 0; pointer-events: none;`, so connections remain non-editable.
2. **Oriented edges** — the store's `flowEdges` ([`src/stores/landscape.ts`](../src/stores/landscape.ts)) turns each milestone's `connections` into edges oriented supplier → customer, with `type: 'smoothstep'`, `animated`, an arrow `markerEnd`, and the `dependencyType` (FS/SS/FF/SF) as the label.
3. **Hover filter** — [`LandscapeCanvas.vue`](../src/components/canvas/LandscapeCanvas.vue) tracks `hoveredL3Id` via `@node-mouse-enter` / `@node-mouse-leave`. The `visibleEdges` computed is empty unless a milestone is hovered, then returns only the edges whose `source` or `target` is the hovered node — coloring **incoming supplier** links one accent (blue) and **outgoing customer** links another (orange), each with a labelled arrowhead.

Because filtering matches the hovered id as either endpoint, hovering reveals both the
connections the milestone declares itself **and** the ones other milestones declare toward
it. See [milestone-data.md](./milestone-data.md#connections-connection) for the underlying
data.

---

## Editing a milestone (drawer)

Clicking a milestone opens [`MilestoneDrawer.vue`](../src/components/drawer/MilestoneDrawer.vue),
a dialog that edits the selected milestone live (changes write straight to the store):
title, owning role (with color swatches), parent gate, stream, the read-only derived
phase + short id, the "Process" description, and the
[`SipocConnections.vue`](../src/components/drawer/SipocConnections.vue) editor for adding
predecessor/successor links (direction, target milestone, relation type). It also offers
**Delete milestone**. The dialog auto-closes if the selected milestone disappears.
