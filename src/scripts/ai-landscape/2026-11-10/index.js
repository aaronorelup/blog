// The page's entry: small, and enough to run the page before (or without) the scene. It checks what the
// machine can do, picks a quality rung, sizes the sections, runs the story clock and the chrome, then loads
// the three.js scene after first paint. With no WebGL, ?tier=static or the skip link, the text version stays.
// window.__landscape { ready, tier, progress, frames, section, camera, world } is the hook the tests read.
import { createClock } from './core/clock.js';
import { $, $$, announce, lazy, readData, toggle } from './core/dom.js';
import { createInput } from './core/input.js';
import { remember, replaced, restore } from './core/markup.js';
import { pickRung } from './core/quality.js';
import { markExpired } from './ui/expiry.js';
import { markWide } from './ui/wide.js';

const root = document.documentElement;
const state = { ready: false, tier: 'static', progress: 0, frames: 0, section: '', camera: null, world: '' };
window.__landscape = state;
// A window shorter than this reads the text version (a phone held sideways, 200 percent zoom): the 3D page's fixed
// layers need the height. Crossing back brings the 3D page back at the same place.
const SHORT = 540;
const phoneQuery = matchMedia('(max-width: 899px)');
const query = new URLSearchParams(location.search);
const reduced = query.has('reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const main = $('#ail-main');
let canvas = $('#ail-gl');
let canvasUsed = false;
let scene = null;
let clock = null;
let input = null;
let markRail = () => {};
let running = false;
let raf = 0;              // the one frame handle: a loop never runs twice
let last = 0;
let shown = null;         // the section whose stage is lit
let pending = null;       // a section landed by a link: its heading takes focus when its stage lights
let headAt = 0;           // when it did
let mounts = 0;           // each scene load has a number: one that arrives after a newer one, or after the text version, is dropped
let chosen = false;       // the text version for good: the skip link, no WebGL, a lost context, a machine too slow
let away = null;          // the text version for now (a short window, printing): where the reader was
let size = { w: innerWidth, h: innerHeight };
let rung = null;
let phone = false;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch { return false; }
}

const gl = () => root.classList.contains('ail-gl');
// A section's heading takes focus (a link landed it, or the page fell back to text while the reader was in it).
// A heading the 3D draws itself can be hidden: then the stage holds focus, and the next Tab is inside it.
function focusHead(sec) {
  const head = document.getElementById(sec.getAttribute('aria-labelledby')) || $('h1', sec) || sec;
  const to = head.checkVisibility && !head.checkVisibility({ visibilityProperty: true }) ? $('.ail-stage', sec) || sec : head;
  if (!to.hasAttribute('tabindex')) to.tabIndex = -1;
  to.focus({ preventScroll: true });
}

// Everything the 3D page wrote into the document goes: the scene (each section puts back the markup it changed), the
// loop, the lit stages, inline styles, the links it added, every attribute it changed. The page is what Astro built.
function stop3D() {
  running = false;
  if (raf) cancelAnimationFrame(raf);
  raf = 0; shown = null; pending = null; mounts++;
  if (scene) { scene.dispose(); scene = null; }
  restore();
  root.classList.remove('ail-3d');
  for (const name of ['data-chrome', 'data-full']) root.removeAttribute(name);
  for (const el of $$('.is-on')) el.classList.remove('is-on');
  for (const el of $$('main [style]')) el.removeAttribute('style');
  for (const el of $$('main [inert]')) el.inert = false;
  for (const el of $$('main [data-faint]')) el.removeAttribute('data-faint');
  for (const el of $$('.ail-next, body > .ail-lidmark')) el.remove();
  const leaders = $('#ail-leaders');
  if (leaders) leaders.replaceChildren();
}

// The text version (SPEC 7.3): the page as Astro built it. Also where a lost context, a slow machine or a lost chunk
// lands (for good, `chosen`), and where a short window or printing lands for now. keep: stay at the section the reader
// was in. say: tell the live region, and move focus to that section's heading.
function toText({ why = 'chosen', keep = false, say = false } = {}) {
  const sec = keep && clock && gl() ? clock.current : null;
  if (why === 'chosen') { chosen = true; away = null; } else if (!away) away = { why, s: clock ? clock.target : 0, id: sec ? sec.id : '' };
  stop3D();
  root.classList.remove('ail-gl');
  state.tier = 'static'; state.ready = true; state.world = ''; state.section = '';
  markWide(true);
  const at = sec && document.getElementById(sec.id);
  // a reader who never left the opening stays at the very top, with the page's own title: no jump past it
  const first = at && clock && at === clock.sections[0].el;
  if (first) window.scrollTo(0, 0); else if (at) at.scrollIntoView();
  if (at && say) focusHead(first ? $('.ail-chrome') : at);
  if (say) announce(main.dataset.sayText || '');
  if (away) { away.here = (at && at.id) || midSection(); window.addEventListener('scroll', onTextScroll, { passive: true }); }
}

function buildRail() {
  const rail = $('.ail-rail');
  const list = rail && $('ol', rail);
  if (!list) return () => {};
  let prev = '';
  const links = clock.sections.filter((sec) => sec.id).map((sec) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const name = document.createElement('span');
    a.href = `#${sec.id}`;
    name.textContent = sec.el.dataset.rail || sec.id;
    if (prev && prev !== sec.name) li.dataset.gap = '';
    prev = sec.name;
    a.append(name); li.append(a); list.append(li);
    return { a, sec };
  });
  rail.hidden = false;
  return (current) => links.forEach(({ a, sec }) => a.setAttribute('aria-current', String(sec === current)));
}

// Keyboard: every stage ends with a link to the next section, read and shown only when it has focus (SPEC 7.4).
function addNextLinks() {
  const secs = clock.sections.filter((s) => s.id);
  secs.forEach((sec, i) => {
    const next = secs[i + 1];
    const stage = $('.ail-stage', sec.el);
    if (!next || !stage || $('.ail-next', stage)) return;
    const a = document.createElement('a');
    a.className = 'ail-next ail-vh';
    a.href = `#${next.id}`;
    a.textContent = `${main.dataset.sayNext || ''} ${next.el.dataset.rail || next.id}`.trim();
    stage.append(a);
  });
}

// A link to a section lands where the section says it is worth arriving (data-land, in screens from its start):
// a world's address opens on the world, not on the studio before it. Its heading takes focus when it is lit.
function land(hash, smooth) {
  const sec = clock.sections.find((x) => x.id && x.id === hash.slice(1));
  if (!sec) return false;
  const top = clock.pixels(sec.s0 + (Number(sec.el.dataset.land) || 0));
  window.scrollTo({ top, behavior: smooth && !reduced ? 'smooth' : 'auto' });
  pending = { sec, top, at: performance.now() };
  return true;
}
// the landed section's heading takes focus as soon as its stage is lit (a block that goes out under focus hands it
// back to the heading: dom.js setBeat). A visitor who scrolls elsewhere meanwhile drops it
function arrive(cur, now) {
  if (!pending) return;
  if (now - pending.at > 8000) { pending = null; return; }
  if (pending.sec !== cur) return;
  pending = null;
  headAt = performance.now();
  focusHead(cur.el);
}

// Five times a second, every control of the lit stage that its section has faded under 0.9 (an opacity on it or on
// what holds it) is inert, so Tab, a finger and a screen reader reach only what can be seen. The focused one is left.
const CONTROLS = 'a[href], button, summary, [tabindex]:not([tabindex="-1"])';
let sweepAt = 0;
function sweep(stage) {
  for (const el of $$(CONTROLS, stage)) {
    if (el.classList.contains('ail-vh') || el === document.activeElement) continue;
    let o = 1;
    for (let n = el; n && n !== stage.parentElement; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
    const faint = o < 0.9;
    if (faint !== el.hasAttribute('data-faint')) { el.toggleAttribute('data-faint', faint); el.inert = faint; }
  }
}

// One frame. A frame that throws is dropped and the loop goes on (every frame starts from the scroll position, so
// the next one draws whole). Three in a row is a page that cannot draw: it reads as text, at the reader's place.
let faults = 0;
function frame(now) {
  raf = 0;
  if (!running) return;
  try { step(now); faults = 0; } catch (err) {
    console.warn('ai-landscape: a frame failed.', err);
    if (++faults >= 3) { toText({ keep: true, say: true }); return; }
  }
  if (running && !raf) raf = requestAnimationFrame(frame);
}
function step(now) {
  const real = Math.max(0, (now - last) / 1000);
  const dt = Math.min(0.05, real);
  last = now;
  clock.update(dt);
  input.update(dt);
  const cur = clock.current;
  if (cur !== shown) {
    let held = false;
    if (shown) {
      // a stage that goes dark takes its lit parts with it: nothing inside it can be reached by Tab or a finger
      const stage = $('.ail-stage', shown.el);
      held = !!stage && stage.contains(document.activeElement);
      toggle(stage, false);
      if (stage) { stage.inert = true; for (const n of $$('.is-on', stage)) n.classList.remove('is-on'); }
      for (const n of [shown.el, ...$$('[data-beat-now]', shown.el)]) delete n.dataset.beatNow;
    }
    const lit = cur && $('.ail-stage', cur.el);
    if (lit) { toggle(lit, true); lit.inert = false; }
    // focus that was in the stage that went dark goes to the section now on screen, not back to the top of the page
    if (held && cur) focusHead(cur.el);
    shown = cur;
    markRail(cur);
    state.section = cur ? cur.id : '';
    state.world = cur ? cur.el.dataset.world || '' : '';
    const map = $('.ail-map');
    if (map) {
      map.toggleAttribute('data-here', !!state.world);
      $$('.ail-map__col').forEach((c) => c.toggleAttribute('data-here', c.dataset.p === state.world));
    }
  }
  arrive(cur, now);
  if (cur && now - sweepAt > 200) { sweepAt = now; const lit = $('.ail-stage', cur.el); if (lit) sweep(lit); }
  state.progress = clock.s / clock.max;
  if (scene) scene.frame(dt, now / 1000, real);
  else if (beats.length < 90) beats.push(real);      // before the scene: how often this display hands out frames
}
function start() {
  if (raf) cancelAnimationFrame(raf);
  running = true; last = performance.now();
  raf = requestAnimationFrame(frame);
}
// A hidden tab holds the frame already asked for and runs it on return: only the clock's last tick is reset, and a
// loop starts again only if none is waiting (one loop, however often the tab is hidden and shown).
function wake() {
  last = performance.now();
  if (running && !raf) raf = requestAnimationFrame(frame);
}

// The display's own pace, in seconds a frame: the quick quarter of the frames the loop ran before the scene (a page
// still loading runs some long; the very first is cut short by when the loop began). 0 when too few were seen.
// A 30 a second phone is not a slow one (core/quality.js).
const beats = [];
function cadence() {
  const sorted = beats.slice(1).sort((a, b) => a - b);
  return sorted.length < 4 ? 0 : sorted[Math.floor(sorted.length / 4)];
}
// The scene waits for that pace: PACE frames of the bare loop (a fifth of a second at 60 a second), or 1.5 s of a
// visible page whose frames are held up. A scene from the cache arrives within a few frames, and with the four or so
// seen by then the pace was unknown half the time (a 30 a second display then read as a slow machine) or read double.
const PACE = 12;
const paced = () => new Promise((done) => {
  let waited = 0;
  const look = () => { if (beats.length > PACE || waited > 1500) done(); else { waited += document.hidden ? 0 : 30; setTimeout(look, 30); } };
  look();
});

// After first paint, the scene. A chunk lost to a deploy reloads the page once, any other failure keeps the text.
// `token` is the number enter3D() took: a text version that started since (a short window, print, the skip link) has
// moved on, and this load, its mount or its scene is dropped.
function load(token) {
  const mine = () => token === mounts && running && gl();
  if (!mine()) return;
  const used = canvas;
  canvasUsed = true;
  const fail = () => toText({ keep: true, say: true });
  lazy(() => import('./scene/index.js'))
    .then((m) => paced().then(() => m))
    .then((m) => (mine() ? (remember(), m.mount({ canvas: used, clock, input, state, rung, phone, reduced, query, data: readData(), toText: fail, cadence: cadence() })) : null))
    .then((mounted) => {
      if (!mounted) return;
      if (!mine()) { mounted.dispose(); if (!gl()) state.tier = 'static'; return; }
      if (scene) scene.dispose();
      scene = mounted; root.classList.add('ail-3d'); state.ready = true;
    })
    .catch((err) => {
      if (!mine()) return;
      console.warn('ai-landscape: the scene did not start, showing the text version.', err);
      fail();
    });
}

// The 3D page, at a story position (screens) or at the section with this id.
function enter3D(where) {
  phone = phoneQuery.matches;
  rung = pickRung(query, phone);
  // a canvas that had a context keeps it, lost: a new scene draws on a fresh one
  if (scene) { scene.dispose(); scene = null; }
  if (canvasUsed) { const fresh = canvas.cloneNode(false); canvas.replaceWith(fresh); replaced(canvas, fresh); canvas = fresh; canvasUsed = false; }
  root.classList.add('ail-gl');
  markWide(false);
  clock.measure();
  size = { w: innerWidth, h: innerHeight };
  const sec = typeof where === 'string' && clock.sections.find((x) => x.id === where);
  const s = sec ? sec.s0 + (Number(sec.el.dataset.land) || 0) : where;
  if (typeof s === 'number') window.scrollTo(0, clock.pixels(s));
  clock.update(0); clock.jump();
  addNextLinks();
  state.tier = rung.name; state.ready = false;
  beats.length = 0;
  start();
  const token = ++mounts;
  requestAnimationFrame(() => requestAnimationFrame(() => load(token)));
}

// While the text version stands in for now, the section the reader has scrolled to (read on scroll, before any resize
// reflows the page). Back in 3D: the same place if that is still the section they left, else that section.
const midSection = () => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); const s = e && e.closest('main > section'); return s ? s.id : ''; };
let reading = 0;
function onTextScroll() { if (away && !reading) reading = requestAnimationFrame(() => { reading = 0; if (away) away.here = midSection() || away.here; }); }
function back() {
  const was = away;
  away = null;
  window.removeEventListener('scroll', onTextScroll);
  const here = was && (was.here || was.id);
  enter3D(!here || here === was.id ? was && was.s : here);
}

function onResize() {
  if (!gl()) markWide(true);
  if (chosen) return;
  const tall = innerHeight >= SHORT;
  if (!gl()) { if (away && away.why === 'short' && tall) back(); return; }
  // a touch screen's address bar comes and goes as the page scrolls: the sections are measured in its small height
  if (input.touch && innerWidth === size.w && Math.abs(innerHeight - size.h) < 120) return;
  if (!tall) { toText({ why: 'short', keep: true }); return; }
  // keep the place in the story: sections are measured in screens, the scroll position in pixels
  const s = clock.target;
  size = { w: innerWidth, h: innerHeight };
  clock.measure();
  window.scrollTo(0, clock.pixels(s));
  clock.update(0); clock.jump();
  if (scene) scene.resize();
}

function boot() {
  markExpired();
  for (const skip of $$('[data-ail-text]')) {
    skip.addEventListener('click', (e) => {
      e.preventDefault();
      toText();
      main.tabIndex = -1; main.focus();
      window.scrollTo(0, 0);
    });
  }
  // printing prints the text version, every picture loaded
  window.addEventListener('beforeprint', () => {
    for (const img of $$('img[loading="lazy"]')) img.loading = 'eager';
    if (gl()) toText({ why: 'print', keep: true });
  });
  window.addEventListener('afterprint', () => { if (!chosen && away && away.why === 'print') back(); });
  if (pickRung(query, phoneQuery.matches).name === 'static' || !hasWebGL()) {
    toText();
    window.addEventListener('resize', () => markWide(true));
    return;
  }

  input = createInput({ reduced });
  clock = createClock({ touch: input.touch, reduced });
  clock.measure();
  markRail = buildRail();
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    // Enter on a link (a click with no pointer) lands at once, so focus is in the new section before the next key
    const keyed = e.detail === 0;
    if (!a || !gl() || !land(a.hash, !keyed)) return;
    e.preventDefault();
    history.pushState(null, '', a.hash);
    if (keyed) { clock.update(0); clock.jump(); }
  });
  // Tab on a stage's last link, the one to the next section, takes it: a reader who only presses Tab walks the page.
  // A Tab in the second a landed section takes to fade in waits on its heading: its controls cannot take focus yet
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || !gl()) return;
    const a = document.activeElement;
    if (a && a.tabIndex < 0 && a !== document.body && performance.now() - headAt < 1000) { e.preventDefault(); return; }
    if (!a || !a.classList || !a.classList.contains('ail-next') || !land(a.hash, false)) return;
    e.preventDefault();
    history.pushState(null, '', a.hash);
    clock.update(0); clock.jump();
  });
  window.addEventListener('hashchange', () => { if (gl()) land(location.hash, false); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
  window.addEventListener('pageshow', (e) => { if (e.persisted) wake(); });
  window.addEventListener('resize', onResize);
  // crossing 899 px (a tablet turned, a window narrowed): the scene is built again for the other layout, same place
  phoneQuery.addEventListener('change', () => { if (!gl() || chosen) return; const s = clock.target; stop3D(); enter3D(s); });

  if (innerHeight < SHORT) { toText({ why: 'short' }); return; }
  enter3D(null);
  if (location.hash) {
    land(location.hash, false);
    // the browser's own scroll to the anchor can come after this one and leave the page at the section's top,
    // so the page lands once more when it has loaded, unless the visitor has already started to scroll
    let touched = false;
    const off = input.onInput((kind) => { if (kind !== 'move') { touched = true; off(); } });
    window.addEventListener('load', () => requestAnimationFrame(() => { off(); if (!touched && gl() && land(location.hash, false)) { clock.update(0); clock.jump(); } }), { once: true });
  }
}

boot();
