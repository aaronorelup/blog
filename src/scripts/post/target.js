// The element a #fragment names inside a post (the URL's, or a link's), or null. Read from the address, never from
// :target, which a pushState (the homepage overlay's routes) doesn't move. Ids are matched whole, any character. A
// fragment that isn't valid percent-encoding (a stray %) is taken as written, as the browser's own lookup takes it.
export function targetOf(root, hash = location.hash) {
  let id = hash.slice(1);
  try { id = decodeURIComponent(id); } catch { /* as written */ }
  return id ? root.querySelector(`[id="${CSS.escape(id)}"]`) : null;
}
