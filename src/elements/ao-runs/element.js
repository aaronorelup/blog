// <ao-runs>: when each agent of a run (a workflow, a fleet, a night of scheduled jobs) started and stopped, on one
// clock: a lane per phase, in the order phases first appear, with agents that overlap inside a phase stacked. Drawn
// from a <table> (label, phase, start, end), which stays for screen readers; pointing at a bar, or the arrow keys,
// names the agent and its length. Times and the start/end attributes: docs/COMPONENTS.md.
import { h } from '../_lib/dom.js';
import { readTable } from '../_lib/table.js';
import { parseTime } from '../_lib/time.js';

const runSpan = (s) => {
  s = Math.round(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? h + ' h ' + String(m).padStart(2, '0') + ' min' : m ? m + ' min ' + x + ' s' : x + ' s';
};
class AoRuns extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    const { rows } = readTable(table);
    // HH:MM and m:ss look alike. The table is on a clock when any start is HH:MM:SS, or when
    // the element has a start= attribute; otherwise two-part times are m:ss from the start.
    const clock = this.hasAttribute('start') || rows.some((c) => (c[2] || '').split(':').length === 3);
    const parse = (v) => {
      const p = String(v || '').trim().split(':');
      if (clock && p.length === 2) return parseTime(v) * 60;
      return parseTime(v);
    };
    const runs = [];
    for (const c of rows) {
      const s = parse(c[2]), e = parse(c[3]);
      if (!isFinite(s) || !isFinite(e) || e < s) continue;
      runs.push({ label: c[0], phase: c[1] || '', s, e, raw: [c[2], c[3]] });
    }
    if (!runs.length) return;
    this._ready = true;
    let t0 = Math.min(...runs.map((r) => r.s)), t1 = Math.max(...runs.map((r) => r.e));
    if (this.hasAttribute('start')) t0 = Math.min(t0, parse(this.getAttribute('start')));
    if (this.hasAttribute('end')) t1 = Math.max(t1, parse(this.getAttribute('end')));
    const span = Math.max(1, t1 - t0);
    const pct = (t) => ((t - t0) / span) * 100;
    const fmt = (t) => {
      if (!clock) return runSpan(t - t0).replace(' 0 s', '');
      const h = Math.floor(t / 3600) % 24, m = Math.floor((t % 3600) / 60);
      return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    };

    const phases = [];
    for (const r of runs) if (!phases.includes(r.phase)) phases.push(r.phase);

    const chart = h('div', { class: 'ao-runs-chart' });
    chart.append(h('p', { class: 'ao-runs-sum', text: runs.length + (runs.length === 1 ? ' agent' : ' agents') +
      (phases.length > 1 ? ' · ' + phases.length + ' phases' : '') + ' · ' + runSpan(span) }));

    // Axis ticks at a round step that gives four to eight marks.
    const steps = [60, 120, 300, 600, 900, 1800, 3600, 7200];
    const step = steps.find((st) => span / st <= 8) || 7200;
    const ticks = h('div', { class: 'ao-runs-axis' });
    for (let t = Math.ceil(t0 / step) * step; t <= t1; t += step) {
      const k = h('span', { class: 'ao-runs-tick', text: fmt(t) });
      k.style.left = pct(t) + '%';
      ticks.append(k);
    }
    chart.append(h('div', { class: 'ao-runs-row ao-runs-axisrow' }, h('span', { class: 'ao-runs-lane' }), ticks));

    const bars = [];
    phases.forEach((ph, pi) => {
      const mine = runs.filter((r) => r.phase === ph).sort((a, z) => a.s - z.s || a.e - z.e);
      // Greedy packing: each agent takes the first sub-row that is free when it starts.
      const ends = [];
      for (const r of mine) {
        let k = ends.findIndex((e) => e <= r.s + 0.5);
        if (k < 0) { k = ends.length; ends.push(0); }
        ends[k] = r.e;
        r.slot = k;
      }
      const from = Math.min(...mine.map((r) => r.s)), to = Math.max(...mine.map((r) => r.e));
      const lane = h('span', { class: 'ao-runs-lane' },
        h('b', { text: ph || '—' }), h('span', { text: mine.length + ' · ' + runSpan(to - from) }));
      const track = h('div', { class: 'ao-runs-track ao-runs-c' + (pi % 2) });
      track.style.setProperty('--slots', String(ends.length));
      for (const r of mine) {
        const b = h('button', { type: 'button', class: 'ao-runs-bar', tabindex: '-1',
          'aria-label': r.label + ', ' + (ph ? ph + ', ' : '') + r.raw[0] + ' to ' + r.raw[1] + ', ' + runSpan(r.e - r.s) });
        b.style.left = pct(r.s) + '%';
        b.style.width = Math.max(0.35, pct(r.e) - pct(r.s)) + '%';
        b.style.setProperty('--slot', String(r.slot));
        r.b = b;
        track.append(b);
        bars.push(r);
      }
      chart.append(h('div', { class: 'ao-runs-row' }, lane, track));
    });

    const idle = 'Point at a bar, or focus the chart and use the arrow keys, to name an agent.';
    const read = h('p', { class: 'ao-runs-read', 'aria-live': 'polite', text: idle });
    chart.append(read);

    bars.sort((a, z) => a.s - z.s || a.e - z.e);
    let on = null;
    const pick = (r) => {
      if (on) on.b.classList.remove('is-on');
      on = r;
      if (!r) { read.textContent = idle; return; }
      r.b.classList.add('is-on');
      read.textContent = '';
      read.append(h('b', { text: r.label }), ' ' + (r.phase ? r.phase + ' · ' : '') + r.raw[0] + '–' + r.raw[1] + ' · ' + runSpan(r.e - r.s));
    };
    bars[0].b.tabIndex = 0;
    bars.forEach((r, i) => {
      r.b.addEventListener('pointerenter', () => pick(r));
      r.b.addEventListener('focus', () => {
        for (const o of bars) o.b.tabIndex = o === r ? 0 : -1;
        pick(r);
      });
      r.b.addEventListener('click', () => pick(r));
      r.b.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        const j = e.key === 'Home' ? 0 : e.key === 'End' ? bars.length - 1 : d ? i + d : -1;
        if (j < 0 || j >= bars.length) return;
        e.preventDefault();
        bars[j].b.focus();
      });
    });
    chart.addEventListener('pointerleave', () => { if (!chart.contains(document.activeElement)) pick(null); });

    table.classList.add('ao-runs-table', 'visually-hidden');
    table.before(chart);
    this.classList.add('ao-runs-ready');
  }
}

customElements.define('ao-runs', AoRuns);
