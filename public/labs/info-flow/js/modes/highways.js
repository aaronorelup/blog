// Mode 1 — Two highways: what one cell reads, what reads it, and a forward pass played out.
import { key } from '../model.js';
import { h, switchEl, esc } from '../dom.js';

export default function highways(app) {
  const st = { cell: null, pinned: null, res: true, kv: true, playing: false };
  let ui = {};
  let raf = 0, phaseKey = '';

  const q = (t) => `<span class="tk">${esc(t)}</span>`;
  const inRange = (c) => { const { L, P } = app.cfg(); return !!c && c.l >= 1 && c.l <= L && c.p >= 0 && c.p < P; };
  const list = (arr) => arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];

  // Element keys lit for one cell: what it reads (+ itself), and what reads it.
  function sets(l, p) {
    const { L, P } = app.cfg();
    const detail = app.grid.g?.detail;
    const on = [], on2 = [];
    // the residual stream entering this cell
    if (detail && l > 1) on.push(`resU:${l - 1}:${p}`);
    on.push(`res:${l}:${p}`);
    if (l === 1) on.push(`in:${p}`);
    // K/V of this and every earlier position at this layer, each computed from the residual entering layer l there
    for (let qq = 0; qq <= p; qq++) {
      on.push(`kv:${l}:${qq}`, `arc:${l}:${qq}:${p}`);
      if (detail) on.push(`kvb:${l}:${qq}`, `res:${l}:${qq}`);
    }
    on.push(`att:${l}:${p}`);
    if (detail) on.push(`q:${l}:${p}`, `ao:${l}:${p}`, `mr:${l}:${p}`, `mlp:${l}:${p}`, `mo:${l}:${p}`, `resU:${l}:${p}`);
    // what reads it
    if (l < L) { on2.push(`res:${l + 1}:${p}`); if (detail) on2.push(`kvb:${l + 1}:${p}`, `q:${l + 1}:${p}`); }
    else { on2.push(`out:${p}`); if (!detail) on2.push(`resU:${l}:${p}`); }
    for (let r = p + 1; r < P; r++) on2.push(`arc:${l}:${p}:${r}`, `att:${l}:${r}`);
    return { on, on2 };
  }

  function readout() {
    const box = ui.read;
    if (!box) return;
    const c = st.cell;
    if (!c) { box.replaceChildren(stepsCard()); return; }
    const { L, P, inputs, outputs } = app.cfg();
    const { l, p } = c;
    const tok = inputs[p];
    const reads = [];
    reads.push(l === 1
      ? `<span class="c-res">the input token</span> ${q(tok)} (its embedding) from below`
      : `<span class="c-res">the residual stream</span> coming up from layer ${l - 1} at ${q(tok)}`);
    const srcs = inputs.slice(0, p + 1).map(q);
    reads.push(`<span class="c-kv">the K/V</span> of ${list(srcs)} at layer ${l}${p > 0 ? ', each in one hop' : ' (its own; nothing comes before it)'}`);
    const by = [];
    by.push(l < L ? `layer ${l + 1} at ${q(tok)} (<span class="c-res">residual stream</span>)` : `the output at the top, which predicts the next token (${q(outputs[p])})`);
    if (p < P - 1) by.push(`attention at ${list(inputs.slice(p + 1).map(q))} in layer ${l} (<span class="c-kv">its K/V</span>)`);
    box.replaceChildren(h('div', { class: 'card', html:
      `<p class="read"><b>Layer ${l} at ${q(tok)}</b>${st.pinned ? '' : ' <span class="note">(hovering)</span>'}</p>` +
      `<p class="read"><b>Reads</b> ${reads.join('; and ')}.</p>` +
      `<p class="read"><b>Read by</b> ${by.join('; and ')}.${p === P - 1 ? ' No later position exists to read its K/V.' : ''}</p>` }));
  }

  function stepsCard() {
    return h('div', { class: 'card', html:
      `<p class="read"><b>Inside every cell</b></p><p class="pass-now" aria-hidden="true" hidden></p><ol class="steps">` +
      `<li value="1">The incoming <span class="c-res">residual stream</span> gives this position's <span class="c-kv">keys and values</span> (K/V) for this layer.</li>` +
      `<li value="2"><span class="c-att">Attention</span> compares this position's query with the keys of this and every earlier position at this layer, and takes a weighted sum of their values.</li>` +
      `<li value="3">That result is added to the residual stream. The <span class="c-mlp">MLP</span> reads the sum and adds its own output, and the stream rises to the next layer.</li></ol>` +
      `<p class="small-print">Drawn as in standard GPT-style models: attention's output joins the residual stream, then the MLP reads it. janus's thread describes this step more briefly.</p>` });
  }

  // ------------------------------------------------------------------ forward pass animation
  // What each phase of the pass is doing, and which step of "Inside every cell" it is.
  const PHASE_TEXT = [
    'keys and values (K/V) computed from the residual stream',
    'attention reads the K/V of this and every earlier position',
    'attention takes a weighted sum of their values',
    'that sum joins the residual stream; the MLP adds its output; the stream rises',
  ];
  const PHASE_STEP = [0, 1, 1, 2];
  function narrate(li, ph) {
    const card = ui.read?.querySelector('.card');
    if (!card) return;
    const { L } = app.cfg();
    const now = card.querySelector('.pass-now'), ol = card.querySelector('ol.steps');
    const end = li > L;
    now.hidden = false;
    now.textContent = end ? `Done · each position’s top predicts the next token` : `Layer ${li} of ${L} · ${PHASE_TEXT[ph]}`;
    ol.classList.toggle('playing', !end);
    ol.querySelectorAll('li').forEach((e, i) => e.classList.toggle('now', !end && i === PHASE_STEP[ph]));
    // one announcement per layer: the phases change too fast to be read out one by one
    if (end) app.say('Forward pass done: each position’s top predicts the next token.');
    else if (ph === 0) app.say(`Layer ${li} of ${L}: keys and values from the residual stream, then attention reads them, then the MLP, and the stream rises.`);
  }
  function play() {
    if (st.playing) { stop(); return; }
    st.playing = true;
    ui.play.textContent = 'Stop';
    ui.play.setAttribute('aria-pressed', 'true');
    ui.read.replaceChildren(stepsCard());
    const t0 = performance.now();
    phaseKey = '';
    const tick = (now) => {
      if (!st.playing) return;
      const { L } = app.cfg();
      // slow enough on small grids to read the phase line; a 12-layer pass still takes ~16 s
      const per = Math.max(1300, Math.min(2600, 10400 / L));
      const t = now - t0;
      const li = Math.floor(t / per) + 1;
      const u = (t % per) / per;
      if (li > L) {
        if (phaseKey !== 'end') { phaseKey = 'end'; app.grid.clearPulses(); paintPass(L + 1, 0); narrate(L + 1, 0); }
        if (t > L * per + 2200) { stop(); return; }
      } else {
        const ph = u < 0.2 ? 0 : u < 0.5 ? 1 : u < 0.7 ? 2 : 3;
        const pk = li + ':' + ph;
        if (pk !== phaseKey) { phaseKey = pk; startPhase(li, ph); narrate(li, ph); }
        if (!app.reduced) movePulses(ph === 0 ? u / 0.2 : ph === 1 ? (u - 0.2) / 0.3 : ph === 3 ? (u - 0.7) / 0.3 : 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    cancelAnimationFrame(raf);
    const was = st.playing;
    st.playing = false;
    app.grid.clearPulses();
    app.grid.svg.querySelectorAll('.glow-att, .glow-mlp, .glow-kv').forEach((e) => e.classList.remove('glow-att', 'glow-mlp', 'glow-kv'));
    if (ui.play) { ui.play.textContent = 'Play a forward pass'; ui.play.setAttribute('aria-pressed', 'false'); }
    if (was) { M.paint(); readout(); }
  }
  let pulses = [];
  function layerKeys(l, upto) {
    const { P } = app.cfg();
    const detail = app.grid.g?.detail;
    const k = [];
    for (let p = 0; p < P; p++) {
      if (upto >= 0) { k.push(`res:${l}:${p}`, `kv:${l}:${p}`); if (detail) k.push(`kvb:${l}:${p}`); if (l > 1 && detail) k.push(`resU:${l - 1}:${p}`); if (l === 1) k.push(`in:${p}`); }
      if (upto >= 1) for (let q2 = 0; q2 <= p; q2++) k.push(`arc:${l}:${q2}:${p}`);
      if (upto >= 2) { k.push(`att:${l}:${p}`); if (detail) k.push(`q:${l}:${p}`, `ao:${l}:${p}`); }
      if (upto >= 3) { if (detail) k.push(`mr:${l}:${p}`, `mlp:${l}:${p}`, `mo:${l}:${p}`, `resU:${l}:${p}`); }
    }
    return k;
  }
  function paintPass(li, ph) {
    const { L, P } = app.cfg();
    const on = [];
    for (let l = 1; l < Math.min(li, L + 1); l++) on.push(...layerKeys(l, 3));
    if (li <= L) on.push(...layerKeys(li, ph));
    if (li > L) for (let p = 0; p < P; p++) on.push(`out:${p}`, `resU:${L}:${p}`);
    app.grid.paint({ dim: true, on, wash: new Map(), showRes: st.res, showKv: st.kv });
  }
  function startPhase(li, ph) {
    paintPass(li, ph);
    const g = app.grid, { P, L } = app.cfg();
    const detail = g.g?.detail;
    g.clearPulses(); pulses = [];
    g.svg.querySelectorAll('.glow-att, .glow-mlp, .glow-kv').forEach((e) => e.classList.remove('glow-att', 'glow-mlp', 'glow-kv'));
    const add = (k, cls) => { const e = g.pathEl(k); if (e) pulses.push({ e, len: e.getTotalLength(), d: app.reduced ? null : g.dot(cls) }); };
    for (let p = 0; p < P; p++) {
      if (ph === 0) add(detail ? `kvb:${li}:${p}` : `res:${li}:${p}`, 'res');
      if (ph === 1) for (let q2 = 0; q2 <= p; q2++) add(`arc:${li}:${q2}:${p}`, 'kv');
      if (ph === 2) g.el.get(`att:${li}:${p}`)?.classList.add('glow-att');
      if (ph === 3) {
        if (detail) g.el.get(`mlp:${li}:${p}`)?.classList.add('glow-mlp');
        add(detail ? `resU:${li}:${p}` : (li < L ? `res:${li + 1}:${p}` : `resU:${li}:${p}`), 'res');
      }
      if (ph === 1) g.el.get(`kv:${li}:${p}`)?.classList.add('glow-kv');
    }
    movePulses(0);
  }
  function movePulses(u) {
    const e = Math.min(1, Math.max(0, u));
    const s = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
    for (const pl of pulses) {
      if (!pl.d || !pl.e.isConnected) continue;
      const pt = pl.e.getPointAtLength(pl.len * s);
      pl.d.setAttribute('cx', pt.x); pl.d.setAttribute('cy', pt.y);
    }
  }

  // ------------------------------------------------------------------ mode object
  const M = {
    id: 'highways', label: 'Two highways', short: 'Highways',
    shows: 'Every position runs a copy of the same network, and information travels on two highways: the residual stream up each column, and the K/V stream to the right along each layer.',
    tryThis: 'Hover over a cell or tap it: solid lines are what it reads, dashed lines what reads it. Then press Play.',
    enter(panel) {
      ui = {};
      // a selection can go stale while this mode is off screen (grid edited, deep link)
      if (!inRange(st.pinned)) st.pinned = null;
      st.cell = st.pinned;
      ui.play = h('button', { type: 'button', class: 'pill', 'aria-pressed': 'false', onclick: play }, 'Play a forward pass');
      const sw1 = switchEl({ label: 'Residual stream', desc: 'Up each column, through every layer', checked: st.res, swatch: 'var(--c-res)', onChange: (v) => { st.res = v; M.paint(); app.setHash(); } });
      const sw2 = switchEl({ label: 'K/V stream', desc: 'Right along each layer, to this and later positions', checked: st.kv, swatch: 'var(--c-kv)', onChange: (v) => { st.kv = v; M.paint(); app.setHash(); } });
      ui.read = h('div', { 'aria-live': 'polite' });
      panel.append(
        h('div', { class: 'sec' }, h('div', { class: 'row' }, ui.play)),
        h('div', { class: 'sec' }, ui.read,
          h('p', { class: 'small-print', html: 'Nothing flows down a column or to the left. The only way back to the bottom is a sampled token (see <b>Reach</b>).' })),
        h('div', { class: 'sec' }, h('h3', {}, 'Highways'), sw1, sw2));
      readout();
    },
    leave() { stop(); },
    hover(c) {
      if (st.playing) return;
      st.cell = c ? { l: c.l, p: c.p } : st.pinned;
      M.paint(); readout();
    },
    click(c) {
      if (st.playing) stop();
      const same = st.pinned && st.pinned.l === c.l && st.pinned.p === c.p && !c.keyboard;
      st.pinned = same ? null : { l: c.l, p: c.p };
      st.cell = st.pinned || (c.keyboard ? null : { l: c.l, p: c.p });
      M.paint(); readout(); app.setHash();
      if (st.pinned) app.say(`Selected ${app.name(c.l, c.p)}.`);
    },
    focusCell(c) { if (st.playing) return; st.pinned = c; st.cell = c; M.paint(); readout(); app.setHash(); },
    // also runs while this mode is not on screen, when the reader's grid changes
    gridChanged() {
      if (!inRange(st.pinned)) st.pinned = null;
      st.cell = st.pinned;
      if (st.playing) stop();
      readout();
    },
    toHash() { return { cell: st.pinned ? `${st.pinned.l}-${st.pinned.p + 1}` : null, res: st.res ? null : '0', kv: st.kv ? null : '0' }; },
    fromHash(p) {
      const c = (p.get('cell') || '').split('-').map(Number);
      st.pinned = c.length === 2 && c[0] >= 1 && c[1] >= 1 ? { l: c[0], p: c[1] - 1 } : null;
      st.cell = st.pinned;
      st.res = p.get('res') !== '0'; st.kv = p.get('kv') !== '0';
    },
    paint() {
      if (st.playing) return;
      const { L, P } = app.cfg();
      let c = st.cell;
      if (c && (c.l > L || c.p >= P)) c = st.cell = null;
      if (!c) { app.grid.paint({ showRes: st.res, showKv: st.kv, quietArcs: P > 6 }); return; }
      const { on, on2 } = sets(c.l, c.p);
      app.grid.paint({ dim: true, on, on2, wash: new Map([[key(c.l, c.p), 'self']]), showRes: st.res, showKv: st.kv });
    },
  };
  return M;
}
