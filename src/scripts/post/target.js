// The element a #fragment names inside a post (the URL's, or a link's), or null. Read from the address, never from
// :target, which a pushState (the homepage overlay's routes) doesn't move. Ids are matched whole, any character.
export function targetOf(root, hash = location.hash) {
  const id = decodeURIComponent(hash.slice(1));
  return id ? root.querySelector(`[id="${CSS.escape(id)}"]`) : null;
}
