# Standard Template Data

The **"Load sample"** action (Editor toolbar) replaces the current landscape with a
representative slice of the DB Netze "Projektlandkarte". The template is built in code by
`buildSample()` in [`src/data/sampleData.ts`](../src/data/sampleData.ts), which returns a
complete `LandscapeSnapshot`. (UUIDs are generated fresh on every load, so the ids below
are not fixed values.)

Project name: **"Großprojekt Beispiel (BUV)"**.

---

## Phases (5, X-axis columns)

In order: `Idee` → `Definition` → `Planung` → `Realisierung` → `Abschluss`.

## L2 Gates (5, one closing each phase)

Each gate is placed at the right boundary of its phase (`phaseLeftX(j+1)`).

| # | Title | Closes phase |
|---|-------|--------------|
| 1 | Projekt ist beauftragt | Idee |
| 2 | Parlamentarische Befassung abgeschlossen (BUV) | Definition |
| 3 | Planrecht hat Bestandskraft | Planung |
| 4 | Inbetriebnahme erfolgt | Realisierung |
| 5 | Projektabschluss | Abschluss |

## Streams (6, Y-axis rows)

In order: `Netzkonzeption`, `Projektmanagement`, `Finanzierungs-/Kostenmanagement`,
`Technische Planung`, `Qualitäts-/Risikomanagement`, `Baudurchführung`.

## Roles (6, name + color)

| Role | Color |
|------|-------|
| Projektleiter technisch | `#D32F2F` (red) |
| Projektleiter kaufm. | `#212121` (near-black) |
| Auftraggeber intern | `#90A4AE` (blue-grey) |
| Einkauf / Beschaffung | `#1565C0` (blue) |
| Zentrales Qualitätsmanagement | `#00897B` (teal) |
| IBV | `#F9A825` (amber) |

---

## L3 Milestones (17)

Numbered in creation order (`displayNumber`). Phase is **derived** from each milestone's
`x` (offset within its phase column); the table lists the phase its `x` falls in.

| # | Title | Owning role | Stream | Phase |
|---|-------|-------------|--------|-------|
| 001 | Neue Maßnahme zur Aufnahme ins Programm | Auftraggeber intern | Netzkonzeption | Idee |
| 002 | Vorplanungsheft beim EBA(F) vorgelegt | Projektleiter technisch | Netzkonzeption | Definition |
| 003 | Projektauftrag erteilt | Projektleiter kaufm. | Projektmanagement | Idee |
| 004 | Stakeholder-Analyse durchgeführt | Projektleiter technisch | Projektmanagement | Definition |
| 005 | Offenlage erfolgt | Projektleiter technisch | Projektmanagement | Planung |
| 006 | Funktionsträger ernannt | Projektleiter kaufm. | Projektmanagement | Realisierung |
| 007 | Projekt in SAP angelegt | Auftraggeber intern | Finanzierungs-/Kostenmanagement | Idee |
| 008 | GWP ermittelt | Projektleiter kaufm. | Finanzierungs-/Kostenmanagement | Definition |
| 009 | FinVe(n) abgeschlossen | Einkauf / Beschaffung | Finanzierungs-/Kostenmanagement | Realisierung |
| 010 | Planungsauftaktveranstaltung durchgeführt | Projektleiter technisch | Technische Planung | Planung |
| 011 | Entwurfsplanung erstellt und geprüft | Projektleiter technisch | Technische Planung | Planung |
| 012 | Ausschreibungsunterlagen Bau veröffentlicht | Einkauf / Beschaffung | Technische Planung | Realisierung |
| 013 | QG Planungsauftrag erfolgreich | Zentrales Qualitätsmanagement | Qualitäts-/Risikomanagement | Idee |
| 014 | Risikomanagement etabliert | Zentrales Qualitätsmanagement | Qualitäts-/Risikomanagement | Definition |
| 015 | QG Vorbereitung Vergabe Hauptaufträge | Zentrales Qualitätsmanagement | Qualitäts-/Risikomanagement | Realisierung |
| 016 | Baubeginn erfolgt | IBV | Baudurchführung | Realisierung |
| 017 | Fertigstellung gemeldet | Projektleiter technisch | Baudurchführung | Abschluss |

### Milestones with a `description` (SIPOC "Process")

| # | Description |
|---|-------------|
| 004 | Analyse aller relevanten Stakeholder inkl. Kommunikationskonzept. |
| 008 | Gesamtwirtschaftlichkeitsprüfung ermittelt. |
| 011 | Entwurfsplanung für die Genehmigungsplanung erstellt und geprüft. |

All other milestones start with an empty description.

---

## Seeded connections (3)

All three are `successor` links (this milestone supplies the target) with dependency type
`FS` (Finish → Start):

| From | → To | Direction | Type |
|------|------|-----------|------|
| 004 Stakeholder-Analyse durchgeführt | 005 Offenlage erfolgt | successor | FS |
| 008 GWP ermittelt | 009 FinVe(n) abgeschlossen | successor | FS |
| 011 Entwurfsplanung erstellt und geprüft | 012 Ausschreibungsunterlagen Bau veröffentlicht | successor | FS |

On the canvas these are visible only when **hovering** the relevant milestone — hovering
004 reveals its line to 005, and hovering 005 reveals the incoming line from 004. See
[modelling-pane.md](./modelling-pane.md#hover-to-reveal-connections).

---

## Loading, clearing, import / export

From the Editor toolbar ([`EditorToolbar.vue`](../src/components/toolbar/EditorToolbar.vue)):

- **Load sample** — replaces the landscape with the data above (asks for confirmation if the canvas isn't empty).
- **Clear** — removes every stream, phase, role, and milestone (confirmation required).
- **Export** — downloads the current `LandscapeSnapshot` as `<project-slug>.landscape.json`.
- **Import** — loads a previously exported JSON file (validated against the schema version).

The same `LandscapeSnapshot` shape is used for the sample, localStorage, and import/export
— see [milestone-data.md](./milestone-data.md#where-milestones-live-in-the-whole-snapshot).
