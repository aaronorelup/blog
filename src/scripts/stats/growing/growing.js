// Chapter 02, "Is it growing?". The answer comes from Cloudflare's daily totals since launch
// (agg.growth), not from the range the reader picked: growth is a question about the whole life
// of the site. Two figures follow: every day since it opened (one series, because those totals
// were never sorted), and the last 30 days sorted into the five kinds.
//
// Routes: #/growing, #/growing/data and #/growing/files (the long view's count), and
// #/growing/day/YYYY-MM-DD (a pinned day in the sorted chart). Pinning a day and pressing
// "Show this day at the gate" pushes #/top/replay?d=…&u=…, which the hero replays.
import '../../../styles/stats/growing.css';
import { createLongview } from './longview.js';
import { createSorted } from './sorted.js';
import { growthWords, growthOnSorted } from './calc.js';
import { h, rafThrottle, motionOf } from './dom.js';

export async function mount(el, ctx) {
  const { snap, agg, fmt, store } = ctx;
  const motion = motionOf(ctx);
  const answerEl = el.querySelector('[data-st-answer]');
  const contextEl = el.querySelector('[data-st-context]');
  const body = el.querySelector('[data-st-body]') || el.appendChild(h('div', { class: 'st-body', 'data-st-body': '' }));
  const followEl = el.querySelector('[data-st-follow]');

  const all = ctx.views.all();
  const days = all.days || snap.days || [];

  // ---- the answer ----
  // agg.growth reads its "now" from the daily totals; the sorted days are what the hero and the
  // charts below count, so where they cover the last 30 days the answer quotes them instead.
  const g = growthOnSorted(agg.growth(snap, days), (all.perDay || []).map((pd) => pd.pages.total));
  const words = growthWords(g, all.people, fmt);
  if (answerEl) {
    const parts = [{ b: words.lead }, ...words.rest.map((p) => (typeof p === 'string' ? p : { num: p.num, key: p.key, fmt: (v) => fmt.num(v) }))];
    // "pages" is a defined word; make its first use in this chapter the term button
    const i = parts.findIndex((p) => typeof p === 'string' && /\bpages\b/.test(p));
    if (i > 0 && ctx.ui?.sentence) {
      const [before, after] = splitOnce(parts[i], 'pages');
      parts.splice(i, 1, before, { term: 'page', label: 'pages' }, after);
    }
    if (ctx.ui?.sentence?.render) ctx.ui.sentence.render(answerEl, parts, { id: 'growing' });
    else answerEl.textContent = parts.map((p) => (typeof p === 'string' ? p : p.b || p.label || fmt.num(p.num))).join('');
  }
  if (contextEl) {
    contextEl.textContent = (days.length > 1)
      ? `The first chart counts everything since the site opened. The second sorts the last ${days.length} days into people and machines.`
      : 'The first chart counts everything since the site opened. The sorted days start below.';
  }

  // ---- one polite live region for the chapter: both readouts speak through it ----
  const live = h('p', { class: 'st-sr', 'aria-live': 'polite' });
  let liveT = 0;
  const announce = (text) => {
    clearTimeout(liveT);
    liveT = setTimeout(() => { live.textContent = text; }, 250);
  };

  // ---- the figures ----
  // The figures write their own state into the address (a pill, a pinned day). Those routes come
  // back through go() below; they must not scroll the page the way a link from elsewhere does.
  let selfUntil = 0;
  const router = {
    ...ctx.router,
    href: (...a) => ctx.router.href(...a),
    go: (target, opts) => { selfUntil = performance.now() + 400; ctx.router.go(target, opts); },
  };
  const fctx = { ...ctx, router };
  body.textContent = '';
  const long = createLongview(fctx, { announce });
  const sorted = createSorted(fctx, { announce });
  body.append(long.el, sorted.el, live);
  long.mount();
  sorted.mount();
  const st = store.get();
  const view = () => ctx.views.get(store.get().range);
  long.setRange(view());
  sorted.setRange(view(), st);

  // ---- follow-ups ----
  // ctx.ui.followups is the ui/followups.js module (main.js passes modules); take its function
  const followups = typeof ctx.ui?.followups === 'function' ? ctx.ui.followups : ctx.ui?.followups?.followups;
  if (followEl && followups) {
    const items = [];
    const wave = agg.scannerWave(snap);
    if (wave) items.push({ label: `What happened on ${fmt.day(wave.d, 'short')}?`, href: `#/top/replay?d=${wave.d}&u=files` });
    items.push({ label: 'What do people read?', href: '#/read' });
    items.push({ label: 'How much data does it send?', href: '#/growing/data' });
    followups(followEl, items);
  }

  // ---- columns grow in when the chapter is first a quarter visible ----
  // Each figure pours in when it is itself a third visible, not when the chapter is: the chapter
  // is taller than a phone screen, and the sorted chart would finish growing before anyone saw it.
  const offEnter = [];
  if (motion.reduced) { long.finish(); sorted.finish(); }
  else if (ctx.ui?.observe?.onEnter) {
    for (const f of [long, sorted]) offEnter.push(ctx.ui.observe.onEnter(f.el, () => f.grow(), { threshold: 0.3 }));
  } else { long.grow(); sorted.grow(); }
  // reduced motion switched on mid-visit: land everything
  const offReduce = motion.onChange((r) => { if (r) { long.finish(); sorted.finish(); } });

  // ---- width changes redraw (the SVGs are drawn in px, so text stays crisp) ----
  const onResize = rafThrottle(() => { long.resize(); sorted.resize(); });
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(onResize) : null;
  ro?.observe(body);

  // Scroll a figure into view under the sticky bar (the router has already brought the chapter
  // near; a pinned day should land on the sorted chart, not the chapter's top).
  // On a cold deep link the chapters above are still mounting while this runs, and each one that
  // fills in pushes the chart down. So for a moment after arriving, re-aim if the target drifted,
  // unless the reader has started scrolling on their own.
  // Any route that leaves this chapter (Back, a link, a Questions pick) ends that re-aiming at once,
  // or the timers would drag the page back here under an address that names somewhere else.
  let settleT = [];
  const cancelSettle = () => { settleT.forEach(clearTimeout); settleT = []; };
  const here = () => { const r = ctx.router?.current?.(); return !r || r.ch === 'growing'; };
  const offRoute = ctx.bus?.on?.('route', ({ route } = {}) => { if (!route || route.ch !== 'growing') cancelSettle(); });
  function reveal(target) {
    const root = ctx.scrollRoot;
    if (!root || !target || !here()) return;
    const aim = (smooth) => {
      const bar = document.querySelector('[data-st-bar]');
      const barH = bar ? bar.getBoundingClientRect().height : 0;
      const top = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - barH - 12;
      if (Math.abs(top - root.scrollTop) > 24) root.scrollTo({ top: Math.max(0, top), behavior: smooth && !motion.reduced ? 'smooth' : 'auto' });
    };
    aim(true);
    cancelSettle();
    let touched = false;
    const stop = () => { touched = true; };
    const opts = { passive: true, once: true };
    root.addEventListener('wheel', stop, opts);
    root.addEventListener('touchstart', stop, opts);
    root.addEventListener('keydown', stop, opts);
    root.addEventListener('pointerdown', stop, opts);
    settleT = [700, 1400, 2400].map((ms) => setTimeout(() => { if (!touched && here()) aim(false); }, ms));
  }

  return {
    update(state, prev) {
      if (!prev || state.range !== prev.range) {
        long.setRange(view());
        sorted.setRange(view(), state);
      }
      if (!prev || state.unit !== prev.unit) sorted.setUnit(state.unit);
    },
    go(route) {
      // a route here means the reader asked to see the chart: skip the slow pour
      long.finish(); sorted.finish();
      const sub = route?.sub || null;
      // The hash holds one sub at a time, so a pinned day and the long view's Data count can't
      // both be in it. Each sub sets only its own figure; plain #/growing (Back) resets both.
      const fromHere = performance.now() < selfUntil;
      let target = el;
      if (sub === 'data' || sub === 'files') { long.setMode(sub); target = long.el; }
      else if (sub === 'day' && route.item) { if (sorted.select(route.item)) target = sorted.el; }
      else if (!sub) { long.setMode('pages'); sorted.deselect(); }
      // the time-travel gate link goes to #/top, so this only runs for arrivals at this chapter
      if (!fromHere) requestAnimationFrame(() => reveal(target));
    },
    onMode() {},
    destroy() {
      offEnter.forEach((off) => off?.()); offReduce?.(); ro?.disconnect(); clearTimeout(liveT); cancelSettle(); offRoute?.();
      long.destroy(); sorted.destroy();
    },
  };
}

// "… as many pages a day …" → ["… as many ", " a day …"]
function splitOnce(str, word) {
  const re = new RegExp(`\\b${word}\\b`);
  const m = re.exec(str);
  return [str.slice(0, m.index), str.slice(m.index + word.length)];
}
