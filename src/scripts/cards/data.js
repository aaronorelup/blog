// /ledger/previews.json, the text of every card ({ posts: { slug: card } }, src/pages/ledger/previews.json.js),
// fetched once and shared by the hover card, the search results and Goobie's related posts. A failed fetch is
// forgotten, so the next caller tries again.
const DATA_URL = '/ledger/previews.json';

let posts = null;         // { [slug]: card } once loaded
let loading = null;

export const loaded = () => posts;

export function load() {
  if (posts) return Promise.resolve(posts);
  loading ??= fetch(DATA_URL, { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((j) => (posts = j.posts))
    .catch(() => { loading = null; return null; });
  return loading;
}
