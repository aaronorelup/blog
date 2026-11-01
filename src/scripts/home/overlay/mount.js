// A fetched view brought to life in the panel, as its own page brings it: its module,
// scripts/views/<data-panel-view>.js (no file: nothing to run), with the real page as fallbackUrl (a chunk lost to a
// deploy becomes a navigation there), and a post's part while it has no module of its own (post below).
// mount(node, url) → { ready, unmount }; ready settles once the module has mounted. T2.1's views/index.js mountView
// and views/post.js take over both.
import { lazy } from '../../lazy.js';

const VIEWS = import.meta.glob('../../views/*.js');

export function mount(node, url) {
  const load = VIEWS[`../../views/${node.dataset.panelView ?? 'post'}.js`];
  let unmount = null;
  let gone = false;
  const ready = (load ? lazy(load, url.href) : Promise.resolve(null)).then((m) => {
    if (m && !gone) unmount = m.mount(node);
  });
  const unpost = !load && node.hasAttribute('data-post-article') ? post(node, url) : () => {};
  return { ready, unmount: () => { gone = true; unmount?.(); unpost(); } };
}

// A post or notes page in the panel, until views/post.js: its components through enhance(), the hover card on its
// links, and where the link lands. Returns unmount; read-aloud's Listen binds here too (bind(node) → unbind).
function post(node, url) {
  const drawn = lazy(() => import('../../../elements/enhance.js'), url.href)
    .then(({ enhance }) => enhance(node, url.href));
  lazy(() => import('../../cards/hover.js'));
  drawn.then(() => land(node, url), () => land(node, url));
  return () => {};
}

// Where a link into a post lands, once its components have drawn: its #heading at the top of #panel-scroll, and a
// search result's passage marked (scripts/post/highlight.js). The page's own arrive.js reads :target, which a
// pushState never moves.
export function land(article, url) {
  if (!article.isConnected) return;
  const id = decodeURIComponent(url.hash.slice(1));
  const target = id && article.querySelector(`[id="${CSS.escape(id)}"]`);
  const scroller = article.closest('#panel-scroll');
  if (target) scroller.scrollTop += target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
  if (url.searchParams.has('hl') || url.searchParams.has('hs')) {
    lazy(() => import('../../post/highlight.js')).then(({ highlight }) => highlight(article, url));
  }
}
