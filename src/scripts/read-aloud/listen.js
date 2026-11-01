// The Listen button (components/post/ReadAloud.astro), hidden until this runs. A press loads the reader (index.js;
// pointerdown and focus start fetching it), opens karaoke mode and plays; the next press pauses. bind(root) → unbind,
// views/post.js's mount(root): the post page, and the homepage's reader. A post that is never recorded (no
// data-read-hash) has only the browser's voice, so a browser without one never shows the button.
import { lazy } from '../lazy.js';

export function bind(root) {
  const button = root.querySelector('[data-read-aloud]');
  if (!button.dataset.readHash && !('speechSynthesis' in window)) return () => {};
  const load = () => lazy(() => import('./index.js'));
  let reader = null; // a promise of the open reader
  const press = () => {
    reader ??= load().then(({ open }) => open(root, button, () => { reader = null; }));
    reader.then((r) => r.toggle());
  };
  button.addEventListener('pointerdown', load, { once: true });
  button.addEventListener('focus', load, { once: true });
  button.addEventListener('click', press);
  button.hidden = false;
  return () => {
    button.removeEventListener('click', press);
    reader?.then((r) => r.close());
  };
}
