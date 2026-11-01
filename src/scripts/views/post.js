// The post view, on /ledger/<slug>/ and in the homepage overlay. article(root) is what a post and its notes page share:
// the post components (enhance), the contents list, folded details opened for the #target, where a link lands and the
// hover card on post links; mount(root) adds the Listen button. Each returns unmount.
import { enhance } from '../../elements/enhance.js';
import { lazy } from '../lazy.js';
import { mount as contents } from '../post/contents.js';
import { mount as details } from '../post/details.js';

// The Listen button (components/post/ReadAloud.astro): read-aloud binds it here, bind(root) → unbind (T2.4).
const listen = () => () => {};

const MOVES = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

// The hover card on post links opens only under a mouse, so a phone never loads it.
if (matchMedia('(hover: hover) and (pointer: fine)').matches) lazy(() => import('../cards/hover.js'));

// Where the reader lands once the components have drawn: each loads its own chunk and often draws after the load
// event, when the browser has already scrolled to the #heading, and a chart is rarely as tall as the table it replaces.
// Unless the reader has scrolled since: where they were before a Reload or a Back that missed the page cache (only
// #panel-scroll scrolls, and browsers keep its place only in that cache), else the #heading. Then a search result's
// or a citation's passage is marked (highlight.js, loaded only for a ?hl= or ?hs= link).
function land(root, drawn) {
  const scroller = root.closest('#panel-scroll');
  let moved = false;
  const stop = () => { moved = true; };
  for (const type of MOVES) addEventListener(type, stop, { capture: true, once: true, passive: true });
  const save = () => history.replaceState({ ...history.state, scroll: scroller.scrollTop }, '');
  addEventListener('pagehide', save);
  const arrive = () => {
    for (const type of MOVES) removeEventListener(type, stop, { capture: true });
    if (!moved && history.state?.scroll !== undefined) scroller.scrollTop = history.state.scroll;
    else if (!moved) document.querySelector(':target')?.scrollIntoView();
    if (/[?&]h[ls]=/.test(location.search)) lazy(() => import('../post/highlight.js')).then((m) => m.highlight(root));
  };
  drawn.then(arrive, arrive);
  return () => removeEventListener('pagehide', save);
}

export function article(root) {
  const unmounts = [contents(root), details(root), land(root, enhance(root))];
  return () => unmounts.forEach((unmount) => unmount());
}

export function mount(root) {
  const unmounts = [article(root), listen(root)];
  return () => unmounts.forEach((unmount) => unmount());
}
