// Post components are found by name: src/elements/<tag>/element.js defines <tag>. upgrade(root) imports the modules
// of the tags present in root and not defined yet, each its own chunk; the overlay passes the post's real URL as
// fallbackUrl (lazy.js). Read by enhance.js.
import { lazy } from '../scripts/lazy.js';

const LOAD = Object.fromEntries(Object.entries(import.meta.glob('./ao-*/element.js'))
  .map(([path, load]) => [path.split('/')[1], load]));

export function upgrade(root = document, fallbackUrl) {
  const tags = Object.keys(LOAD).filter((t) => !customElements.get(t) && root.querySelector(t));
  return Promise.all(tags.map((t) => lazy(LOAD[t], fallbackUrl)));
}
