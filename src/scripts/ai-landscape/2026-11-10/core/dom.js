// Small DOM helpers shared by the entry, the scene and the sections: queries, the page's data block, the
// beat switch that lights a section's words, and the live region. Words are always read from the HTML.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// The one JSON block the page carries: the structure of the five stacks (data/view.js writes it).
export function readData() {
  const node = document.getElementById('ail-data');
  try { return JSON.parse(node.textContent); } catch { return null; }
}

// Light the blocks of `root` whose data-beat lists `name` (data-beat="b c"), and hide the others. A block that is not
// lit is inert: a part of it that a stylesheet keeps visible can still not be reached by Tab or a screen reader.
export function setBeat(root, name) {
  if (root.dataset.beatNow === name) return false;
  root.dataset.beatNow = name;
  for (const el of $$('[data-beat]', root)) {
    const on = el.dataset.beat.split(' ').includes(name);
    el.classList.toggle('is-on', on);
    // focus inside a block that goes out stays in its section: on the section's heading, never back at the page top
    if (!on && el.contains(document.activeElement)) {
      const head = document.getElementById(root.getAttribute('aria-labelledby'));
      if (head) { if (!head.hasAttribute('tabindex')) head.tabIndex = -1; head.focus({ preventScroll: true }); }
    }
    el.inert = !on;
  }
  return true;
}

export const toggle = (el, on) => { if (el && el.classList.contains('is-on') !== on) el.classList.toggle('is-on', on); };

// Scrubbed opacity for a block that follows the scroll rather than a class.
export function fade(el, opacity, dy = 0) {
  el.style.opacity = opacity.toFixed(3);
  el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
  if (dy || el.style.transform) el.style.transform = dy ? `translate3d(0,${dy.toFixed(1)}px,0)` : '';
}

// The site's lazy() rule (src/scripts/lazy.js), kept here so this page shares no chunk with the site's own pages:
// after a deploy an open tab's hashed chunks are gone, so a failed import reloads the page, once per session.
// Every chunk of this page loads through it: the scene, each section and each signature.
// A visitor on the way out is not a lost chunk: WebKit stops a page's loads the moment a navigation away begins, so
// an import still in flight fails then, and a reload would bring the visitor back to the page they were leaving.
// While the page is leaving a failed import waits, and is tried again if the page is still here four seconds on.
const LEAVE = 4000;
let leaving = 0;
if (typeof window !== 'undefined') for (const type of ['beforeunload', 'pagehide']) window.addEventListener(type, () => { leaving = performance.now(); });
export function lazy(load) {
  return load().catch((err) => {
    if (leaving && performance.now() - leaving < LEAVE) return new Promise((resolve) => { setTimeout(resolve, LEAVE); }).then(() => lazy(load));
    let spent = true;
    try { spent = !!sessionStorage.getItem('ao-reloaded'); if (!spent) sessionStorage.setItem('ao-reloaded', '1'); } catch { /* storage off: never loop */ }
    if (!spent) location.reload();
    err.spent = spent;
    throw err;
  });
}

// One sentence to the polite live region, built from data by the caller (SPEC 7.4).
export function announce(text) {
  const live = $('.ail-live');
  if (live && live.textContent !== text) live.textContent = text;
}

// Roving focus for a group of buttons: arrows move, Home and End jump (SPEC 4.7). Returns the unbind function.
export function rove(group, selector = 'button, summary') {
  const onKey = (e) => {
    const items = $$(selector, group).filter((n) => n.offsetParent !== null);
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : step ? (i + step + items.length) % items.length : -1;
    if (next < 0) return;
    e.preventDefault();
    items[next].focus();
  };
  group.addEventListener('keydown', onKey);
  return () => group.removeEventListener('keydown', onKey);
}
