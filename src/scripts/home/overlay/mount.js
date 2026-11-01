// A fetched view brought to life in the panel, as its own page brings it: its module, scripts/views/<data-panel-view>.js
// (no file: nothing to run), with the real page as fallbackUrl (a chunk lost to a deploy becomes a navigation there).
// A post or notes page also gets its components through enhance(), the hover card on its links, and lands where the
// link points. mount(node, url) → { ready, unmount }; ready settles once the module has mounted. T2.1's
// views/index.js mountView and views/post.js take over the lookup and the post's part (read-aloud's Listen too).
import { lazy } from '../../lazy.js';

const VIEWS = import.meta.glob('../../views/*.js');

export function mount(node, url) {
  const name = node.dataset.panelView ?? 'post';
  const load = VIEWS[`../../views/${name}.js`];
  let unmount = null;
  let gone = false;
  const ready = (load ? lazy(load, url.href) : Promise.resolve(null)).then((m) => {
    if (m && !gone) unmount = m.mount(node);
  });
  if (node.hasAttribute('data-post-article')) {
    const drawn = lazy(() => import('../../../elements/enhance.js'), url.href)
      .then(({ enhance }) => enhance(node, url.href));
    lazy(() => import('../../cards/hover.js'));
    drawn.then(() => land(node, url), () => land(node, url));
  }
  return { ready, unmount: () => { gone = true; unmount?.(); } };
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
