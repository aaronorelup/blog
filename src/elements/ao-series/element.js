// <ao-series>: numbers per day (or per any ordered label) drawn as one column each, from a plain <table> that stays
// for screen readers and readers without JS: the first column is the day (YYYY-MM-DD) or a label, every other a
// series. One series at a time with a button each, or stacked; an optional trailing average and marked days.
// Pointing at a day, or the arrow keys, reads it out. Attributes show, avg, stack: docs/COMPONENTS.md.
import { h } from '../_lib/dom.js';
import { cellNumber, readTable } from '../_lib/table.js';

const seriesDay = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
};
// UTC on purpose: the labels are bare dates, and a reader west of UTC must not see them a day early.
// Spelled out by hand because en-GB's short month is "Sept" in some browsers and "Sep" in others.
const SERIES_MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const SERIES_WEEKDAYS = 'Sun Mon Tue Wed Thu Fri Sat'.split(' ');
const SERIES_TICK = { format: (d) => d.getUTCDate() + ' ' + SERIES_MONTHS[d.getUTCMonth()] };
const SERIES_DAY = { format: (d) => SERIES_WEEKDAYS[d.getUTCDay()] + ' ' + SERIES_TICK.format(d) };
const SERIES_AXIS = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const seriesNum = (v) => v.toLocaleString('en-US', { maximumFractionDigits: Math.abs(v) < 100 ? 1 : 0 });
const niceStep = (v) => {
  if (!(v > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const r = v / p;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * p;
};
class AoSeries extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    const cells = readTable(table);
    const names = cells.head.slice(1);
    const units = cells.units.slice(1);
    const rows = cells.rows.map((c) => {
      const label = c[0] || '';
      return {
        label,
        date: seriesDay(label),
        v: names.map((_, k) => {
          const n = cellNumber(c[k + 1]);
          return Number.isFinite(n) ? n : 0;
        }),
      };
    });
    if (!rows.length || !names.length) return;
    this._ready = true;
    const n = rows.length;
    const stack = this.hasAttribute('stack');
    const avgN = Math.max(0, parseInt(this.getAttribute('avg') || '0', 10));
    const dayName = (r) => (r.date ? SERIES_DAY.format(r.date) : r.label);
    const withUnit = (v, k) => seriesNum(v) + (units[k] ? ' ' + units[k] : '');

    const marks = new Map(); // row index -> the marks on that day
    const at = new Map(rows.map((r, i) => [r.label, i]));
    for (const li of this.querySelectorAll(':scope > ol > li[data-d]')) {
      const i = at.get(li.dataset.d.trim());
      if (i === undefined) continue;
      if (!marks.has(i)) marks.set(i, []);
      marks.get(i).push(li.textContent.trim());
    }

    let shown = Math.max(0, names.indexOf(this.getAttribute('show') || ''));
    const on = names.map(() => true); // stack mode: which layers are drawn
    let active = -1;

    const chart = h('div', { class: 'ao-series-chart' });
    const top = h('div', { class: 'ao-series-top', role: 'group', 'aria-label': stack ? 'Layers shown' : 'Series shown' });
    const buttons = names.map((name, k) => {
      const b = h('button', { type: 'button', text: name, class: stack && 'ao-series-key ao-series-s' + (k % 4), onclick: () => {
        if (stack) {
          if (on[k] && on.filter(Boolean).length === 1) return; // keep one layer
          on[k] = !on[k];
        } else shown = k;
        draw();
        read();
      } });
      top.append(b);
      return b;
    });
    if (names.length > 1 || stack) chart.append(top);

    const body = h('div', { class: 'ao-series-body' });
    const plot = h('div', { class: 'ao-series-plot', tabindex: '0', role: 'group', 'aria-roledescription': 'chart',
      'aria-label': (stack ? names.join(', ') : names.join(' / ')) + ', ' + n + ' days. Arrow keys move between days.' });
    const grid = h('div', { class: 'ao-series-grids', 'aria-hidden': 'true' });
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + n + ' 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const hl = h('div', { class: 'ao-series-hl' });
    hl.style.width = 100 / n + '%';
    plot.append(grid, svg, hl);

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
      const t = h('span', { text: rows[i].date ? SERIES_TICK.format(rows[i].date) : rows[i].label,
        class: end ? 'is-last' : j === 0 && 'is-first' });
      t.style.left = pct + '%';
      xs.append(t);
      last = pct;
    });

    const strip = h('div', { class: 'ao-series-marks', 'aria-hidden': 'true' });
    const dots = new Map();
    for (const [i, list] of marks) {
      const d = h('span', { class: 'ao-series-mark' + (list.length > 1 ? ' is-many' : '') });
      d.style.left = ((i + 0.5) / n) * 100 + '%';
      strip.append(d);
      dots.set(i, d);
    }
    body.append(plot, xs);
    if (marks.size) body.append(strip);
    chart.append(body);

    const out = h('p', { class: 'ao-series-read', 'aria-live': 'polite' });
    chart.append(out);

    let scaleTop = 1;
    const draw = () => {
      buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(stack ? on[k] : k === shown)));
      const keys = stack ? names.map((_, k) => k).filter((k) => on[k]) : [shown];
      const tot = rows.map((r) => keys.reduce((a, k) => a + Math.max(0, r.v[k]), 0));
      const max = Math.max(...tot, 0);
      const step = niceStep(max / 4);
      scaleTop = Math.max(step, Math.ceil(max / step) * step);
      grid.replaceChildren();
      for (let g = step; g <= scaleTop + step / 1000; g += step) {
        // "1K MB" reads badly: with a unit, the number is written out.
        const lab = h('span', { text: !stack && units[shown] ? seriesNum(g) + ' ' + units[shown] : SERIES_AXIS.format(g) });
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
            let s = 0;
            for (let j = from; j <= i; j++) s += rows[j].v[shown];
            return (i + 0.5) + ',' + y(s / (i - from + 1));
          });
          html += '<polyline class="ao-series-avg" points="' + pts.join(' ') + '"/>';
        }
      }
      svg.innerHTML = html;
    };

    const summary = () => {
      if (stack) {
        const keys = names.map((_, k) => k).filter((k) => on[k]);
        const sums = keys.map((k) => rows.reduce((a, r) => a + r.v[k], 0));
        const all = sums.reduce((a, b) => a + b, 0);
        return [n + ' days', ...keys.map((k, j) => names[k] + ' ' + seriesNum(sums[j]) + ' (' + Math.round((sums[j] / (all || 1)) * 100) + '%)')].join(' · ');
      }
      const sum = rows.reduce((a, r) => a + r.v[shown], 0);
      const peak = rows.reduce((m, r, i) => (r.v[shown] > rows[m].v[shown] ? i : m), 0);
      return n + ' days · ' + names[shown] + ' ' + withUnit(sum, shown) + ' in all · busiest ' + dayName(rows[peak]) +
        ', ' + withUnit(rows[peak].v[shown], shown);
    };
    const read = () => {
      out.replaceChildren();
      for (const d of dots.values()) d.classList.remove('is-on');
      if (active < 0) {
        hl.hidden = true;
        out.append(summary());
        out.append(h('span', { class: 'ao-series-hint', text: 'Point at a day, or focus the chart and use the arrow keys.' }));
        return;
      }
      const r = rows[active];
      hl.hidden = false;
      hl.style.left = (active / n) * 100 + '%';
      out.append(h('b', { text: dayName(r) }));
      const order = stack ? names.map((_, k) => k).filter((k) => on[k]) : [shown, ...names.map((_, k) => k).filter((k) => k !== shown)];
      for (const k of order) {
        out.append(' · ', h('span', { class: 'ao-series-val' + (stack ? ' ao-series-s' + (k % 4) : k === shown ? ' is-shown' : ''),
          text: names[k] + ' ' + withUnit(r.v[k], k) }));
      }
      if (stack) out.append(' · Total ' + seriesNum(order.reduce((a, k) => a + r.v[k], 0)));
      if (!stack && avgN > 1 && active >= avgN - 1) {
        let s = 0;
        for (let j = active - avgN + 1; j <= active; j++) s += rows[j].v[shown];
        out.append(' · ' + avgN + '-day average ' + withUnit(s / avgN, shown));
      }
      const m = marks.get(active);
      if (m) {
        dots.get(active)?.classList.add('is-on');
        for (const text of m) out.append(h('span', { class: 'ao-series-note', text }));
      }
    };
    const pick = (i) => {
      active = i < 0 ? -1 : Math.max(0, Math.min(n - 1, i));
      read();
    };
    const fromPointer = (e) => {
      const box = plot.getBoundingClientRect();
      pick(Math.floor(((e.clientX - box.left) / box.width) * n));
    };
    body.addEventListener('pointermove', fromPointer);
    body.addEventListener('pointerdown', fromPointer);
    body.addEventListener('pointerleave', () => { if (document.activeElement !== plot) pick(-1); });
    plot.addEventListener('focus', () => { if (active < 0) pick(n - 1); });
    plot.addEventListener('blur', () => pick(-1));
    plot.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1, PageDown: 7, PageUp: -7 }[e.key];
      const to = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : d ? (active < 0 ? n - 1 : active + d) : null;
      if (to === null) return;
      e.preventDefault();
      pick(to);
    });

    draw();
    read();
    table.classList.add('ao-series-table', 'visually-hidden');
    table.before(chart);
    this.classList.add('ao-series-ready');
  }
}

customElements.define('ao-series', AoSeries);
