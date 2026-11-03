// <ao-series>'s drawing: the day labels under the plot, the strip of marked days, and the columns (stacked layers, or
// one series with its trailing average) on a scale of round steps. s is the element's state (element.js).
import { h } from '../_lib/dom.js';
import { axisNum, niceStep, num, tickOf } from './data.js';

export function xAxis(rows) {
  const n = rows.length;
  const xs = h('div', { class: 'ao-series-x', 'aria-hidden': 'true' });
  const ticks = [0];
  rows.forEach((r, i) => { if (i && r.date && r.date.getUTCDate() === 1) ticks.push(i); });
  if (!rows[0].date) for (let i = 1; i < 5; i++) ticks.push(Math.round((i * (n - 1)) / 5));
  ticks.push(n - 1);
  let last = -Infinity;
  ticks.forEach((i, j) => {
    const pct = ((i + 0.5) / n) * 100;
    const end = j === ticks.length - 1;
    if (!end && pct - last < 12) return; // two labels this close would overprint
    if (end && pct - last < 12) {
      // The last day wins over a month label just before it, never over the first label.
      if (xs.children.length > 1) xs.lastChild.remove();
      else return;
    }
    const t = h('span', { text: rows[i].date ? tickOf(rows[i].date) : rows[i].label,
      class: end ? 'is-last' : j === 0 && 'is-first' });
    t.style.left = pct + '%';
    xs.append(t);
    last = pct;
  });
  return xs;
}

// The marked days' dots, and each dot by its row's index.
export function markStrip(marks, n) {
  const strip = h('div', { class: 'ao-series-marks', 'aria-hidden': 'true' });
  const dots = new Map();
  for (const [i, list] of marks) {
    const d = h('span', { class: 'ao-series-mark' + (list.length > 1 ? ' is-many' : '') });
    d.style.left = ((i + 0.5) / n) * 100 + '%';
    strip.append(d);
    dots.set(i, d);
  }
  return { strip, dots };
}

export function draw(s, { grid, svg }) {
  const { names, units, rows, stack, on, shown, avgN } = s;
  const keys = stack ? names.map((_, k) => k).filter((k) => on[k]) : [shown];
  const tot = rows.map((r) => keys.reduce((a, k) => a + Math.max(0, r.v[k]), 0));
  const max = Math.max(...tot, 0);
  const step = niceStep(max / 4);
  const scaleTop = Math.max(step, Math.ceil(max / step) * step);
  grid.replaceChildren();
  for (let g = step; g <= scaleTop + step / 1000; g += step) {
    // "1K MB" reads badly: with a unit, the number is written out.
    const lab = h('span', { text: !stack && units[shown] ? num(g) + ' ' + units[shown] : axisNum(g) });
    const line = h('div', { class: 'ao-series-grid' }, lab);
    line.style.bottom = (g / scaleTop) * 100 + '%';
    grid.append(line);
  }
  const y = (v) => 100 - (v / scaleTop) * 100;
  let html = '';
  if (stack) {
    rows.forEach((r, i) => {
      let base = 0;
      for (const k of keys) {
        const v = Math.max(0, r.v[k]);
        if (!v) continue;
        html += '<rect class="ao-series-s' + (k % 4) + '" x="' + (i + 0.1) + '" width="0.8" y="' + y(base + v) +
          '" height="' + (v / scaleTop) * 100 + '"/>';
        base += v;
      }
    });
  } else {
    const muted = avgN > 1 ? ' ao-series-muted' : '';
    rows.forEach((r, i) => {
      const v = Math.max(0, r.v[shown]);
      if (v) html += '<rect class="ao-series-s0' + muted + '" x="' + (i + 0.1) + '" width="0.8" y="' + y(v) + '" height="' + (v / scaleTop) * 100 + '"/>';
    });
    if (avgN > 1) {
      const pts = rows.map((r, i) => {
        const from = Math.max(0, i - avgN + 1);
        let sum = 0;
        for (let j = from; j <= i; j++) sum += rows[j].v[shown];
        return (i + 0.5) + ',' + y(sum / (i - from + 1));
      });
      html += '<polyline class="ao-series-avg" points="' + pts.join(' ') + '"/>';
    }
  }
  svg.innerHTML = html;
}
