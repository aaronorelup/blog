// Mode 2 — Reach: a cell's past (everything that can influence it) and future (everything it
// can influence). With "generating" on, sampled tokens feed the next column and open the one
// route back down.
import { key, reach } from '../model.js';
import { h, switchEl, esc } from '../dom.js';

export default function reachMode(app) {
  const st = { sel: null, hover: null, gen: false };
  let ui = {};
  const q = (t) => `<span class="tk">${esc(t)}</span>`;

  function defaultCell() {
    const { L, P } = app.cfg();
    return { l: Math.min(L, Math.floor(L / 2) + 1), p: Math.min(P - 1, Math.floor(P / 2)) };
  }
  const cur = () => st.hover || st.sel;

  const inRange = (c) => { const { L, P } = app.cfg(); return c && c.l >= 1 && c.l <= L && c.p >= 0 && c.p < P; };

  function readout() {
    if (!ui.read) return;
    const c = cur();
    const { L, P, inputs, outputs } = app.cfg();
    if (!c) { ui.read.replaceChildren(h('p', { class: 'read' }, 'Click a cell to see its past and future.')); ui.notes.replaceChildren(); return; }
    const r = reach(L, P, c.l, c.p, st.gen);
    const others = L * P - 1;
    const neither = others - r.pastCount - r.futureCount;
    let html = `<p class="read"><b>Layer ${c.l} at ${q(inputs[c.p])}</b>${st.hover && !(st.sel && st.sel.l === c.l && st.sel.p === c.p) ? ' <span class="note">(hovering)</span>' : ''}</p>`;
    html += `<p class="read"><span class="key past"></span>Can be influenced by <b>${r.pastCount}</b> of the other ${others} points.</p>`;
    html += `<p class="read"><span class="key fut"></span>Can influence <b>${r.futureCount}</b>.</p>`;
    const notes = [];
    if (!st.gen) {
      if (r.past.kv.size || r.future.kv.size) notes.push('Dotted cells in the same layer are linked only through K/V: the keys and values of earlier positions feed its attention, and its own feed later positions’ attention. What attention adds here reaches them one layer up.');
      notes.push((neither
        ? `The ${neither === 1 ? 'cell' : `<b>${neither}</b> cells`} below and to the right of it, or above and to the left, ${neither === 1 ? 'is' : 'are'} in neither cone: information moves only up and to the right.`
        : 'Every other cell is in one of its two cones: information moves only up and to the right.') +
        ' Switch on <b>generating</b> to open the one way down.');
    } else {
      if (r.past.both.size || r.future.both.size) notes.push('Dotted cells in the same layer are linked directly only through K/V. While generating they are also linked in full through a sampled token (gold hatching): up one column, down through the token, then up and to the right.');
      const tp = r.past.token.size, tf = r.future.token.size;
      if (tp || tf) notes.push(`Gold-hatched cells in other layers are linked only through a sampled token: <b>${tp}</b> in its past, <b>${tf}</b> in its future.${c.p < P - 1 ? ` Its way down is the token ${q(outputs[c.p])}, sampled at the top of this column and fed in at the bottom of the next.` : ''}`);
      if (!neither) notes.push('Now every other cell is in one of its two cones.');
      notes.push('That token is the only route back to the bottom: one token, at most about 17 bits for a vocabulary of about 128,000 like Llama 3’s (GPT-2’s 50,257 gives about 16), against thousands of numbers in the residual stream.');
    }
    ui.read.replaceChildren(h('div', { class: 'card', html }));
    ui.notes.replaceChildren(...notes.map((n) => h('p', { class: 'small-print', html: n })));
  }

  const M = {
    id: 'reach', label: 'Reach', short: 'Reach',
    shows: 'A point’s past is everything that can influence it, and its future is everything it can influence.',
    tryThis: 'Click a cell in the middle and count its two cones. Then switch on “generating”.',
    enter(panel) {
      ui = {};
      // a selection can go stale while this mode is off screen (grid edited, deep link)
      if (!inRange(st.sel)) st.sel = defaultCell();
      st.hover = null;
      ui.sw = switchEl({ label: 'Generating', desc: 'Each column’s top output is sampled and fed in as the next column’s input', checked: st.gen, swatch: 'var(--c-tok)',
        onChange: (v) => { st.gen = v; M.paint(); readout(); app.setHash(); app.say(v ? 'Generating: sampled tokens now feed the next column.' : 'Reading a prompt.'); } });
      ui.read = h('div', { 'aria-live': 'polite' });
      ui.notes = h('div', { 'aria-live': 'polite' });
      panel.append(
        h('div', { class: 'sec' }, ui.read, ui.sw),
        h('div', { class: 'sec' }, ui.notes,
          h('p', { class: 'small-print', html: '<span class="key past"></span>past (violet) · <span class="key fut"></span>future (terracotta). A point here is one cell: one layer at one position.' })));
      readout();
    },
    hover(c) { st.hover = c ? { l: c.l, p: c.p } : null; M.paint(); readout(); },
    click(c) {
      st.sel = { l: c.l, p: c.p }; st.hover = null;
      M.paint(); readout(); app.setHash();
      const { L, P } = app.cfg();
      const r = reach(L, P, c.l, c.p, st.gen);
      app.say(`${app.name(c.l, c.p)}: influenced by ${r.pastCount}, influences ${r.futureCount}.`);
    },
    focusCell(c) { st.sel = c; st.hover = null; M.paint(); readout(); app.setHash(); },
    // also runs while this mode is not on screen, when the reader's grid changes
    gridChanged() {
      if (!inRange(st.sel)) st.sel = defaultCell();
      st.hover = null; readout();
    },
    toHash() { return { cell: st.sel ? `${st.sel.l}-${st.sel.p + 1}` : null, gen: st.gen ? '1' : null }; },
    fromHash(p) {
      const c = (p.get('cell') || '').split('-').map(Number);
      if (c.length === 2 && c[0] >= 1 && c[1] >= 1) st.sel = { l: c[0], p: c[1] - 1 };
      st.gen = p.get('gen') === '1';
    },
    paint() {
      const { L, P } = app.cfg();
      let c = cur();
      if (c && !inRange(c)) { st.sel = defaultCell(); st.hover = null; c = st.sel; }
      if (!c) { app.grid.paint({ tokens: st.gen }); return; }
      const r = reach(L, P, c.l, c.p, st.gen);
      const wash = new Map([[key(c.l, c.p), 'self']]);
      const on = [], on2 = [];
      for (const k of r.past.full) wash.set(k, 'past');
      for (const k of r.past.kv) { wash.set(k, 'past-kv'); const [, qq] = k.split(',').map(Number); on.push(`kv:${c.l}:${qq}`, `arc:${c.l}:${qq}:${c.p}`); }
      for (const k of r.past.both) { wash.set(k, 'past-kv past-tok'); const [, qq] = k.split(',').map(Number); on.push(`kv:${c.l}:${qq}`, `arc:${c.l}:${qq}:${c.p}`); }
      for (const k of r.past.token) wash.set(k, 'past-tok');
      for (const k of r.future.full) wash.set(k, 'fut');
      for (const k of r.future.kv) { wash.set(k, 'fut-kv'); const [, rr] = k.split(',').map(Number); on2.push(`att:${c.l}:${rr}`, `arc:${c.l}:${c.p}:${rr}`); }
      for (const k of r.future.both) { wash.set(k, 'fut-kv fut-tok'); const [, rr] = k.split(',').map(Number); on2.push(`att:${c.l}:${rr}`, `arc:${c.l}:${c.p}:${rr}`); }
      for (const k of r.future.token) wash.set(k, 'fut-tok');
      // its own way down (the token sampled at the top of this column) is lit; the other sampled
      // tokens stay drawn faintly, so the dashed gold never boxes in whole columns
      if (st.gen && c.p < P - 1) on.push(`tok:${c.p}`);
      app.grid.paint({ wash, on, on2, tokens: st.gen, quietArcs: P > 6 });
    },
  };
  return M;
}
