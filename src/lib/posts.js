// Pure helpers over post entries (from lib/content.js). Ledger order is the one order lists follow:
// newest date first, then the highest id.
import { monthOf } from './dates.js';

const byId = (a, b) => a.localeCompare(b, 'en', { numeric: true });
const ledgerCmp = (a, b) => b.data.date - a.data.date || byId(b.data.id, a.data.id);

// draft: not built at all. unlisted: built at /ledger/<slug>/ with noindex, and in no list, feed, card,
// thread or search. Use this, not `!data.draft`, whenever posts are listed.
export const isListed = (data) => !data.draft && !data.unlisted;

export const ledgerOrder = (posts) => [...posts].sort(ledgerCmp);

// [{ month: 'October 2026', posts }] in ledger order.
export function byMonth(posts) {
  const months = new Map();
  for (const p of ledgerOrder(posts)) {
    const m = monthOf(p.data.date);
    if (!months.has(m)) months.set(m, []);
    months.get(m).push(p);
  }
  return [...months].map(([month, list]) => ({ month, posts: list }));
}

// How many posts carry each value of a field ('topic', or 'project', which is a list).
export function countBy(posts, field) {
  const counts = {};
  for (const p of posts) for (const v of [p.data[field]].flat()) counts[v] = (counts[v] ?? 0) + 1;
  return counts;
}

// The posts either side of `post` in ledger order (it need not be among `posts`), so no post is a dead end.
export function olderNewer(post, posts) {
  const order = ledgerOrder(posts.filter((p) => p.id !== post.id));
  const i = order.findIndex((p) => ledgerCmp(post, p) < 0);
  const at = i < 0 ? order.length : i;
  return { newer: order[at - 1], older: order[at] };
}
