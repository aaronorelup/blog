// The part of the image viewer every post loads: pictures become focusable buttons (hookViewer, from enhance) and a
// click, Enter or Space opens one. The viewer itself, viewer-ui.js with zoom.js, loads on the first open. Elements
// that open their own pictures (a slider's sides, a panorama) call openViewer(img, list).
import { lazy } from '../../scripts/lazy.js';
import { AO_STOP } from './player.js';

// The image viewer. Every picture in a post opens full size on click (or Enter), in a viewer
// that zooms (wheel, pinch, double-tap, +/-, or a click on the picture) around the pointer,
// pans by dragging, and pages through the post's other pictures in reading order (arrows,
// swipe, the side buttons), so the frames of one comparison or the sheets of one film are a
// keypress apart. The post's own copy shows at once; a larger file, if the image names one in
// data-full="…" (or in srcset), replaces it at the same size when it arrives. Pictures inside
// links, sliders, model and game posters and spectrograms keep their own click.
const NO_VIEWER = 'a[href], button, ao-slider, ao-pan, ao-model, ao-game, ao-listen, [data-no-zoom], .ao-matrix-off';
export const viewable = (img) =>
  img.tagName === 'IMG' && !!img.closest('[data-post-article], .pc-prose') && !img.closest(NO_VIEWER);
// list: the pictures to page through (default: every viewable one in the same post). A picture asked for before the
// viewer's chunk has arrived stays shut if Esc or ao-stop (the homepage closing its reader) came in between.
let cancels = 0;
document.addEventListener(AO_STOP, () => { cancels++; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cancels++; }, true);
export const openViewer = (img, list) => {
  const asked = cancels;
  return lazy(() => import('./viewer-ui.js')).then(({ viewer }) => { if (cancels === asked) viewer.open(img, list); });
};

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button > 0) return;
  const img = e.target.closest && e.target.closest('img');
  if (img && viewable(img)) { e.preventDefault(); openViewer(img); }
});
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.tagName === 'IMG' && viewable(e.target)) {
    e.preventDefault();
    openViewer(e.target);
  }
});

// Make a post's pictures reachable from the keyboard. The standalone page and the homepage's reader both call it
// through enhance(root).
export function hookViewer(root = document) {
  for (const img of root.querySelectorAll('img')) {
    if (!viewable(img) || img.hasAttribute('tabindex')) continue;
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
  }
}
