// Mode 3 — Paths A→B: janus's route count C(m+n, n), every route drawn, and "scale it up".
import { routeCount, unrankRoute, routeString, routeSegments, segmentUsage, bigInfo, crossing, binom } from '../model.js';
import { h, esc, fmt, radios, switchEl, revealIn } from '../dom.js';

const LIST_MAX = 60;
const EX_SMALL = 'Her example needs at least 2 layers and 3 positions: widen the grid with Edit.';
const PRESETS = [
  { n: 1, m: 2, label: '<b>janus’s example</b>: 1 layer up, 2 positions right' },
  { n: 10, m: 10, label: '<b>10 up, 10 right</b>' },
  { n: 12, m: 1024, label: '<b>GPT-2 small</b>: 12 layers, 1,024 positions' },
  { n: 32, m: 8192, label: '<b>Llama 3.1 8B</b>: 32 layers, an 8,192-position window (its full context is 131,072)' },
  { n: 80, m: 131072, label: '<b>Llama 3.1 70B</b>: 80 layers, 131,072 positions (its full context)' },
  { n: 126, m: 1000000, label: '<b>126 layers, a million positions</b> (Llama 3.1 405B’s depth at a 1M context)' },
];

// A count of positions above ten million, said the way a person would: "about 450 million",
// "about 38 billion", and only past a trillion "about 10^14".
function aboutPositions(cr) {
  const v = Number(cr);
  if (v >= 1e12) return `about 10<sup>${Math.round(Math.log10(v))}</sup>`;
  const [unit, word] = v >= 1e9 ? [1e9, 'billion'] : [1e6, 'million'];
  const x = v / unit;
  const r = x >= 100 ? Math.round(x / 10) * 10 : x >= 10 ? Math.round(x) : Math.round(x * 10) / 10;
  if (r >= 1000) return word === 'million' ? 'about 1 billion' : 'about 1 trillion';
  return `about ${r} ${word}`;
}

export default function pathsMode(app) {
  const st = { A: null, B: null, pick: 'A', idx: 0, all: false, view: 'routes', n: 80, m: 131072, showAll: false, fresh: true };
  let ui = {};
  let alt = null;
  const q = (t) => `<span class="tk">${esc(t)}</span>`;

  function example() {
    const { L, P } = app.cfg();
    if (L < 2 || P < 3) return false;
    st.A = { l: 1, p: 0 }; st.B = { l: 2, p: 2 }; st.idx = 0; st.all = false; st.fresh = true;
    return true;
  }
  const nm = () => ({ n: st.B.l - st.A.l, m: st.B.p - st.A.p });
  const count = () => routeCount(st.A, st.B);

  // ------------------------------------------------------------------ routes panel
  function renderRoutes() {
    const { inputs, L, P } = app.cfg();
    // her example needs 2 layers and 3 positions; say so where the button is, not only to a screen reader
    const small = L < 2 || P < 3;
    ui.exNote.hidden = !small;
    ui.exBtn.setAttribute('aria-disabled', small ? 'true' : 'false');
    ui.exBtn.classList.toggle('off', small);
    const { n, m } = nm();
    const N = count();
    ui.aLbl.innerHTML = `<b class="c-route">A</b> · K/V at layer ${st.A.l}, ${q(inputs[st.A.p])}`;
    ui.bLbl.innerHTML = `<b class="c-route">B</b> · attention input at layer ${st.B.l}, ${q(inputs[st.B.p])}`;
    ui.pickSeg.set(st.pick);
    ui.pickHint.textContent = st.pick === 'A' ? 'Pick any cell (or its violet K/V dot) to move A. Keys: arrows, then A or B.' : 'Pick any cell (or its blue attention box) to move B. Keys: arrows, then A or B.';
    if (N === 0) {
      const why = n < 0 && m < 0 ? 'below and to the left of' : n < 0 ? 'below' : 'to the left of';
      ui.count.innerHTML = `<p class="read"><b>No route.</b> B is ${why} A, and information moves only up and to the right.</p>`;
      ui.stepper.hidden = true; ui.list.replaceChildren(); ui.allSw.hidden = true;
      return;
    }
    const f = (k) => `${k}!`;
    let formula = `C(${m + n}, ${n}) = ${f(m + n)} ÷ (${f(m)} × ${f(n)}) = ${fmt(N)}`;
    if (n === 0) formula = `C(${m}, 0) = 1: no layers to climb, so one hop at this layer`;
    ui.count.innerHTML = `<p class="read">Up <b>n = ${n}</b> ${n === 1 ? 'layer' : 'layers'} and right <b>m = ${m}</b> ${m === 1 ? 'position' : 'positions'}, in any order.</p>` +
      `<div class="big">${fmt(N)} ${N === 1 ? 'route' : 'routes'}</div><p class="note mono">${formula}</p>`;
    ui.stepper.hidden = false; ui.allSw.hidden = false;
    st.idx = Math.min(st.idx, N - 1);
    const g = unrankRoute(n, m, st.idx);
    ui.pos.innerHTML = st.all ? `All ${fmt(N)} at once: thicker = used by more routes` : `Route <b>${fmt(st.idx + 1)}</b> of ${fmt(N)}: <span class="mono c-route">${routeString(g)}</span>`;
    ui.prev.disabled = st.all || N < 2; ui.next.disabled = st.all || N < 2;
    ui.allSw.input.checked = st.all;
    // list
    if (N <= LIST_MAX) {
      const items = [];
      for (let k = 0; k < N; k++) {
        const b = h('button', { type: 'button', 'aria-current': !st.all && k === st.idx ? 'true' : 'false', onclick: () => { st.idx = k; st.all = false; st.fresh = true; renderRoutes(); M.paint(); app.setHash(); } },
          h('span', { class: 'i' }, String(k + 1)), routeString(unrankRoute(n, m, k)));
        items.push(h('li', {}, b));
      }
      ui.list.replaceChildren(...items);
      ui.listNote.textContent = '';
    } else {
      ui.list.replaceChildren();
      ui.listNote.textContent = `More than ${LIST_MAX} routes, so they are not listed; step through them, or show them all at once.`;
    }
  }

  // ------------------------------------------------------------------ scale it up
  function bigView() {
    if (!alt) {
      alt = h('div', { class: 'bignum', 'aria-live': 'polite' });
    }
    const { n, m } = st;
    const b = bigInfo(n, m);
    const exact = b.digits <= 15;
    const head = exact ? fmt(b.value.toString()) : `≈ ${b.mantissa.toFixed(2)} × 10<sup>${fmt(b.exp)}</sup>`;
    const shown = st.showAll ? b.str : b.str.slice(0, 160);
    const digits = b.digits > 15
      ? `<div class="bn-digits">${shown}${b.digits > 160 && !st.showAll ? `<span class="more">… (${fmt(b.digits)} digits in all)</span>` : ''}</div>`
      : '';
    const max = Math.max(100, Math.ceil((b.log10 + 10) / 50) * 50);
    const at = (x) => Math.min(100, (x / max) * 100);
    const diff = b.log10 - 80;
    const cmp = diff >= 1 ? `This number is about 10<sup>${Math.floor(diff)}</sup> times larger.`
      : diff > 0 ? 'This number is slightly larger.'
      : diff > -1 ? 'This number is a little smaller.' : `This number is smaller, by a factor of about 10<sup>${Math.ceil(-diff)}</sup>.`;
    const cr = crossing(n);
    const crTxt = cr === null ? '' : cr <= 10000000n
      ? `With ${fmt(n)} ${n === 1 ? 'layer' : 'layers'} to climb, the count passes 10<sup>80</sup> after <b>${fmt(cr.toString())}</b> positions.`
      : `With only ${fmt(n)} ${n === 1 ? 'layer' : 'layers'} to climb, it takes <b>${aboutPositions(cr)}</b> positions to pass 10<sup>80</sup>. Depth is what makes the number explode.`;
    alt.innerHTML =
      `<span class="eyebrow">Routes up ${fmt(n)} ${n === 1 ? 'layer' : 'layers'} and right ${fmt(m)} ${m === 1 ? 'position' : 'positions'}</span>` +
      `<div class="bn-big">${head}</div>` +
      `<p class="bn-sub">C(${fmt(m + n)}, ${fmt(n)}) = (m + n)! ÷ (m! × n!)${exact ? '' : `, a number with <b>${fmt(b.digits)}</b> digits`}.</p>` +
      digits +
      (b.digits > 160 ? `<button type="button" class="linkish" data-act="all">${st.showAll ? 'Show fewer digits' : `Show all ${fmt(b.digits)} digits`}</button>` : '') +
      `<div class="scale" role="img" aria-label="On a scale of powers of ten up to 10^${max}, this number sits at 10^${b.log10.toFixed(0)}; atoms in the observable universe at 10^80.">` +
      `<div class="axis"></div><div class="fill" style="width:${at(b.log10)}%"></div>` +
      `<div class="tick atoms" style="left:${at(80)}%"><span>atoms ≈ 10<sup>80</sup></span></div>` +
      `<div class="tick" style="left:${at(b.log10)}%"><span>this ≈ 10<sup>${b.log10 < 10 ? b.log10.toFixed(2) : b.log10.toFixed(1)}</sup></span></div>` +
      `<span class="lab" style="left:0">1</span><span class="lab" style="right:0">10<sup>${max}</sup></span></div>` +
      `<p class="bn-sub" style="margin-top:22px">Atoms in the observable universe: about 10<sup>80</sup>. ${cmp}</p>` +
      (crTxt ? `<p class="bn-sub">${crTxt}</p>` : '') +
      `<p class="small-print">Not counting the extra routes through the skip connections inside each layer, as janus notes. A route here is an order of n moves up and m moves right, where several rights in one layer are a single attention hop.</p>`;
    alt.querySelector('[data-act="all"]')?.addEventListener('click', () => { st.showAll = !st.showAll; bigView(); });
    return alt;
  }
  function syncScaleInputs() {
    if (!ui.nNum) return;
    ui.nNum.value = st.n; ui.nRange.value = st.n;
    ui.mNum.value = st.m; ui.mRange.value = Math.log10(st.m).toFixed(2);
  }
  function setNM(n, m, from) {
    st.n = Math.max(1, Math.min(200, Math.round(n || 1)));
    st.m = Math.max(1, Math.min(10000000, Math.round(m || 1)));
    st.showAll = false;
    if (from !== 'num') syncScaleInputs();
    else { ui.nRange.value = st.n; ui.mRange.value = Math.log10(st.m).toFixed(2); }
    bigView(); app.setHash();
  }

  // ------------------------------------------------------------------ panel
  function build(panel) {
    ui = {};
    ui.viewSeg = radios({ label: 'View', value: st.view, items: [{ value: 'routes', label: 'Routes on the grid' }, { value: 'scale', label: 'Scale it up' }],
      onChange: (v) => { st.view = v; rebuild(); app.syncStage(); M.paint(); app.setHash(); } });
    panel.append(h('div', { class: 'sec' }, ui.viewSeg));
    ui.body = h('div');
    panel.append(ui.body);
    fill();
  }
  function rebuild() { if (!ui.body) return; ui.body.replaceChildren(); fill(); }
  function fill() {
    const body = ui.body;
    if (st.view === 'scale') {
      ui.nNum = h('input', { type: 'number', min: 1, max: 200, step: 1, 'aria-label': 'Layers to climb, n' });
      ui.nRange = h('input', { type: 'range', min: 1, max: 200, step: 1, 'aria-label': 'Layers to climb, n (slider)' });
      ui.mNum = h('input', { type: 'number', min: 1, max: 10000000, step: 1, 'aria-label': 'Positions to cross, m' });
      ui.mRange = h('input', { type: 'range', min: 0, max: 7, step: 0.01, 'aria-label': 'Positions to cross, m (slider, powers of ten)' });
      ui.nNum.addEventListener('input', () => { if (ui.nNum.value !== '') setNM(+ui.nNum.value, st.m, 'num'); });
      ui.mNum.addEventListener('input', () => { if (ui.mNum.value !== '') setNM(st.n, +ui.mNum.value, 'num'); });
      ui.nNum.addEventListener('change', syncScaleInputs);
      ui.mNum.addEventListener('change', syncScaleInputs);
      ui.nRange.addEventListener('input', () => setNM(+ui.nRange.value, st.m));
      ui.mRange.addEventListener('input', () => {
        const v = Math.pow(10, +ui.mRange.value);
        const r = v < 100 ? Math.round(v) : Math.round(v / Math.pow(10, Math.floor(Math.log10(v)) - 1)) * Math.pow(10, Math.floor(Math.log10(v)) - 1);
        setNM(st.n, r);
      });
      body.append(
        h('div', { class: 'sec' },
          h('div', { class: 'fld' }, h('span', { class: 'fld-l' }, 'Layers to climb (n), 1 to 200'), h('div', { class: 'row' }, ui.nRange, h('span', { style: { width: '84px', flex: '0 0 84px' } }, ui.nNum))),
          h('div', { class: 'fld' }, h('span', { class: 'fld-l' }, 'Positions to cross (m), 1 to 10,000,000'), h('div', { class: 'row' }, ui.mRange, h('span', { style: { width: '108px', flex: '0 0 108px' } }, ui.mNum)))),
        h('div', { class: 'sec' }, h('h3', {}, 'Try a real model'),
          h('div', { class: 'presets' }, ...PRESETS.map((pr) => h('button', { type: 'button', html: pr.label, onclick: () => setNM(pr.n, pr.m) })))),
        h('p', { class: 'small-print' }, 'Computed exactly with whole-number (BigInt) arithmetic in your browser. Model depths and context lengths are from each model’s published configuration.'));
      syncScaleInputs();
      return;
    }
    ui.aLbl = h('span'); ui.bLbl = h('span');
    ui.pickSeg = radios({ label: 'Which point a click sets', value: st.pick, items: [{ value: 'A', label: 'Set A' }, { value: 'B', label: 'Set B' }],
      onChange: (v) => { st.pick = v; renderRoutes(); } });
    ui.pickHint = h('p', { class: 'note' });
    ui.count = h('div', { class: 'card', 'aria-live': 'polite' });
    ui.prev = h('button', { type: 'button', class: 'pill ghost small', 'aria-label': 'Previous route', onclick: () => step(-1) }, '‹ Prev');
    ui.next = h('button', { type: 'button', class: 'pill ghost small', 'aria-label': 'Next route', onclick: () => step(1) }, 'Next ›');
    ui.pos = h('p', { class: 'read', 'aria-live': 'polite' });
    ui.allSw = switchEl({ label: 'All at once', desc: 'Line thickness = how many routes use that step', checked: st.all, onChange: (v) => { st.all = v; st.fresh = true; renderRoutes(); M.paint(); app.setHash(); } });
    ui.stepper = h('div', {}, h('div', { class: 'row' }, ui.prev, ui.next), ui.pos);
    ui.list = h('ol', { class: 'rlist', 'aria-label': 'Every route' });
    ui.listNote = h('p', { class: 'note' });
    body.append(
      h('div', { class: 'sec' },
        h('div', { class: 'row' }, ui.exBtn = h('button', { type: 'button', class: 'pill small', onclick: () => {
          if (example()) { renderRoutes(); M.paint(); app.setHash(); app.say('janus’s example: three routes.'); }
          else { renderRoutes(); app.say(EX_SMALL); } } }, 'janus’s example')),
        ui.exNote = h('p', { class: 'note', hidden: true }, EX_SMALL),
        ui.count, ui.stepper, ui.allSw),
      h('div', { class: 'sec' }, h('h3', {}, 'Move A and B'),
        h('p', { class: 'read' }, ui.aLbl), h('p', { class: 'read' }, ui.bLbl),
        ui.pickSeg, ui.pickHint),
      h('div', { class: 'sec' }, h('h3', {}, 'Every route'), ui.list, ui.listNote),
      h('p', { class: 'small-print', html: 'UP = one layer through the residual stream. RIGHT = one attention read along a layer, any distance; several rights in one layer are a single hop, because what attention reads joins the residual after that layer’s K/V were made, so it must go up before it can be passed on again. Not counting the extra routes through the skip connections inside each layer, as janus notes.' }));
    renderRoutes();
  }
  function step(d) {
    const N = count(); if (N < 2) return;
    st.idx = (st.idx + d + N) % N; st.all = false; st.fresh = true;
    renderRoutes(); M.paint(); app.setHash();
    // scroll the route list (only the list) to the current route
    revealIn(ui.list, ui.list.querySelector('[aria-current="true"]'), { pad: 2 });
  }

  const M = {
    id: 'paths', label: 'Paths A→B', short: 'Paths',
    shows: 'Getting from A to B means going up n layers and right m positions in some order, so janus counts C(m+n, n) routes.',
    tryThis: 'Press “janus’s example” and step through her three routes. Then try “Scale it up”.',
    altView() { return st.view === 'scale' ? bigView() : null; },
    enter(panel) {
      const { L, P } = app.cfg();
      if (!st.A || st.A.l > L || st.A.p >= P || st.B.l > L || st.B.p >= P) {
        if (!example()) { st.A = { l: 1, p: 0 }; st.B = { l: Math.min(2, L), p: P - 1 }; }
      }
      build(panel);
    },
    hover() {},
    click(c) {
      if (st.view !== 'routes') return;
      const which = c.part === 'kv' ? 'A' : c.part === 'att' ? 'B' : st.pick;
      if (which === 'A') { st.A = { l: c.l, p: c.p }; st.pick = 'B'; }
      else { st.B = { l: c.l, p: c.p }; }
      st.idx = 0; st.fresh = true;
      renderRoutes(); M.paint(); app.setHash();
      app.say(`${which} set to ${which === 'A' ? 'the K/V' : 'the attention input'} at ${app.name(c.l, c.p)}. ${count()} routes.`);
    },
    key(e, c) {
      if (st.view !== 'routes') return;
      const k = e.key.toLowerCase();
      if (k === 'a' || k === 'b') { e.preventDefault(); M.click({ ...c, part: k === 'a' ? 'kv' : 'att' }); }
      if (k === '[' || k === ',') step(-1);
      if (k === ']' || k === '.') step(1);
    },
    gridChanged() {
      const { L, P } = app.cfg();
      const clamp = (pt) => ({ l: Math.min(L, pt.l), p: Math.min(P - 1, pt.p) });
      if (st.A) {
        const a = clamp(st.A), b = clamp(st.B);
        if (a.l !== st.A.l || a.p !== st.A.p || b.l !== st.B.l || b.p !== st.B.p) st.idx = 0;
        st.A = a; st.B = b;
      }
      if (ui.count && st.view === 'routes') renderRoutes();
    },
    toHash() {
      if (st.view === 'scale') return { view: 'scale', n: st.n, m: st.m };
      return { a: `${st.A.l}-${st.A.p + 1}`, b: `${st.B.l}-${st.B.p + 1}`, route: st.all ? 'all' : st.idx ? st.idx + 1 : null };
    },
    fromHash(p) {
      st.view = p.get('view') === 'scale' ? 'scale' : 'routes';
      const n = parseInt(p.get('n'), 10), m = parseInt(p.get('m'), 10);
      if (n >= 1 && n <= 200) st.n = n;
      if (m >= 1 && m <= 10000000) st.m = m;
      const pa = (p.get('a') || '').split('-').map(Number), pb = (p.get('b') || '').split('-').map(Number);
      if (pa.length === 2 && pa[0] >= 1 && pa[1] >= 1) st.A = { l: pa[0], p: pa[1] - 1 };
      if (pb.length === 2 && pb[0] >= 1 && pb[1] >= 1) st.B = { l: pb[0], p: pb[1] - 1 };
      if (st.A && !st.B) st.B = { ...st.A };
      if (st.B && !st.A) st.A = { ...st.B };
      const r = p.get('route');
      st.all = r === 'all';
      st.idx = r && r !== 'all' ? Math.max(0, parseInt(r, 10) - 1 || 0) : 0;
    },
    paint() {
      if (st.view !== 'routes' || !st.A) return;
      const { L, P } = app.cfg();
      if (st.A.l > L || st.B.l > L || st.A.p >= P || st.B.p >= P) M.gridChanged();
      const marks = [{ at: 'kv', l: st.A.l, p: st.A.p, text: 'A' }, { at: 'att', l: st.B.l, p: st.B.p, text: 'B', cls: 'b' }];
      const N = count();
      const routes = [];
      if (N > 0) {
        const { n, m } = nm();
        if (st.all) {
          const use = segmentUsage(st.A, st.B);
          let max = 1; for (const v of use.values()) max = Math.max(max, v);
          const fs = app.grid.g?.fs || 13;
          for (const [k, v] of use) {
            const [t, l, a, b] = k.split(':');
            const seg = t === 'hop' ? { t: 'hop', l: +l, from: +a, to: +b } : { t: 'rise', l: +l, p: +a };
            if (seg.t === 'hop' && seg.from === seg.to && !app.grid.g?.detail) continue;
            routes.push({ segs: [seg], width: 1.4 + (fs * 0.55) * (v / max), arrows: false, cls: 'all' });
          }
        } else {
          routes.push({ segs: routeSegments(st.A, unrankRoute(n, m, Math.min(st.idx, N - 1))), draw: st.fresh && !app.reduced });
        }
      }
      st.fresh = false;
      app.grid.paint({ marks, routes, dim: N > 0, on: [`kv:${st.A.l}:${st.A.p}`, `att:${st.B.l}:${st.B.p}`], quietArcs: P > 6 });
    },
  };
  return M;
}
