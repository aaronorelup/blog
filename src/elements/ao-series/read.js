// <ao-series>'s read-out under the chart: the whole range when no day is picked, else the picked day's values, its
// average and its marks. s is the element's state (element.js).
import { h } from '../_lib/dom.js';
import { dayName, num } from './data.js';

const withUnit = (s, v, k) => num(v) + (s.units[k] ? ' ' + s.units[k] : '');

function summary(s) {
  const { names, rows, stack, on, shown } = s;
  const n = rows.length;
  if (stack) {
    const keys = names.map((_, k) => k).filter((k) => on[k]);
    const sums = keys.map((k) => rows.reduce((a, r) => a + r.v[k], 0));
    const all = sums.reduce((a, b) => a + b, 0);
    return [n + ' days', ...keys.map((k, j) => names[k] + ' ' + num(sums[j]) + ' (' + Math.round((sums[j] / (all || 1)) * 100) + '%)')].join(' · ');
  }
  const sum = rows.reduce((a, r) => a + r.v[shown], 0);
  const peak = rows.reduce((m, r, i) => (r.v[shown] > rows[m].v[shown] ? i : m), 0);
  return n + ' days · ' + names[shown] + ' ' + withUnit(s, sum, shown) + ' in all · busiest ' + dayName(rows[peak]) +
    ', ' + withUnit(s, rows[peak].v[shown], shown);
}

export function read(s, { out, hl, dots }) {
  const { names, rows, marks, stack, on, shown, avgN, active } = s;
  out.replaceChildren();
  for (const d of dots.values()) d.classList.remove('is-on');
  if (active < 0) {
    hl.hidden = true;
    out.append(summary(s));
    out.append(h('span', { class: 'ao-series-hint', text: 'Point at a day, or focus the chart and use the arrow keys.' }));
    return;
  }
  const r = rows[active];
  hl.hidden = false;
  hl.style.left = (active / rows.length) * 100 + '%';
  out.append(h('b', { text: dayName(r) }));
  const order = stack ? names.map((_, k) => k).filter((k) => on[k]) : [shown, ...names.map((_, k) => k).filter((k) => k !== shown)];
  for (const k of order) {
    out.append(' · ', h('span', { class: 'ao-series-val' + (stack ? ' ao-series-s' + (k % 4) : k === shown ? ' is-shown' : ''),
      text: names[k] + ' ' + withUnit(s, r.v[k], k) }));
  }
  if (stack) out.append(' · Total ' + num(order.reduce((a, k) => a + r.v[k], 0)));
  if (!stack && avgN > 1 && active >= avgN - 1) {
    let sum = 0;
    for (let j = active - avgN + 1; j <= active; j++) sum += rows[j].v[shown];
    out.append(' · ' + avgN + '-day average ' + withUnit(s, sum / avgN, shown));
  }
  const m = marks.get(active);
  if (m) {
    dots.get(active)?.classList.add('is-on');
    for (const text of m) out.append(h('span', { class: 'ao-series-note', text }));
  }
}
