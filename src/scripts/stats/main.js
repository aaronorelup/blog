// /stats boots here. The page is already readable before this runs (the H1, the paragraph, the
// questions are server HTML); this file fetches the filing (already in flight from the inline
// prefetch in stats.astro), builds the shared context every chapter gets, mounts the bar and the
// hero at once, and the other chapters only as the reader nears them.
//
// Chapters are found with import.meta.glob rather than plain import() calls, on purpose: a
// chapter whose file is missing or fails to load just isn't mounted, and its section keeps its
// static skeleton (question, "this answer needs JavaScript" line). Nothing one chapter does can
// stop the others or the hero from drawing. DESIGN.md §D.10 is the contract every module meets:
//
//   export async function mount(el, ctx) -> { update(state, prev), go?(route), onMode?(), destroy() }
import * as agg from './core/agg.js';
import * as fmt from './core/fmt.js';
import * as words from './core/words.js';
import { motion } from './core/motion.js';
import { loadSnapshot, retry } from './core/data.js';
import { createViews } from './core/view.js';
import { createStore } from './core/store.js';
import { createRouter, targetFor, scrollToEl, releaseScrollHold } from './core/router.js';
import { createBus } from './core/bus.js';
import * as pop from './ui/pop.js';
import * as term from './ui/term.js';
import * as sentence from './ui/sentence.js';
import * as glyph from './ui/glyph.js';
import * as drawer from './ui/drawer.js';
import * as table from './ui/table.js';
import * as observe from './ui/observe.js';
import { mountBar } from './ui/bar.js';
// The failure states (ui/states.js) load only when there is a failure to show: most visits
// never need them, and the first bundle is over its budget without them.
const states = () => import('./ui/states.js');

// Lazy by default: each of these becomes its own chunk, fetched when called.
const MODULES = import.meta.glob([
  './hero/hero.js',
  './ask/chips.js',
  './ask/noticed.js',
  './ask/questions.js',
  './machines/machines.js',
  './growing/growing.js',
  './people/people.js',
  './rhythm/rhythm.js',
  './how/how.js',
]);

const REGISTRY = [
  { key: 'top', sel: '#st-top', path: './hero/hero.js', eager: true },
  { key: 'chips', sel: '[data-st-slot="chips"]', path: './ask/chips.js', eager: true },
  { key: 'noticed', sel: '[data-st-slot="noticed"]', path: './ask/noticed.js', eager: true },
  { key: 'machines', sel: '#st-machines', path: './machines/machines.js' },
  { key: 'growing', sel: '#st-growing', path: './growing/growing.js' },
  { key: 'people', sel: '#st-people', path: './people/people.js' },
  { key: 'rhythm', sel: '#st-rhythm', path: './rhythm/rhythm.js' },
  { key: 'how', sel: '#st-how', path: './how/how.js' },
];
// which registered module answers each route chapter
const OWNER = { top: 'top', machines: 'machines', growing: 'growing', read: 'people', where: 'people', when: 'rhythm', speed: 'rhythm', how: 'how' };

const importCache = new Map();
function load(path) {
  if (!importCache.has(path)) {
    const fn = MODULES[path];
    // A chunk that failed (the network dropped) isn't remembered here, so the next approach asks
    // again. Chrome (measured 18 Oct) keeps a failed module URL failed for the life of the page,
    // so there this only stops a retry being refused by our own cache; browsers that refetch win.
    importCache.set(path, fn ? fn().catch((e) => { console.error('[stats] could not load ' + path, e); importCache.delete(path); return null; }) : Promise.resolve(null));
  }
  return importCache.get(path);
}

// ctx.ui.<name> is the module (ctx.ui.table.tableTwin(...)) and also callable as its main
// function (ctx.ui.followups(el, items)), since §D.10 can be read either way and chapters were
// written both ways.
function callable(mod, main) {
  const fn = (...args) => mod[main](...args);
  for (const [k, v] of Object.entries(mod)) fn[k] = v;
  return fn;
}
const UI = {
  pop: callable(pop, 'openPop'),
  term: callable(term, 'term'),
  sentence: callable(sentence, 'render'),
  glyph: callable(glyph, 'glyphSVG'),
  drawer: callable(drawer, 'createDrawer'),
  table: callable(table, 'tableTwin'),
  observe: callable(observe, 'onNear'),
};
// Ranked bars, split bars and follow-up links are drawn only by the chapters and the hero's
// drawers (which import them themselves), never by the first screen, so they load with the
// first chapter instead of in the first bundle. ctx.ui has them before any chapter mounts.
let kitP = null;
function loadKit() {
  kitP ||= Promise.all([import('./ui/bars.js'), import('./ui/split.js'), import('./ui/followups.js')])
    .then(([bars, split, follow]) => {
      UI.bars = callable(bars, 'rankedBars');
      UI.split = callable(split, 'splitBar');
      UI.followups = callable(follow, 'followups');
      return true;
    })
    .catch((e) => { console.error('[stats] could not load the chapter kit', e); kitP = null; return false; });
  return kitP;
}

// ---------- build data ----------
function readBuild() {
  let raw = {};
  try { raw = JSON.parse(document.getElementById('st-build')?.textContent || '{}'); } catch (e) { raw = {}; }
  const posts = (raw.posts || []).slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return {
    posts,
    bySlug: new Map(posts.map((p) => [String(p.slug).toLowerCase(), p])),
    labels: raw.labels || words.PATH_LABELS,
    courses: raw.courses || [],
    // slug-shaped words the site's own pages use (stats.astro), for agg.isPublicPath
    words: Array.isArray(raw.words) ? raw.words : null,
  };
}

// ---------- palette for canvas ----------
const PALETTE_VARS = {
  person: '--st-person', personGlow: '--st-person-glow', bot: '--st-bot', scanner: '--st-scanner', agent: '--st-agent',
  stale: '--st-stale', total: '--st-total', you: '--st-you', page: '--pc-page', bg: '--pc-bg', tile: '--pc-tile',
  line: '--pc-line', line2: '--pc-line2', quiet: '--pc-quiet', soft: '--pc-soft', body: '--pc-body',
  strong: '--pc-strong', head: '--pc-head', accent: '--pc-accent',
};
function readPalette(root) {
  const cs = getComputedStyle(root);
  const out = {};
  for (const [k, v] of Object.entries(PALETTE_VARS)) out[k] = cs.getPropertyValue(v).trim();
  out.mode = document.documentElement.dataset.mode === 'day' ? 'day' : 'night';
  return out;
}

// Chapter entrance: the text rises once, when the chapter's top has come a quarter of the way up
// the view. (A share-of-the-section threshold would never fire for a chapter taller than four
// screens, and its question would stay invisible.) Set up before the data arrives, so the
// sections that stay in a failure state (How was this counted?) still come in.
function watchEntrances() {
  const secs = document.querySelectorAll('.st-ch');
  if (typeof IntersectionObserver !== 'function') { secs.forEach((s) => s.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { root: observe.scrollRoot(), rootMargin: '0px 0px -25% 0px', threshold: 0 });
  secs.forEach((s) => io.observe(s));
}

async function boot() {
  const root = document.querySelector('.st');
  if (!root) return;
  document.documentElement.classList.add('st-js');
  chrome();
  const build = readBuild();

  // start fetching the hero's chunk now, in parallel with the data it will draw
  for (const r of REGISTRY) if (r.eager) load(r.path);
  load('./hero/hero.js');

  watchEntrances();
  const ledeEl = document.querySelector('[data-st-lede]');
  if (ledeEl) { ledeEl.classList.add('is-loading'); ledeEl.textContent = 'Sorting the latest filing…'; }
  let loaded = await loadSnapshot();
  // A retry that works brings the whole page in under the reader's focus: the pill they pressed
  // goes away with the failure state, so focus moves to the H1 and the answer is said once in a
  // polite live region (the hero turns the lede's own live region off, and says nothing on its
  // first render). A retry that fails again keeps focus on the new pill (ui/states.js).
  let said = null;
  const retryLoop = async () => {
    if (!said) {
      said = document.createElement('p');
      said.className = 'st-sr';
      said.setAttribute('aria-live', 'polite');
      root.append(said);
    }
    said.textContent = '';
    const next = await retry();
    if (next.ok) {
      const hadFocus = !!document.activeElement?.closest?.('.st-state-actions') || document.activeElement === document.body;
      clearFallback();
      try { (await states()).clearState(); } catch (e) { /* never shown, nothing to clear */ }
      start(next.snap, { retried: hadFocus ? 'focus' : 'say' });
    } else showFailure(next, retryLoop);
  };
  if (!loaded.ok) { showFailure(loaded, retryLoop); return; }
  start(loaded.snap);

  function start(snap, { retried = null } = {}) {
    const views = createViews(snap, build);
    const defaultRange = agg.clampRange(snap, { kind: 'last', n: 30 });
    const store = createStore({ range: defaultRange, unit: 'pages', tz: 'local', route: { ch: 'top', sub: null, item: null } });
    const bus = createBus();
    term.setDefaultBus(bus);
    const mounted = new Map();   // key -> Mounted
    const mounting = new Map();  // key -> Promise<Mounted|null>
    let palette = readPalette(root);
    const zone = fmt.tzZone();

    const ctx = {
      snap, build, views, store, bus,
      router: null,
      agg, fmt, words, motion,
      ui: UI,
      scrollRoot: observe.scrollRoot(),
      tz: { zone, city: fmt.tzCity(zone) },
      palette: () => palette,
      now: new Date(),
    };

    // ---------- mounting ----------
    function mountKey(key) {
      if (mounted.has(key)) return Promise.resolve(mounted.get(key));
      if (mounting.has(key)) return mounting.get(key);
      const reg = REGISTRY.find((r) => r.key === key);
      if (!reg) return Promise.resolve(null);
      const el = document.querySelector(reg.sel);
      if (!el) return Promise.resolve(null);
      const p = Promise.all([load(reg.path), reg.eager ? true : loadKit()]).then(async ([mod, kit]) => {
        // mounted or not, the section stops holding its waiting height (base.css [data-st-pending])
        el.removeAttribute('data-st-pending');
        // A chunk that didn't arrive leaves the static section; a later route, or coming back
        // online, asks again (see load() for how far a browser lets that go).
        if (!mod || !kit) {
          mounting.delete(key);
          if (LAZY.includes(key)) window.addEventListener('online', () => { if (!mounting.has(key)) observe.onNear(el, () => mountKey(key), '150% 0px'); }, { once: true });
          return null;
        }
        if (typeof mod.mount !== 'function') return null;
        try {
          const m = await mod.mount(el, ctx);
          if (m) mounted.set(key, m);
          el.dataset.stMounted = '';
          return m || null;
        } catch (e) {
          console.error('[stats] ' + key + ' failed to mount; its section keeps the static version', e);
          return null;
        }
      });
      mounting.set(key, p);
      return p;
    }

    // ---------- the Questions sheet ----------
    let questionsOpen = false;
    async function openQuestions(opener) {
      if (questionsOpen) return;
      const mod = await load('./ask/questions.js');
      if (!mod || typeof mod.open !== 'function') return;
      questionsOpen = true;
      try { await mod.open(ctx, opener || document.querySelector('.st-pill-ask')); }
      catch (e) { console.error('[stats] the questions sheet failed', e); }
      finally { questionsOpen = false; }
    }

    // ---------- routing ----------
    // Each route is numbered. A route waiting for its chapter's chunk can finish after a newer
    // one (Back pressed, another link followed, on a slow phone network): it must then leave
    // the page alone, or it scrolls to and opens the chapter the reader already left while the
    // address names the new one.
    let firstRoute = true;
    let routeSeq = 0;
    async function onRoute(route, opts = {}) {
      // A module writing its own state into the address (a tab, a picked day: push and scroll both
      // off) is not a new destination. It often happens inside that module's go(), so it must not
      // cancel the route being followed, nor the scroll hold carrying a deep link to its target.
      const moves = !!opts.push || opts.scroll !== false;
      const seq = moves ? ++routeSeq : routeSeq;
      const initial = firstRoute;
      firstRoute = false;
      // a scroll still re-aiming at the last route's target would drag this one back to it
      if (moves) releaseScrollHold();
      bus.emit('route', { route });
      if (route.ch === 'ask') { openQuestions(); return; }
      const key = OWNER[route.ch] || 'top';
      // Back or Forward to an entry that knows where the reader was: put them back there, not at
      // the route's target (a follow-up sits at the foot of its chapter, thousands of px below
      // the top). The module still follows the route, so what it shows matches the address, and
      // focus goes back to what had it there (the follow-up link pressed), or nowhere new.
      if (opts.restore) {
        const sc = observe.scrollRoot();
        const put = () => { releaseScrollHold(); sc?.scrollTo({ top: opts.restore.top, behavior: 'auto' }); };
        put();
        const m = await mountKey(key);
        if (seq !== routeSeq) return;
        try { await m?.go?.(route); } catch (e) { console.error('[stats] ' + key + ' could not follow the route', e); }
        if (seq !== routeSeq) return;
        put();
        const f = opts.restore.focus;
        if (f && f.isConnected && f.getClientRects().length) f.focus({ preventScroll: true });
        else if (sc && document.activeElement && document.activeElement !== document.body && document.activeElement !== sc) {
          // focus left on a heading far off screen would scroll the reader away on the next Tab
          const r = document.activeElement.getBoundingClientRect(), v = sc.getBoundingClientRect();
          if (r.bottom < v.top || r.top > v.bottom) sc.focus({ preventScroll: true });
        }
        return;
      }
      const m = await mountKey(key);
      if (seq !== routeSeq) return;
      // a fresh load with no address stays at the top; everything else goes where it points
      const bare = initial && route.ch === 'top' && !route.sub;
      if (opts.scroll !== false && !bare) {
        if (route.ch === 'top' && !route.sub) observe.scrollRoot()?.scrollTo({ top: 0, behavior: motion.reduced ? 'auto' : 'smooth' });
        else scrollToEl(targetFor(route), { smooth: !initial });
      }
      try { await m?.go?.(route); } catch (e) { console.error('[stats] ' + key + ' could not follow the route', e); }
      if (seq !== routeSeq) return;
      if (opts.push) focusArrival(route);
    }

    // A link that sends the reader somewhere (a chip, a follow-up, Show me) takes keyboard focus
    // there too, so the next Tab carries on from the answer rather than jumping back to the link,
    // and a screen reader reads the place it landed. The heading of what it landed on gets focus,
    // unless the module already put focus inside it (an opened row, a pile's drawer).
    function focusArrival(route) {
      const target = targetFor(route);
      const active = document.activeElement;
      if (!target) return;
      if (active && active.closest?.('[data-st-sheet], .st-pop')) return;
      if (route.ch === 'top') { focusTop(route, active); return; }
      // the link just followed doesn't count as focus the module placed, even inside the target
      if (target.contains(active) && !active.matches?.('a[href^="#/"]')) return;
      const h = target.matches('h2, h3') ? target
        : target.querySelector(':scope > .st-q, :scope > .st-fq, :scope > h2, :scope > h3, .st-q, .st-fq, h2, h3') || target;
      focusQuietly(h);
    }
    function focusQuietly(el) {
      if (!el) return;
      if (!el.hasAttribute('tabindex') && el.tabIndex < 0) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }

    // The hero has no chapter heading of its own (the h1 sits above it), and the first h2 inside
    // it is "Noticed this month", under the gate and the chips: the generic rule sent "Back to the
    // answer" and every time-travel link there, below the fold, and the next Tab scrolled the
    // reader away from the gate that was replaying. Here the answer itself takes focus: the lede,
    // or the pile's drawer, or (for "Am I in here?") the lede until the guest has walked and the
    // drawer opens. A reader already working the gate or a drawer keeps their place.
    //
    // A pile's drawer may not be open yet when this runs: its code is a chunk of its own, still
    // loading on a fresh visit. Focus then stays where it is until the drawer opens and moves to
    // its title (never to the lede, which a scrolled page has under the sticky bar). The guest's
    // walk takes a second and a half, so "Am I in here?" parks focus on the lede meanwhile; under
    // reduced motion the walk is instant and its drawer can already be open.
    let youWait = null;
    function focusTop(route, active) {
      youWait?.();
      if (active && active.closest?.('[data-st-gate], [data-st-drawer]')) return;
      const lede = document.querySelector('[data-st-lede]');
      const sub = route.sub;
      if (!sub || sub === 'replay') { focusQuietly(lede || document.getElementById('st-h1')); return; }
      const host = document.querySelector('[data-st-drawer]');
      const ready = () => (host && host.dataset.open === 'true' && host.dataset.key === sub
        ? host.querySelector(sub === 'you' ? '.st-gate-youdrawer .st-gate-dtitle' : '.st-gate-dtitle') : null);
      const now = ready();
      if (now) { focusQuietly(now); return; }
      if (sub === 'you') focusQuietly(lede || document.getElementById('st-h1'));
      if (!host || typeof MutationObserver !== 'function') return;
      // hand focus on when the drawer opens, unless the reader has moved it somewhere meanwhile
      const parked = document.activeElement;
      const mo = new MutationObserver(() => {
        const t = ready();
        if (!t) return;
        stop();
        const a = document.activeElement;
        if (a === parked || a === lede || a === document.body || a === observe.scrollRoot()) focusQuietly(t);
      });
      const timer = setTimeout(() => stop(), 6000);
      function stop() { mo.disconnect(); clearTimeout(timer); if (youWait === stop) youWait = null; }
      youWait = stop;
      mo.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-open', 'data-key'] });
    }

    const router = createRouter(store, { onRoute, defaults: { range: defaultRange }, clamp: (r) => agg.clampRange(snap, r) });
    ctx.router = router;

    // ---------- the bar and the hero ----------
    const barEl = document.querySelector('[data-st-bar]');
    if (barEl) {
      mountBar(barEl, ctx, {
        onQuestions: (opener) => openQuestions(opener),
        prefetchQuestions: () => load('./ask/questions.js'),
      });
    }
    // The lazy chapters wait at a screen and a half of height each (base.css [data-st-pending])
    // from here on, before the hero draws: as bare 220px skeletons all five sat inside the 150%
    // margin below, so a reader who never scrolled still fetched and mounted every chapter, in
    // the middle of the gate's opening replay.
    const LAZY = ['machines', 'growing', 'people', 'rhythm', 'how'];
    for (const key of LAZY) document.querySelector(REGISTRY.find((r) => r.key === key).sel)?.setAttribute('data-st-pending', '');
    const lede = document.querySelector('[data-st-lede]');
    mountKey('top').then((m) => {
      // no hero module yet: leave a plain answer instead of "Sorting…"
      if (!m && lede && lede.classList.contains('is-loading')) {
        const v = views.get(store.get().range);
        lede.classList.remove('is-loading');
        lede.textContent = `People, Aaron included, read between ${fmt.lowSpoken(v.people)} and ${fmt.num(v.people.hi)} of the ${fmt.num(v.pages.total)} pages this site sent ${v.phrase.long}.`;
      }
      if (retried) {
        if (retried === 'focus') focusQuietly(document.getElementById('st-h1'));
        // the hero's first render writes exact figures (no roll), so the lede reads as it will stay
        const text = (lede?.textContent || '').replace(/\s+/g, ' ').trim();
        if (said && text) setTimeout(() => { said.textContent = 'The numbers are back. ' + text; }, 150);
      }
      armLazy();
    });
    mountKey('chips');
    mountKey('noticed');

    // ---------- lazy chapters ----------
    // Each chapter imports and mounts when it comes within 150% of the view (§G.1), measured once
    // the hero has its real height, so "near" means near the place the reader is, not near a
    // page that hasn't laid out yet. A routed chapter (a shared link) is mounted by onRoute.
    function armLazy() {
      for (const key of LAZY) {
        const el = document.querySelector(REGISTRY.find((r) => r.key === key).sel);
        if (el && !mounting.has(key)) observe.onNear(el, () => mountKey(key), '150% 0px');
      }
    }
    bus.on('gate:done', () => {
      const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
      idle(() => { load('./machines/machines.js'); loadKit(); });
    });

    // ---------- every state change reaches every mounted module ----------
    store.subscribe((s, p) => {
      for (const [key, m] of mounted) {
        try { m.update?.(s, p); } catch (e) { console.error('[stats] ' + key + ' update failed', e); }
      }
    });

    // ---------- day and night ----------
    new MutationObserver(() => {
      palette = readPalette(root);
      bus.emit('mode', {});
      for (const [key, m] of mounted) {
        try { m.onMode?.(); } catch (e) { console.error('[stats] ' + key + ' onMode failed', e); }
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

    // the address the reader arrived with (a shared link, a refresh); mounts before scrolling
    // (a bare /stats keeps its bare address: nothing is written until something changes)
    if (location.hash.startsWith('#/')) router.go(location.hash, { push: false });
    else onRoute({ ch: 'top', sub: null, item: null }, { scroll: false });

    // for the integration pass and the screenshot harness: the live context, read-only use
    window.__st = ctx;
  }

}

// A failure state, said by ui/states.js. That file is a chunk of its own, fetched only now, and a
// reader who has really gone offline can't fetch it either: the page then sat on "Sorting the
// latest filing…" for good, with an uncaught rejection and no way to try again. So the offline
// words and the Try again pill are also here, plain, for when the chunk can't be had.
async function showFailure(loaded, onRetry) {
  let mod = null;
  try { mod = await states(); } catch (e) { console.warn('[stats] the failure states could not load; saying it plainly', e); }
  if (mod) { clearFallback(); mod.showState(loaded, { onRetry }); return; }
  fallbackState(onRetry);
}
function fallbackState(onRetry) {
  const hadFocus = !!document.activeElement?.closest?.('.st-state-actions');
  document.querySelectorAll('.st-state-actions').forEach((n) => n.remove());
  const lede = document.querySelector('[data-st-lede]');
  if (!lede) return;
  lede.classList.remove('is-loading');
  lede.classList.add('st-state-lede');
  const b = document.createElement('strong');
  b.textContent = "Couldn't reach the numbers just now.";
  lede.replaceChildren(b, " They're still there; try again in a moment.");
  const bar = document.querySelector('[data-st-bar]');
  if (bar) {
    bar.setAttribute('aria-disabled', 'true');
    for (const btn of bar.querySelectorAll('button')) btn.disabled = true;
  }
  for (const key of ['machines', 'growing', 'people', 'rhythm']) { const s = document.getElementById('st-' + key); if (s) s.hidden = true; }
  for (const slot of document.querySelectorAll('[data-st-slot], [data-st-drawer]')) slot.hidden = true;
  const wrap = document.createElement('p');
  wrap.className = 'st-state-actions';
  wrap.dataset.stFallback = '';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'st-pill';
  btn.textContent = 'Try again';
  // as ui/states.js retryPill: aria-disabled, not disabled, so focus stays on it while trying
  btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-disabled') === 'true') return;
    btn.setAttribute('aria-disabled', 'true');
    btn.textContent = 'Trying…';
    onRetry();
  });
  wrap.append(btn);
  lede.after(wrap);
  if (hadFocus) btn.focus({ preventScroll: true });
}
function clearFallback() {
  const wrap = document.querySelector('.st-state-actions[data-st-fallback]');
  if (!wrap) return;
  wrap.remove();
  for (const key of ['machines', 'growing', 'people', 'rhythm']) { const s = document.getElementById('st-' + key); if (s) s.hidden = false; }
  for (const slot of document.querySelectorAll('[data-st-slot], [data-st-drawer]')) slot.hidden = false;
  document.querySelector('[data-st-bar]')?.removeAttribute('aria-disabled');
  document.querySelector('[data-st-lede]')?.classList.remove('st-state-lede');
}

// The frame around the page, set up before the data arrives so every state gets it.
function chrome() {
  // The page scrolls inside #panel-scroll, not the window, so PageDown, Space and the arrows did
  // nothing until the reader had tabbed into the content. Focus the scroller on load (it needs a
  // tabindex to take it) unless something else already has focus.
  const sc = observe.scrollRoot();
  if (sc) {
    if (!sc.hasAttribute('tabindex')) sc.setAttribute('tabindex', '-1');
    if (!document.activeElement || document.activeElement === document.body) sc.focus({ preventScroll: true });
  }

  // On a phone, or a window too short for three fixed bands, the footer scrolls with the page:
  // header, sticky bar and footer together had left a 360x740 phone two thirds of its height.
  // Moving the footer node keeps its links and markup exactly as PanelChrome renders them.
  const foot = document.querySelector('#panel-inner > footer');
  if (sc && foot && window.matchMedia) {
    const mq = window.matchMedia('(max-width: 600px), (max-height: 520px)');
    const home = foot.parentNode;
    const place = () => {
      if (mq.matches && foot.parentNode !== sc) { sc.append(foot); foot.classList.add('st-foot-moved'); }
      else if (!mq.matches && foot.parentNode === sc) { home.append(foot); foot.classList.remove('st-foot-moved'); }
    };
    place();
    mq.addEventListener?.('change', place);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
