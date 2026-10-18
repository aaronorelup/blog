// Figure 2a, "Every day since it opened": one column per day of Cloudflare's daily totals, from
// launch to the latest filing, except that the days the chart below sorts are drawn from those
// sorted counts, so a date never shows two different numbers on one page. It is one series on purpose. Cloudflare keeps these totals
// forever but only sorts traffic into people and machines for the last 30 days, so this chart
// can't (and doesn't pretend to) split them; the bracket over its right end says where the
// sorted chart below picks up.
//
// It ignores the page's range control (the h3 says "every day"), except to dim the days outside
// the range, so the reader can see where their 7 days or their one day sits in the whole story.
import { longColumns, xLabels, postsByDay, dayNum, mergeSorted } from './calc.js';
import { h, s, pill, drawPostMarks, appendPosts, bindScrub, axisTicks, finePointer, spoken, motionOf } from './dom.js';

const MODES = [
  { key: 'pages', label: 'Pages', col: 'pages' },
  { key: 'files', label: 'Files', col: 'requests' },
  { key: 'data', label: 'Data', col: 'bytes' },
];
const GUTTER = 46;      // y tick labels
const TOP = 30;         // the "sorted below" bracket and its label
const OUT = 0.55;       // opacity of days outside the chosen range

export function createLongview(ctx, { announce }) {
  const { snap, build, agg, fmt } = ctx;
  const motion = motionOf(ctx);
  const cov = snap.coverage || {};

  // The three series, read from totals by column name (never by position).
  const series = {};
  for (const m of MODES) series[m.key] = agg.totalsSeries(snap, m.col);
  const totals = series.pages.map((p, i) => ({
    d: p.d, pages: p.v || 0, files: series.files[i]?.v || 0, bytes: series.data[i]?.v || 0,
  }));
  const sortedDays = (ctx.views.all().days || snap.days || []).map((d) => ({
    d: d.d, pages: agg.kindSums([d], 'pages').total, files: agg.kindSums([d], 'req').total, bytes: agg.kindSums([d], 'bytes').total,
  }));
  const merged = mergeSorted(totals, sortedDays);
  const rows = merged.rows;
  const first = rows.length ? rows[0].d : null;
  const last = rows.length ? rows[rows.length - 1].d : null;
  const byDay = postsByDay((build.posts || []).filter((p) => first && p.date >= first && p.date <= last));

  let mode = 'pages';
  let layout = null;            // geometry for the current width
  let cursor = -1;              // column the readout describes
  let growP = motion.reduced ? 1 : 0;
  let growing = null;
  let range = { from: null, to: null };

  // ---- DOM ----
  const fig = h('figure', { class: 'st-fig st-grow-fig', id: 'st-longview' });
  const fq = h('h3', { class: 'st-fq', text: 'Every day since it opened.' });
  const fa = h('p', {
    class: 'st-fa',
    text: `Cloudflare keeps its daily totals forever but sorts visitors only for the last ${cov.days || 30} days, so this chart can't tell people from machines.${seamNote()}`,
  });
  const ctrl = h('div', { class: 'st-grow-ctrl' });
  const pills = h('div', { class: 'st-grow-pills', role: 'group', 'aria-label': 'Count by' });
  const pillEls = MODES.map((m) => {
    const b = pill(m.label, { pressed: m.key === mode });
    b.dataset.mode = m.key;
    b.addEventListener('click', () => setMode(m.key, { route: true }));
    pills.append(b);
    return b;
  });
  const binNote = h('span', { class: 'st-grow-binnote', hidden: true, text: 'Each column is a week, shown as its average day.' });
  ctrl.append(pills, binNote);

  const readout = h('p', { class: 'st-grow-readout' });
  const plot = h('div', {
    class: 'st-grow-plot st-grow-plot--long', role: 'group', tabindex: '0',
    'aria-roledescription': 'chart',
  });
  const svg = s('svg', { class: 'st-grow-svg', 'aria-hidden': 'true', focusable: 'false' });
  const marks = h('div', { class: 'st-grow-marks' });
  plot.append(svg, marks);
  const note = h('p', { class: 'st-grow-note', hidden: true, text: 'Video is usually most of the data.' });
  const invite = h('p', {
    class: 'st-invite',
    text: finePointer()
      ? 'Point at a day for its numbers, or focus the chart and use the arrow keys.'
      : 'Slide a finger along the chart to read each day.',
  });
  fig.append(fq, fa, ctrl, readout, plot, note, invite);

  // Where the columns switch from Cloudflare's totals to the sorted counts, and how far apart the
  // two tallies were on the days both have (worked out, not assumed: they can differ either way).
  function seamNote() {
    if (!merged.from || !first || merged.from <= first) return '';
    const { totals: t, sorted: so } = merged.both;
    const when = fmt.day(merged.from, 'short');
    const lead = ` From ${when} it shows the sorted counts used everywhere else on this page`;
    if (!(t > 0 && so > 0)) return lead + '.';
    const d = (t - so) / so;
    if (Math.abs(d) < 0.005) return `${lead}, which match Cloudflare's own totals for those days.`;
    return `${lead}; Cloudflare's own totals for those days come out ${fmt.pct(Math.abs(d))} ${d < 0 ? 'lower' : 'higher'}.`;
  }

  // ---- table twin and tools ----
  let tools = null;
  if (ctx.ui?.table?.tableTwin) {
    const twin = ctx.ui.table.tableTwin({
      caption: merged.from && merged.from > first
        ? `Every day since the site opened, all traffic: Cloudflare's daily totals, then the sorted counts from ${fmt.day(merged.from, 'short')}`
        : 'Every day since the site opened: all traffic, as Cloudflare totals it',
      cols: [
        { key: 'day', label: 'Day', fmt: (v) => fmt.day(v, 'short') },
        { key: 'pages', label: 'Pages', num: true },
        { key: 'files', label: 'Files', num: true },
        { key: 'mb', label: 'Data (MB)', num: true, fmt: (v) => v.toFixed(1) },
      ],
      rows: rows.map((r) => ({ day: r.d, pages: r.pages, files: r.files, mb: Math.round(r.bytes / 1e5) / 10 })),
    });
    tools = ctx.ui.table.figureTools(fig, { table: twin, route: { ch: 'growing', sub: null, item: null }, router: ctx.router });
  }

  // ---- drawing ----
  const unitWord = () => (mode === 'pages' ? 'pages' : mode === 'files' ? 'files' : 'data');
  const valOf = (c) => (mode === 'pages' ? c.pages : mode === 'files' ? c.files : c.bytes);
  const tickFmt = (v) => (mode === 'data' ? (v === 0 ? '0' : fmt.bytes(v)) : fmt.compact(v));

  function measure() {
    const W = Math.max(240, Math.round(plot.clientWidth || fig.clientWidth || 320));
    const narrow = W < 560;
    const plotH = narrow ? 150 : 200;
    const x0 = GUTTER, plotW = W - GUTTER - 2;
    const L = longColumns(rows, plotW);
    const axisY = TOP + plotH;
    return { W, H: axisY + 40, narrow, plotH, x0, plotW, axisY, ...L, band: plotW / Math.max(1, L.slots) };
  }

  // The day's centre in px on a continuous calendar scale (the same whether or not we bin).
  const dayX = (d) => {
    const span = dayNum(last) - dayNum(first) + 1;
    return layout.x0 + ((dayNum(d) - dayNum(first) + 0.5) / span) * layout.plotW;
  };

  function build_() {
    layout = measure();
    const { W, H, x0, plotW, axisY, plotH, cols, band, binned } = layout;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.textContent = '';
    binNote.hidden = !binned;
    if (!cols.length) return;
    if (cursor < 0 || cursor >= cols.length) cursor = cols.length - 1;

    const max = Math.max(1, ...cols.map(valOf));
    const ticks = axisTicks(fmt.niceTicks, max);
    const top = ticks[ticks.length - 1] || max;
    layout.yOf = (v) => axisY - (v / top) * plotH;

    // grid + tick labels
    const grid = s('g', { class: 'st-grow-grid' });
    for (const t of ticks) {
      const y = Math.round(layout.yOf(t)) + 0.5;
      if (t > 0) grid.append(s('line', { x1: x0, x2: x0 + plotW, y1: y, y2: y }));
      const lab = s('text', { x: x0 - 8, y: y + 3.5, 'text-anchor': 'end', class: 'st-grow-tick' });
      lab.textContent = tickFmt(t);
      grid.append(lab);
    }
    svg.append(grid);

    // the hover band sits behind the columns
    layout.band_ = s('rect', { class: 'st-grow-hoverband', y: TOP - 4, height: plotH + 4, width: band, x: -999, rx: 3 });
    svg.append(layout.band_);

    const cw = Math.max(1, Math.min(10, band - 2));
    layout.cw = cw;
    const g = s('g', { class: 'st-grow-cols' });
    layout.colEls = cols.map((c) => {
      const p = s('path', { class: 'st-grow-col' });
      c.x = x0 + c.i * band + (band - cw) / 2;
      g.append(p);
      return p;
    });
    svg.append(g);

    // trailing 7-day mean (not when binned: a week's average day is already a smoothing)
    if (!binned) {
      const mean = agg.trailingMean(cols.map(valOf), 7);
      let d = '';
      cols.forEach((c, i) => {
        if (!Number.isFinite(mean[i])) return;
        d += (d ? 'L' : 'M') + (c.x + cw / 2).toFixed(1) + ' ' + layout.yOf(mean[i]).toFixed(1);
      });
      layout.meanEl = d ? s('path', { d, class: 'st-grow-mean' }) : null;
      if (layout.meanEl) svg.append(layout.meanEl);
    } else layout.meanEl = null;

    // baseline
    svg.append(s('line', { class: 'st-grow-axis', x1: x0, x2: x0 + plotW, y1: axisY + 0.5, y2: axisY + 0.5 }));

    // the bracket over the days the chart below sorts
    if (cov.first && cov.first >= first) {
      const bx0 = dayX(cov.first) - band / 2 + 1, bx1 = x0 + plotW - 1;
      const by = TOP - 10;
      const br = s('g', { class: 'st-grow-bracket' });
      br.append(s('path', { d: `M${bx0} ${by + 5}V${by}H${bx1}V${by + 5}` }));
      const label = s('text', { y: by - 6, class: 'st-grow-bracket-label' });
      label.textContent = 'sorted below';
      const wide = bx1 - bx0 > 110;
      label.setAttribute('x', wide ? bx0 : bx1 - 14);
      label.setAttribute('text-anchor', wide ? 'start' : 'end');
      br.append(label);
      // the arrow is drawn, beside the words
      const cx = wide ? bx0 + 80 : bx1 - 6;
      br.append(s('path', { class: 'st-grow-bracket-chev', d: `M${cx - 3} ${by - 12}l3 3 3-3` }));
      svg.append(br);
      // measure the label once it's in the DOM, so the chevron sits right after the words
      requestAnimationFrame(() => {
        try {
          const bb = label.getBBox();
          const chev = br.querySelector('.st-grow-bracket-chev');
          const cxx = wide ? bb.x + bb.width + 7 : bb.x + bb.width + 7;
          if (!wide) label.setAttribute('x', bx1 - 14);
          chev.setAttribute('d', `M${cxx - 3} ${by - 12}l3 3 3-3`);
        } catch { /* not rendered yet; the estimate stands */ }
      });
    }

    // x labels: first day, the 1st of each month, last day
    const xl = s('g', { class: 'st-grow-xlabels' });
    for (const l of xLabels(first, last, dayX, layout.narrow ? 40 : 52)) {
      const t = s('text', { x: l.x, y: axisY + 34, 'text-anchor': l.anchor, class: 'st-grow-tick' });
      t.textContent = fmt.day(l.d, 'axis');
      xl.append(t);
    }
    svg.append(xl);

    // post marks: a dot under the axis, a ring when several went up that day
    drawPostMarks(marks, [...byDay.entries()].map(([d, posts]) => ({ d, posts, x: dayX(d), y: axisY + 12 })), 0, W);

    plot.setAttribute('aria-label', `Columns, one per ${binned ? 'week' : 'day'} from ${fmt.day(first, 'long')} to ${fmt.day(last, 'long')}: ${unitLabel()} a day, all visitors together, with a 7-day average line.`);
    draw();
  }

  const unitLabel = () => (mode === 'pages' ? 'pages' : mode === 'files' ? 'files' : 'data sent');

  function draw() {
    if (!layout || !layout.colEls) return;
    const { cols, axisY, cw } = layout;
    const n = cols.length;
    const STAG = 12, DUR = 500;
    const total = DUR + STAG * Math.max(0, n - 1);
    cols.forEach((c, i) => {
      // per-column progress inside the one shared tween: a 12 ms stagger, each 500 ms long
      const local = growP >= 1 ? 1 : Math.max(0, Math.min(1, (growP * total - STAG * i) / DUR));
      const p = local >= 1 ? 1 : motion.EASE?.out ? motion.EASE.out(local) : local;
      const y = axisY - (axisY - layout.yOf(valOf(c))) * p;
      const el = layout.colEls[i];
      el.setAttribute('d', colPath(c.x, y, cw, axisY));
      const inRange = range.from && c.to >= range.from && c.from <= range.to;
      el.style.opacity = inRange || !range.from ? '' : OUT;
      el.classList.toggle('is-on', i === cursor && cursorShown);
    });
    if (layout.meanEl) layout.meanEl.style.opacity = growP >= 1 ? '' : '0';
    placeBand();
  }

  let cursorShown = false;
  function placeBand() {
    if (!layout?.band_) return;
    const c = layout.cols[cursor];
    if (!c || !cursorShown) { layout.band_.setAttribute('x', -999); return; }
    layout.band_.setAttribute('x', layout.x0 + c.i * layout.band);
    layout.band_.setAttribute('width', layout.band);
  }

  // ---- readout ----
  function renderReadout(i) {
    const c = layout?.cols?.[i];
    readout.textContent = '';
    if (!c) return;
    const binned = layout.binned;
    const when = binned ? `Week of ${fmt.day(c.from, 'short')}` : fmt.day(c.from, 'short');
    const a = binned ? ' a day' : '';
    readout.append(h('b', { text: when }));
    const part = (key, text) => {
      readout.append(' · ');
      readout.append(h('span', { class: key === mode ? 'is-unit' : '', text }));
    };
    part('pages', `${fmt.num(c.pages)} ${fmt.plural(Math.round(c.pages), 'page', 'pages')}${a}`);
    part('files', `${fmt.num(c.files)} ${fmt.plural(Math.round(c.files), 'file', 'files')}${a}`);
    part('data', `${fmt.bytes(c.bytes)}${a}`);
    // posts that went up inside this column
    const posts = [];
    for (const [d, list] of byDay) if (d >= c.from && d <= c.to) posts.push(...list);
    appendPosts(readout, posts);
  }

  function setCursor(i, src) {
    if (!layout?.cols?.length) return;
    i = Math.max(0, Math.min(layout.cols.length - 1, i));
    const changed = i !== cursor || !cursorShown;
    cursor = i;
    cursorShown = true;
    if (!changed) return;
    renderReadout(i);
    draw();
    if (src !== 'init') announce(spoken(readout));
  }

  bindScrub(plot, {
    count: () => layout?.cols?.length || 0,
    cursor: () => cursor,
    indexAt: (clientX) => {
      if (!layout?.cols?.length) return -1;
      const r = plot.getBoundingClientRect();
      const x = clientX - r.left - layout.x0;
      // the nearest column by slot, so gaps (missing days) still land on a real column
      const slot = x / layout.band;
      let best = 0, bd = Infinity;
      layout.cols.forEach((c, j) => { const dd = Math.abs(c.i + 0.5 - slot); if (dd < bd) { bd = dd; best = j; } });
      return best;
    },
    onCursor: setCursor,
  });
  plot.addEventListener('focus', () => { cursorShown = true; draw(); });

  // ---- mode ----
  function setMode(m, { route = false } = {}) {
    if (!MODES.some((x) => x.key === m)) m = 'pages';
    const changed = m !== mode;
    mode = m;
    pillEls.forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === mode ? 'true' : 'false'));
    note.hidden = mode !== 'data';
    if (changed && layout) {
      const from = layout.cols.map((c) => layout.yOf(valOf(c)));
      build_();
      renderReadout(cursor);
      if (!motion.reduced && growP >= 1) heightTween(from);
    }
    if (route) {
      ctx.router.go({ ch: 'growing', sub: mode === 'pages' ? null : mode, item: null }, { push: false, scroll: false });
    }
  }

  // A mode change rescales every column; ease them from their old heights to the new.
  let hTween = null;
  function heightTween(fromY) {
    hTween?.cancel();
    const to = layout.cols.map((c) => layout.yOf(valOf(c)));
    const yOf = layout.yOf;
    hTween = motion.tween({
      from: 0, to: 1, dur: 450, ease: motion.EASE?.std,
      onUpdate: (t) => {
        layout.cols.forEach((c, i) => {
          const y = (fromY[i] ?? layout.axisY) + (to[i] - (fromY[i] ?? layout.axisY)) * t;
          layout.colEls[i].setAttribute('d', colPath(c.x, y, layout.cw, layout.axisY));
        });
        if (layout.meanEl) layout.meanEl.style.opacity = t < 1 ? String(t) : '';
      },
      onDone: () => { hTween = null; layout.yOf = yOf; draw(); },
    });
  }

  // ---- public ----
  return {
    el: fig,
    mount() { build_(); setCursor(cursor < 0 ? (layout?.cols?.length || 1) - 1 : cursor, 'init'); cursorShown = false; draw(); },
    resize() { if (!layout || Math.abs(measure().W - layout.W) > 1) { build_(); renderReadout(cursor); } },
    setRange(view) {
      range = { from: view.from, to: view.to };
      draw();
    },
    setMode,
    get mode() { return mode; },
    grow() {
      if (growP >= 1 || growing) return;
      const n = layout?.cols?.length || 1;
      growing = motion.tween({
        from: 0, to: 1, dur: 500 + 12 * (n - 1), ease: (t) => t, delay: 120,
        onUpdate: (t) => { growP = t; draw(); },
        onDone: () => { growP = 1; growing = null; draw(); },
      });
    },
    finish() { growing?.cancel(); growing = null; growP = 1; draw(); },
    destroy() { growing?.cancel(); hTween?.cancel(); tools?.destroy?.(); },
  };
}

// A column with a rounded top and a square base, standing on the axis.
function colPath(x, y, cw, axisY) {
  const hgt = axisY - y;
  if (hgt <= 0) return '';
  const r = Math.min(2, cw / 2, hgt);
  return `M${x} ${axisY}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + cw - r}Q${x + cw} ${y} ${x + cw} ${y + r}V${axisY}Z`;
}
