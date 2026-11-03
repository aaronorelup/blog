// <ao-series>'s numbers: its table read into rows (a label, its date when the label is YYYY-MM-DD, one value per
// series), the marked days of its <ol>, and how a day, a value and the axis are written.
import { cellNumber, readTable } from '../_lib/table.js';

const dayOf = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
};
// UTC on purpose: the labels are bare dates, and a reader west of UTC must not see them a day early.
// Spelled out by hand because en-GB's short month is "Sept" in some browsers and "Sep" in others.
const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const WEEKDAYS = 'Sun Mon Tue Wed Thu Fri Sat'.split(' ');
export const tickOf = (d) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()];
export const dayName = (r) => (r.date ? WEEKDAYS[r.date.getUTCDay()] + ' ' + tickOf(r.date) : r.label);
export const axisNum = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format;
export const num = (v) => v.toLocaleString('en-US', { maximumFractionDigits: Math.abs(v) < 100 ? 1 : 0 });
export const niceStep = (v) => {
  if (!(v > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const r = v / p;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * p;
};

// { names, units, rows, marks }: marks maps a row's index to the notes on that day. No rows or no series: null.
export function readSeries(el, table) {
  const cells = readTable(table);
  const names = cells.head.slice(1);
  const units = cells.units.slice(1);
  const rows = cells.rows.map((c) => {
    const label = c[0] || '';
    return {
      label,
      date: dayOf(label),
      v: names.map((_, k) => {
        const n = cellNumber(c[k + 1]);
        return Number.isFinite(n) ? n : 0;
      }),
    };
  });
  if (!rows.length || !names.length) return null;
  const marks = new Map();
  const at = new Map(rows.map((r, i) => [r.label, i]));
  for (const li of el.querySelectorAll(':scope > ol > li[data-d]')) {
    const i = at.get(li.dataset.d.trim());
    if (i === undefined) continue;
    if (!marks.has(i)) marks.set(i, []);
    marks.get(i).push(li.textContent.trim());
  }
  return { names, units, rows, marks };
}
