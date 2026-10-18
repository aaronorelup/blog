// Figure 4b, "Is it fast for them?": the page-paint playback. Two device frames, a laptop and a
// phone, start blank; a playhead sweeps a ruler in real time, and when it reaches a device's
// "three visits in four" time for the main content (p75 LCP from Cloudflare's counter) that
// frame paints and a stamp drops onto the ruler. So 0.68 s is shown as 0.68 s, not as a bar.
// Under it, two buttons let the reader feel a tap answered in this site's time and in a slow
// site's 500 ms.
//
// It always covers the counter's last 30 days (vitals.from to .to), whatever range is picked,
// because the counter only keeps a month of these and they don't split by day.
import * as g from './geom.js';
import { motion, frameLoop } from '../core/motion.js';
import * as fmt from '../core/fmt.js';

const NS = 'http://www.w3.org/2000/svg';
const DEV = {
  desktop: { name: 'Computer', on: 'on a computer', label: 'a computer' },
  mobile: { name: 'Phone', on: 'on a phone', label: 'a phone' },
};

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const sv = (tag, attrs = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};
const has = (d) => !!(d && d.n > 0);

// Two strokes of line art for the image well, a mountain and a smaller one behind it, so a
// painted frame shows a picture arriving and not just a grey box. Drawn in the well's own
// coordinates (x, y, w, h), resting on its floor, so one drawing fits the laptop and the phone.
function mountain(x, y, w, h) {
  const p = (pts) => pts.map(([u, v]) => `${(x + u * w).toFixed(1)},${(y + v * h).toFixed(1)}`).join(' ');
  return [
    sv('polyline', { points: p([[0.1, 0.86], [0.36, 0.3], [0.62, 0.86]]), class: 'st-rhy-sk-mt' }),
    sv('polyline', { points: p([[0.5, 0.6], [0.68, 0.42], [0.9, 0.86]]), class: 'st-rhy-sk-mt' }),
  ];
}

// Line art for the two devices, each with a post skeleton inside: a header hairline (always
// there), and a heading bar, an image well and four lines of text that appear on paint.
function frameSVG(kind) {
  const laptop = kind === 'desktop';
  const W = laptop ? 240 : 104, Hh = laptop ? 152 : 226;
  const svg = sv('svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'st-rhy-dev-svg', 'aria-hidden': 'true', focusable: 'false' });
  const paint = sv('g', { class: 'st-rhy-paint' });
  if (laptop) {
    svg.append(
      sv('rect', { x: 10, y: 1, width: 220, height: 137.5, rx: 7, class: 'st-rhy-screen' }),
      sv('rect', { x: 1, y: 140, width: 238, height: 9, rx: 4, class: 'st-rhy-base' }),
      sv('line', { x1: 10, y1: 16, x2: 230, y2: 16, class: 'st-rhy-hair' }),
    );
    paint.append(
      sv('rect', { x: 24, y: 27, width: 112, height: 8, rx: 4, class: 'st-rhy-sk-h' }),
      sv('rect', { x: 24, y: 43, width: 192, height: 52, rx: 4, class: 'st-rhy-sk-img' }),
      ...mountain(24, 43, 192, 52),
      ...[192, 184, 192, 118].map((w, i) => sv('rect', { x: 24, y: 103 + i * 8.5, width: w, height: 4, rx: 2, class: 'st-rhy-sk-l' })),
    );
  } else {
    svg.append(
      sv('rect', { x: 1, y: 1, width: 102, height: 224, rx: 15, class: 'st-rhy-screen' }),
      sv('rect', { x: 40, y: 7, width: 24, height: 4, rx: 2, class: 'st-rhy-base' }),
      sv('line', { x1: 1, y1: 24, x2: 103, y2: 24, class: 'st-rhy-hair' }),
    );
    paint.append(
      sv('rect', { x: 10, y: 34, width: 62, height: 7, rx: 3.5, class: 'st-rhy-sk-h' }),
      sv('rect', { x: 10, y: 49, width: 84, height: 74, rx: 4, class: 'st-rhy-sk-img' }),
      ...mountain(10, 49, 84, 74),
      ...[84, 78, 84, 50].map((w, i) => sv('rect', { x: 10, y: 133 + i * 9, width: w, height: 4, rx: 2, class: 'st-rhy-sk-l' })),
    );
  }
  const none = sv('text', { x: W / 2, y: laptop ? 76 : 116, 'text-anchor': 'middle', class: 'st-rhy-none' });
  none.textContent = 'No measurements';
  svg.append(paint, none);
  return { svg, paint, none };
}

// A small device mark for the stamps.
function devIcon(kind) {
  const s = sv('svg', { viewBox: '0 0 16 12', class: 'st-rhy-ico', 'aria-hidden': 'true', focusable: 'false' });
  if (kind === 'desktop') s.append(sv('rect', { x: 2.5, y: 1, width: 11, height: 7.5, rx: 1.2 }), sv('line', { x1: 0.8, y1: 10.6, x2: 15.2, y2: 10.6 }));
  else s.append(sv('rect', { x: 5, y: 0.8, width: 6, height: 10.4, rx: 1.4 }), sv('line', { x1: 7.2, y1: 9, x2: 8.8, y2: 9 }));
  return s;
}

// `say` is the chapter's one polite live region (rhythm.js), shared with the clock's readout.
export function mountSpeed(host, ctx, say = () => {}) {
  const V = ctx.snap?.vitals || null;
  const term = (key, label) => {
    try { if (ctx.ui?.term?.term && ctx.words?.TERMS?.[key]) return ctx.ui.term.term(key, label); } catch (e) { /* plain text then */ }
    return document.createTextNode(label);
  };

  const fig = el('figure', 'st-fig st-rhy-fig st-rhy-speed');
  fig.id = 'st-speed';
  const kick = el('p', 'st-rhy-kick', 'Last 30 days, whatever you picked above');
  const fq = el('h3', 'st-fq', 'Is it fast for them?');
  const fa = el('p', 'st-fa');
  fig.append(kick, fq, fa);
  host.append(fig);

  const devs = V ? ['desktop', 'mobile'].filter((k) => V[k]) : [];
  if (!V || !devs.some((k) => has(V[k]))) {
    fa.textContent = "Speed numbers aren't in this filing.";
    return { el: fig, play() {}, openCard() {}, destroy() { fig.remove(); } };
  }
  const D = V.desktop, M = V.mobile;
  const live = ['desktop', 'mobile'].filter((k) => has(V[k]));

  // ---- the sentence ----
  // It leads with the verdict, because "Is the site fast?" lands here and the chapter's own
  // answer is off screen by then. The shift score is said in words; the number itself is in
  // the device card and the table.
  {
    const lead = { 'Fast.': 'Yes, fast:', 'Mostly fast.': 'Mostly fast:', 'Slow.': 'No, slow:' }[g.speedLead(V)];
    // a number never wraps away from its unit ("0.8 / s")
    const nb = (s) => s.replace(/ (s|ms)\b/g, ' $1');
    const lcps = live.map((k) => `${nb(fmt.secs(V[k].lcp))} ${DEV[k].on}`);
    const inps = live.map((k) => `${fmt.num(V[k].inp)} ms ${DEV[k].on}`);
    fa.append(
      `${lead} `, term('p75', 'three visits in four'), ' saw ', term('lcp', 'the main content'),
      ` within ${fmt.list(lcps)} (Google calls under 2.5 s good). `,
      term('inp', 'A tap got an answer'),
      ` in ${fmt.list(inps)} (under 200 ms is good), and ${g.movedText(V)}.`,
    );
  }

  // ---- frames and ruler ----
  const stage = el('div', 'st-rhy-stage');
  const frames = el('div', 'st-rhy-frames');
  const F = {};
  for (const k of ['desktop', 'mobile']) {
    const d = V[k];
    const b = el('button', `st-rhy-dev st-rhy-dev-${k}`);
    b.type = 'button';
    const art = frameSVG(k);
    const cap = el('span', 'st-rhy-devcap', DEV[k].name);
    b.append(art.svg, cap);
    const ok = has(d);
    art.none.style.display = ok ? 'none' : '';
    b.setAttribute('aria-label', ok
      ? `${DEV[k].name}: the main content showed within ${fmt.secs(d.lcp)} for three visits in four. Open the details.`
      : `${DEV[k].name}: no measurements.`);
    frames.append(b);
    F[k] = { b, art, ok, painted: false };
  }

  const max = g.rulerMax(V);
  const xPct = (t) => `${(Math.min(t, max) / max) * 100}%`;
  const ruler = el('div', 'st-rhy-ruler');
  ruler.setAttribute('aria-hidden', 'true');
  const axis = el('div', 'st-rhy-axis');
  const ticks = g.rulerTicks(max);
  ticks.forEach((t, i) => {
    const tk = el('span', t % 1000 === 0 ? 'st-rhy-tk is-major' : 'st-rhy-tk');
    tk.style.left = xPct(t);
    const lab = el('span', 'st-rhy-tkl', g.tickLabel(t, i === ticks.length - 1));
    lab.style.left = xPct(t);
    if (i === ticks.length - 1) lab.classList.add('is-last');
    if (i === 0) lab.classList.add('is-first');
    ruler.append(tk, lab);
  });
  const good = el('span', 'st-rhy-good');
  good.style.left = xPct(g.GOOD.lcp);
  const goodL = el('span', 'st-rhy-goodl', 'Google: good below this');
  goodL.style.left = xPct(g.GOOD.lcp);
  const head = el('span', 'st-rhy-head');
  const headL = el('span', 'st-rhy-headl', '0.00 s');
  head.append(headL);
  ruler.append(axis, good, goodL, head);
  const stamps = {};
  // the slower device takes the upper lane, so the faster one's stem never crosses a stamp
  [...live].sort((a, b) => V[b].lcp - V[a].lcp).forEach((k, lane) => {
    const x = xPct(V[k].lcp);
    const stem = el('span', `st-rhy-stem lane-${lane}`);
    stem.style.left = x;
    const st = el('span', `st-rhy-stamp lane-${lane}`);
    st.style.setProperty('--x', x);
    st.append(devIcon(k), el('span', null, fmt.secs(V[k].lcp)));
    ruler.append(stem, st);
    stamps[k] = [stem, st];
  });
  stage.append(frames, ruler);

  const ctl = el('div', 'st-rhy-ctl');
  const replay = el('button', 'st-rhy-replay', 'Replay');
  replay.type = 'button';
  replay.addEventListener('click', () => play(true));
  ctl.append(replay);

  // ---- feel it ----
  const feel = el('div', 'st-rhy-feel');
  feel.setAttribute('role', 'group');
  feel.setAttribute('aria-label', 'Feel the difference');
  const feelK = el('span', 'st-rhy-feelk', 'Feel it');
  const inpHere = (has(D) ? D : M).inp;
  const tapBtn = (msv, text) => {
    const b = el('button', 'st-pill st-rhy-tap');
    b.type = 'button';
    const ghost = el('span', 'st-rhy-tapghost', text), t = el('span', 'st-rhy-taptext', text);
    ghost.setAttribute('aria-hidden', 'true');
    b.append(ghost, t);
    b.dataset.ms = String(msv);
    let busy = false;
    b.addEventListener('click', () => {
      if (busy) return;
      busy = true;
      const t0 = performance.now();
      b.classList.add('is-waiting');
      // The wait is the point, so it happens under reduced motion too; only the ripple goes.
      setTimeout(() => {
        b.dataset.answeredMs = String(Math.round(performance.now() - t0));
        b.classList.remove('is-waiting');
        b.classList.add('is-answered');
        t.textContent = 'Answered';
        say(`Answered after ${fmt.num(msv)} milliseconds`);
        setTimeout(() => { b.classList.remove('is-answered'); t.textContent = text; busy = false; }, 1200);
      }, msv);
    });
    return b;
  };
  feel.append(feelK, tapBtn(inpHere, `Tap: this site (${fmt.num(inpHere)} ms)`), tapBtn(500, 'Tap: a slow site (500 ms)'));

  // ---- footnote, invite, table ----
  const foot = el('p', 'st-rhy-foot');
  {
    const n = (k) => (V[k] ? fmt.num(V[k].n || 0) : '0');
    let s = `From ${n('desktop')} computer and ${n('mobile')} phone visits Cloudflare's counter measured, ${fmt.span(V.from, V.to)}`;
    const rough = live.filter((k) => V[k].n < 30).map((k) => DEV[k].name.toLowerCase());
    if (rough.length) s += `, so the ${fmt.list(rough)} ${fmt.plural(rough.length, 'figure is', 'figures are')} rough`;
    foot.textContent = s + '.';
  }
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const invite = el('p', 'st-invite', `${fine.matches ? 'Click' : 'Tap'} a device for its numbers.`);
  // wide screens: the playback on the left, the things to try and the small print beside it
  const grid = el('div', 'st-rhy-sgrid'), main = el('div', 'st-rhy-smain'), aside = el('div', 'st-rhy-saside');
  main.append(stage, ctl);
  aside.append(feel, foot, invite);
  grid.append(main, aside);
  fig.append(grid);
  let toolsH = null;
  const T = ctx.ui?.table;
  if (T?.tableTwin) {
    const tw = T.tableTwin({
      caption: `How fast pages were for three visits in four, ${fmt.span(V.from, V.to)}`,
      cols: [
        { key: 'dev', label: 'Device' }, { key: 'n', label: 'Visits measured', num: true },
        { key: 'lcp', label: 'Main content showed (s)', num: true, fmt: (v) => (v === '' ? '' : String(v)) },
        { key: 'inp', label: 'Tap got an answer (ms)', num: true },
        { key: 'cls', label: 'Moved while loading (score)', num: true, fmt: (v) => (v === '' ? '' : g.clsText(v)) },
      ],
      rows: devs.map((k) => ({ dev: DEV[k].name, n: V[k].n || 0, lcp: has(V[k]) ? V[k].lcp / 1000 : '', inp: has(V[k]) ? V[k].inp : '', cls: has(V[k]) ? V[k].cls : '' })),
    });
    toolsH = T.figureTools?.(fig, { table: tw, route: { ch: 'speed', sub: null, item: null }, router: ctx.router });
  }

  // ---- the device card ----
  const P = ctx.ui?.pop;
  function cardNode(k) {
    const d = V[k];
    const body = !has(d)
      ? [`Cloudflare's counter measured no visits ${DEV[k].on} in these 30 days.`]
      : [
        `The main content showed within ${fmt.secs(d.lcp)} for three visits in four: the biggest thing on the page, a heading or a picture, was on screen. Google calls under 2.5 s good.`,
        `A tap got an answer within ${fmt.num(d.inp)} ms: how long the page took to respond to a tap, click or key. Under 200 ms is good.`,
        `The page ${d.cls > g.GOOD.cls ? 'jumped' : d.cls > 0 ? 'barely moved' : "didn't move"} while loading: a shift score of ${g.clsText(d.cls)}, where under 0.1 is good.`,
      ];
    const meta = has(d)
      ? `From ${fmt.num(d.n)} measured visits${d.n < 30 ? ', so it is rough' : ''}. These come from Cloudflare's counter, so they cover only browsers that ran it.`
      : null;
    if (P?.cardBody) return P.cardBody({ title: `${DEV[k].name}s`, body, meta });
    const box = el('div');
    for (const t of body.concat(meta || [])) box.append(el('p', null, t));
    return box;
  }
  // a click (or tap, or Enter) on a frame opens its card and a second one closes it; no hover
  // card, since pointing at a frame during playback shouldn't cover the ruler
  const unbind = [];
  for (const k of ['desktop', 'mobile']) {
    if (P?.bindPop) unbind.push(P.bindPop(F[k].b, () => cardNode(k), { hover: false, focus: false, kind: 'card', label: `${DEV[k].name} speed`, placement: 'auto' }));
  }
  function openCard(k) {
    const anchor = F[k]?.b;
    if (!anchor || !P?.openPop || P.isOpenFor?.(anchor)) return;
    P.openPop(anchor, () => cardNode(k), { kind: 'card', label: `${DEV[k].name} speed`, placement: 'auto', pinned: true });
  }

  // ---- playback ----
  let state = 'idle';   // idle → playing → done
  let t0 = 0;
  const paint = (k, at) => {
    const f = F[k];
    if (!f || f.painted) return;
    f.painted = true;
    f.b.classList.add('is-painted');
    if (at != null) f.b.dataset.stPaintMs = String(Math.round(at));
    stamps[k]?.forEach((s) => s.classList.add('is-on'));
  };
  const reset = () => {
    for (const k in F) { F[k].painted = false; F[k].b.classList.remove('is-painted'); delete F[k].b.dataset.stPaintMs; }
    for (const k in stamps) stamps[k].forEach((s) => s.classList.remove('is-on'));
  };
  const finalFrame = () => {
    loop.stop();
    for (const k of live) paint(k);
    head.classList.remove('is-on');
    state = 'done';
  };
  const loop = frameLoop(() => {
    const t = performance.now() - t0;
    head.style.left = xPct(t);
    headL.textContent = `${(Math.min(t, max) / 1000).toFixed(2)} s`;
    for (const k of live) if (t >= V[k].lcp) paint(k, t);
    if (t >= max) {
      head.classList.remove('is-on');
      state = 'done';
      return false;
    }
    return true;
  });
  function play(force) {
    if (motion.reduced) { finalFrame(); return; }
    if (state === 'playing' && !force) return;
    loop.stop();
    reset();
    state = 'playing';
    head.style.left = '0%';
    headL.textContent = '0.00 s';
    head.classList.add('is-on');
    t0 = performance.now();
    loop.start();
  }
  const syncReduced = () => {
    replay.hidden = motion.reduced;
    if (motion.reduced) finalFrame();
  };
  syncReduced();
  const offReduced = motion.onChange(syncReduced);

  // Runs once by itself, when the reader can see the ruler whole. The sweep, the stamps landing
  // and the "good below this" line are the point, and the ruler is the bottom of the stage: an
  // "half the stage is in view" trigger started it with the ruler still under the scroller's
  // bottom edge, so the frames filled in with no clock. So it waits until the ruler sits fully
  // inside the visible band (below the sticky range bar, above the scroller's bottom) and, when
  // the whole stage fits, until the frames above it are in too, so a reader scrolling back up
  // doesn't watch a ruler paint frames that are still above the bar. A stage taller than the
  // band starts on the ruler alone. Scroll events are only listened to while the stage is on
  // screen, and not at all once it has played.
  let offEnter = null;
  if (!motion.reduced) {
    const sc = ctx.ui?.observe?.scrollRoot?.();
    const watch = ctx.ui?.observe?.watchVisible;
    if (sc && watch) {
      let listening = false, raf = 0, offVis = null;
      const band = () => {
        const r = sc.getBoundingClientRect();
        const bar = document.querySelector('.st-bar');
        const b = bar && bar.getBoundingClientRect();
        const top = b && b.bottom > r.top && b.top < r.top + 140 ? b.bottom : r.top;
        return { top, bottom: Math.min(r.bottom, innerHeight) };
      };
      const stopListening = () => {
        if (listening) sc.removeEventListener('scroll', onScroll);
        listening = false;
        cancelAnimationFrame(raf);
        raf = 0;
      };
      const teardown = () => { stopListening(); offVis?.(); offVis = null; };
      const check = () => {
        raf = 0;
        if (state !== 'idle') { teardown(); return; }   // a routed arrival already played it
        const bd = band();
        const ru = ruler.getBoundingClientRect(), st = stage.getBoundingClientRect();
        if (!ru.height || ru.top < bd.top - 1 || ru.bottom > bd.bottom + 1) return;
        const fits = st.height <= bd.bottom - bd.top;
        if (fits && st.top < bd.top - 1) return;
        teardown();
        play();
      };
      function onScroll() { if (!raf) raf = requestAnimationFrame(check); }
      offVis = watch(stage, (v) => {
        if (v && !listening) { sc.addEventListener('scroll', onScroll, { passive: true }); listening = true; check(); }
        else if (!v) stopListening();
      });
      offEnter = teardown;
    } else play();
  }

  return {
    el: fig,
    play,
    openCard,
    get state() { return state; },
    destroy() {
      loop.stop();
      offEnter?.();
      offReduced?.();
      toolsH?.destroy?.();
      unbind.forEach((u) => u?.());
      fig.remove();
    },
  };
}
