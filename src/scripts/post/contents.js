// A long post's contents list (components/post/Contents.astro): open beside the text at 1180 px and wider, a closed
// <details> above it on narrower screens, and the heading being read marked (aria-current) as the panel scrolls: the
// last h2 to have crossed the top fifth of #panel-scroll. mount(root) returns unmount.
import { targetOf } from './target.js';

const WIDE = '(min-width: 1180px)';

export function mount(root) {
  const toc = root.querySelector('.toc');
  if (!toc) return () => {};
  const wide = matchMedia(WIDE);
  const fit = () => { toc.open = wide.matches; };
  const stay = () => { if (wide.matches) toc.open = true; };   // beside the text it never folds, Enter or not
  fit();
  wide.addEventListener('change', fit);
  toc.addEventListener('toggle', stay);

  const links = [...toc.querySelectorAll('a')];
  const heads = links.map((a) => targetOf(root, a.hash));
  // Any crossing re-reads every heading's place, so a jump that carries some past the band at once still counts them.
  const io = new IntersectionObserver(([{ rootBounds }]) => {
    const at = heads.findLastIndex((h) => h.getBoundingClientRect().top < rootBounds.bottom);
    links.forEach((a, i) => (i === at ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }, { root: root.closest('#panel-scroll'), rootMargin: '0px 0px -80% 0px' });
  heads.forEach((h) => io.observe(h));
  return () => { io.disconnect(); wide.removeEventListener('change', fit); toc.removeEventListener('toggle', stay); };
}
