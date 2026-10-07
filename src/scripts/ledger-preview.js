// The hover card for a post. Hover (or keyboard-focus) any link to /ledger/<slug>/ with a mouse
// and a card opens beside it: verdict, takeaway, findings, and a small still or a three-second
// silent loop. PREVIEWS.md at the repo root is the spec; this is the machinery.
//
// It has to cost nothing on a slow laptop and nothing at all on a phone:
// - Phones and tablets (no hover, coarse pointer) never get past the first line of setup.
// - The text for every card is one file, /ledger/previews.json, fetched once while the browser
//   is idle. Opening a card never waits on the network.
// - A still starts loading when the pointer reaches the row (and its neighbours), before the
//   card opens. A loop is fetched only once a card has stayed open a moment, never on
//   Save-Data, 2G or reduced motion, and plays muted from a blob in memory.
// - One card element, reused. Placed once per open with left/top, faded with opacity and a
//   short transform. Nothing listens to mousemove.
import '../styles/ledger-preview.css';

const DATA_URL = '/ledger/previews.json';
const POST_PATH = /^\/ledger\/([^/?#]+)\/?$/;
const OPEN_DELAY = 90;    // ms the pointer rests on a link before the first card opens
const CLOSE_DELAY = 70;   // bridges the hairline between two ledger rows without a flicker
const WARM_MS = 450;      // after a card closes, the next one opens with no delay for this long
const LOOP_DELAY = 250;   // a card stays open this long before its loop is fetched
const GAP = 18;           // between the link's text and the card
const EDGE = 12;          // the card keeps this far from the panel's edges

const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let data = null;          // { posts: { [slug]: card } } once loaded
let loading = null;
let card = null;          // the element, built on first use
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

function load() {
  if (data) return Promise.resolve(data);
  if (!loading) {
    loading = fetch(DATA_URL, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => (data = j))
      .catch(() => { loading = null; return null; });   // the next hover tries again
  }
  return loading;
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
  const p = data && data.posts && data.posts[hit.slug];
  // No entry means the post isn't listed (or doesn't exist); the link stays a plain link.
  if (!p || !hit.a.isConnected || !hit.a.getClientRects().length) return hide();
  build();
  // Moving straight from one card to the next: the last one's loop must stop, not keep
  // decoding underneath a picture nobody can see.
  if (renderedSlug !== hit.slug) stopLoop();
  if (renderedSlug !== hit.slug || els.title.hidden !== hit.a.hasAttribute('data-ledger-entry')) render(hit, p);
  shown = hit;
  place(hit.a);
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

// ---------- the element ----------

function build() {
  if (card) return;
  card = document.createElement('div');
  card.className = 'lp-card';
  // A visual summary of a page the link already leads to: screen readers get the link, and
  // the post, rather than the card read out on every focus.
  card.setAttribute('aria-hidden', 'true');
  // The picture sits inside the body: full width across the top normally, floated into a
  // thumbnail the text wraps around when space is short (place()).
  card.innerHTML =
    '<div class="lp-body">' +
    '<div class="lp-media"><img class="lp-img" alt="" decoding="async">' +
    '<video class="lp-video" muted playsinline loop disablepictureinpicture disableremoteplayback preload="none"></video></div>' +
    '<div class="lp-meta"></div>' +
    '<div class="lp-title"></div>' +
    '<div class="lp-verdict"></div>' +
    '<p class="lp-takeaway"></p>' +
    '<ul class="lp-points"></ul>' +
    '<p class="lp-excerpt"><span class="lp-label">From the opening</span><span class="lp-excerpt-text"></span></p>' +
    '</div>';
  const q = (s) => card.querySelector(s);
  els = {
    media: q('.lp-media'), img: q('.lp-img'), video: q('.lp-video'), meta: q('.lp-meta'),
    title: q('.lp-title'), verdict: q('.lp-verdict'), takeaway: q('.lp-takeaway'),
    points: q('.lp-points'), excerpt: q('.lp-excerpt'), excerptText: q('.lp-excerpt-text'),
  };
  els.video.muted = true;
  els.img.addEventListener('load', () => els.img.classList.add('lp-ready'));
  els.video.addEventListener('playing', () => els.video.classList.add('lp-ready'));
  // Inside #panel-screen it inherits the panel's palette, which the homepage scene tweens
  // inline as day turns to night. Fixed, so it isn't clipped by the panel's overflow.
  (document.getElementById('panel-screen') || document.body).appendChild(card);
}

function render(hit, p) {
  renderedSlug = hit.slug;
  els.meta.textContent = `${p.id} · ${p.mins} min read`;
  // A ledger row already shows the title beside the card; any other link may not.
  const row = hit.a.hasAttribute('data-ledger-entry');
  els.title.hidden = row;
  els.title.textContent = row ? '' : p.title;
  els.verdict.hidden = !p.verdict;
  els.verdict.textContent = p.verdict || '';
  els.takeaway.hidden = !p.takeaway;
  els.takeaway.textContent = p.takeaway || '';
  els.points.replaceChildren(...(p.points || []).map((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    return li;
  }));
  els.points.hidden = !(p.points && p.points.length);
  els.excerpt.hidden = !p.excerpt;
  els.excerptText.textContent = p.excerpt || '';

  els.media.hidden = !p.image;
  els.img.classList.remove('lp-ready');
  els.video.classList.remove('lp-ready');
  if (p.image) {
    els.img.alt = p.alt || '';
    if (els.img.getAttribute('src') !== p.image) els.img.src = p.image;
    if (els.img.complete && els.img.naturalWidth) els.img.classList.add('lp-ready');
  } else {
    els.img.removeAttribute('src');
  }
}

// Beside the text if there's room (flush with the row's right edge, beside the text, or to its
// left), otherwise under the link, otherwise above it. The card may cover the rows around the
// one being hovered, never that row's own title or the link itself: if the full card can't sit
// clear of them, it steps down a size before anything is covered. The picture shrinks to a
// thumbnail, then goes; last, the findings go and the verdict and takeaway stay, which fits
// on any screen. The bounds are the panel card, so on the homepage it never hangs over the scene.
const SIZES = ['', 'lp-thumb', 'lp-compact', 'lp-compact lp-tight'];

function place(a) {
  const panel = a.closest('#panel-card');
  const b = panel ? panel.getBoundingClientRect() : { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
  const r = anchorBox(a);
  const size = (cls) => {
    card.classList.remove('lp-thumb', 'lp-compact', 'lp-tight');
    if (cls) card.classList.add(...cls.split(' '));
    return card.offsetHeight;
  };
  const sizes = els.media.hidden ? ['', 'lp-compact lp-tight'] : SIZES;
  let h = size('');
  const w = card.offsetWidth;
  const minX = b.left + EDGE, maxX = b.right - EDGE - w, minY = b.top + EDGE, maxBottom = b.bottom - EDGE;
  const side =
    r.right - w >= r.textRight + GAP && r.right - w <= maxX ? r.right - w   // flush with the row's right edge: the row, opened out
    : r.textRight + GAP <= maxX ? r.textRight + GAP
    : r.textLeft - GAP - w >= minX ? r.textLeft - GAP - w
    : null;
  let x, y = null;
  if (side !== null) {
    x = side;
    // Only a title long enough to reach under the card constrains it; otherwise it can slide.
    const blocked = r.titleRight > x - 4;
    for (const cls of sizes) {
      h = size(cls);
      if (r.top + h <= maxBottom || (!blocked && h <= maxBottom - minY)) { y = r.top; break; }
      if (blocked && r.titleTop - 6 - h >= minY) { y = r.titleTop - 6 - h; break; }
    }
  } else {
    x = r.left;
    for (const cls of sizes) {
      h = size(cls);
      if (r.bottom + 8 + h <= maxBottom) { y = r.bottom + 8; break; }
      if (r.above - 8 - h >= minY) { y = r.above - 8 - h; break; }
    }
  }
  if (y === null) y = r.top;   // nothing fits whole at any size: the smallest, held inside the bounds
  const maxY = maxBottom - h;
  card.style.left = `${Math.round(Math.min(Math.max(x, minX), Math.max(minX, maxX)))}px`;
  card.style.top = `${Math.round(Math.min(Math.max(y, minY), Math.max(minY, maxY)))}px`;
}

// Where the words are. A ledger row is as wide as the page but its summary is capped at 600px:
// beside the summary, the card starts level with it, under the title (most titles here run the
// whole width). A link inside a post sits in a 720px column with the margin beside it free.
//   top: where a card beside the text starts      above/bottom: what a card above/below clears
//   textLeft/textRight: the column of words        titleTop/titleRight: a row's title, to keep clear
function anchorBox(a) {
  const r = a.getBoundingClientRect();
  if (a.hasAttribute('data-ledger-entry')) {
    const box = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el || a);
      return range.getBoundingClientRect();
    };
    const t = box(a.querySelector('p')), h = box(a.querySelector('h2'));
    return { left: r.left, right: r.right, top: t.top - 4, above: r.top, bottom: r.bottom,
      textLeft: r.left, textRight: t.right, titleTop: h.top, titleRight: h.right };
  }
  const col = a.closest('[data-post-article]');
  const c = col ? col.getBoundingClientRect() : r;
  const line = a.getClientRects()[0] || r;
  return { left: line.left, right: -Infinity, top: line.top - 6, above: line.top, bottom: r.bottom,
    textLeft: c.left, textRight: c.right, titleTop: line.top, titleRight: -Infinity };
}

// ---------- media ----------

// Start fetching and decoding the stills a reader is about to see: this link's, and for a list,
// the ones either side of it, since that's where the pointer goes next.
function warmMedia(hit) {
  const go = () => {
    if (!data) return;
    const near = [hit.a];
    const item = hit.a.hasAttribute('data-ledger-entry') ? hit.a : hit.a.closest('li');
    if (item) [item.previousElementSibling, item.nextElementSibling].forEach((s) => {
      const link = s && (s.matches('a[href]') ? s : s.querySelector('a[href]'));
      if (link) near.push(link);
    });
    near.forEach((link) => {
      const h = postLink(link);
      const src = h && data.posts[h.slug] && data.posts[h.slug].image;
      if (!src || warmed.has(src)) return;
      warmed.add(src);
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      if (img.decode) img.decode().catch(() => {});
    });
  };
  if (data) go(); else load().then(go);
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
