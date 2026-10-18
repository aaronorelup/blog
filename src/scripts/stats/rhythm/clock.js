// Figure 4a, "When do they come?": the Lantern Clock. A 24-hour dial with midnight at the top,
// one wedge per hour growing out of a zero ring, as long as the people's pages read in that
// hour (linear, the busiest hour reaching 95% of the radius). Under it, when the range is two
// weeks or more, the average day of the week.
//
// The dial can show the reader's own clock or UTC. Switching turns the whole wedge group by the
// reader's offset (15° an hour), so the eye sees that nothing about the counts changed, only the
// clock they're read on; then the same wedges are redrawn in place for the new clock. A zone that
// isn't a whole hour off UTC keeps UTC's hour edges with local labels (agg.hoursLocal), so its
// wedges straddle the half hours, and a note says why.
//
// Nothing here runs while idle: the grow, the turn and range changes are single tweens.
import * as g from './geom.js';
import { motion, tween, EASE, pulse } from '../core/motion.js';
import * as fmt from '../core/fmt.js';

const NS = 'http://www.w3.org/2000/svg';
const WD = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const UTC_ZONES = /^(UTC|Etc\/UTC|Etc\/GMT|GMT|Etc\/Universal|Universal|Etc\/Zulu|Zulu)$/;

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
const spoken = (s) => s.replace(/–/g, ' to ');
const mod = (a, n) => ((a % n) + n) % n;
const perDay = (n) => (n < 10 ? String(Math.round(n * 10) / 10) : Math.round(n).toLocaleString('en-US'));

const rng = (lo, hi) => (perDay(lo) === perDay(hi) ? perDay(hi) : `${perDay(lo)}–${perDay(hi)}`);

// `say` is the chapter's one polite live region (rhythm.js), shared with the speed figure.
export function mountClock(host, ctx, say = () => {}) {
  const { agg } = ctx;
  const zone = ctx.tz?.zone || 'UTC';
  const city = ctx.tz?.city || fmt.tzCity?.(zone) || 'your time';
  const readerIsUTC = UTC_ZONES.test(zone);
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  // ---- the figure ----
  const fig = el('figure', 'st-fig st-rhy-fig');
  fig.id = 'st-when';
  const fq = el('h3', 'st-fq', 'When do they come?');
  const fa = el('p', 'st-fa');
  const wrap = el('div', 'st-rhy-when');

  const left = el('div', 'st-rhy-left');
  const toggle = el('div', 'st-rhy-tz');
  toggle.setAttribute('role', 'radiogroup');
  toggle.setAttribute('aria-label', 'Which clock to read the hours on');
  const tzBtn = (mode, label) => {
    const b = el('button', 'st-pill st-rhy-tzpill', label);
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.dataset.tz = mode;
    b.addEventListener('click', () => pick(mode));
    b.addEventListener('keydown', (e) => {
      if (!/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return;
      e.preventDefault();
      const other = mode === 'local' ? 'utc' : 'local';
      pick(other);
      toggle.querySelector(`[data-tz="${other}"]`).focus();
    });
    return b;
  };
  const bLocal = tzBtn('local', `Your time (${city})`), bUTC = tzBtn('utc', 'UTC');
  toggle.append(bLocal, bUTC);
  if (readerIsUTC) toggle.hidden = true;

  // the dial: SVG for the marks, an HTML centre for the words (fonts, wrapping)
  const dial = el('div', 'st-rhy-dial');
  dial.tabIndex = 0;
  dial.setAttribute('role', 'group');
  const svg = sv('svg', { viewBox: '0 0 300 300', class: 'st-rhy-svg', 'aria-hidden': 'true', focusable: 'false' });
  const face = sv('g', { class: 'st-rhy-face' });
  face.append(sv('circle', { cx: g.C, cy: g.C, r: g.R, class: 'st-rhy-rim' }));
  for (let i = 0; i < 24; i++) {
    const long = i % 6 === 0;
    const [x1, y1] = g.point(i * 15, g.R - (long ? 5 : 0));
    const [x2, y2] = g.point(i * 15, g.R + (long ? 5 : 3));
    face.append(sv('line', { x1, y1, x2, y2, class: long ? 'st-rhy-tick is-long' : 'st-rhy-tick' }));
  }
  const turn = sv('g', { class: 'st-rhy-turn' });
  const night = sv('path', { class: 'st-rhy-night' });
  const wedgeG = sv('g', { class: 'st-rhy-wedges' });
  const wedges = Array.from({ length: 24 }, () => wedgeG.appendChild(sv('path', { class: 'st-rhy-wedge' })));
  const selP = sv('path', { class: 'st-rhy-sel' });
  const nowG = sv('g', { class: 'st-rhy-now' });
  const nowL = sv('line', {}), nowDot = sv('circle', { r: 2.4 }), nowT = sv('text', { class: 'st-rhy-nowt' });
  nowT.textContent = 'now';
  nowG.append(nowL, nowDot, nowT);
  turn.append(night, wedgeG, selP, nowG);
  const hub = sv('circle', { cx: g.C, cy: g.C, r: g.R0, class: 'st-rhy-hub' });
  const labels = sv('g', { class: 'st-rhy-labels' });
  const LAB = [[0, g.C, -9, 'middle'], [360, g.C + g.R + 11, g.C + 4, 'start'], [720, g.C, g.C + g.R + 21, 'middle'], [1080, g.C - g.R - 11, g.C + 4, 'end']];
  for (const [m, x, y, anchor] of LAB) {
    const t = sv('text', { x, y, 'text-anchor': anchor });
    t.textContent = fmt.hourLabel(m);
    labels.append(t);
  }
  svg.append(face, turn, hub, labels);
  const centre = el('div', 'st-rhy-centre');
  const cSpan = el('b', 'st-rhy-cspan'), cNum = el('span', 'st-rhy-cnum'), cShare = el('span', 'st-rhy-cshare');
  centre.append(cSpan, cNum, cShare);
  centre.setAttribute('aria-hidden', 'true');
  dial.append(svg, centre);
  left.append(toggle, dial);

  const side = el('div', 'st-rhy-side');
  const readout = el('p', 'st-rhy-readout');
  readout.setAttribute('aria-hidden', 'true');
  const note = el('p', 'st-rhy-note');
  // The hours only exist for pages that passed every question, so they are the high end of
  // the people range; the weekday row below has both ends and shows them.
  const caveat = el('p', 'st-rhy-caveat', 'Hours count the pages that passed every question: the high end, Aaron included.');
  const invite = el('p', 'st-invite');
  side.append(readout, note, caveat, invite);

  // weekday row
  const wk = el('div', 'st-rhy-wk');
  wk.id = 'st-weekdays';
  const wkHead = el('p', 'st-rhy-wkhead', 'By day of the week');
  const wkCols = el('div', 'st-rhy-wkcols');
  wkCols.setAttribute('role', 'group');
  wkCols.setAttribute('aria-label', "Average people's pages by day of the week, UTC days");
  wkCols.append(el('span', 'st-rhy-wkend'));
  // Each column is the people range for that weekday: solid up to the low end, striped on to
  // the high end, like every other people range on the page. The caption under the row follows
  // the pointer or focus but isn't a live region: each button's name already carries its numbers.
  const wkBtns = WD.map((name, i) => {
    const b = el('button', 'st-rhy-wkcol');
    b.type = 'button';
    const bar = el('span', 'st-rhy-wkbar'), lab = el('span', 'st-rhy-wklab', name.slice(0, 3));
    const val = el('span', 'st-rhy-wkval'), box = el('span', 'st-rhy-wkbox');
    bar.append(el('span', 'st-rhy-wklo'));
    box.append(bar);
    b.append(val, box, lab);
    b.style.gridColumn = String(i + 1);
    b.style.gridRow = '1';
    const show = () => wkShow(i);
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(); });
    b.addEventListener('focus', show);
    b.addEventListener('click', () => { wkPinned = i; show(); });
    b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') wkShow(wkPinned); });
    b.addEventListener('blur', () => wkShow(wkPinned));
    wkCols.append(b);
    return b;
  });
  const wkCap = el('p', 'st-rhy-wkcap');
  wk.append(wkHead, wkCols, wkCap);
  side.append(wk);

  wrap.append(left, side);
  fig.append(fq, fa, wrap);
  host.append(fig);

  // ---- state ----
  let mode = 'local';
  let view = null, H = null, HL = null, HU = null;   // the shown clock, and both clocks
  let radii = Array(24).fill(g.R0);                  // what is drawn now
  let grown = motion.reduced;
  let selU = null, hoverJ = null;                   // the pinned hour (as a UTC hour) and the pointed one
  let rot = 0, anim = null, liveT = 0;
  let wk7 = null, wkBusy = 0, wkPinned = 0;

  const clockOf = (m) => (m === 'utc' || readerIsUTC ? HU : HL);
  // UTC hour of bin j on clock h, and bin of UTC hour u on clock h
  const utcOf = (h, j) => (h.utcOf ? h.utcOf(j) : mod(Math.round(j - (h.fractional ? 0 : h.offsetMin / 60)), 24));
  const binOfU = (h, u) => { for (let j = 0; j < 24; j++) if (utcOf(h, j) === u) return j; return u; };
  const spanOf = (h, j) => (h.span ? h.span(j) : fmt.hourSpan(g.binStart(j, h)));
  const localSpanOfU = (u) => fmt.hourSpan(mod(u * 60 + HL.offsetMin, 1440));

  function drawWedges(rs) {
    radii = rs;
    for (let j = 0; j < 24; j++) wedges[j].setAttribute('d', g.wedgePath(g.angleOf(g.binStart(j, H)), rs[j]));
    drawSel();
  }
  const target = () => {
    const max = Math.max(...H.bins);
    return H.bins.map((v) => g.radiusFor(v, max));
  };

  function drawStatic() {
    // the reader's night, 6 pm to 6 am on their own clock, wherever that falls on this dial
    const nightAt = (m) => g.angleOf(H === HU && !readerIsUTC ? m - HL.offsetMin : m);
    night.setAttribute('d', g.ringPath(nightAt(1080), nightAt(360), g.R0, g.R));
    // now: the reader's current time on this clock
    const now = new Date();
    const mins = H === HU || readerIsUTC ? now.getUTCHours() * 60 + now.getUTCMinutes() : localMinutes(now);
    const a = g.angleOf(mins);
    const [x1, y1] = g.point(a, g.R - 6), [x2, y2] = g.point(a, g.R + 7), [tx, ty] = g.point(a, g.R + 18);
    nowL.setAttribute('x1', x1); nowL.setAttribute('y1', y1); nowL.setAttribute('x2', x2); nowL.setAttribute('y2', y2);
    nowDot.setAttribute('cx', x2); nowDot.setAttribute('cy', y2);
    const s = Math.sin((a * Math.PI) / 180);
    nowT.setAttribute('x', tx); nowT.setAttribute('y', ty + 3.5);
    nowT.setAttribute('text-anchor', s > 0.3 ? 'start' : s < -0.3 ? 'end' : 'middle');
    // the word would sit on a clock label within 25° of the four quarters; the mark alone says it
    const nearLabel = Math.min(...[0, 90, 180, 270, 360].map((q) => Math.abs(a - q))) < 25;
    nowT.style.display = nearLabel ? 'none' : '';
  }
  function localMinutes(d) {
    try {
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(d).map((x) => [x.type, x.value]));
      return (Number(p.hour) % 24) * 60 + Number(p.minute);
    } catch (e) { return d.getHours() * 60 + d.getMinutes(); }
  }

  const shownJ = () => {
    if (hoverJ != null) return hoverJ;
    if (selU != null) return binOfU(H, selU);
    return g.peakQuiet(H.bins, H).peak;
  };
  function drawSel() {
    const j = shownJ();
    selP.setAttribute('d', H.total > 0 ? g.wedgePath(g.angleOf(g.binStart(j, H)), Math.max(radii[j], g.R0 + 4)) : '');
    wedges.forEach((w, i) => w.classList.toggle('is-on', i === j));
  }
  function writeCentre(announce) {
    const j = shownJ();
    const v = H.bins[j] || 0;
    const span = spanOf(H, j);
    cSpan.textContent = span;
    cSpan.classList.toggle('is-long', span.length > 8);
    cNum.textContent = `${fmt.num(v)} ${fmt.plural(v, 'page', 'pages')}`;
    cShare.textContent = H.total > 0 ? fmt.pct(v / H.total) : '';
    // "8 to 9 pm your time (midnight to 1 am UTC): 108 pages"
    const u = utcOf(H, j);
    let words;
    if (readerIsUTC) words = `${spoken(span)} UTC`;
    else if (H === HU) words = `${spoken(fmt.hourSpan(u * 60))} UTC (${spoken(localSpanOfU(u))} your time)`;
    else words = `${spoken(span)} your time (${spoken(fmt.hourSpan(u * 60))} UTC)`;
    readout.textContent = `${words}: ${fmt.num(v)} ${fmt.plural(v, 'page', 'pages')}`;
    if (announce) {
      clearTimeout(liveT);
      liveT = setTimeout(() => say(readout.textContent), 250);
    }
  }

  function writeFa() {
    if (H.total < 24) {
      fa.textContent = `Only ${fmt.num(H.total)} ${fmt.plural(H.total, 'page', 'pages')}: too few to see a pattern.`;
      return;
    }
    const share = fmt.pct(g.nightShare(H.bins, H));
    const where = H === HU || readerIsUTC ? 'UTC' : 'your time';
    const s = `${share} of people's pages were read between midnight and 6 am ${where}.`;
    fa.textContent = s.charAt(0).toUpperCase() + s.slice(1);
  }
  function writeNote() {
    const frac = !readerIsUTC && H === HL && HL.fractional;
    note.hidden = !frac;
    if (frac) note.textContent = `Your clock is ${g.offsetText(HL.offsetMin)} from UTC, so each hour here starts at ${g.startsAt(HL.offsetMin)}.`;
    invite.textContent = fine.matches ? 'Point at an hour for its count.' : 'Tap an hour for its count.';
    dial.setAttribute('aria-label', `A 24-hour clock of people's pages, ${H === HU || readerIsUTC ? 'in UTC' : 'on your clock'}, midnight at the top. Left and right arrows step through the hours.`);
  }
  function writeToggle() {
    for (const b of [bLocal, bUTC]) {
      const on = b.dataset.tz === mode;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    }
  }

  // ---- table twins ----
  // Made once, refilled on every range change. The figure has one tools row at its foot, like
  // every other figure: "Show the numbers" opens the hour table and the weekday table together,
  // and Copy as CSV copies both. The two sit in one wrapper that the tools row toggles.
  const T = ctx.ui?.table;
  let clockTwin = null, wkTwin = null, toolsH = null;
  const tables = el('div', 'st-rhy-tables st-sr');
  tables.id = 'st-rhy-tables';
  function writeTables() {
    if (!T?.tableTwin) return;
    const rows = [];
    for (let j = 0; j < 24; j++) {
      const u = readerIsUTC ? j : utcOf(HL, j);
      rows.push({ local: spanOf(HL, j), utc: fmt.hourSpan(u * 60), pages: HL.bins[j] });
    }
    const spec = {
      caption: `People's pages by hour, ${view.phrase?.long || ''}`.trim(),
      cols: readerIsUTC
        ? [{ key: 'utc', label: 'Hour (UTC)' }, { key: 'pages', label: 'Pages', num: true }]
        : [{ key: 'local', label: `Hour (${city})` },{ key: 'utc', label: 'Hour (UTC)' }, { key: 'pages', label: 'Pages', num: true }],
      rows,
    };
    const wspec = {
      caption: "People's pages on an average day of the week (UTC days), " + (view.phrase?.long || ''),
      cols: [
        { key: 'day', label: 'Day' },
        { key: 'lo', label: 'Average pages, low end', num: true, fmt: (v) => perDay(v) },
        { key: 'hi', label: 'Average pages, high end', num: true, fmt: (v) => perDay(v) },
        { key: 'n', label: 'Days counted', num: true },
      ],
      rows: wk7 ? WD.map((d, i) => ({ day: d, lo: wk7.lo[i], hi: wk7.hi[i], n: wk7.counts[i] })) : [],
    };
    if (clockTwin) { clockTwin.update(spec); wkTwin.update(wspec); }
    else {
      clockTwin = T.tableTwin(spec);
      wkTwin = T.tableTwin(wspec);
      // the wrapper does the hiding, so the tables themselves drop their own .st-sr
      clockTwin.el.classList.remove('st-sr');
      wkTwin.el.classList.remove('st-sr');
      tables.append(clockTwin.el, wkTwin.el);
      const both = { el: tables, csv: () => clockTwin.csv() + (wk7 ? '\n' + wkTwin.csv() : '') };
      toolsH = T.figureTools?.(wrap, { table: both, route: { ch: 'when', sub: null, item: null }, router: ctx.router });
    }
    wkTwin.el.hidden = !wk7;
  }

  // ---- weekdays ----
  function writeWeekdays() {
    wk.hidden = !wk7;
    if (!wk7) return;
    // the busiest day is the one with the highest high end, which is also what the bars scale to
    const max = Math.max(...wk7.hi, 0);
    wkBusy = wk7.hi.indexOf(max);
    wkPinned = wkBusy;
    wkBtns.forEach((b, i) => {
      const lo = wk7.lo[i], hi = wk7.hi[i];
      const bar = b.querySelector('.st-rhy-wkbar');
      bar.style.height = `${max > 0 ? Math.max(hi > 0 ? 2 : 0, (hi / max) * 48) : 0}px`;
      bar.firstChild.style.height = hi > 0 ? `${(lo / hi) * 100}%` : '0';
      b.querySelector('.st-rhy-wkval').textContent = rng(lo, hi);
      b.setAttribute('aria-label', `${WD[i]}: ${spoken(rng(lo, hi))} pages on average, from ${wk7.counts[i]} ${fmt.plural(wk7.counts[i], 'day', 'days')}`);
    });
    wkShow(wkPinned);
  }
  function wkShow(i) {
    if (!wk7) return;
    wkBtns.forEach((b, k) => b.classList.toggle('is-on', k === i));
    wkCap.textContent = `On an average ${WD[i]}: ${spoken(rng(wk7.lo[i], wk7.hi[i]))} pages; busiest day of the week: ${WD[wkBusy]}.`;
  }

  // ---- motion ----
  function animateRadii(to, { dur = 450, stagger = 0, ease = EASE.std } = {}) {
    anim?.cancel();
    const from = radii.slice();
    const total = dur + stagger * 23;
    const e = ease || ((t) => t);
    anim = tween({
      from: 0, to: total, dur: total, ease: (t) => t,
      onUpdate: (ms) => {
        const rs = from.map((r0, j) => {
          const p = Math.min(1, Math.max(0, (ms - j * stagger) / dur));
          return r0 + (to[j] - r0) * e(p);
        });
        drawWedges(rs);
      },
      onDone: () => { anim = null; drawWedges(to); },
    });
  }

  function grow() {
    if (grown) return;
    grown = true;
    // clockwise from midnight on the clock shown
    const order = [...Array(24).keys()].sort((a, b) => g.binStart(a, H) - g.binStart(b, H));
    const rank = []; order.forEach((j, k) => { rank[j] = k; });
    anim?.cancel();
    const to = target(), from = Array(24).fill(g.R0), dur = 600, st = 15;
    const ease = EASE.out;
    anim = tween({
      from: 0, to: dur + st * 23, dur: dur + st * 23, ease: (t) => t,
      onUpdate: (ms) => drawWedges(from.map((r, j) => r + (to[j] - r) * ease(Math.min(1, Math.max(0, (ms - rank[j] * st) / dur))))),
      onDone: () => { anim = null; drawWedges(to); },
    });
  }

  function turnTo(next) {
    // Turn the old wedges until they sit where the new clock puts them, then redraw them for
    // the new clock with no rotation: the two pictures match, so the swap is invisible. If the
    // range spans a daylight-saving change the counts per hour differ a little; those crossfade.
    const old = H, oldBins = H.bins.slice();
    let delta = mod((next === 'utc' ? -HL.offsetMin : HL.offsetMin) / 4, 360);
    if (delta > 180) delta -= 360;
    anim?.cancel();
    svg.classList.add('is-turning');
    anim = tween({
      from: 0, to: delta, dur: 700, ease: EASE.std,
      onUpdate: (a) => { rot = a; turn.setAttribute('transform', `rotate(${a} ${g.C} ${g.C})`); },
      onDone: () => {
        anim = null;
        rot = 0;
        turn.removeAttribute('transform');
        svg.classList.remove('is-turning');
        H = clockOf(next);
        let same = true;
        for (let j = 0; j < 24; j++) if (H.bins[binOfU(H, utcOf(old, j))] !== oldBins[j]) { same = false; break; }
        drawStatic();
        drawWedges(target());
        writeCentre(true);
        writeFa();
        writeNote();
        if (!same && wedgeG.animate && !motion.reduced) wedgeG.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 160, easing: 'linear' });
        labels.animate?.([{ opacity: 0.2 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
      },
    });
  }

  function pick(next) {
    if (next === mode) return;
    // pushed, not replaced (DESIGN §D.8 lists the toggle as replace, but P6's acceptance wants
    // Back to turn the dial back, and a reader who flips the clock expects Back to undo it)
    ctx.store.set({ tz: next }, { push: true, source: 'rhythm' });
  }

  // ---- pointer and keys ----
  const toBox = (e) => {
    const r = svg.getBoundingClientRect();
    return [((e.clientX - r.left) * 300) / r.width, ((e.clientY - r.top) * 300) / r.height];
  };
  const binAtEvent = (e) => {
    const [x, y] = toBox(e);
    // undo a turn in progress so the hit follows the wedge under the finger
    if (!rot) return g.binAt(x, y, H);
    const a = (-rot * Math.PI) / 180, dx = x - g.C, dy = y - g.C;
    return g.binAt(g.C + dx * Math.cos(a) - dy * Math.sin(a), g.C + dx * Math.sin(a) + dy * Math.cos(a), H);
  };
  dial.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !H) return;
    const j = binAtEvent(e);
    const next = j < 0 ? null : j;
    if (next === hoverJ) return;
    hoverJ = next;
    drawSel();
    // pointing only changes the picture; the live region speaks for taps and keys
    writeCentre(false);
  });
  dial.addEventListener('pointerleave', () => {
    if (hoverJ == null) return;
    hoverJ = null;
    drawSel();
    writeCentre(false);
  });
  dial.addEventListener('click', (e) => {
    if (!H) return;
    const j = binAtEvent(e);
    if (j < 0) return;
    selU = utcOf(H, j);
    hoverJ = null;
    drawSel();
    writeCentre(true);
  });
  dial.addEventListener('keydown', (e) => {
    if (!H) return;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (e.key === 'Home') { e.preventDefault(); selU = utcOf(H, g.peakQuiet(H.bins, H).peak); }
    else if (step) { e.preventDefault(); selU = utcOf(H, mod(shownJ() + step, 24)); }
    else return;
    hoverJ = null;
    drawSel();
    writeCentre(true);
  });

  // grow when a quarter of the figure is in view
  // (the observer fires once; an entry before the first render is kept and grown by render)
  let offEnter = null, growPending = false;
  if (!grown && ctx.ui?.observe?.onEnter) offEnter = ctx.ui.observe.onEnter(fig, () => { if (H) grow(); else growPending = true; }, { threshold: 0.25 });
  else grown = true;

  return {
    el: fig,
    /** @returns {{peak:string, quiet:string, total:number, utc:boolean}} */
    render(v, tzMode, { animateTz = false, rangeChanged = true } = {}) {
      const nextMode = readerIsUTC ? 'local' : tzMode === 'utc' ? 'utc' : 'local';
      if (rangeChanged || !HL) {
        view = v;
        HL = readerIsUTC ? null : agg.hoursLocal(v.days, zone, ctx.snap.through);
        HU = agg.hoursLocal(v.days, 'utc', ctx.snap.through);
        if (readerIsUTC) HL = HU;
        wk7 = v.n >= 14 ? g.weekdayRange(v.people?.perDay) : null;
      }
      const modeChanged = nextMode !== mode;
      mode = nextMode;
      writeToggle();
      if (modeChanged && animateTz && grown && H && !motion.reduced) {
        turnTo(mode);
      } else {
        anim?.cancel(); anim = null; rot = 0; turn.removeAttribute('transform'); svg.classList.remove('is-turning');
        H = clockOf(mode);
        drawStatic();
        if (!grown) drawWedges(Array(24).fill(g.R0));
        else if (rangeChanged && !modeChanged && radii.some((r) => r > g.R0)) animateRadii(target());
        else drawWedges(target());
        writeCentre(false);
        writeFa();
        writeNote();
      }
      if (rangeChanged) { writeWeekdays(); writeTables(); }
      if (growPending && !grown && H) { growPending = false; grow(); }
      const target2 = clockOf(mode);
      const { peak, quiet } = g.peakQuiet(target2.bins, target2);
      return {
        peak: fmt.hourLabel(g.binStart(peak, target2)),
        quiet: fmt.hourLabel(g.binStart(quiet, target2)),
        total: target2.total,
        utc: target2 === HU && !readerIsUTC,
        readerIsUTC,
      };
    },
    pulseWeekdays() { if (!wk.hidden) pulse(wkCols); },
    destroy() {
      anim?.cancel();
      clearTimeout(liveT);
      offEnter?.();
      toolsH?.destroy?.();
      fig.remove();
    },
  };
}
