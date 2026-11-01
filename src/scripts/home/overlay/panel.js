// The homepage overlay: a scene card's link grows the panel (PanelChrome around an empty [data-panel-host]), which
// shows the route's view (routes.js), fetched from its real page (load-view.js), a fresh copy each time run by its
// module as on its page (views/index.js mountView). It owns the panel's history, Esc, resize, the links that open in
// it and prefetch on intent. The scene follows it with onPanel(fn): 'open' (growing, or open: no input), 'covered'
// (it fills the window: nothing to draw), 'closing', 'closed'; and leaves through closePanel() when it flies out.
import { appear, fit, grow, shrink } from './frame.js';
import { load, prefetch } from './load-view.js';
import { routeOf } from './routes.js';
import { targetOf } from '../../post/target.js';
import { mountView } from '../../views/index.js';

const host = document.querySelector('[data-panel-host]');
const inner = document.getElementById('panel-inner');
const scroller = document.getElementById('panel-scroll');
const HOME_TITLE = document.title;
const listeners = new Set();
let state = 'closed';
let shown = null;                          // the view on screen: { route, node, unmount }
let wanted = null;                         // the key of the route last asked for
let ledger = { search: '', scroll: 0 };    // where the ledger was left, for "← LEDGER" (data-close-reader)

const set = (next) => { state = next; listeners.forEach((fn) => fn(next)); };
const isOpen = () => state === 'open' || state === 'covered';
const stop = () => document.dispatchEvent(new CustomEvent('ao-stop'));
// The view being left keeps its scroll in its history entry, so Back finds it where it was, and takes the address it
// has moved to since it was mounted (the ledger's chips replaceState their filter), so "← LEDGER" finds it the same.
function leave() {
  if (!shown) return;
  history.replaceState({ ...history.state, scroll: scroller.scrollTop }, '');
  const here = routeOf(location.href);
  if (here?.page === shown.route.page) shown.route = here;
}

export function onPanel(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

function drop() {
  const { node, route } = shown;
  if (node.dataset.panelView === 'ledger') ledger = { search: route.url.search, scroll: scroller.scrollTop };
  shown.unmount();
  node.remove();
  shown = null;
}

// The same page again only moves to its anchor (or, from a link with none, its top); a pop leaves it be.
async function show(route, pushed) {
  wanted = route.key;
  if (shown?.route.key === route.key) {
    shown.route = route;
    if (route.url.hash) targetOf(shown.node, route.url.hash)?.scrollIntoView();
    else if (pushed) scroller.scrollTop = 0;
    return;
  }
  const { node, title } = await load(route);
  if (wanted !== route.key || !isOpen()) return;
  if (shown) { stop(); drop(); }
  host.append(node);
  inner.dataset.activeView = route.nav;
  document.title = title;
  // The real page is the fallback: a chunk lost to a deploy opens it.
  const mounted = mountView(node, route.url.href);
  shown = { route, node, unmount: () => mounted.then((unmount) => unmount()) };
  const scroll = history.state?.scroll ?? 0;
  scroller.scrollTop = scroll;
  if (scroll) mounted.then(() => { scroller.scrollTop = scroll; });
}

// from: the card it grows out of. Back, Forward and a deep link open it at once.
function open(route, from, pushed) {
  if (!isOpen()) {
    set('open');
    const covered = () => set('covered');
    if (pushed) grow(from, covered); else appear(covered);
  }
  show(route, pushed);
}

export function closePanel(push = true) {
  if (!isOpen()) return;
  if (push) {
    leave();
    history.pushState(null, '', '/');
  }
  stop();
  wanted = null;
  set('closing');
  shrink(() => {
    if (shown) drop();
    document.title = HOME_TITLE;
    set('closed');
  });
}

function onClick(e) {
  if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest?.('a[href]');
  if (!a || a.target === '_blank' || a.getAttribute('href').startsWith('#')) return;
  if (a.hasAttribute('data-panel-home')) {
    e.preventDefault();
    closePanel();
    return;
  }
  const back = a.hasAttribute('data-close-reader');
  const route = routeOf(back ? '/ledger' + ledger.search : a.href);
  if (!route) return;
  e.preventDefault();
  leave();
  const same = shown?.route.key === route.key;
  history[same ? 'replaceState' : 'pushState'](back ? { scroll: ledger.scroll } : null, '', route.url.href);
  open(route, a.closest('section[data-wp]')?.firstElementChild, true);
}

function onPop() {
  const route = routeOf(location.href);
  if (route) open(route, null, false);
  else closePanel(false);
}

// A pointer going down on a link, or keyboard focus on a card's link or the nav: fetch the page now. Never on idle:
// every fetched page is a page view on /stats.
function onIntent(e) {
  const a = e.target.closest?.('a[href]');
  if (!a || navigator.connection?.saveData) return;
  if (e.type === 'focusin' && !a.matches('section[data-wp] a, [data-nav]')) return;
  const route = routeOf(a.href);
  if (route) prefetch(route.page);
}

// Esc closes it, unless a dialog (the picture viewer) is open over it: Esc is that dialog's.
function onKey(e) {
  if (e.key !== 'Escape' || !isOpen() || document.querySelector('dialog[open]')) return;
  e.preventDefault();
  closePanel();
}

export function mountOverlay() {
  document.addEventListener('click', onClick);
  document.addEventListener('pointerdown', onIntent);
  document.addEventListener('focusin', onIntent);
  addEventListener('keydown', onKey);
  addEventListener('resize', () => { if (isOpen()) fit(); });
  addEventListener('popstate', onPop);
  const route = routeOf(location.href);
  if (route) open(route, null, false);
}
