// The post view, on /ledger/<slug>/ and in the homepage overlay. article(root) is what a post and its notes page share:
// the post components (enhance), the contents list, folded details opened for the #target, where a link lands and the
// hover card on post links; mount(root) adds the Listen button (read-aloud/listen.js). Each returns unmount.
import { enhance } from '../../elements/enhance.js';
import { lazy } from '../lazy.js';
import { mount as contents } from '../post/contents.js';
import { mount as details } from '../post/details.js';
import { targetOf } from '../post/target.js';
import { bind as listen } from '../read-aloud/listen.js';

const MOVES = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

// The hover card on post links opens only under a mouse, so a phone never loads it.
if (matchMedia('(hover: hover) and (pointer: fine)').matches) lazy(() => import('../cards/hover.js'));

// Where the reader lands once the components have drawn: each loads its own chunk and often draws after the load
// event, when the browser has already scrolled to the #heading, and a chart is rarely as tall as the table it replaces.
// After a Reload or a Back that missed the page cache, where they were (only #panel-scroll scrolls, and browsers keep
// its place only in that cache, so it is kept in history.state as they scroll); for a ?hl= or ?hs= link, the passage
// marked (highlight.js); else the #heading. A place is held while the article still grows above it (a video learning
// its size), until the reader scrolls, taps or types.
function land(root, drawn) {
  const scroller = root.closest('#panel-scroll');
  const saved = history.state?.scroll;
  let moved = false;
  let held = null;
  const stop = () => { moved = true; held?.disconnect(); };
  for (const type of MOVES) addEventListener(type, stop, { capture: true, once: true, passive: true });
  const hold = (place) => { held = new ResizeObserver(place); held.observe(root); };
  let timer = 0;
  const keep = () => {
    clearTimeout(timer);
    timer = setTimeout(() => history.replaceState({ ...history.state, scroll: scroller.scrollTop }, ''), 200);
  };
  scroller.addEventListener('scroll', keep, { passive: true });
  const arrive = () => {
    if (!moved && saved !== undefined) hold(() => { scroller.scrollTop = saved; });
    else if (/[?&]h[ls]=/.test(location.search)) lazy(() => import('../post/highlight.js')).then((m) => m.highlight(root));
    else if (!moved && location.hash) hold(() => targetOf(root)?.scrollIntoView());
  };
  drawn.then(arrive, arrive);
  return () => {
    stop();
    for (const type of MOVES) removeEventListener(type, stop, { capture: true });
    clearTimeout(timer);
    scroller.removeEventListener('scroll', keep);
  };
}

export function article(root) {
  const unmounts = [contents(root), details(root), land(root, enhance(root))];
  return () => unmounts.forEach((unmount) => unmount());
}

export function mount(root) {
  const unmounts = [article(root), listen(root)];
  return () => unmounts.forEach((unmount) => unmount());
}
