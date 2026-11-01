// A route's view for the overlay, from its real page: load(route) → { node, title }, node a fresh copy of the page's
// view (VIEW) with its scripts left out (mount.js runs the view's module instead). Parsed pages are cached by path
// (KEEP), never live nodes: a component that has disconnected was never written to come back. A page from another
// build (ao-build), or one that can't be fetched or has no view, is opened as the real page and load never settles.
// The page's stylesheets the homepage lacks are adopted first, before the homepage's own, which keep winning.
const VIEW = '[data-panel-view], [data-post-article]';   // the one place the overlay names a page's view
const KEEP = 12;
const BUILD = document.querySelector('meta[name="ao-build"]').content;
const FIRST = document.head.querySelector('link[rel="stylesheet"], style');
const pages = new Map();   // page → promise of its Document
const sheets = new Map([...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => [l.href, null]));

function fetchPage(page) {
  if (!pages.has(page)) {
    const doc = fetch(page, { headers: { Accept: 'text/html' } })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status))))
      .then((html) => new DOMParser().parseFromString(html, 'text/html'));
    doc.catch(() => pages.delete(page));
    pages.set(page, doc);
    if (pages.size > KEEP) pages.delete(pages.keys().next().value);
  }
  return pages.get(page);
}

// On intent (a pointer going down on a link, keyboard focus on a card or the nav), so the click finds it ready.
export const prefetch = (page) => { fetchPage(page).catch(() => {}); };

// Each stylesheet once, in the page's order, before the homepage's first; resolved when all have loaded.
function adopt(doc) {
  return Promise.all([...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => {
    const href = new URL(l.getAttribute('href'), location.href).href;
    if (!sheets.has(href)) {
      const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
      sheets.set(href, new Promise((done) => { link.onload = link.onerror = done; }));
      FIRST.before(link);
    }
    return sheets.get(href);
  }));
}

export async function load(route) {
  const doc = await fetchPage(route.page).catch(() => null);
  const view = doc?.querySelector(VIEW);
  if (!view || doc.querySelector('meta[name="ao-build"]')?.content !== BUILD) {
    location.replace(route.url.href);
    return new Promise(() => {});
  }
  await adopt(doc);
  const node = document.importNode(view, true);
  for (const s of node.querySelectorAll('script')) s.remove();
  return { node, title: doc.title };
}
