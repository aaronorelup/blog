// mountView(root): runs the module named after root's data-panel-view (./<name>.js) on root and resolves to its
// unmount. Every standalone panel page calls it (layouts/PanelPage.astro), and the homepage overlay on each view it
// mounts, with the view's real page as fallbackUrl (a chunk lost to a deploy becomes a navigation there, lazy.js).
// A view with no module (about, courses, research) mounts nothing.
import { lazy } from '../lazy.js';

const VIEWS = import.meta.glob(['./*.js', '!./index.js']);

export async function mountView(root, fallbackUrl) {
  const load = VIEWS[`./${root.dataset.panelView}.js`];
  if (!load) return () => {};
  const { mount } = await lazy(load, fallbackUrl);
  return root.isConnected ? mount(root) : () => {};   // the overlay left this view while its module loaded
}
