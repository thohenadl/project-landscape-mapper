# Getting Started

How to run the Project Landscape Mapper locally.

## What it is

A **client-only** single-page app (Vue 3 + Quasar + Vue Flow + Pinia, built with Vite)
that recreates a multi-level project landscape map — milestones arranged in swimlanes over
project phases. There is **no backend**: everything runs in your browser and all data is
stored locally (see [Data & persistence](#data--persistence)).

## Prerequisites

- **Node.js** (with npm). The project uses Vite 8 and `@types/node` 24, so a current LTS
  Node (v20+) is recommended.
- A modern browser.

## Install

From the project root:

```bash
npm install
```

## Run in development

```bash
npm run dev
```

Vite prints a local URL (typically `http://localhost:5173`). Open it in your browser. Hot
module replacement is enabled, so edits reload automatically.

## First steps in the app

1. The app opens on the **Editor** view (sidebar, left). On a fresh start the canvas is
   empty.
2. Click **Load sample** in the toolbar to populate the board with the standard template
   (17 milestones across 6 streams and 5 phases) — see
   [standard-template-data.md](./standard-template-data.md).
3. **Click** a milestone to edit it (title, role, gate, stream, description, connections).
   **Double-click** an empty spot on the canvas to add a milestone.
4. **Hover** a milestone to reveal its supplier/customer connection lines (they disappear
   when you move away) — see
   [modelling-pane.md](./modelling-pane.md#hover-to-reveal-connections).
5. Switch to the **Admin** view to configure streams, phases, gates, and roles — see
   [admin-settings.md](./admin-settings.md).

## Other scripts

| Command | Does |
|---------|------|
| `npm run dev` | Start the Vite dev server (HMR). |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Serve the production build locally to preview it. |
| `npm run typecheck` | Type-check the project with `vue-tsc` (no emit). |

## Data & persistence

- State is saved to **browser localStorage** under the key `plm:landscape:v1`. Reloading
  the page keeps your work; it is per-browser and per-origin.
- The entire state is one `LandscapeSnapshot` object — the same shape used for **Export**
  (download as `<project>.landscape.json`) and **Import**.
- To start over: **Clear** wipes the canvas, **Load sample** restores the template. Both
  are in the Editor toolbar. (Clearing localStorage for the site also resets everything.)

## Project structure (quick map)

```
src/
├─ pages/        EditorPage.vue, AdminPage.vue
├─ layouts/      MainLayout.vue          (sidebar + view switch)
├─ components/
│  ├─ canvas/    LandscapeCanvas, SwimlaneBackground, L2GateNode, L3MilestoneNode
│  ├─ drawer/    MilestoneDrawer, SipocConnections
│  ├─ toolbar/   EditorToolbar
│  └─ admin/     StreamsAdmin, PhasesAdmin, GatesAdmin, RolesAdmin
├─ stores/       landscape.ts            (Pinia store: state, CRUD, persistence)
├─ composables/  useLayout.ts, useFlowInteractions.ts
├─ types/        landscape.ts            (domain model)
└─ data/         sampleData.ts           (the "Load sample" template)
```

See also: [milestone-data.md](./milestone-data.md),
[modelling-pane.md](./modelling-pane.md), [admin-settings.md](./admin-settings.md),
[standard-template-data.md](./standard-template-data.md).
