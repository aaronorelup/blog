// <ao-bars>: a bar chart drawn from a plain <table>, so the numbers are written once and a reader without JS (or
// with a screen reader) still gets the table. The first column labels the rows; every other column is a series,
// named by its <th>, on one shared scale. Cells that aren't numbers draw no bar. Attributes max, unit:
// docs/COMPONENTS.md.
import { h } from '../_lib/dom.js';
import { cellNumber, readTable } from '../_lib/table.js';

class AoBars extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    const { head, rows: cells } = readTable(table);
    const rows = cells.map((c) => ({
      label: c[0] || '',
      values: c.slice(1).map((t) => {
        const n = cellNumber(t);
        return Number.isFinite(n) ? n : null;
      }),
    }));
    if (!rows.length) return;
    this._ready = true;
    const series = Math.max(...rows.map((r) => r.values.length));
    const all = rows.flatMap((r) => r.values).filter((v) => v !== null);
    const max = parseFloat(this.getAttribute('max')) || Math.max(...all, 0) || 1;
    const unit = this.getAttribute('unit') || '';

    const chart = h('div', { class: 'ao-bars-chart', 'aria-hidden': 'true' });
    if (series > 1) {
      const legend = h('div', { class: 'ao-bars-legend' });
      for (let k = 0; k < series; k++) {
        legend.append(h('span', { class: 'ao-bars-key ao-bars-s' + (k % 4), text: head[k + 1] || 'Series ' + (k + 1) }));
      }
      chart.append(legend);
    }
    for (const r of rows) {
      const track = h('div', { class: 'ao-bars-track' });
      r.values.forEach((v, k) => {
        const bar = h('span', { class: 'ao-bars-bar ao-bars-s' + (k % 4) });
        bar.style.setProperty('--w', v === null ? '0' : String(Math.max(0, Math.min(1, v / max))));
        const val = h('span', { class: 'ao-bars-val', text: v === null ? '' : v.toLocaleString('en-US') + (unit ? ' ' + unit : '') });
        track.append(h('div', { class: 'ao-bars-line' }, bar, val));
      });
      chart.append(h('div', { class: 'ao-bars-row' }, h('span', { class: 'ao-bars-label', text: r.label }), track));
    }
    table.classList.add('ao-bars-table', 'visually-hidden');
    table.before(chart);
    this.classList.add('ao-bars-ready');
  }
}

customElements.define('ao-bars', AoBars);
