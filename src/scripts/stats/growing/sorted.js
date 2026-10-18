// Figure 2b, "The last 30 days, sorted": one stacked column per sorted day, the five kinds piled
// in the same order every time (people on the ground, the loud machines on top). People are a
// solid block for what Cloudflare's counter heard and a striped block above it for what only the
// server count says, the same "maybe" stripe the gate uses. In files there's no range, so people
// are one block.
//
// The legend chips hide and show layers (the chart rescales to what's left), "People only" greys
// the machines instead of hiding them, and a click pins a day: that day can then be replayed at
// the gate, at the top of the page, in whichever unit is showing here.
import { stackOf, stackTotal, tallest, peopleBusiest, postNote, postsByDay, xLabels, dayNum } from './calc.js';
import { h, s, chevron, pill, drawPostMarks, appendPosts, bindScrub, axisTicks, finePointer, spoken, motionOf } from './dom.js';

const GUTTER = 46;
const TOP = 28;          // room for the direct label over the tallest column
const OUT = 0.45;        // opacity of days outside the chosen range
const GAP = 2;           // surface gap between stacked segments
const SEGS = ['person-lo', 'person-hi', 'stale', 'agent', 'scanner', 'bot'];
// "One scanner wave squashes the rest": the singular, lower-case name for each kind's wave.
const WAVE = { bot: 'named-bot', scanner: 'scanner', agent: 'script', stale: 'old-browser' };
// Readout order: people first (the page's subject), then the machines from most to least
// browser-like, with scanners last because their numbers are the jumpiest.
const READ_ORDER = ['person', 'stale', 'agent', 'bot', 'scanner'];
const READ_NAME = { person: 'people', stale: 'old browsers', agent: 'scripts', bot: 'bots', scanner: 'scanners' };

export function createSorted(ctx, { announce }) {
  const { build, fmt, words, store, router } = ctx;
  const motion = motionOf(ctx);
  const all = ctx.views.all();
  const perDay = all.perDay || [];
  const n = perDay.length;
  const first = n ? perDay[0].d : null;
  const last = n ? perDay[n - 1].d : null;
  const byDay = postsByDay((build.posts || []).filter((p) => first && p.date >= first && p.date <= last));
  const KIND_ORDER = words.KIND_ORDER || ['bot', 'scanner', 'agent', 'stale', 'person'];
  const KINDS = words.KINDS || {};

  let unit = store.get().unit === 'files' ? 'files' : 'pages';
  const hidden = new Set();
  let peopleOnly = false;
  let selected = -1;
  let cursor = n - 1;
  let cursorShown = false;
  let growP = motion.reduced ? 1 : 0;
  let growing = null;
  let geomTween = null;
  let layout = null;
  let drawn = null;            // geometry currently on screen (for interrupted tweens)
  let range = { from: null, to: null, single: false };

  // ---- DOM ----
  const fig = h('figure', { class: 'st-fig st-grow-fig', id: 'st-sorted' });
  const fq = h('h3', { class: 'st-fq', text: n === 1 ? 'The first sorted day.' : `The last ${n} days, sorted.` });
  const fa = h('p', { class: 'st-fa' });
  const ctrl = h('div', { class: 'st-grow-ctrl' });
  const unitGroup = h('div', { class: 'st-grow-pills', role: 'group', 'aria-label': 'Count by' });
  const unitBtns = ['pages', 'files'].map((u) => {
    const b = pill(u === 'pages' ? 'Pages' : 'Files', { pressed: u === unit });
    b.dataset.unit = u;
    b.addEventListener('click', () => store.set({ unit: u }, { push: false, source: 'growing' }));
    unitGroup.append(b);
    return b;
  });
  ctrl.append(unitGroup);

  const legend = h('div', { class: 'st-grow-legend', role: 'group', 'aria-label': 'Kinds shown in the chart' });
  const chips = {};
  for (const k of KIND_ORDER) {
    const b = h('button', { type: 'button', class: 'st-grow-chip', 'aria-pressed': 'true', 'data-k': k });
    const g = ctx.ui?.glyph?.glyphSVG ? ctx.ui.glyph.glyphSVG(k, { size: 12 }) : h('span', { class: 'st-grow-sw', 'data-k': k });
    g.classList?.add('st-grow-chip-glyph');
    g.setAttribute?.('data-k', k);
    const name = h('span', { class: 'st-grow-chip-name', text: KINDS[k]?.short || k });
    const num = h('span', { class: 'st-grow-chip-num' });
    b.append(g, name, num);
    b.addEventListener('click', () => toggleKind(k));
    chips[k] = { b, num };
    legend.append(b);
  }
  const onlyBtn = h('button', { type: 'button', class: 'st-grow-chip st-grow-chip--only', 'aria-pressed': 'false' });
  {
    const g = ctx.ui?.glyph?.glyphSVG ? ctx.ui.glyph.glyphSVG('person', { size: 12 }) : h('span');
    g.classList?.add('st-grow-chip-glyph');
    g.setAttribute?.('data-k', 'person');
    onlyBtn.append(g, h('span', { class: 'st-grow-chip-name', text: 'People only' }));
  }
  onlyBtn.addEventListener('click', () => {
    peopleOnly = !peopleOnly;
    if (peopleOnly) hidden.delete('person');
    syncChips();
    relayout(true);
  });
  legend.append(onlyBtn);

  const hint = h('p', { class: 'st-grow-hint', hidden: true });
  const hintText = h('span');
  const hintBtn = h('button', { type: 'button', class: 'st-grow-textbtn' });
  hint.append(hintText, ' ', hintBtn);

  const readout = h('p', { class: 'st-grow-readout' });
  const pick = h('div', { class: 'st-grow-pick' });
  const gateBtn = pill(h('span', { class: 'st-grow-pill-in' }, 'Show this day at the gate', chevron('up', 10)), { cls: 'st-grow-gate' });
  gateBtn.hidden = true;
  gateBtn.addEventListener('click', () => toGate());
  pick.append(gateBtn);

  const plot = h('div', { class: 'st-grow-plot st-grow-plot--sorted', role: 'group', tabindex: '0', 'aria-roledescription': 'chart' });
  const svg = s('svg', { class: 'st-grow-svg', 'aria-hidden': 'true', focusable: 'false' });
  const marks = h('div', { class: 'st-grow-marks' });
  plot.append(svg, marks);

  const steps = h('div', { class: 'st-grow-steps' });
  const prevBtn = pill('Prev day');
  const nextBtn = pill('Next day');
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  steps.append(prevBtn, nextBtn);
  // On a phone the gate pill lives under the chart with Prev and Next, so pinning a day never
  // pushes the chart down under the finger that pinned it. On wider screens it sits at the end
  // of the readout line.
  const touchLayout = typeof matchMedia === 'function' ? matchMedia('(max-width: 640px), (pointer: coarse)') : null;
  const placePick = () => {
    const want = touchLayout?.matches ? steps : null;
    if (want && steps.nextSibling !== pick) steps.after(pick);
    else if (!want && readout.nextSibling !== pick) readout.after(pick);
  };
  touchLayout?.addEventListener?.('change', placePick);

  const invite = h('p', {
    class: 'st-invite',
    text: finePointer()
      ? 'Point at a day for its numbers; click one to pin it and replay it at the gate.'
      : 'Tap a day for its numbers and to replay it at the gate. Slide along the chart to read each one.',
  });
  // the readout and the gate pill share a row, so pinning a day doesn't push the chart down
  const readRow = h('div', { class: 'st-grow-readrow' }, readout, pick);
  fig.append(fq, fa, ctrl, legend, hint, readRow, plot, steps, invite);

  // ---- table twin (its columns follow the unit, so it always matches what is drawn) ----
  let twin = null, tools = null;
  function tableSpec() {
    const cols = unit === 'pages'
      ? [{ key: 'day', label: 'Day', fmt: (v) => fmt.day(v, 'short') }, { key: 'lo', label: 'People (low)', num: true }, { key: 'hi', label: 'People (high)', num: true }]
      : [{ key: 'day', label: 'Day', fmt: (v) => fmt.day(v, 'short') }, { key: 'person', label: 'People', num: true }];
    cols.push(
      { key: 'stale', label: 'Old browsers', num: true }, { key: 'agent', label: 'Scripts', num: true },
      { key: 'scanner', label: 'Scanners', num: true }, { key: 'bot', label: 'Bots', num: true },
    );
    const src = (pd) => (unit === 'pages' ? pd.pages : pd.req);
    return {
      caption: `The last ${n} days, sorted into the five kinds, in ${unit}`,
      cols,
      rows: perDay.map((pd) => ({
        day: pd.d, lo: Math.round(pd.lo), hi: Math.round(pd.hi), person: src(pd).person,
        stale: src(pd).stale, agent: src(pd).agent, scanner: src(pd).scanner, bot: src(pd).bot,
      })),
    };
  }
  function buildTable() {
    if (!ctx.ui?.table?.tableTwin) return;
    if (twin) { twin.update(tableSpec()); return; }
    twin = ctx.ui.table.tableTwin(tableSpec());
    tools = ctx.ui.table.figureTools(fig, { table: twin, route: { ch: 'growing', sub: null, item: null }, router });
  }

  // ---- words ----
  function renderFa() {
    if (n <= 1) { fa.textContent = "One day isn't a trend; the sorted days start here."; return; }
    const b = peopleBusiest(perDay);
    if (!b) { fa.textContent = 'Nobody who looked like a person came on any of these days.'; return; }
    // the same range object the readout and the hero print, so an estimated low end is rounded alike
    const hi = Math.round(b.hi);
    const spoken = fmt.rangeSpoken(b);
    const amount = spoken === fmt.num(hi) ? `${spoken} ${fmt.plural(hi, 'page', 'pages')}` : `${spoken} pages`;
    fa.textContent = `${fmt.day(b.d, 'short')} was the busiest day for people: ${amount}${postNote(b.d, byDay)}.`;
  }

  // The chips total the days the chart draws (every sorted day, the heading's "last n days"),
  // never the range picked in the bar: here the range only dims columns, and a 7-day sum under
  // a 30-day heading read as the chart's own figures.
  function syncChips() {
    const view = all;
    const sums = unit === 'pages' ? view.pages : view.files;
    for (const k of KIND_ORDER) {
      const on = !hidden.has(k);
      chips[k].b.setAttribute('aria-pressed', on ? 'true' : 'false');
      const ppl = k === 'person' && unit === 'pages';
      chips[k].num.textContent = ppl ? fmt.range(view.people) : fmt.num(sums[k] || 0);
      // the visible chip runs name into number and uses a dash; the spoken name says it in words
      const amount = ppl ? fmt.rangeSpoken(view.people) : fmt.num(sums[k] || 0);
      chips[k].b.setAttribute('aria-label', `${KINDS[k]?.short || k}, ${amount} ${unit}`);
      // the last layer showing can't be switched off
      chips[k].b.setAttribute('aria-disabled', on && visibleKinds().length === 1 ? 'true' : 'false');
    }
    onlyBtn.setAttribute('aria-pressed', peopleOnly ? 'true' : 'false');
    fig.classList.toggle('is-people-only', peopleOnly);
  }
  const visibleKinds = () => KIND_ORDER.filter((k) => !hidden.has(k));

  function toggleKind(k) {
    if (!hidden.has(k)) {
      if (visibleKinds().length <= 1) return;
      hidden.add(k);
      if (k === 'person') peopleOnly = false;
    } else hidden.delete(k);
    syncChips();
    relayout(true);
  }

  // The hint and the direct label. The hint reads the stack with every layer on, so hiding the
  // wave leaves its "Show" button where the reader's finger is.
  function renderHint() {
    const t = tallest(perDay.map((pd) => ({ d: pd.d, segs: stackOf(pd, unit) })));
    if (!t || !t.hint) { hint.hidden = true; return; }
    const short = (KINDS[t.kind]?.short || t.kind).toLowerCase();
    hint.hidden = false;
    hint.dataset.k = t.kind;
    if (hidden.has(t.kind)) {
      hintText.textContent = `${KINDS[t.kind]?.short || t.kind} are hidden, so the other days have room.`;
      hintBtn.textContent = `Show ${short}`;
    } else {
      hintText.textContent = `One ${WAVE[t.kind] || short} wave squashes the rest.`;
      hintBtn.textContent = `Hide ${short}`;
    }
  }
  hintBtn.addEventListener('click', () => {
    const k = hint.dataset.k;
    if (k) toggleKind(k);
  });

  // ---- geometry ----
  function measure() {
    const W = Math.max(240, Math.round(plot.clientWidth || fig.clientWidth || 320));
    const narrow = W < 560;
    const plotH = narrow ? 200 : 250;
    const x0 = GUTTER, plotW = W - GUTTER - 2;
    const band = n < 7 ? 26 : plotW / Math.max(1, n);
    const cw = Math.max(2, Math.min(24, band - 2));
    const axisY = TOP + plotH;
    return { W, H: axisY + 40, narrow, plotH, x0, plotW, band, cw, axisY };
  }
  const colX = (i) => layout.x0 + i * layout.band + (layout.band - layout.cw) / 2;
  const dayX = (d) => layout.x0 + (dayNum(d) - dayNum(first) + 0.5) * layout.band;

  // Target geometry: for each column, the six segments as drawn rects {y, h}, plus the top.
  function target() {
    const stacks = perDay.map((pd) => stackOf(pd, unit, hidden));
    const max = Math.max(1, ...stacks.map(stackTotal));
    const ticks = axisTicks(fmt.niceTicks, max);
    const top = ticks[ticks.length - 1] || max;
    const k = layout.plotH / top;
    const geom = stacks.map((segs) => {
      let lastNZ = -1;
      segs.forEach((sg, j) => { if (sg.v > 0) lastNZ = j; });
      let cur = layout.axisY;
      return segs.map((sg, j) => {
        const px = sg.v * k;
        if (px <= 0) return { y: cur, h: 0 };
        // the gap is cut from the top of every segment but the highest, so each block still
        // stands on its true base; a sliver too thin to see is drawn 1px tall
        const gap = j === lastNZ ? 0 : GAP;
        const hh = Math.max(1, px - gap);
        const y = cur - hh;
        cur -= px;
        return { y, h: hh };
      });
    });
    return { geom, ticks, top, stacks };
  }

  function build_() {
    layout = measure();
    const { W, H, x0, plotW, axisY, plotH } = layout;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.textContent = '';
    const defs = s('defs');
    // the "maybe" stripe: people's colour, 2px on, 3px off, on the diagonal
    const pat = s('pattern', { id: 'st-grow-stripe', patternUnits: 'userSpaceOnUse', width: 5, height: 5, patternTransform: 'rotate(45)' });
    pat.append(s('rect', { width: 2, height: 5, class: 'st-grow-stripe-ink' }));
    defs.append(pat);
    svg.append(defs);
    layout.gridG = s('g', { class: 'st-grow-grid' });
    svg.append(layout.gridG);
    layout.band_ = s('rect', { class: 'st-grow-hoverband', y: TOP - 6, height: plotH + 6, width: layout.band, x: -999, rx: 3 });
    svg.append(layout.band_);
    const colsG = s('g', { class: 'st-grow-stack' });
    layout.colGs = perDay.map((pd, i) => {
      const g = s('g', { class: 'st-grow-day' });
      const rects = SEGS.map((seg) => {
        const r = s('rect', { class: 'st-grow-seg', 'data-seg': seg, x: colX(i), width: layout.cw, rx: Math.min(1.5, layout.cw / 4) });
        g.append(r);
        return r;
      });
      colsG.append(g);
      return { g, rects };
    });
    svg.append(colsG);
    svg.append(s('line', { class: 'st-grow-axis', x1: x0, x2: x0 + plotW, y1: axisY + 0.5, y2: axisY + 0.5 }));
    layout.ring = s('rect', { class: 'st-grow-ring', rx: 4, x: -999, y: 0, width: 0, height: 0 });
    layout.rangeRing = s('rect', { class: 'st-grow-ring st-grow-ring--range', rx: 4, x: -999, y: 0, width: 0, height: 0 });
    svg.append(layout.rangeRing, layout.ring);
    layout.label = s('text', { class: 'st-grow-direct', y: 0, x: -999 });
    svg.append(layout.label);

    const xl = s('g', { class: 'st-grow-xlabels' });
    if (n) {
      const labs = n === 1 ? [{ d: first, x: colX(0) + layout.cw / 2, anchor: 'start' }] : xLabels(first, last, dayX, layout.narrow ? 40 : 52);
      for (const l of labs) {
        const t = s('text', { x: l.anchor === 'start' ? Math.min(l.x, colX(0)) : l.anchor === 'end' ? Math.max(l.x, colX(n - 1) + layout.cw) : l.x, y: axisY + 34, 'text-anchor': l.anchor, class: 'st-grow-tick' });
        t.textContent = fmt.day(l.d, 'axis');
        xl.append(t);
      }
    }
    svg.append(xl);
    const dayIdx = new Map(perDay.map((pd, i) => [pd.d, i]));
    drawPostMarks(marks, [...byDay.entries()].filter(([d]) => dayIdx.has(d)).map(([d, posts]) => ({ d, posts, x: colX(dayIdx.get(d)) + layout.cw / 2, y: axisY + 12 })), 0, W);

    const T = target();
    layout.T = T;
    drawGrid(T);
    drawn = null;
    draw(T.geom);
    plot.setAttribute('aria-label', `Stacked columns, one per day from ${fmt.day(first || '', 'long')} to ${fmt.day(last || '', 'long')}, in ${unit}: people at the bottom, then old browsers, scripts, scanners and named bots.`);
  }

  function drawGrid(T) {
    const g = layout.gridG;
    g.textContent = '';
    const { x0, plotW, axisY, plotH } = layout;
    for (const t of T.ticks) {
      const y = Math.round(axisY - (t / T.top) * plotH) + 0.5;
      if (t > 0) g.append(s('line', { x1: x0, x2: x0 + plotW, y1: y, y2: y }));
      const lab = s('text', { x: x0 - 8, y: y + 3.5, 'text-anchor': 'end', class: 'st-grow-tick' });
      lab.textContent = fmt.compact(t);
      g.append(lab);
    }
  }

  // Put geometry on screen, scaled by the grow-in progress, and place rings and the label.
  function draw(geom) {
    if (!layout?.colGs) return;
    const { axisY } = layout;
    const STAG = 12, DUR = 500;
    const total = DUR + STAG * Math.max(0, n - 1);
    const ease = motion.EASE.out || ((t) => t);
    const tops = [];
    geom.forEach((col, i) => {
      const local = growP >= 1 ? 1 : Math.max(0, Math.min(1, (growP * total - STAG * i) / DUR));
      const p = local >= 1 ? 1 : ease(local);
      const { g, rects } = layout.colGs[i];
      let top = axisY;
      col.forEach((r, j) => {
        const y = axisY - (axisY - r.y) * p;
        const hh = r.h * p;
        rects[j].setAttribute('y', y.toFixed(2));
        rects[j].setAttribute('height', Math.max(0, hh).toFixed(2));
        if (hh > 0) top = Math.min(top, y);
      });
      tops.push(top);
      const d = perDay[i].d;
      const inRange = !range.from || (d >= range.from && d <= range.to);
      g.style.opacity = inRange ? '' : OUT;
      g.classList.toggle('is-on', cursorShown && i === cursor);
    });
    drawn = geom;
    layout.tops = tops;
    placeRings();
    placeLabel(growP >= 1);
    placeBand();
  }

  function ringAt(el, i) {
    if (i < 0 || !layout.tops) { el.setAttribute('x', -999); return; }
    const top = Math.min(layout.tops[i], layout.axisY - 4);
    el.setAttribute('x', colX(i) - 3.5);
    el.setAttribute('y', top - 3.5);
    el.setAttribute('width', layout.cw + 7);
    el.setAttribute('height', layout.axisY - top + 7);
  }
  function placeRings() {
    ringAt(layout.ring, selected);
    const single = range.single ? perDay.findIndex((pd) => pd.d === range.from) : -1;
    ringAt(layout.rangeRing, single === selected ? -1 : single);
  }
  function placeBand() {
    if (!layout?.band_) return;
    if (!cursorShown || cursor < 0) { layout.band_.setAttribute('x', -999); return; }
    layout.band_.setAttribute('x', layout.x0 + cursor * layout.band);
    layout.band_.setAttribute('width', layout.band);
  }

  // One direct label at most, on the tallest column as drawn, when one kind is over half of it.
  function placeLabel(show) {
    const el = layout.label;
    el.setAttribute('x', -999);
    if (!show || n < 2 || peopleOnly) return;   // with the machines greyed, a machine label would shout over the point
    const t = tallest(perDay.map((pd) => ({ d: pd.d, segs: stackOf(pd, unit, hidden) })));
    if (!t || !t.label || hidden.has(t.kind)) return;
    let text;
    if (t.kind === 'person') {
      const pd = perDay[t.i];
      text = unit === 'pages' ? `Mostly people · ${fmt.range(pd)} pages` : `Mostly people · ${fmt.num(t.n)} files`;
    } else {
      const w = WAVE[t.kind];
      text = `${w.charAt(0).toUpperCase()}${w.slice(1)} wave · ${fmt.num(t.n)} ${unit}`;
    }
    el.textContent = text;
    const cx = colX(t.i) + layout.cw / 2;
    const y = (layout.tops?.[t.i] ?? layout.axisY) - 9;
    // keep it inside the plot: anchor to the side with room
    const room = 7 * text.length / 2;
    let anchor = 'middle', x = cx;
    if (cx - room < layout.x0) { anchor = 'start'; x = Math.max(layout.x0, colX(t.i)); }
    else if (cx + room > layout.x0 + layout.plotW) { anchor = 'end'; x = colX(t.i) + layout.cw; }
    el.setAttribute('text-anchor', anchor);
    el.setAttribute('x', x);
    el.setAttribute('y', Math.max(12, y));
  }

  // Unit or layer change: same days, new count. Heights ease over 450 ms from wherever they are.
  function relayout(animate) {
    if (!layout) return;
    const from = drawn;
    const T = target();
    layout.T = T;
    drawGrid(T);
    renderHint();
    renderReadout(cursorShown || selected >= 0 ? cursor : n - 1);
    geomTween?.cancel();
    if (!animate || motion.reduced || growP < 1 || !from) { draw(T.geom); return; }
    geomTween = motion.tween({
      from: 0, to: 1, dur: 450, ease: motion.EASE.std,
      onUpdate: (t) => {
        const g = T.geom.map((col, i) => col.map((r, j) => {
          const a = from[i][j];
          return { y: a.y + (r.y - a.y) * t, h: a.h + (r.h - a.h) * t };
        }));
        layout.label.setAttribute('x', -999);
        draw(g);
        if (t < 1) placeLabel(false);
      },
      onDone: () => { geomTween = null; draw(T.geom); },
    });
  }

  // ---- readout ----
  function renderReadout(i) {
    readout.textContent = '';
    const pd = perDay[i];
    if (!pd) return;
    const src = unit === 'pages' ? pd.pages : pd.req;
    const total = src.total ?? Object.values(src).reduce((a, b) => a + b, 0);
    readout.append(h('b', { text: fmt.day(pd.d, 'short') }));
    readout.append(` · ${fmt.num(total)} ${unit === 'pages' ? fmt.plural(total, 'page', 'pages') : fmt.plural(total, 'file', 'files')}`);
    for (const k of READ_ORDER) {
      const v = k === 'person' && unit === 'pages' ? fmt.range(pd) : fmt.num(src[k] || 0);
      readout.append(' · ');
      readout.append(h('span', { class: 'st-grow-rk', 'data-k': k, text: `${READ_NAME[k]} ${v}` }));
    }
    const posts = byDay.get(pd.d);
    appendPosts(readout, posts);
  }

  function setCursor(i, src) {
    if (!n) return;
    i = Math.max(0, Math.min(n - 1, i));
    const changed = i !== cursor || !cursorShown;
    cursor = i;
    cursorShown = true;
    if (!changed) return;
    renderReadout(i);
    if (drawn) draw(drawn);
    syncSteps();
    if (src !== 'init') announce(spoken(readout));
  }

  // ---- selection and time travel ----
  function select(i, { route = true } = {}) {
    if (i < 0 || i >= n) { deselect({ route }); return; }
    selected = i;
    cursor = i;
    cursorShown = true;
    gateBtn.hidden = false;
    gateBtn.setAttribute('aria-label', `Show ${fmt.day(perDay[i].d, 'long')} at the gate, in ${unit}`);
    renderReadout(i);
    if (drawn) draw(drawn);
    syncSteps();
    if (route) router.go({ ch: 'growing', sub: 'day', item: perDay[i].d }, { push: false, scroll: false });
  }
  function deselect({ route = true } = {}) {
    const had = selected >= 0;
    selected = -1;
    gateBtn.hidden = true;
    if (drawn) draw(drawn);
    syncSteps();
    if (route && had) router.go({ ch: 'growing', sub: null, item: null }, { push: false, scroll: false });
  }
  // Prev and Next move from the day the readout is showing (the pinned one, or else the one last
  // read), never pin it in place: a first tap that only drew a ring read as a dead button.
  const stepBase = () => (selected >= 0 ? selected : cursor);
  function step(k) {
    const i = Math.max(0, Math.min(n - 1, stepBase() + k));
    if (i === stepBase()) return;
    select(i);
    announce(spoken(readout));
  }
  // at either end the button says so rather than doing nothing (aria-disabled keeps it focusable)
  function syncSteps() {
    const b = stepBase();
    prevBtn.setAttribute('aria-disabled', b <= 0 ? 'true' : 'false');
    nextBtn.setAttribute('aria-disabled', b >= n - 1 ? 'true' : 'false');
  }
  function toGate() {
    if (selected < 0) return;
    router.go(`#/top/replay?d=${perDay[selected].d}&u=${unit}`, { push: true });
  }

  bindScrub(plot, {
    count: () => n,
    cursor: () => cursor,
    indexAt: (clientX) => {
      if (!layout) return -1;
      const r = plot.getBoundingClientRect();
      const x = clientX - r.left - layout.x0;
      if (n < 7 && x > n * layout.band + 12) return -1;   // empty space right of a short run
      return Math.max(0, Math.min(n - 1, Math.floor(x / layout.band)));
    },
    onCursor: setCursor,
    onPick: (i) => { if (i === selected) deselect(); else select(i); },
    onLeave: () => {
      // back to the pinned day, if there is one; otherwise the readout keeps the last day read
      if (selected >= 0 && cursor !== selected) { cursor = selected; renderReadout(cursor); if (drawn) draw(drawn); syncSteps(); }
    },
    onKey: (e, i) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!cursorShown) { setCursor(i, 'key'); return true; }
        if (i === selected) toGate(); else { select(i); announce(`${spoken(readout)}. Pinned. Press Enter again to show it at the gate.`); }
        return true;
      }
      if (e.key === 'Escape' && selected >= 0) { deselect(); return true; }
      return false;
    },
  });
  plot.addEventListener('focus', () => { if (!cursorShown) { cursorShown = true; if (drawn) draw(drawn); } });

  // ---- public ----
  function setRange(view, state) {
    const single = state.range?.kind === 'day' || view.n === 1;
    range = { from: view.from, to: view.to, single };
    syncChips();
    if (drawn) draw(drawn);
  }
  function setUnit(u) {
    u = u === 'files' ? 'files' : 'pages';
    if (u === unit) return;
    unit = u;
    unitBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.unit === unit ? 'true' : 'false'));
    if (selected >= 0) gateBtn.setAttribute('aria-label', `Show ${fmt.day(perDay[selected].d, 'long')} at the gate, in ${unit}`);
    syncChips();
    buildTable();
    relayout(true);
    fig.classList.toggle('is-files', unit === 'files');
  }

  return {
    el: fig,
    mount() {
      renderFa();
      syncChips();
      renderHint();
      buildTable();
      build_();
      renderReadout(cursor);
      fig.classList.toggle('is-files', unit === 'files');
      placePick();
      syncSteps();
    },
    resize() { if (layout && Math.abs(measure().W - layout.W) > 1) build_(); },
    setRange,
    setUnit,
    select: (d) => { const i = perDay.findIndex((pd) => pd.d === d); if (i >= 0) select(i, { route: false }); return i >= 0; },
    deselect: () => deselect({ route: false }),
    grow() {
      if (growP >= 1 || growing) return;
      growing = motion.tween({
        from: 0, to: 1, dur: 500 + 12 * Math.max(0, n - 1), ease: (t) => t, delay: 120,
        onUpdate: (t) => { growP = t; if (layout?.T) draw(layout.T.geom); },
        onDone: () => { growP = 1; growing = null; if (layout?.T) draw(layout.T.geom); },
      });
    },
    finish() { growing?.cancel(); growing = null; growP = 1; if (layout?.T) draw(layout.T.geom); },
    destroy() { growing?.cancel(); geomTween?.cancel(); tools?.destroy?.(); },
  };
}
