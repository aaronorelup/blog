// The tea room's one module (layouts/TeaPage.astro): marks the chapter being read in the rail (aria-current) and keeps
// it, and any pill the keyboard reaches, in view on the phone's strip, and fades sections in once as they arrive.
// Without it every anchor still works and everything is visible; the fade only starts once this has run and never
// under reduced motion.
const root = document.documentElement;
const links = new Map([...document.querySelectorAll('[data-tea-link]')].map((a) => [a.dataset.teaLink, a]));
const strip = document.querySelector('[data-tea-strip]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// On the phone's strip (when it overflows), brings a pill to the strip's start, where the scroll snaps it and it shows
// whole, clear of the fading end; the room after the last pill (tea.css) lets the last ones get clear too.
function lead(a) {
  if (!a || !strip || strip.scrollWidth <= strip.clientWidth) return;
  // the pill's place in the strip's own scroll (offsetLeft counts from the rail, which starts further out)
  const left = a.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft;
  slide(Math.max(0, Math.min(left - 16, strip.scrollWidth - strip.clientWidth)));
}

// The glide is the strip's own, an instant move a frame, never the browser's smooth scroll: in Chromium a link to a
// chapter followed while a smooth scroll runs on the strip lands with the chapter centred in the window instead of at
// its top (the ledger, some 17,000 px tall on a phone, 8,292 px down it), from anywhere on the page, followed by the
// keyboard or by script (a tap not measured), and the strip glides after every change of chapter, so a link followed
// within a third of a second of one met it (tea-hero-23, tea-hero-7). Snapping waits for the glide's end (data-gliding,
// tea.css: the snap then lands at once, in one frame); a hand on the strip stops it.
const GLIDE = 320;
let glide = 0;
function slide(to) {
  stop();
  const from = strip.scrollLeft;
  if (still || Math.abs(to - from) < 1) { strip.scrollLeft = to; return; }
  const t0 = performance.now();
  strip.dataset.gliding = '';
  const step = (now) => {
    const k = Math.min(1, Math.max(0, (now - t0) / GLIDE));
    strip.scrollLeft = from + (to - from) * (1 - (1 - k) ** 3);
    if (k < 1) glide = requestAnimationFrame(step);
    else stop();
  };
  glide = requestAnimationFrame(step);
}
function stop() {
  cancelAnimationFrame(glide);
  glide = 0;
  delete strip.dataset.gliding;
}
for (const type of ['pointerdown', 'wheel', 'touchstart']) strip?.addEventListener(type, () => glide && stop(), { passive: true });

function mark(id) {
  for (const [key, a] of links) {
    if (key === id) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }
  lead(links.get(id));
}

// The pill the keyboard is on gets the same place, so it never sits cut off or under the fade. A frame later, once
// the browser's own reveal of the focused link is done: WebKit's would stop a glide started any sooner.
strip?.addEventListener('focusin', (e) => {
  const a = e.target.closest('[data-tea-link]');
  if (a) requestAnimationFrame(() => lead(a));
});

// The current chapter: the last one whose top has passed a line a third of the way down the window.
const chapters = [...document.querySelectorAll('[data-tea-chapter]')];
let current = null;
function pick() {
  const line = innerHeight / 3;
  let id = null;
  for (const c of chapters) if (c.getBoundingClientRect().top <= line) id = c.dataset.teaChapter;
  if (id !== current) { current = id; mark(id); }
}
let queued = false;
addEventListener('scroll', () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; pick(); });
}, { passive: true });
addEventListener('resize', pick);
pick();

// The fade: only what is still below the window waits for it.
if (!still && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const el of document.querySelectorAll('.tea-reveal')) {
    if (el.getBoundingClientRect().top < innerHeight) continue;
    el.classList.add('is-waiting');
    io.observe(el);
  }
  root.classList.add('tea-js');
}
