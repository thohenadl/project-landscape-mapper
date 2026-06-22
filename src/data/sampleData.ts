// A representative slice of the DB Netze "Projektlandkarte" used by the
// "Load sample" toolbar action. Builds a complete LandscapeSnapshot directly
// (display numbers assigned here, so it does not go through store.addL3).

import {
  type Connection,
  type L2Milestone,
  type L3Milestone,
  type LandscapeSnapshot,
  type Phase,
  type Role,
  type Stream,
  SCHEMA_VERSION,
} from '@/types/landscape'
import { phaseLeftX } from '@/composables/useLayout'

function uid(): string {
  return crypto.randomUUID()
}

export function buildSample(): LandscapeSnapshot {
  // --- Phases (X columns) ---------------------------------------------------
  const phaseNames = ['Idee', 'Definition', 'Planung', 'Realisierung', 'Abschluss']
  const phases: Phase[] = phaseNames.map((name) => ({ id: uid(), name }))

  // --- L2 gates: one closing each phase (placed at the phase's right edge) ---
  const gateTitles = [
    'Projekt ist beauftragt',
    'Parlamentarische Befassung abgeschlossen (BUV)',
    'Planrecht hat Bestandskraft',
    'Inbetriebnahme erfolgt',
    'Projektabschluss',
  ]
  const gates: L2Milestone[] = gateTitles.map((title, j) => ({
    id: uid(),
    title,
    x: phaseLeftX(j + 1), // right boundary of phase j
  }))

  // --- Streams (Y rows) -----------------------------------------------------
  const streamNames = [
    'Netzkonzeption',
    'Projektmanagement',
    'Finanzierungs-/Kostenmanagement',
    'Technische Planung',
    'Qualitäts-/Risikomanagement',
    'Baudurchführung',
  ]
  const streams: Stream[] = streamNames.map((name) => ({ id: uid(), name }))

  // --- Roles (color only) ---------------------------------------------------
  const roleDefs: { key: string; name: string; color: string }[] = [
    { key: 'plT', name: 'Projektleiter technisch', color: '#D32F2F' },
    { key: 'plK', name: 'Projektleiter kaufm.', color: '#212121' },
    { key: 'agI', name: 'Auftraggeber intern', color: '#90A4AE' },
    { key: 'eink', name: 'Einkauf / Beschaffung', color: '#1565C0' },
    { key: 'qm', name: 'Zentrales Qualitätsmanagement', color: '#00897B' },
    { key: 'ibv', name: 'IBV', color: '#F9A825' },
  ]
  const roles: Role[] = roleDefs.map((r) => ({ id: uid(), name: r.name, color: r.color }))
  const roleId = (key: string): string => roles[roleDefs.findIndex((r) => r.key === key)].id

  const streamId = (i: number): string => streams[i].id
  const gateId = (j: number): string => gates[j].id
  // X within phase j (offset from the phase's left edge), always ≤ that phase's gate.
  const xIn = (j: number, offset = 160): number => phaseLeftX(j) + offset

  // --- L3 milestones --------------------------------------------------------
  let seq = 0
  const l3: L3Milestone[] = []
  function add(input: {
    title: string
    role: string
    stream: number
    phase: number
    offset?: number
    description?: string
    connections?: Connection[]
  }): L3Milestone {
    seq++
    const m: L3Milestone = {
      id: uid(),
      displayNumber: String(seq).padStart(3, '0'),
      title: input.title,
      roleId: roleId(input.role),
      parentL2Id: gateId(input.phase),
      streamId: streamId(input.stream),
      x: xIn(input.phase, input.offset ?? 160),
      description: input.description ?? '',
      connections: input.connections ?? [],
    }
    l3.push(m)
    return m
  }

  // Netzkonzeption
  add({ title: 'Neue Maßnahme zur Aufnahme ins Programm', role: 'agI', stream: 0, phase: 0, offset: 90 })
  add({ title: 'Vorplanungsheft beim EBA(F) vorgelegt', role: 'plT', stream: 0, phase: 1, offset: 200 })

  // Projektmanagement
  add({ title: 'Projektauftrag erteilt', role: 'plK', stream: 1, phase: 0, offset: 220 })
  const stakeholder = add({
    title: 'Stakeholder-Analyse durchgeführt',
    role: 'plT',
    stream: 1,
    phase: 1,
    offset: 120,
    description: 'Analyse aller relevanten Stakeholder inkl. Kommunikationskonzept.',
  })
  const offenlage = add({ title: 'Offenlage erfolgt', role: 'plT', stream: 1, phase: 2, offset: 110 })
  add({ title: 'Funktionsträger ernannt', role: 'plK', stream: 1, phase: 3, offset: 150 })

  // Finanzierungs-/Kostenmanagement
  add({ title: 'Projekt in SAP angelegt', role: 'agI', stream: 2, phase: 0, offset: 150 })
  const gwp = add({
    title: 'GWP ermittelt',
    role: 'plK',
    stream: 2,
    phase: 1,
    offset: 230,
    description: 'Gesamtwirtschaftlichkeitsprüfung ermittelt.',
  })
  const finve = add({ title: 'FinVe(n) abgeschlossen', role: 'eink', stream: 2, phase: 3, offset: 120 })

  // Technische Planung
  add({ title: 'Planungsauftaktveranstaltung durchgeführt', role: 'plT', stream: 3, phase: 2, offset: 60 })
  const entwurf = add({
    title: 'Entwurfsplanung erstellt und geprüft',
    role: 'plT',
    stream: 3,
    phase: 2,
    offset: 230,
    description: 'Entwurfsplanung für die Genehmigungsplanung erstellt und geprüft.',
  })
  const ausschreibung = add({
    title: 'Ausschreibungsunterlagen Bau veröffentlicht',
    role: 'eink',
    stream: 3,
    phase: 3,
    offset: 170,
  })

  // Qualitäts-/Risikomanagement
  add({ title: 'QG Planungsauftrag erfolgreich', role: 'qm', stream: 4, phase: 0, offset: 130 })
  add({ title: 'Risikomanagement etabliert', role: 'qm', stream: 4, phase: 1, offset: 170 })
  add({ title: 'QG Vorbereitung Vergabe Hauptaufträge', role: 'qm', stream: 4, phase: 3, offset: 100 })

  // Baudurchführung
  add({ title: 'Baubeginn erfolgt', role: 'ibv', stream: 5, phase: 3, offset: 200 })
  add({ title: 'Fertigstellung gemeldet', role: 'plT', stream: 5, phase: 4, offset: 140 })

  // --- A few predecessor/successor connections -----------------------------
  stakeholder.connections.push({
    targetMilestoneId: offenlage.id,
    direction: 'successor',
    dependencyType: 'FS',
  })
  gwp.connections.push({
    targetMilestoneId: finve.id,
    direction: 'successor',
    dependencyType: 'FS',
  })
  entwurf.connections.push({
    targetMilestoneId: ausschreibung.id,
    direction: 'successor',
    dependencyType: 'FS',
  })

  return {
    schemaVersion: SCHEMA_VERSION,
    project: { id: uid(), name: 'Großprojekt Beispiel (BUV)' },
    phases,
    streams,
    roles,
    l2: gates,
    l3,
    nextDisplayNumber: seq + 1,
  }
}
