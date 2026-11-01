// The Listen button (components/post/ReadAloud.astro), hidden until this runs. A press loads the reader (index.js;
// pointerdown and focus start fetching it), opens karaoke mode and plays; the next press pauses. bind(root) → unbind,
// for a view module's mount(root): the post page, and the homepage's reader.
export function bind(root) {
  const button = root.querySelector('[data-read-aloud]');
  const load = () => import('./index.js');
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
