# Admin Settings

The **Admin** view (sidebar → "Admin", titled "Configuration") is where the building
blocks of the landscape are configured. It is a tabbed page:
[`src/pages/AdminPage.vue`](../src/pages/AdminPage.vue), with one component per tab under
[`src/components/admin/`](../src/components/admin/).

Edits are applied **live** to the Pinia store and persisted to localStorage immediately —
there is no separate "save" step.

| Tab | Component | Manages |
|-----|-----------|---------|
| Streams | [`StreamsAdmin.vue`](../src/components/admin/StreamsAdmin.vue) | Y-axis swimlane rows |
| Phases | [`PhasesAdmin.vue`](../src/components/admin/PhasesAdmin.vue) | X-axis background columns |
| Gates (L2) | [`GatesAdmin.vue`](../src/components/admin/GatesAdmin.vue) | Vertical synchronization gates |
| Roles | [`RolesAdmin.vue`](../src/components/admin/RolesAdmin.vue) | Role name + color (drives node color) |

---

## Streams (swimlanes)

The horizontal rows of the landscape, top to bottom.

- **Add** — type a name, click Add (or Enter).
- **Rename** — edit inline.
- **Reorder** — up/down arrows (`store.reorderStream`). Order determines vertical lane position.
- **Delete** — blocked while milestones still live in the stream. Attempting it shows: *"… still has milestones. Reassign or delete them first."* (Guard: `store.removeStream` returns `false`.)

---

## Phases (columns)

The ordered background columns, left to right (Idee, Definition, …).

- **Add / rename / reorder** (left/right arrows, `store.reorderPhase`).
- **Delete** — always allowed. Phases are **purely visual**: a milestone's phase is *derived* from where its `x` falls, so phases carry no foreign keys. Removing one just narrows the canvas; milestones don't move in data.

---

## Gates (L2 synchronization milestones)

Vertical gates that span all streams. Each L3 milestone rolls up to exactly one gate and
must finish at or before it.

- **Add** — new gate is placed at the right edge (or shifted right of the last gate).
- **Rename** — edit the title inline.
- **Position** — set the gate's `x` numerically here, or drag it on the canvas. Moving a gate left **pulls back** any child milestones that would otherwise sit right of it.
- **Delete** — blocked while any milestone rolls up to the gate: *"… still has milestones rolling up to it. Reassign or delete them first."* (Guard: `store.removeL2` returns `false`.)

The list is shown sorted by `x` (left-to-right order on the canvas).

---

## Roles

A role is just a **name + color**. A milestone is owned by exactly one role and is filled
with that role's color on the canvas.

- **Add** — pick a color (color picker, hex) and type a name.
- **Rename** — edit inline.
- **Change color** — click the swatch, pick a new hex color (updates every milestone owned by that role).
- **Delete** — blocked while the role owns milestones: *"… still owns milestones. Reassign them to another role first."* (Guard: `store.removeRole` returns `false`.)

---

## Note on the editor toolbar (not part of Admin)

Streams/phases/gates/roles can also be **bulk-seeded or wiped** from the Editor toolbar
([`EditorToolbar.vue`](../src/components/toolbar/EditorToolbar.vue)) via **Load sample**,
**Clear**, **Import**, and **Export** — see
[standard-template-data.md](./standard-template-data.md) and
[getting-started.md](./getting-started.md). The toolbar also shows live counts of gates,
milestones, and streams.
