// Chapter 00: the answer and the Gate (#st-top). The lede says the whole finding in words before
// a single dot moves; the gate then shows where every page went, and each pile opens a drawer
// in place. DESIGN.md §A.4 "00" is the spec. This file owns the words (lede, sub, provenance and
// station cards, the "Am I in here?" card) and the routes #/top/{kind|you|replay}; gate.js owns
// the canvas and drawers.js what opens under it.
import '../../../styles/stats/hero.css';
import { createGate } from './gate.js';
import { KIND_ORDER } from './gate-layout.js';
import { num, approx, pct, pctRange, rangeSpoken, plural, span as fmtSpan, day as fmtDay } from '../core/fmt.js';
import { KINDS } from '../core/words.js';
import { motion, EASE, frameLoop, tweenNumber } from '../core/motion.js';
import { hashString, mulberry32 } from '../core/prng.js';
import { largestRemainder, rangeKey } from '../core/agg.js';
import { glyphSVG, glyphPath, arrowSVG } from '../ui/glyph.js';
import { bindPop, cardBody } from '../ui/pop.js';
import { term, kindWord } from '../ui/term.js';
import { createDrawer } from '../ui/drawer.js';
import { onEnter, watchVisible, scrollRoot } from '../ui/observe.js';
import { tableTwin } from '../ui/table.js';

const VERDICT = {
  'machines-all': 'All machines.',
  machines: 'Mostly machines.',
  people: 'Mostly people.',
  half: 'About half and half.',
  unclear: 'Hard to call.',
};
const STEP_Q = { badge: 'Badge?', door: 'Wrong door?', program: 'A program?', old: 'Old browser?' };
const MORE = {
  bot: ['Meet them', '#/machines/bots'],
  scanner: ['See the doors', '#/machines/scanners'],
  agent: ['Meet the programs', '#/machines/scripts'],
  stale: ['See the costume rack', '#/machines/old'],
  person: ['Why a range?', '#/how/range'],
};

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
// The counter's estimate: rounded to tens with 'about' from 100 up, exact below (§A.4 lede).
const aboutLo = (lo) => (lo < 100 ? num(lo) : 'about ' + approx(lo));
// The low end is the server's own count, exact, when the counter's estimate came out at or above
// it on every day of the range (each day's low end is then that day's people pages). Rounding it
// like an estimate would print a floor above the data: 127 pages written as "about 130".
const loIsExact = (pr) => pr.lo > 0 && pr.lo === pr.hiRaw;
const loWords = (pr) => (loIsExact(pr) ? num(pr.lo) : aboutLo(pr.lo));
const loFmt = (pr) => (loIsExact(pr) ? num : approx);
// Per-day figures: whole numbers, one decimal below ten.
const perDay = (v) => (v < 10 ? String(Math.round(v * 10) / 10) : num(v));

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function para(parts, cls = 'st-pop-body') {
  const p = el('p', cls);
  for (const x of parts) {
    if (x == null) continue;
    if (typeof x === 'string') p.append(x);
    else if (x.b) p.append(el('strong', null, x.b));
    else if (x.href) { const a = el('a', null, x.label); a.href = x.href; p.append(a); }
    else p.append(x);
  }
  return p;
}

function linkRow(label, href) {
  const row = el('p', 'st-pop-links');
  const a = el('a', 'st-gate-poplink');
  a.href = href;
  a.append(el('span', null, label), arrowSVG('right'));
  row.append(a);
  return row;
}

export async function mount(root, ctx) {
  const lede = root.querySelector('[data-st-lede]');
  const sub = root.querySelector('[data-st-sub]');
  const gateHost = root.querySelector('[data-st-gate]');
  const drawerHost = root.querySelector('[data-st-drawer]');
  root.classList.add('st-hero-on');

  let state = ctx.store.get();
  let view = ctx.views.get(state.range);

  // The lede updates in place and tweens its numbers; it should not chatter to a screen reader
  // on every frame. One quiet live region gets the finished sentence once the range settles.
  lede.setAttribute('aria-live', 'off');
  const live = el('p', 'st-sr');
  live.setAttribute('aria-live', 'polite');
  root.append(live);
  let liveT = 0;

  // Number elements live across renders, so a range change rolls each figure from its old value.
  const nums = { lo: el('span', 'st-num'), hi: el('span', 'st-num'), total: el('span', 'st-num'), n: el('span', 'st-num'), person: el('span', 'st-num') };
  for (const k in nums) nums[k].dataset.k = k;
  // What each number will settle on, so the live region never reads a figure caught mid-roll.
  const finals = {};
  const prov = {};
  for (const key of ['lo', 'hi', 'total']) {
    const b = el('button', 'st-prov' + (key !== 'total' ? ' st-prov-person' : ''));
    b.type = 'button';
    b.append(nums[key]);
    bindPop(b, () => provCard(key), { label: key === 'total' ? 'Where the total comes from' : key === 'hi' ? 'The most people could be' : 'The least people could be' });
    prov[key] = b;
  }
  const peopleWord = kindWord('person', 'People', ctx.bus);
  const pagesWord = term('page', 'pages');
  let firstRender = true;

  function setNum(key, v, fmt) {
    // The first render writes the exact figures; later ones roll from what was showing.
    finals[key] = fmt(v);
    tweenNumber(nums[key], v, firstRender ? { from: v, fmt } : { fmt, dur: 450, ease: EASE.out });
  }

  function renderLede() {
    const files = state.unit === 'files';
    const sums = files ? view.files : view.pages;
    const pr = view.people;
    const total = sums.total;
    lede.classList.remove('is-loading', 'st-lede-loading');
    lede.textContent = '';
    sub.textContent = '';
    if (!total) {
      lede.append(`No ${files ? 'files' : 'pages'} at all ${view.phrase.long}. Cloudflare may have missed the day; try another.`);
      announce();
      firstRender = false;
      return;
    }
    if (files) {
      // Files mode: no range (the counter counts page loads, not files), just where they went.
      let topK = 'bot';
      for (const k of KIND_ORDER) if (sums[k] > sums[topK]) topK = k;
      setNum('total', total, num);
      setNum('n', sums[topK], num);
      lede.append(`${cap(view.phrase.long)} the site sent `, prov.total, ' files: pages, pictures, video and scripts. ',
        `${KINDS[topK].long} took the most: `, strongNum(nums.n), '.');
      if (topK === 'person') {
        // People lead (their pages pull in pictures and video): name the busiest machine kind as
        // the runner-up rather than repeating the people figure. nums.person holds the second figure.
        let next = null;
        for (const k of KIND_ORDER) if (k !== 'person' && sums[k] > 0 && (!next || sums[k] > sums[next])) next = k;
        if (next) {
          setNum('person', sums[next], num);
          lede.append(` ${KINDS[next].long} came next: `, strongNum(nums.person), '.');
        }
      } else {
        setNum('person', sums.person, num);
        lede.append(' Browsers that looked like people’s took ', strongNum(nums.person), '.');
      }
      sub.append(fourQuestions('file'));
    } else {
      const verdict = el('span', 'st-verdict', VERDICT[view.verdict] || '');
      setNum('total', total, num);
      setNum('hi', pr.hi, num);
      lede.append(verdict, ' ', peopleWord, ', Aaron included, read ');
      if (pr.loRaw === 0) {
        lede.append('up to ', prov.hi);
      } else if (Math.round(pr.lo) === Math.round(pr.hi)) {
        lede.append(pr.hi < 100 ? '' : 'about ', prov.hi);
      } else {
        setNum('lo', pr.lo, loFmt(pr));
        lede.append('between ', pr.lo < 100 || loIsExact(pr) ? '' : 'about ', prov.lo, ' and ', prov.hi);
      }
      lede.append(' of the ', prov.total, ' ', pagesWord, ` this site sent ${view.phrase.long}.`);
      if (view.n > 1) {
        const a = pr.loRaw === 0 ? null : pr.loPerDay;
        sub.append(a == null || Math.round(a) === Math.round(pr.hiPerDay)
          ? `That's ${a == null ? 'up to ' : ''}${perDay(pr.hiPerDay)} a day. `
          : `That's ${perDay(a)} to ${perDay(pr.hiPerDay)} a day. `, fourQuestions('page'));
      } else sub.append(fourQuestions('page'));
      if (pr.loRaw === 0) sub.append(el('span', 'st-sub-note', "Cloudflare's counter heard from no one on these days: a quiet stretch, or ad blockers."));
    }
    announce();
    firstRender = false;
  }

  // The sentence that points at the gate. It sits above the stage on a roomy screen and under it
  // on a phone or a short laptop window (hero.css moves it), so it is written both ways and the
  // same media queries that move it show the matching one. The hidden one is display:none, so a
  // screen reader hears only the sentence that is on screen.
  function fourQuestions(thing) {
    const f = document.createDocumentFragment();
    f.append(
      el('span', 'st-sub-dn', `Below, every ${thing} walks past the same four questions, and the first yes decides its pile.`),
      el('span', 'st-sub-up', `Above, every ${thing} walked past the same four questions; the first yes decided its pile.`),
    );
    return f;
  }

  function strongNum(span) { const b = el('strong', 'st-lede-strong'); b.append(span); return b; }

  function announce() {
    clearTimeout(liveT);
    if (firstRender) return;   // the lede is already on the page; nothing changed yet
    // Read from a copy of the lede with each rolling number set to where it will land: the
    // numbers on the page roll for 450 ms and are still mid-way when this fires.
    liveT = setTimeout(() => {
      const copy = lede.cloneNode(true);
      for (const s of copy.querySelectorAll('[data-k]')) if (finals[s.dataset.k] != null) s.textContent = finals[s.dataset.k];
      live.textContent = copy.textContent.replace(/\s+/g, ' ').trim();
    }, 400);
  }

  // ---------- provenance cards (the lede's three numbers) ----------
  function provCard(key) {
    const pr = view.people;
    const files = state.unit === 'files';
    const when = view.n > 1 ? fmtSpan(view.from, view.to) : 'on ' + fmtDay(view.to, 'short');
    if (key === 'total') {
      if (files) {
        return cardBody({ title: `${num(view.files.total)} files`, body: [`Every file Cloudflare sent to anyone, ${when}: pages, pictures, pieces of video, scripts and fonts. ${num(view.pages.total)} of them were pages.`], meta: "Source: Cloudflare's own log of the site, sorted by the four questions below." });
      }
      return cardBody({
        title: `${num(view.pages.total)} pages`,
        body: [`Every page Cloudflare sent to anyone, ${when}. A page is one web page; the pictures, videos and scripts inside it are counted separately, as files (${num(view.files.total)} of them).`],
        meta: "Source: Cloudflare's own log of the site, sorted by the four questions below.",
      });
    }
    // Each day's range runs from the smaller of the two counts to the larger. Usually the
    // counter's estimate is the smaller; on a "swap" day it came out above the server's count,
    // and then each end is partly the other source. The cards say so instead of naming one.
    const k = pr.swappedDays;
    const swapDays = view.n === 1 ? 'this day' : `${k} of these days`;
    if (key === 'hi') {
      const w = cardBody({ title: `At most ${num(pr.hi)}` });
      const ao = ['Aaron browsing his own site is in here, and in October he was most of it (', { href: '/ledger/who-visits-a-new-website/', label: 'AO-057' }, ').'];
      if (k > 0) {
        w.append(para([`Pages that got four noes at the gate (a recent browser, no badge, no wrong door, not a program): ${num(pr.hiRaw)}. On ${swapDays} Cloudflare's counter estimated more than that, so the top of the range takes the larger of the two counts each day. That's the most people could be. `, ...ao]));
      } else {
        w.append(para(['Pages that got four noes at the gate: a recent browser, no badge, no wrong door, not a program. That’s the most people could be. ', ...ao]));
      }
      return w;
    }
    const w = cardBody({ title: cap(loWords(pr)) });
    if (k > 0 && loIsExact(pr)) {
      w.append(para([`Cloudflare's counter, a tiny script in each page, reported ${aboutLo(pr.loRaw)} page loads. Ad blockers stop it, and it listens to about 1 visit in 10 and multiplies, so it's an estimate. On ${swapDays} it came out higher than the server's own count of pages that got four noes, so the low end is that count itself: ${num(pr.lo)}, the least people could be.`]));
    } else if (k > 0) {
      w.append(para([`Cloudflare's counter, a tiny script in each page, reported ${aboutLo(pr.loRaw)} page loads. Ad blockers stop it, and it listens to about 1 visit in 10 and multiplies, so it's an estimate. On ${swapDays} its estimate came out higher than the server's count; the range takes whichever was lower each day as the low end, which comes to ${aboutLo(pr.lo)}: the least people could be.`]));
    } else {
      w.append(para(["About this many page loads reported by Cloudflare's counter, a tiny script in each page. Ad blockers stop it, and it listens to about 1 visit in 10 and multiplies, so it's an estimate: the least people could be."]));
    }
    w.append(linkRow('Why a range?', '#/how/range'));
    return w;
  }

  // ---------- station cards ----------
  function stationCard(k) {
    const kind = KIND_ORDER[k];
    const files = state.unit === 'files';
    const sums = files ? view.files : view.pages;
    const n = sums[kind];
    const unit = files ? 'files' : 'pages';
    const nB = { b: `${num(n)} ${n === 1 ? unit.slice(0, -1) : unit}` };
    let body;
    switch (kind) {
      case 'bot':
        body = para(['Cloudflare checks that a visitor calling itself Googlebot really comes from Google, and the same for about a hundred known bots. The ones that check out wear a badge. ', nB, ` ${view.phrase.long}.`]);
        break;
      case 'scanner':
        body = para(["Did the site answer with an error, like 'not found'? That's almost always a program trying addresses this site never had, hoping for a weak spot. A person following a broken link lands here too. ", nB,
          files ? '.' : `, ${num(view.files.scanner)} files.`]);
        break;
      case 'agent':
        body = para(["Does it name a program instead of a browser (curl, Python, a browser run by a script), or give no name at all? Many are Aaron's own agents checking that a post went live. ", nB, '.']);
        break;
      case 'stale':
        body = para(["Does it say it's a browser more than a year out of date? People do run old browsers; not this many, this often. Most of these are probably bots in costume. ", nB, '.']);
        break;
      default: {
        const pr = view.people;
        body = para(["Whatever got four noes: a recent browser that didn't say it was a bot or a program. Probably people, Aaron included.",
          files || pr.loRaw === 0 ? '' : loIsExact(pr) ? " Cloudflare's counter heard from at least as many." : ` Cloudflare's counter confirmed ${aboutLo(pr.lo)} of them.`]);
      }
    }
    const w = cardBody({ title: KINDS[kind].station });
    w.append(body, linkRow(...MORE[kind]));
    return w;
  }

  // ---------- the gate ----------
  function buildModel() {
    const files = state.unit === 'files';
    const sums = files ? view.files : view.pages;
    const pr = view.people;
    const values = KIND_ORDER.map((k) => sums[k] || 0);
    // The people pile is drawn up to the top of the range. That is the pages that got four noes,
    // except on a day the counter's estimate came out above them: then the top is the estimate,
    // and a pile of the server's count alone would stop short of its own label and bracket.
    // Solid dots are the low end, rings the rest, so the rings are the "maybe" either way.
    if (!files) values[4] = Math.max(values[4], Math.round(pr.hi));
    const total = sums.total || 0;
    const unit = files ? 'files' : 'pages';
    const labels = KIND_ORDER.map((kind, k) => {
      const K = KINDS[kind];
      const v = values[k];
      const base = { eyebrow: K.eyebrow, long: K.long, short: K.short, station: K.station };
      if (kind === 'person' && !files && total) {
        const same = Math.round(pr.lo) === Math.round(pr.hi) || pr.loRaw === 0;
        return {
          ...base,
          // Before its first dot lands the people pile shows a dash, never "0–0".
          fmt: (f) => (f === 0 ? '–' : same ? num(pr.hi * f) : `${loFmt(pr)(pr.lo * f)}–${num(pr.hi * f)}`),
          share: same ? pct(pr.hiShare) : pctRange(pr.loShare, pr.hiShare),
          aria: `${K.long}: ${same ? num(pr.hi) : loFmt(pr)(pr.lo) + ' to ' + num(pr.hi)} pages, ${(same ? pct(pr.hiShare) : pctRange(pr.loShare, pr.hiShare)).replace('–', ' to ').replace('%', ' percent')}. Show who.`,
        };
      }
      return {
        ...base,
        fmt: (f) => num(v * f),
        share: v ? pct(v / total) : 'none',
        aria: `${K.long}: ${num(v)} ${v === 1 ? unit.slice(0, -1) : unit}, ${v ? pct(v / total).replace('%', ' percent') : 'none'}. Show who.`,
      };
    });
    return {
      seed: `${rangeKey(view.range)}|${state.unit}|${ctx.snap.through}`,
      unit: state.unit,
      values, total,
      // In files mode there is no range (the counter counts page loads), so every people dot is
      // solid, as in the growing chart's files view: rings would claim a "maybe" nobody measured.
      loForSolid: files ? values[4] : pr.lo,
      swapped: !files && pr.swappedDays > 0,
      lo: pr.lo, hi: pr.hi, loRaw: pr.loRaw, loWords: loWords(pr),
      labels,
      unitWord: (u) => (u === 1 ? unit.slice(0, -1) : unit),
      statusRun: `Sorting ${view.phrase.short} · same order for everyone`,
      statusDone: `${num(total)} ${total === 1 ? unit.slice(0, -1) : unit}`,
    };
  }

  const drawer = createDrawer(drawerHost);

  const gate = createGate(gateHost, {
    motion, EASE, frameLoop,
    palette: () => ctx.palette(),
    glyphPath, glyphSVG,
    hashString, mulberry32,
    alloc: largestRemainder,
    num, approx,
    drawerId: drawerHost.id,
    watchVisible,
    scrollRoot,
    onEnter: (el, fn, o) => onEnter(el, fn, o || { threshold: 0.4 }),
    bindStation: (btn, k) => bindPop(btn, () => stationCard(k), { label: KINDS[KIND_ORDER[k]].station }),
    onHover: (kind) => { if (kind) loadDrawers(); ctx.bus.emit('brush', { kind, from: 'pile' }); },
    onPick: (kind, btn) => pick(kind, btn),
    onYou: (btn, how) => {
      // A second press closes the result, like a pile's drawer. The guest stays on its pile.
      if (want === 'you') {
        closeDrawer();
        ctx.router.go({ ch: 'top', sub: null, item: null }, { push: false, scroll: false });
        return;
      }
      youKeyboard = !!how?.keyboard;
      ctx.router.go({ ch: 'top', sub: 'you', item: null }, { push: true, scroll: false });
    },
    onYouNear: () => { loadBrowser(); },
    onUnitBack: () => ctx.store.set({ unit: 'pages' }, { push: false }),
    onDone: () => {
      ctx.bus.emit('gate:done', { rangeKey: view.key });
      (window.requestIdleCallback || ((fn) => setTimeout(fn, 300)))(() => loadDrawers());
    },
  });

  // The screen-reader twin of the gate: the same five numbers as a table.
  const twin = tableTwin(tableSpec());
  gateHost.after(twin.el);
  function tableSpec() {
    const files = state.unit === 'files';
    const sums = files ? view.files : view.pages;
    const pr = view.people;
    const unit = files ? 'Files' : 'Pages';
    const rows = KIND_ORDER.map((kind) => {
      const v = sums[kind];
      if (kind === 'person' && !files) return { pile: KINDS[kind].long, n: loIsExact(pr) ? `${num(pr.lo)} to ${num(pr.hi)}` : rangeSpoken(pr.lo, pr.hi), share: pctRange(pr.loShare, pr.hiShare) };
      return { pile: KINDS[kind].long, n: num(v), share: sums.total ? pct(v / sums.total) : '0%' };
    });
    // The counter's row matches the pile: the low end itself. On swap days that differs from
    // the counter's own total, so the row says which it is.
    if (!files && pr.swappedDays === 0) rows.push({ pile: "Counted by Cloudflare's counter (people, low end)", n: approx(pr.lo), share: sums.total ? pct(pr.lo / sums.total) : '0%' });
    else if (!files) rows.push({ pile: `Cloudflare's counter, its own estimate (above the server's count on ${pr.swappedDays} ${plural(pr.swappedDays, 'day', 'days')})`, n: approx(pr.loRaw), share: sums.total ? pct(Math.min(pr.loRaw, sums.total) / sums.total) : '0%' });
    return { caption: `${unit} ${view.phrase.long}, sorted at the gate`, cols: [{ key: 'pile', label: 'Pile' }, { key: 'n', label: unit, num: true }, { key: 'share', label: 'Share', num: true }], rows };
  }

  // ---------- drawers ----------
  // The drawers' code is its own small chunk: nobody needs it until a pile is picked, so it
  // loads when a pointer or focus first reaches a pile, or when the browser is idle after the
  // replay, and never delays the first paint.
  let drawerFor = null, drawersP = null;
  let want = null;   // the pile whose drawer was last asked for (it may still be loading)
  function loadDrawers() {
    drawersP ||= import('./drawers.js').then((m) => { drawerFor = m.drawerFor; return m; });
    return drawersP;
  }
  function openDrawer(kind, { scroll = false } = {}) {
    if (!(state.unit === 'files' ? view.files.total : view.pages.total)) return;
    want = kind;
    gate.setLit(kind);
    const show = () => {
      if (want !== kind) return;
      drawer.open(kind, drawerFor(kind, view, ctx), gate.labelButton(kind));
      if (scroll) revealDrawer();
    };
    if (drawerFor) show();
    else loadDrawers().then(show, (e) => console.error('[stats] the drawers failed to load', e));
  }
  function closeDrawer() {
    want = null;
    drawer.close();
    gate.setLit(null);
  }
  // Bring the drawer's top into view when it opens below the fold, without yanking the page
  // when it's already visible.
  function revealDrawer() {
    const sr = scrollRoot();
    if (!sr) return;
    requestAnimationFrame(() => {
      const r = drawerHost.getBoundingClientRect(), R = sr.getBoundingClientRect();
      const want = r.top - R.top - R.height * 0.55;
      if (want > 0) sr.scrollBy({ top: Math.min(want, 360), behavior: motion.reduced ? 'auto' : 'smooth' });
    });
  }
  function pick(kind, btn) {
    if (want === kind) {
      closeDrawer();
      ctx.router.go({ ch: 'top', sub: null, item: null }, { push: false, scroll: false });
      btn?.focus({ preventScroll: true });
      return;
    }
    openDrawer(kind, { scroll: true });
    ctx.router.go({ ch: 'top', sub: kind, item: null }, { push: true, scroll: false });
  }
  // Escape on the gate (focus still on the pile labels) closes an open drawer too, and leaves
  // focus on the pile it belonged to.
  gateHost.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || want == null) return;
    const k = want;
    closeDrawer();
    ctx.router.go({ ch: 'top', sub: null, item: null }, { push: false, scroll: false });
    (k === 'you' ? gate.youButton : gate.labelButton(k))?.focus({ preventScroll: true });
  });
  // Escape inside the drawer closes it (ui/drawer.js); keep the lit pile and the address in step.
  drawerHost.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setTimeout(() => {
      if (drawer.current == null) {
        want = null;
        gate.setLit(null);
        const sub = ctx.store.get().route?.sub;
        if (sub && (KIND_ORDER.includes(sub) || sub === 'you')) {
          ctx.router.go({ ch: 'top', sub: null, item: null }, { push: false, scroll: false });
        }
      }
    }, 0);
  });

  // ---------- You ----------
  // "Am I in here?" reads the browser's own name, walks a pink-ringed guest past the four
  // questions, and then writes where it landed into the drawer slot under the gate, the same
  // in-place pattern as the piles. (The first spec had a card anchored to the pill; a card sat on
  // top of the very walk it explains, on a phone it hid the row the guest landed on, and if the
  // reader scrolled during the walk it opened detached over the header.) The classifier is only
  // needed here, so it loads on the first pointer or focus near the button.
  let youRun = 0, youKeyboard = false, browserP = null;
  const loadBrowser = () => (browserP ||= import('../core/browser.js'));
  async function runYou() {
    const run = ++youRun;
    const keyboard = youKeyboard;
    youKeyboard = false;
    const { readYou, classifyYou } = await loadBrowser();
    if (run !== youRun) return;
    const you = readYou();
    const res = classifyYou(you, ctx.snap.through);
    // Close whatever drawer is open first, so the walk happens in plain view.
    if (want) closeDrawer();
    want = 'you';
    // Bring the piles into view before the guest sets off, so its landing is seen.
    const sr = scrollRoot();
    let by = 0;
    if (sr) {
      const R = sr.getBoundingClientRect(), st = gate.stage.getBoundingClientRect();
      by = Math.min(st.bottom - R.bottom + 12, Math.max(0, st.top - R.top));
      if (by > 0) sr.scrollBy({ top: by, behavior: motion.reduced ? 'auto' : 'smooth' });
    }
    // Let a smooth scroll land before noting where the reader is.
    if (by > 0 && !motion.reduced) await new Promise((r) => setTimeout(r, 350));
    const startTop = sr ? sr.scrollTop : 0;
    await gate.you(res);
    if (run !== youRun || want !== 'you') return;
    const r = ctx.store.get().route;
    if (r && (r.ch !== 'top' || r.sub !== 'you')) return;   // the reader went somewhere else meanwhile
    const node = youDrawer(you, res);
    drawer.open('you', node, gate.youButton);
    // Only the one screen-reader region speaks, and only the verdict line.
    live.textContent = node.dataset.say;
    if (keyboard) node.querySelector('.st-gate-dtitle')?.focus({ preventScroll: true });
    // Show the result, unless the reader scrolled away during the walk: then it waits in place.
    if (!sr || Math.abs(sr.scrollTop - startTop) <= 24) revealDrawer();
  }
  function youDrawer(you, res) {
    const name = you.browser === 'Other' ? "a browser this page doesn't recognise" : `${you.browser}${you.major ? ' ' + you.major : ''}`;
    const on = you.os && you.os !== 'Other' ? ` on ${you.os}` : '';
    const steps = res.steps.map((s) => `${STEP_Q[s.q]} ${s.yes ? 'yes' : 'no'}${s.q === 'old' && s.why ? ': ' + s.why : ''}.`);
    const verdict = res.kind === 'agent' ? "You'd be counted with scripts and agents."
      : res.kind === 'stale' ? "You'd land on the costume rack, which is where bots in disguise go."
        : "You'd be counted as probably a person.";
    const w = el('div', 'st-gate-drawer st-gate-youdrawer');
    w.dataset.kind = 'you';
    w.dataset.say = `${verdict} Your browser says it's ${name}${on}.`;
    const head = el('div', 'st-gate-dhead');
    head.append(el('p', 'st-gate-deb', 'AM I IN HERE?'));
    const h = el('h3', 'st-gate-dtitle', 'Where you would land');
    h.tabIndex = -1;
    head.append(h);
    w.append(head);
    const body = el('div', 'st-gate-dbody');
    body.append(para([{ b: `Your browser says it's ${name}${on}.` }, ' At the gate: ', steps.join(' '), ' ', { b: verdict }, res.kind === 'stale' ? ' Time to update?' : ''], 'st-gate-dlead'));
    body.append(para(["Today's visit shows up in tomorrow's filing, and this page never knows which dot is you. Nothing was sent anywhere; your browser read its own name."], 'st-gate-dhonest'));
    w.append(body);
    return w;
  }

  // ---------- first paint ----------
  renderLede();
  gate.setModel(buildModel(), 'first');

  // astro dev only: lets a test seek the replay clock and time a frame. Vite drops this from
  // the production build.
  if (import.meta.env && import.meta.env.DEV) window.__stGate = gate;

  const offBrush = ctx.bus.on('brush', (d) => { if (d.from === 'term') gate.brush(d.kind); });

  return {
    update(next, prev) {
      state = next;
      const rangeChanged = rangeKey(next.range) !== rangeKey(prev.range);
      if (!rangeChanged && next.unit === prev.unit) return;
      view = ctx.views.get(next.range);
      renderLede();
      twin.update(tableSpec());
      gate.setModel(buildModel(), 'change');
      // The guest left with the old range (gate.setModel clears it), and so does its result.
      if (want === 'you') {
        youRun++;
        closeDrawer();
        if (ctx.store.get().route?.sub === 'you') ctx.router.go({ ch: 'top', sub: null, item: null }, { push: false, scroll: false });
      } else if (drawer.current && drawerFor) {
        const k = drawer.current;
        if ((next.unit === 'files' ? view.files.total : view.pages.total) > 0) drawer.open(k, drawerFor(k, view, ctx), gate.labelButton(k));
        else closeDrawer();
      }
    },
    go(route) {
      const s = route?.sub || null;
      if (s && KIND_ORDER.includes(s)) {
        if (want !== s) openDrawer(s, { scroll: true });
      } else if (s === 'you') {
        runYou();
      } else if (s === 'replay') {
        gate.replay(2);
      } else if (!s && want) {
        closeDrawer();
      }
    },
    onMode() { gate.onMode(); },
    destroy() {
      offBrush();
      clearTimeout(liveT);
      gate.destroy();
      twin.el.remove();
      live.remove();
    },
  };
}
