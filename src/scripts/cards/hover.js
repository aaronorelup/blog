// The hover card for a post. Hover (or keyboard-focus) any link to /ledger/<slug>/ with a mouse and a card opens
// beside it: verdict, takeaway, findings, and a small still or a three-second silent loop. PREVIEWS.md is the spec;
// render.js builds and places the card, data.js loads the text. Importing this module is the whole mount.
//
// It has to cost nothing on a slow laptop and nothing at all on a phone:
// - Phones and tablets (no hover, coarse pointer) never get past the first line of setup.
// - The text for every card is one file, fetched once while the browser is idle. Opening a card never waits.
// - A still starts loading when the pointer reaches the row (and its neighbours), before the card opens. A loop is
//   fetched only once a card has stayed open a moment, never on Save-Data, 2G or reduced motion, and plays muted
//   from a blob in memory.
// - One card element, reused, placed once per open. Nothing listens to mousemove.
import { load, loaded } from './data.js';
import { build, fill, place } from './render.js';

const POST_PATH = /^\/ledger\/([^/?#]+)\/?$/;
const OPEN_DELAY = 90;    // ms the pointer rests on a link before the first card opens
const CLOSE_DELAY = 70;   // bridges the hairline between two ledger rows without a flicker
const WARM_MS = 450;      // after a card closes, the next one opens with no delay for this long
const LOOP_DELAY = 250;   // a card stays open this long before its loop is fetched

const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let card = null;          // the element and its parts, built on first use
let els = null;
let shown = null;         // { a, slug } of the open card
let pending = null;       // { a, slug } waiting on OPEN_DELAY or on the data
let openT = 0, closeT = 0, loopT = 0, scrollT = 0;
let warmUntil = 0;
let renderedSlug = null;
let loopAbort = null;
const warmed = new Set();
const blobs = new Map();  // loop url -> object URL, most recent last

if (hoverable.matches) init();
else hoverable.addEventListener?.('change', () => hoverable.matches && init(), { once: true });

function init() {
  if (init.done) return;
  init.done = true;
  document.addEventListener('pointerover', onOver, { passive: true });
  document.addEventListener('pointerout', onOut, { passive: true });
  document.addEventListener('focusin', onFocus);
  document.addEventListener('focusout', onOut);
  document.addEventListener('pointerdown', hideNow, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideNow(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) hideNow(); });
  window.addEventListener('resize', hideNow, { passive: true });
  // Back/forward on the homepage closes the panel without a click; don't leave a loop running
  // inside a panel nobody can see.
  window.addEventListener('popstate', hideNow);
  // Scrolling moves the link out from under the card. Hide, and once the scroll settles,
  // bring it back if the pointer (or focus) is still on the same link.
  window.addEventListener('scroll', onScroll, { capture: true, passive: true });

  const idle = () => (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(load, { timeout: 5000 });
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}

// ---------- which links get a card ----------

function postLink(target) {
  const a = target && target.closest ? target.closest('a[href]') : null;
  if (!a || (card && card.contains(a))) return null;
  let url;
  try { url = new URL(a.getAttribute('href'), location.href); } catch (_) { return null; }
  if (url.origin !== location.origin) return null;
  const m = url.pathname.match(POST_PATH);
  if (!m) return null;
  const slug = decodeURIComponent(m[1]);
  // A post doesn't preview itself (the homepage reader rewrites the address to the open post).
  const here = location.pathname.match(POST_PATH);
  if (here && decodeURIComponent(here[1]) === slug) return null;
  return { a, slug };
}

function onOver(e) {
  if (e.pointerType === 'touch') return;
  const hit = postLink(e.target);
  if (!hit) return;
  if ((shown && shown.a === hit.a) || (pending && pending.a === hit.a)) { clearTimeout(closeT); return; }
  intend(hit, false);
}

function onFocus(e) {
  const hit = postLink(e.target);
  if (!hit || hit.a !== e.target || !hit.a.matches(':focus-visible')) return;
  intend(hit, true);
}

function onOut(e) {
  const cur = shown || pending;
  if (!cur) return;
  const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
  if (a !== cur.a) return;
  if (e.relatedTarget && cur.a.contains(e.relatedTarget)) return;   // moving within the link
  clearTimeout(openT);
  pending = null;
  clearTimeout(closeT);
  closeT = setTimeout(hide, CLOSE_DELAY);
}

function intend(hit, now) {
  clearTimeout(closeT);
  clearTimeout(openT);
  pending = hit;
  load();
  warmMedia(hit);
  const delay = now || shown || performance.now() < warmUntil ? 0 : OPEN_DELAY;
  openT = setTimeout(() => {
    load().then(() => { if (pending === hit) show(hit); });
  }, delay);
}

// ---------- open and close ----------

function show(hit) {
  pending = null;
  const p = loaded()?.[hit.slug];
  // No entry means the post isn't listed (or doesn't exist); the link stays a plain link.
  if (!p || !hit.a.isConnected || !hit.a.getClientRects().length) return hide();
  if (!card) ({ card, els } = build());
  // Moving straight from one card to the next: the last one's loop must stop, not keep
  // decoding underneath a picture nobody can see.
  if (renderedSlug !== hit.slug) stopLoop();
  const row = hit.a.hasAttribute('data-ledger-entry');
  if (renderedSlug !== hit.slug || els.title.hidden !== row) {
    renderedSlug = hit.slug;
    fill(els, p, row);
  }
  shown = hit;
  place(card, els, hit.a);
  card.classList.add('lp-on');
  startLoop(hit.slug, p);
}

function hide() {
  clearTimeout(openT); clearTimeout(closeT); clearTimeout(loopT);
  pending = null;
  if (!shown) return;
  shown = null;
  warmUntil = performance.now() + WARM_MS;
  if (card) card.classList.remove('lp-on');
  stopLoop();
}

function hideNow() {
  clearTimeout(scrollT);
  hide();
}

let scrolledFrom = null;
function onScroll(e) {
  if (card && e.target === card) return;
  if (shown) scrolledFrom = shown;
  if (!scrolledFrom) return;
  hide();
  clearTimeout(scrollT);
  scrollT = setTimeout(() => {
    const was = scrolledFrom;
    scrolledFrom = null;
    if (was.a.isConnected && (was.a.matches(':hover') || was.a.matches(':focus-visible'))) show(was);
  }, 140);
}

// ---------- media ----------

// Start fetching and decoding the stills a reader is about to see: this link's, and for a list,
// the ones either side of it, since that's where the pointer goes next.
function warmMedia(hit) {
  const go = (posts) => {
    if (!posts) return;
    const near = [hit.a];
    const item = hit.a.closest('li');
    if (item) [item.previousElementSibling, item.nextElementSibling].forEach((s) => {
      const link = s && (s.matches('a[href]') ? s : s.querySelector('a[href]'));
      if (link) near.push(link);
    });
    near.forEach((link) => {
      const h = postLink(link);
      const src = h && posts[h.slug] && posts[h.slug].image;
      if (!src || warmed.has(src)) return;
      warmed.add(src);
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      if (img.decode) img.decode().catch(() => {});
    });
  };
  load().then(go);
}

function motionAllowed() {
  if (reducedMotion.matches) return false;
  const c = navigator.connection;
  return !(c && (c.saveData || /2g$/.test(c.effectiveType || '')));
}

function startLoop(slug, p) {
  clearTimeout(loopT);
  if (!p.loop || !motionAllowed()) return;
  const play = (url) => {
    if (!shown || shown.slug !== slug) return;
    const v = els.video;
    if (v.getAttribute('src') !== url) v.src = url;
    v.currentTime = 0;
    const pr = v.play();
    if (pr) pr.catch(() => {});
  };
  if (blobs.has(p.loop)) return play(blobs.get(p.loop));
  loopT = setTimeout(() => {
    // Fetched whole into memory: one small request, cancelled if the reader moves on first, and
    // after that every loop and every return to this card plays from the blob with no request.
    loopAbort = new AbortController();
    fetch(p.loop, { signal: loopAbort.signal })
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        blobs.set(p.loop, url);
        if (blobs.size > 12) {
          const [oldest, oldUrl] = blobs.entries().next().value;
          if (els.video.getAttribute('src') !== oldUrl) { URL.revokeObjectURL(oldUrl); blobs.delete(oldest); }
        }
        play(url);
      })
      .catch(() => {});
  }, LOOP_DELAY);
}

function stopLoop() {
  if (loopAbort) { loopAbort.abort(); loopAbort = null; }
  if (els) {
    els.video.pause();
    els.video.classList.remove('lp-ready');
  }
}
