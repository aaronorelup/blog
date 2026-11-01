// The Listen button (components/post/ReadAloud.astro), hidden until this runs. A press loads the reader (index.js;
// pointerdown and focus start fetching it), opens karaoke mode and plays; the next press pauses. bind(root) → unbind,
// views/post.js's mount(root): the post page, and the homepage's reader. A post that is never recorded (no
// data-read-hash) has only the browser's voice, so a browser without one never shows the button.
import { lazy } from '../lazy.js';

// iOS lets audio start and the browser's voice speak only inside a tap, and the reading starts after an import and a
// fetch. So the first press unlocks both before either: a silent utterance (the voice's first one cancels it), and a
// play() of the one <audio> the recording plays through, unlocked for good (WebKit unlocks that element alone).
let audio = null;
function unlock() {
  if (audio) return;
  audio = new Audio();
  audio.play().catch(() => {}); // no source yet: the pause below cuts it short
  audio.pause();
  if (!('speechSynthesis' in window)) return;
  const hush = new SpeechSynthesisUtterance(' ');
  hush.volume = 0;
  speechSynthesis.speak(hush);
}

export function bind(root) {
  const button = root.querySelector('[data-read-aloud]');
  if (!button.dataset.readHash && !('speechSynthesis' in window)) return () => {};
  const load = () => lazy(() => import('./index.js'));
  let reader = null; // a promise of the open reader
  const press = () => {
    unlock();
    reader ??= load().then(({ open }) => open(root, button, audio, () => { reader = null; }));
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
