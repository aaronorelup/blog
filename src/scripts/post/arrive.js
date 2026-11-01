// Where a link into a post lands: the URL's #heading at the top, or a search result's passage marked and centred
// (highlight.js). Each post component loads its own chunk and often draws after the load event, when the browser has
// already scrolled to the heading, and a drawn chart is rarely as tall as the table it replaces. So both wait for drawn
// (enhance()'s promise), and the heading is put back unless the reader has scrolled since. The post and notes pages call it.
import { highlight } from './highlight.js';

let moved = false;
for (const type of ['wheel', 'touchstart', 'keydown', 'pointerdown']) {
  addEventListener(type, () => { moved = true; }, { capture: true, once: true, passive: true });
}

export function arrive(article, drawn) {
  const land = () => {
    if (!moved) document.querySelector(':target')?.scrollIntoView();
    highlight(article);
  };
  drawn.then(land, land);
}
