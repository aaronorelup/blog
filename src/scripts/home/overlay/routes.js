// What opens in the homepage overlay: the NAV entries marked overlay (src/data/site.js), each post /ledger/<slug>/ and
// its notes /ledger/<slug>/notes/, with any query string and hash. routeOf(href) → { url, page, key, nav } or null:
// page is the real page's path (fetched, and the cache's key), key the page with its query (one view each), nav the
// lit NAV item. Everything else, a course page or /stats, is a page of its own.
import { NAV } from '../../../data/site.js';

const VIEWS = new Map(NAV.filter((n) => n.overlay).map((n) => [n.href, n.key]));
const POST = /^\/ledger\/[^/]+(?:\/notes)?$/;

export function routeOf(href) {
  const url = new URL(href, location.href);
  const bare = url.pathname.replace(/\/$/, '');
  const nav = url.origin === location.origin && (VIEWS.get(bare) ?? (POST.test(bare) && 'ledger'));
  if (!nav) return null;
  const page = bare + '/';
  return { url, page, key: page + url.search, nav };
}
