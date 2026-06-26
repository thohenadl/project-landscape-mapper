// Pure calendar math for the timeline. The project's `startDate` (ISO 'YYYY-MM-DD')
// anchors month 0; everything else is expressed as a month offset from there. Uses the
// native Date only (no date library) and treats dates as calendar dates, not instants.

import { PX_PER_MONTH, xFromMonth } from '@/composables/useLayout'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Parse an ISO 'YYYY-MM-DD' into year/month(0-based)/day, defaulting safely. */
function parts(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = (iso || '').split('-').map((n) => parseInt(n, 10))
  return {
    y: Number.isFinite(y) ? y : 2026,
    m: Number.isFinite(m) ? m - 1 : 0,
    d: Number.isFinite(d) ? d : 1,
  }
}

/** ISO 'YYYY-MM-DD' for the first of the month `n` months after `startISO`. */
export function addMonths(startISO: string, n: number): string {
  const { y, m } = parts(startISO)
  const total = y * 12 + m + n
  const yy = Math.floor(total / 12)
  const mm = total % 12
  return `${String(yy).padStart(4, '0')}-${String(mm + 1).padStart(2, '0')}-01`
}

/** Short label like 'Jan 26' for the month `index` months after the start. */
export function monthLabel(startISO: string, index: number): string {
  const { y, m } = parts(addMonths(startISO, index))
  return `${MONTH_LABELS[m]} ${String(y).slice(-2)}`
}

/** A list of `count` months starting at `startISO`, for rendering the ruler. */
export function monthList(startISO: string, count: number): { index: number; label: string }[] {
  const out: { index: number; label: string }[] = []
  for (let i = 0; i < Math.max(0, Math.ceil(count)); i++) {
    out.push({ index: i, label: monthLabel(startISO, i) })
  }
  return out
}

/** Days in a given calendar month (year, 0-based month). */
function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate()
}

/** Month offset (with day fraction) of `dateISO` from `startISO`. */
export function dateToMonthFraction(startISO: string, dateISO: string): number {
  const s = parts(startISO)
  const d = parts(dateISO)
  const wholeMonths = (d.y - s.y) * 12 + (d.m - s.m)
  const dayFraction = (d.d - 1) / daysInMonth(d.y, d.m)
  return wholeMonths + dayFraction
}

/** Graph X for a calendar date, against the timeline anchored at `startISO`. */
export function xFromDate(startISO: string, dateISO: string): number {
  return xFromMonth(dateToMonthFraction(startISO, dateISO))
}

/** Human-friendly date label, e.g. '14 Mar 2026'. */
export function formatDate(dateISO: string): string {
  const { y, m, d } = parts(dateISO)
  return `${d} ${MONTH_LABELS[m]} ${y}`
}

export { PX_PER_MONTH }
