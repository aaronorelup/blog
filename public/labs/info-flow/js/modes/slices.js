// Mode 4 — Time slices: three legal orders of the same computation, and a schedule the
// reader builds one time step at a time.
import { key, unkey, schedules, inputsOf, fewestSteps } from '../model.js';
import { h, esc, radios, switchEl, revealIn } from '../dom.js';

const WOLFRAM = 'https://www.wolframphysics.org/technical-introduction/the-updating-process-for-string-substitution-systems/foliations-and-coordinates-on-causal-graphs/';

export default function slicesMode(app) {
  const st = {
    show: 'anim', sched: 'diagonal', step: 99, playing: false,
    own: { gen: false, done: new Map(), pending: new Set(), next: 1 }, hint: true,
  };
  let ui = {};
  let timer = 0;
  const q = (t) => `<span class="tk">${esc(t)}</span>`;
  const nameH = (k) => { const [l, p] = unkey(k); return `layer ${l} at ${q(app.cfg().inputs[p])}`; };
  const list = (arr) => arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];

  const INFO = {
    layer: { label: 'Reading a prompt: layer by layer', gen: false,
      text: (L) => `Every position of a layer at once, as a GPU does with a known prompt. ${L} steps: the fewest possible, since each position has to climb its layers in order.` },
    diagonal: { label: 'janus’s diagonal slices', gen: false,
      text: (L, P) => `After her third diagram: the cell at layer l, position p (both counted from 1) runs at step l + p − 1. Legal, because no cell in a slice needs another in the same slice; it takes ${L + P - 1} steps, more than layer by layer’s ${L}, so it is not the fastest order. One way to get it is if the prompt’s tokens arrive one per step and every cell runs as soon as its inputs exist. She notes it assumes inputs don’t wait for sampled outputs, and that it is not the only possible order.` },
    column: { label: 'Generating: column by column', gen: true,
      text: (L, P) => `Each new position waits for the token sampled at the top of the one before it, so the cells run one at a time: ${L} × ${P} = ${L * P} steps.` },
  };
  const total = (s) => { const { L, P } = app.cfg(); return schedules[s].steps(L, P); };
  const stepOf = (s, l, p) => schedules[s].step(l, p, app.cfg().L);

  // ------------------------------------------------------------------ animation
  function choose(s) {
    stopPlay();
    st.show = 'anim'; st.sched = s; st.step = 0;
    renderAnim(); M.paint(); app.setHash();
    play();
  }
  function play() {
    if (st.playing) { stopPlay(); renderAnim(); return; }
    st.show = 'anim';
    if (st.step >= total(st.sched)) st.step = 0;
    st.playing = true;
    const S = total(st.sched);
    const ms = app.reduced ? 900 : Math.max(140, Math.min(720, 6500 / S));
    const tick = () => {
      st.step++;
      renderAnim(); M.paint(); app.setHash();
      if (st.step >= S) { stopPlay(); renderAnim(); app.say(`${INFO[st.sched].label}: done in ${S} steps.`); return; }
      timer = setTimeout(tick, ms);
    };
    timer = setTimeout(tick, st.step === 0 ? 250 : ms);
    renderAnim();
  }
  function stopPlay() { clearTimeout(timer); st.playing = false; }
  function stepBy(d) {
    stopPlay(); st.show = 'anim';
    st.step = Math.max(0, Math.min(total(st.sched), st.step + d));
    renderAnim(); M.paint(); app.setHash();
  }
  function renderAnim() {
    if (!ui.counter) return;
    const { L, P } = app.cfg();
    const S = total(st.sched);
    st.step = Math.min(st.step, S);
    ui.schedBtns.forEach((b) => b.setAttribute('aria-pressed', st.show === 'anim' && b.dataset.s === st.sched ? 'true' : 'false'));
    ui.counter.innerHTML = st.show === 'anim'
      ? `<span class="big">${st.step}</span> <span class="note">of ${S} steps · ${esc(INFO[st.sched].label)}</span>`
      : '<span class="note">Pick a schedule to watch.</span>';
    ui.play.textContent = st.playing ? 'Pause' : st.step >= S && st.show === 'anim' ? 'Replay' : 'Play';
    ui.play.setAttribute('aria-pressed', st.playing ? 'true' : 'false');
    ui.explain.textContent = INFO[st.sched].text(L, P);
    // while the reader builds their own schedule, the paragraph about a watched one is beside the point
    ui.explain.hidden = st.show !== 'anim';
  }

  // ------------------------------------------------------------------ the reader's schedule
  function ownClick(c) {
    stopPlay();
    st.show = 'own';
    const { L, P } = app.cfg();
    const o = st.own;
    const k = key(c.l, c.p);
    renderAnim();
    if (!st.ownSeen) { st.ownSeen = true; revealIn(document.getElementById('panel'), ui.own, { smooth: !app.reduced }); }
    if (o.done.has(k)) { say(`Already computed, in step ${o.done.get(k)}.`); M.paint(); return; }
    if (o.pending.has(k)) { o.pending.delete(k); say(`Removed ${nameH(k)} from step ${o.next}.`); renderOwn(); M.paint(); return; }
    const ins = inputsOf(L, P, c.l, c.p, o.gen);
    const missing = ins.filter((x) => !o.done.has(x));
    if (missing.length) {
      app.grid.shake(c.l, c.p);
      const inStep = missing.filter((x) => o.pending.has(x));
      const tokenK = o.gen && c.l === 1 && c.p > 0 ? key(L, c.p - 1) : null;
      const parts = missing.map((x) => x === tokenK ? `the token sampled at the top of ${q(app.cfg().inputs[c.p - 1])} (${nameH(x)})` : nameH(x));
      let msg = `Not yet: ${nameH(k)} needs ${list(parts)} first.`;
      if (inStep.length === missing.length) msg += ` ${inStep.length === 1 ? 'It is' : 'They are'} in this same step; a cell can only use results from earlier steps.`;
      say(msg, true);
      M.paint();
      return;
    }
    o.pending.add(k);
    say(`Added ${nameH(k)} to step ${o.next}.`);
    renderOwn(); M.paint();
  }
  function runStep() {
    const o = st.own;
    if (!o.pending.size) { say('Choose at least one cell for this step first.', true); return; }
    for (const k of o.pending) o.done.set(k, o.next);
    const n = o.pending.size;
    o.pending.clear();
    say(n === 1 ? `Step ${o.next} ran 1 cell.` : `Step ${o.next} ran ${n} cells at once.`);
    o.next++;
    st.show = 'own';
    renderOwn(); M.paint(); app.setHash();
    if (!ui.run) return;
    const panel = document.getElementById('panel');
    if (!ui.result.hidden) {
      // finished: show (and focus) the comparison, scrolling only the panel
      ui.result.focus({ preventScroll: true });
      revealIn(panel, ui.result, { smooth: !app.reduced });
    } else {
      // the button that ran the step is now disabled or hidden, so focus would fall to the page:
      // put it on the grid, where the reader picks the next cells
      const ae = document.activeElement;
      if (!ae || ae === document.body || ae.disabled || ae.hidden) app.grid.svg.focus({ preventScroll: true });
    }
  }
  function undo() {
    const o = st.own;
    if (o.pending.size) { o.pending.clear(); }
    else if (o.next > 1) { o.next--; for (const [k, s] of [...o.done]) if (s === o.next) o.done.delete(k); }
    st.show = 'own'; say('Undone.'); renderOwn(); M.paint();
  }
  function reset(gen = st.own.gen) {
    st.own = { gen, done: new Map(), pending: new Set(), next: 1 };
    st.show = 'own'; say(''); renderOwn(); M.paint(); app.setHash();
  }
  function say(t, bad) { if (ui.msg) { ui.msg.innerHTML = t; ui.msg.classList.toggle('bad', !!bad); } }
  function syncFloat() {
    const f = ui.float; if (!f) return;
    const o = st.own;
    const show = st.show === 'own' && o.pending.size > 0;
    f.hidden = !show;
    f.textContent = `Run step ${o.next} (${o.pending.size})`;
  }
  function renderOwn() {
    syncFloat();
    if (!ui.run) return;
    renderAnim();
    const { L, P } = app.cfg();
    const o = st.own;
    ui.genSeg.set(o.gen ? 'gen' : 'read');
    const all = L * P, doneN = o.done.size;
    const finished = doneN === all;
    ui.run.textContent = finished ? 'All cells done' : `Run step ${o.next}` + (o.pending.size ? ` (${o.pending.size})` : '');
    ui.run.disabled = finished || !o.pending.size;
    ui.undo.disabled = !o.pending.size && o.next === 1;
    ui.status.innerHTML = finished ? '' : `<span class="note">${doneN} of ${all} cells computed${o.pending.size ? ` · ${o.pending.size} chosen for step ${o.next}` : ''}.</span>`;
    if (finished) {
      const used = o.next - 1;
      const best = fewestSteps(L, P, o.gen);
      ui.result.hidden = false;
      ui.result.innerHTML =
        `<p class="read"><b>Done in ${used} ${used === 1 ? 'step' : 'steps'}.</b> ${used === best ? 'That is the fewest possible.' : ''}</p>` +
        (o.gen
          ? `<p class="read">Column by column: ${L * P} (the only order while generating). Layer by layer (${L}) and the diagonal (${L + P - 1}) only work when the input tokens are already known, not sampled by the model one at a time.</p>`
          : `<p class="read">Layer by layer: ${L} · diagonal: ${L + P - 1} · column by column: ${L * P}.</p>`) +
        `<p class="small-print">${o.gen
          ? `While generating, the fewest possible is ${best}: each column waits for the token from the one before, and inside a column the layers run in order.`
          : `While reading a prompt, the fewest possible is ${best}: each position has to climb its ${L} layers in order, and every position of a layer can run at once.`}</p>`;
    } else ui.result.hidden = true;
  }

  // ------------------------------------------------------------------ mode
  const M = {
    id: 'slices', label: 'Time slices', short: 'Time', detail: 'off',
    shows: 'The computation is a causal graph, and a time slice is a set of cells that can run at once; more than one slicing is legal.',
    tryThis: 'Watch the three schedules, then build your own: click cells into a step, press “Run step”, and finish in as few steps as you can.',
    enter(panel) {
      ui = {};
      M.gridChanged();
      ui.schedBtns = Object.keys(INFO).map((s) => h('button', { type: 'button', class: 'pill ghost small', 'data-s': s, 'aria-pressed': 'false', style: { justifyContent: 'flex-start' }, onclick: () => choose(s) },
        `${INFO[s].label} · ${total(s)} steps`));
      ui.counter = h('p', { class: 'read', 'aria-live': 'polite' });
      ui.play = h('button', { type: 'button', class: 'pill small', onclick: () => { if (st.show !== 'anim') { st.show = 'anim'; st.step = 0; } play(); } }, 'Play');
      ui.explain = h('p', { class: 'small-print' });
      ui.genSeg = radios({ label: 'Situation', value: st.own.gen ? 'gen' : 'read', items: [{ value: 'read', label: 'Reading a prompt' }, { value: 'gen', label: 'Generating' }],
        onChange: (v) => reset(v === 'gen') });
      ui.run = h('button', { type: 'button', class: 'pill small', onclick: runStep }, 'Run step 1');
      ui.undo = h('button', { type: 'button', class: 'pill ghost small', onclick: undo }, 'Undo');
      ui.reset = h('button', { type: 'button', class: 'pill ghost small', onclick: () => reset() }, 'Start over');
      ui.msg = h('p', { class: 'msg', 'aria-live': 'polite' });
      ui.status = h('p', { class: 'read' });
      ui.result = h('div', { class: 'card', hidden: true, tabindex: '-1' });
      document.querySelectorAll('.stage-action').forEach((e) => e.remove());
      ui.float = h('button', { type: 'button', class: 'pill stage-action', hidden: true, onclick: runStep }, 'Run step');
      document.getElementById('stage').append(ui.float);
      ui.hintSw = switchEl({ label: 'Outline cells that are ready', checked: st.hint, onChange: (v) => { st.hint = v; M.paint(); } });
      panel.append(
        h('div', { class: 'sec' }, h('h3', {}, 'Watch three schedules'),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' } }, ...ui.schedBtns),
          ui.counter,
          h('div', { class: 'row' }, ui.play,
            h('button', { type: 'button', class: 'pill ghost small', 'aria-label': 'Step back', onclick: () => stepBy(-1) }, '‹'),
            h('button', { type: 'button', class: 'pill ghost small', 'aria-label': 'Step forward', onclick: () => stepBy(1) }, '›')),
          ui.explain),
        ui.own = h('div', { class: 'sec' }, h('h3', {}, 'Schedule it yourself'), ui.genSeg,
          h('p', { class: 'small-print' }, 'A cell can run once every cell it reads has run in an earlier step: the layer below at its own position and at every earlier position. While generating, the bottom of each column also needs the token sampled at the top of the column before.'),
          h('div', { class: 'row', style: { marginTop: '8px' } }, ui.run, ui.undo, ui.reset), ui.status, ui.msg, ui.result, ui.hintSw),
        h('p', { class: 'small-print', html: `janus describes the computation as a causal graph sliced into time steps, after Stephen Wolfram’s <a href="${WOLFRAM}" target="_blank" rel="noopener">causal graphs and foliations</a>.` }));
      renderAnim(); renderOwn();
    },
    leave() { stopPlay(); ui.float?.remove(); ui.float = null; },
    click(c) { ownClick(c); },
    key(e) { if (e.key === 'r' || e.key === 'R') { e.preventDefault(); runStep(); } },
    gridChanged() {
      const { L, P } = app.cfg();
      if (st.shape === L + 'x' + P) return;
      const had = st.shape; st.shape = L + 'x' + P;
      if (!had) return;
      stopPlay(); st.step = 99; st.own = { gen: st.own.gen, done: new Map(), pending: new Set(), next: 1 }; if (ui.run) { ui.schedBtns.forEach((b) => (b.textContent = `${INFO[b.dataset.s].label} · ${total(b.dataset.s)} steps`)); renderAnim(); renderOwn(); } },
    toHash() { return st.show === 'anim' ? { sched: st.sched, step: st.step || null } : { own: '1', gen: st.own.gen ? '1' : null }; },
    fromHash(p) {
      if (p.get('own') === '1') { st.show = 'own'; st.own = { gen: p.get('gen') === '1', done: new Map(), pending: new Set(), next: 1 }; return; }
      const s = p.get('sched');
      if (schedules[s]) st.sched = s;
      st.show = 'anim';
      st.step = p.has('step') ? Math.max(0, parseInt(p.get('step'), 10) || 0) : 99;
    },
    paint() {
      const { L, P } = app.cfg();
      const wash = new Map(), steps = new Map(), on = [];
      let tokens = false;
      if (st.show === 'anim') {
        st.step = Math.min(st.step, total(st.sched));
        tokens = INFO[st.sched].gen;
        for (let l = 1; l <= L; l++) for (let p = 0; p < P; p++) {
          const s = stepOf(st.sched, l, p);
          if (s <= st.step) { wash.set(key(l, p), s === st.step ? 'cur' : 'done'); steps.set(key(l, p), String(s)); }
        }
        if (tokens) for (let p = 0; p < P - 1; p++) if (stepOf(st.sched, L, p) <= st.step) on.push(`tok:${p}`);
      } else {
        const o = st.own;
        tokens = o.gen;
        for (const [k, s] of o.done) { wash.set(k, 'done'); steps.set(k, String(s)); }
        for (const k of o.pending) { wash.set(k, 'pending'); steps.set(k, String(o.next)); }
        if (st.hint) for (let l = 1; l <= L; l++) for (let p = 0; p < P; p++) {
          const k = key(l, p);
          if (wash.has(k)) continue;
          if (inputsOf(L, P, l, p, o.gen).every((x) => o.done.has(x))) wash.set(k, 'ready');
        }
        if (tokens) for (let p = 0; p < P - 1; p++) if (o.done.has(key(L, p))) on.push(`tok:${p}`);
      }
      app.grid.paint({ wash, steps, on, tokens, quietArcs: true });
    },
  };
  return M;
}
