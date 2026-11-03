// <ao-series>: numbers per day (or per any ordered label) drawn as one column each, from a plain <table> that stays
// for screen readers and readers without JS: the first column is the day (YYYY-MM-DD) or a label, every other a
// series. One series at a time with a button each, or stacked; an optional trailing average and marked days.
// Pointing at a day, or the arrow keys, reads it out. Attributes show, avg, stack: docs/COMPONENTS.md. The table is
// read by data.js, drawn by draw.js and read out by read.js; this file builds the chart and holds what is picked.
import { h } from '../_lib/dom.js';
import { readSeries } from './data.js';
import { draw, markStrip, xAxis } from './draw.js';
import { read } from './read.js';

const KEYS = { ArrowRight: 1, ArrowLeft: -1, PageDown: 7, PageUp: -7 };

class AoSeries extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    const data = readSeries(this, table);
    if (!data) return;
    this._ready = true;
    const { names, rows, marks } = data;
    const n = rows.length;
    const stack = this.hasAttribute('stack');
    // What is drawn and picked: the series shown, the layers on (stack), the day read out (-1: none).
    const s = { ...data, stack, avgN: Math.max(0, parseInt(this.getAttribute('avg') || '0', 10)),
      shown: Math.max(0, names.indexOf(this.getAttribute('show') || '')), on: names.map(() => true), active: -1 };

    const chart = h('div', { class: 'ao-series-chart' });
    const top = h('div', { class: 'ao-series-top', role: 'group', 'aria-label': stack ? 'Layers shown' : 'Series shown' });
    const buttons = names.map((name, k) => {
      const b = h('button', { type: 'button', text: name, class: stack && 'ao-series-key ao-series-s' + (k % 4), onclick: () => {
        if (stack) {
          if (s.on[k] && s.on.filter(Boolean).length === 1) return; // keep one layer
          s.on[k] = !s.on[k];
        } else s.shown = k;
        redraw();
        readOut();
      } });
      top.append(b);
      return b;
    });
    if (names.length > 1 || stack) chart.append(top);

    const body = h('div', { class: 'ao-series-body' });
    const plot = h('div', { class: 'ao-series-plot', tabindex: '0', role: 'group', 'aria-roledescription': 'chart',
      'aria-label': (stack ? names.join(', ') : names.join(' / ')) + ', ' + n + ' days. Arrow keys move between days.' });
    const grid = h('div', { class: 'ao-series-grids', 'aria-hidden': 'true' });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + n + ' 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const hl = h('div', { class: 'ao-series-hl' });
    hl.style.width = 100 / n + '%';
    plot.append(grid, svg, hl);
    const { strip, dots } = markStrip(marks, n);
    body.append(plot, xAxis(rows));
    if (marks.size) body.append(strip);
    chart.append(body);
    const out = h('p', { class: 'ao-series-read', 'aria-live': 'polite' });
    chart.append(out);

    const redraw = () => {
      buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(stack ? s.on[k] : k === s.shown)));
      draw(s, { grid, svg });
    };
    const readOut = () => read(s, { out, hl, dots });
    const pick = (i) => {
      s.active = i < 0 ? -1 : Math.max(0, Math.min(n - 1, i));
      readOut();
    };
    const fromPointer = (e) => {
      const box = plot.getBoundingClientRect();
      pick(Math.floor(((e.clientX - box.left) / box.width) * n));
    };
    body.addEventListener('pointermove', fromPointer);
    body.addEventListener('pointerdown', fromPointer);
    body.addEventListener('pointerleave', () => { if (document.activeElement !== plot) pick(-1); });
    plot.addEventListener('focus', () => { if (s.active < 0) pick(n - 1); });
    plot.addEventListener('blur', () => pick(-1));
    plot.addEventListener('keydown', (e) => {
      const d = KEYS[e.key];
      const to = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : d ? (s.active < 0 ? n - 1 : s.active + d) : null;
      if (to === null) return;
      e.preventDefault();
      pick(to);
    });

    redraw();
    readOut();
    table.classList.add('ao-series-table', 'visually-hidden');
    table.before(chart);
    this.classList.add('ao-series-ready');
  }
}

customElements.define('ao-series', AoSeries);
