// Readable addresses for everything the page can show, so a link can be copied, a chip can be
// undone with Back, and a Noticed row can hand the reader straight to a replay.
//
//   #/ch[/sub[/item]][?r=30|7|1 | d=YYYY-MM-DD][&u=files][&tz=utc]
//
// Defaults are left out of the address (the default range, pages, the reader's clock), so the
// address only says what differs. Two ways in, with one rule each:
// - following a link or calling go(): params the link doesn't name keep their current value,
//   so a follow-up "→ What do people read?" doesn't throw away the 7 days the reader picked;
// - Back, Forward or an edited address: params it doesn't name go back to their defaults,
//   because every address this page writes names whatever isn't a default.
// A hash that doesn't start with "#/" (the panel's skip link, #panel-scroll) is never ours.
import { motion } from './motion.js';

const CHAPTERS = ['top', 'machines', 'growing', 'read', 'where', 'when', 'speed', 'how', 'ask'];
const KINDS = ['person', 'bot', 'scanner', 'agent', 'stale'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9][a-z0-9-]{0,99}$/;

// Repair a parsed route to the nearest valid one. Never an error: an unknown chapter is the top.
function repair(ch, sub, item) {
  if (!CHAPTERS.includes(ch)) return { ch: 'top', sub: null, item: null };
  const r = { ch, sub: null, item: null };
  const s = sub || null, it = item || null;
  switch (ch) {
    case 'top':
      if (KINDS.includes(s) || s === 'you' || s === 'replay') r.sub = s;
      break;
    case 'machines':
      if (['bots', 'scanners', 'scripts', 'old'].includes(s)) {
        r.sub = s;
        if (s === 'bots' && it && SLUG.test(it)) r.item = it;
      }
      break;
    case 'growing':
      if (s === 'day' && it && DATE.test(it)) { r.sub = 'day'; r.item = it; }
      else if (s === 'data' || s === 'files') r.sub = s;
      break;
    case 'read':
      if (s && SLUG.test(s)) r.sub = s;
      break;
    case 'where':
      if (s === 'bots' || s === 'scanners') r.sub = s;
      else if (s && /^[A-Za-z][A-Za-z0-9]$/.test(s)) r.sub = s.toUpperCase();
      break;
    case 'when':
      if (s === 'weekdays') r.sub = s;
      break;
    case 'speed':
      if (s === 'desktop' || s === 'mobile') r.sub = s;
      break;
    case 'how':
      if (['range', 'blind', 'filed'].includes(s)) r.sub = s;
      else if (s === 'try') { r.sub = 'try'; if (it && SLUG.test(it)) r.item = it; }
      break;
    default:
      break;
  }
  return r;
}

function parseHash(hash) {
  const h = String(hash ?? '');
  if (h !== '' && h !== '#' && !h.startsWith('#/')) return null;
  const body = h.replace(/^#\/?/, '');
  const [pathPart, query = ''] = body.split('?');
  const segs = pathPart.split('/').filter(Boolean).map((s) => { try { return decodeURIComponent(s); } catch (e) { return s; } });
  const route = segs.length ? repair(segs[0], segs[1], segs[2]) : { ch: 'top', sub: null, item: null };
  const q = new URLSearchParams(query);
  const params = {};
  const d = q.get('d'), r = q.get('r'), u = q.get('u'), tz = q.get('tz');
  if (d && DATE.test(d)) params.range = { kind: 'day', d };
  else if (r && /^\d{1,3}$/.test(r) && +r > 0) params.range = { kind: 'last', n: +r };
  if (u === 'files' || u === 'pages') params.unit = u;
  if (tz === 'utc' || tz === 'local') params.tz = tz;
  return { route, patch: params };
}

const sameRange = (a, b) => a && b && a.kind === b.kind && (a.kind === 'day' ? a.d === b.d : a.n === b.n);

/**
 * @param {*} store
 * @param {{onRoute?:(route, opts)=>void, defaults?:{range:any}, clamp?:(range)=>any}} opts
 */
export function createRouter(store, { onRoute, defaults = {}, clamp = (r) => r } = {}) {
  const defRange = () => clamp(defaults.range || { kind: 'last', n: 30 });
  let applying = false;
  let lastHash = typeof location !== 'undefined' ? location.hash : '';

  function href(route, statePatch = {}) {
    const s = { ...store.get(), ...statePatch };
    const r = route || s.route || { ch: 'top' };
    let path = '#/' + (r.ch || 'top');
    if (r.sub) path += '/' + encodeURIComponent(r.sub);
    if (r.sub && r.item) path += '/' + encodeURIComponent(r.item);
    const q = [];
    if (s.range && !sameRange(s.range, defRange())) {
      q.push(s.range.kind === 'day' ? 'd=' + s.range.d : 'r=' + s.range.n);
    }
    if (s.unit === 'files') q.push('u=files');
    if (s.tz === 'utc') q.push('tz=utc');
    return path + (q.length ? '?' + q.join('&') : '');
  }

  // Back must put the reader where they were reading, not at the top or at the route's target.
  // The page scrolls inside #panel-scroll, so the browser's own scroll restoration never sees it:
  // each history entry carries the scroller's position (stScroll) and the element that had focus
  // when it was left (stFocus, a key into a map that lives as long as the page). The position is
  // written as the reader scrolls and again just before a push leaves the entry.
  const scroller = () => (typeof document !== 'undefined' ? document.getElementById('panel-scroll') : null);
  const focusKeep = new Map();
  let focusSeq = 0;
  // The position as the reader last saw it, from the scroll events: by the time a push is
  // written the link's state change has already re-laid the page out, and scroll anchoring may
  // have moved scrollTop (a picked day grows the bar), but that move's scroll event comes later.
  let seenTop = scroller()?.scrollTop ?? 0;
  function here(extra) {
    const st = { ...(history.state && typeof history.state === 'object' ? history.state : {}), ...extra };
    if (scroller()) st.stScroll = Math.round(seenTop);
    return st;
  }
  function leave() {
    const a = document.activeElement;
    let stFocus;
    if (a && a !== document.body && a !== scroller()) {
      stFocus = 'f' + (++focusSeq);
      focusKeep.set(stFocus, a);
      if (focusKeep.size > 50) focusKeep.delete(focusKeep.keys().next().value);
    }
    return here({ stFocus });
  }
  let saveT = 0;
  const cancelSave = () => { clearTimeout(saveT); saveT = 0; };
  function write(push) {
    if (typeof history === 'undefined') return;
    const h = href(store.get().route);
    lastHash = h;
    const url = location.pathname + location.search + h;
    cancelSave();
    try {
      if (push) {
        history.replaceState(leave(), '');
        history.pushState(null, '', url);
      } else history.replaceState(here(), '', url);
    } catch (e) { /* some sandboxes refuse history writes; the page still works */ }
  }
  if (typeof window !== 'undefined' && typeof history !== 'undefined') {
    // the place on the current entry follows the reader, so Forward comes back to it as well
    const root = scroller();
    root?.addEventListener('scroll', () => {
      seenTop = root.scrollTop;
      cancelSave();
      saveT = setTimeout(() => { saveT = 0; try { history.replaceState(here(), ''); } catch (e) { /* ignore */ } }, 250);
    }, { passive: true });
  }
  // what a history entry asks to come back to: a position, and the element focused there
  function restoreOf(state) {
    if (!state || typeof state !== 'object' || !Number.isFinite(state.stScroll)) return null;
    const el = state.stFocus ? focusKeep.get(state.stFocus) : null;
    return { top: state.stScroll, focus: el && el.isConnected ? el : null };
  }

  function apply(parsed, { full, push, scroll = true, source = 'router' }) {
    const patch = { route: parsed.route };
    if (parsed.patch.range) patch.range = clamp(parsed.patch.range);
    else if (full) patch.range = defRange();
    if (parsed.patch.unit) patch.unit = parsed.patch.unit;
    else if (full) patch.unit = 'pages';
    if (parsed.patch.tz) patch.tz = parsed.patch.tz;
    else if (full) patch.tz = 'local';
    applying = true;
    try { store.set(patch, { push, source }); } finally { applying = false; }
    return patch.route;
  }

  function go(target, opts = {}) {
    const { push = true, scroll = true, params } = opts;
    let parsed;
    if (typeof target === 'string') parsed = parseHash(target.startsWith('#') ? target : '#/' + target.replace(/^\/+/, ''));
    else if (target && typeof target === 'object') parsed = { route: repair(target.ch, target.sub, target.item), patch: {} };
    if (!parsed) return;
    if (params) {
      if (params.d && DATE.test(params.d)) parsed.patch.range = { kind: 'day', d: params.d };
      else if (params.r) parsed.patch.range = { kind: 'last', n: +params.r };
      if (params.u) parsed.patch.unit = params.u;
      if (params.tz) parsed.patch.tz = params.tz;
    }
    const route = apply(parsed, { full: false, push });
    write(push);
    onRoute?.(route, { scroll, push, from: 'go' });
  }

  function fromLocation() {
    if (typeof location === 'undefined') return;
    // a save timed for the entry just left would land on this one
    cancelSave();
    if (location.hash === lastHash) return;
    lastHash = location.hash;
    const parsed = parseHash(location.hash);
    if (!parsed) return;
    const route = apply(parsed, { full: true, push: false, source: 'history' });
    onRoute?.(route, { scroll: true, push: false, from: 'history', restore: restoreOf(history.state) });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', fromLocation);
    window.addEventListener('hashchange', fromLocation);
    // Our own links: route them with the keep-the-current-state rule instead of letting the
    // browser jump to an anchor that doesn't exist.
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target?.closest?.('a[href^="#/"]');
      if (!a || !a.closest('.st, .st-pop, [data-st-sheet]')) return;
      e.preventDefault();
      go(a.getAttribute('href'), { push: true });
    });
  }

  // Changes made elsewhere (a range pill, the tz toggle, the files toggle) are written into the
  // address too: replaced unless the caller asked to push.
  store.subscribe((s, p, o = {}) => {
    if (applying || o.source === 'router' || o.source === 'history') return;
    if (!sameRange(s.range, p.range) || s.unit !== p.unit || s.tz !== p.tz || s.route !== p.route) write(!!o.push);
  });

  return {
    go,
    href,
    parse: parseHash,
    current: () => store.get().route,
  };
}

// The element a chapter or sub-route lives at. Chapters that are still skeletons fall back to
// their section, so a route can scroll before the module has drawn its figure.
const ELEMENT = {
  top: '#st-top', machines: '#st-machines', growing: '#st-growing', read: '#st-read', where: '#st-where',
  when: '#st-when', speed: '#st-speed', how: '#st-how', ask: '#st-top',
};
const SECTION = { read: '#st-people', where: '#st-people', when: '#st-rhythm', speed: '#st-rhythm' };
// Sub-routes whose figure isn't named after them: #/growing/data switches the long view, a picked
// day opens the sorted view. Without these the target was the whole chapter, which holds the very
// follow-up link that was pressed, so focus stayed on that link far below the chart it opened.
const SUB_ELEMENT = { growing: { data: 'st-longview', files: 'st-longview', day: 'st-sorted' } };
export function targetFor(route) {
  if (typeof document === 'undefined' || !route) return null;
  if (route.sub && /^[a-z]+$/.test(route.sub)) {
    const named = SUB_ELEMENT[route.ch]?.[route.sub];
    const sub = (named && document.getElementById(named)) || document.getElementById('st-' + route.sub);
    if (sub) return sub;
  }
  return document.querySelector(ELEMENT[route.ch] || '#st-top') || document.querySelector(SECTION[route.ch] || '#st-top');
}

// Scroll #panel-scroll (the page doesn't scroll the window) so el sits just under the sticky bar.
// A chapter is aimed at by its kicker, not its box: the box starts with the chapter's 72–112px of
// top padding, which left a blank band under the bar at every landing.
//
// On a cold deep link (#/how/try/curl) the chapters above the target are still mounting when
// this runs, and each one that fills in pushes the target further down: without a hold the page
// landed a whole chapter short. So for a few seconds after arriving, whenever the column changes
// size, the scroll is re-aimed at the target's new place, until the reader scrolls on their own.
// The aim is absolute (where the target is now), not a nudge by how far it moved: a first scroll
// cut short because the page wasn't tall enough yet gets the rest of the way once it is.
//
// A module may scroll on from there, to a row inside the target (machines opening the OpenAI
// row). Its scrollTo goes through the hold: the hold takes that as its new aim and keeps
// carrying it down as the chapters above mount, instead of cancelling it with a correction of
// its own (an instant scroll cancels a smooth one in flight).
let releaseHold = null;
const docTop = (el, root) => el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
const barHeight = () => {
  const bar = document.querySelector('[data-st-bar]');
  return bar && getComputedStyle(bar).position === 'sticky' ? bar.getBoundingClientRect().height : 0;
};
// where el's content starts: past a chapter's top padding
const aimOf = (el, root) => {
  let pad = 0;
  if (el.classList.contains('st-ch')) pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
  return docTop(el, root) + pad;
};
const maxTop = (root) => Math.max(0, root.scrollHeight - root.clientHeight);
const proto = typeof Element !== 'undefined' ? Element.prototype : null;

function holdTarget(el, root, behavior) {
  releaseHold?.();
  const col = document.querySelector('.st');
  if (!col || typeof ResizeObserver !== 'function') return;
  const off = () => barHeight() + 12;
  // what we aim at: the target itself, or a point a module chose, kept relative to the target
  let rel = 0;                                  // aim − the target's place
  let pos = aimOf(el, root);
  let lastScroll = performance.now();
  const wanted = () => Math.max(0, pos + rel - off());
  const go = (top, b) => proto.scrollTo.call(root, { top: Math.min(top, maxTop(root)), behavior: b });
  // the browser's own scroll anchoring would correct the same shift a second time
  const anchor = root.style.overflowAnchor;
  root.style.overflowAnchor = 'none';
  const onScroll = () => { lastScroll = performance.now(); };
  root.addEventListener('scroll', onScroll, { passive: true });
  const ro = new ResizeObserver(() => {
    const now = aimOf(el, root);
    const moved = Math.abs(now - pos) >= 2;
    pos = now;
    const want = Math.min(wanted(), maxTop(root));
    if (Math.abs(root.scrollTop - want) < 2) return;
    // still on its way (a smooth scroll moving this frame): re-aim it; settled: put it right
    const moving = behavior === 'smooth' && performance.now() - lastScroll < 120;
    if (moved || !moving) go(want, moving ? behavior : 'auto');
  });
  // a module's own scroll during the hold becomes the hold's aim
  const aimAt = (top, bh = 'auto') => {
    if (Number.isFinite(top)) rel = top + off() - pos;
    return proto.scrollTo.call(root, { top: Number.isFinite(top) ? top : root.scrollTop, behavior: bh || 'auto' });
  };
  root.scrollTo = function (x, y) {
    if (x && typeof x === 'object') return aimAt(x.top, x.behavior);
    return aimAt(y);
  };
  root.scrollBy = function (x, y) {
    if (x && typeof x === 'object') return aimAt(root.scrollTop + (x.top || 0), x.behavior);
    return aimAt(root.scrollTop + (Number(y) || 0));
  };
  const stop = () => release();
  const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  const t = setTimeout(stop, 4000);
  function release() {
    ro.disconnect();
    clearTimeout(t);
    root.style.overflowAnchor = anchor;
    root.removeEventListener('scroll', onScroll);
    delete root.scrollTo;
    delete root.scrollBy;
    evs.forEach((e) => root.removeEventListener(e, stop));
    if (releaseHold === release) releaseHold = null;
  }
  evs.forEach((e) => root.addEventListener(e, stop, { passive: true }));
  ro.observe(col);
  releaseHold = release;
}

/** Let go of a landing that is still re-aiming the scroll (a newer route has arrived). */
export function releaseScrollHold() { releaseHold?.(); }

export function scrollToEl(el, { smooth = true } = {}) {
  const root = document.getElementById('panel-scroll');
  if (!root || !el) return;
  releaseHold?.();
  const behavior = smooth && !motion.reduced ? 'smooth' : 'auto';
  const top = Math.max(0, aimOf(el, root) - barHeight() - 12);
  root.scrollTo({ top, behavior });
  holdTarget(el, root, behavior);
}

export { parseHash, repair };
