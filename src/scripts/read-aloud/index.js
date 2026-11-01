// Karaoke mode for one post (ARCHITECTURE.md "Read-aloud"): the bar, the recording of this version or the browser's
// own voice, the word marked as it is read, a click on any word to start there, the reading followed down the page,
// and one player at a time with the post's videos. open(root, button, onClose) → { toggle, close } (listen.js).
import { AO_STOP, claim } from '../../elements/_core/player.js';
import { bar } from './bar.js';
import { blocksOf, hit, rangeOf, wordAt } from './dom.js';
import { recorded } from './recorded.js';
import { speech } from './speech.js';

const SPEEDS = [1, 1.25, 1.5, 2];
const HINT = 'Click any word to start there.';
const COMING = 'The recording of this version is on its way.';
const MUTE = 'No recording of this version yet, and this browser has no voice of its own.';
const QUIET = 3000; // after the reader scrolls themselves, the page waits this long before following the reading again
const NOT_TEXT = 'a, button, input, select, textarea, summary, label, img, picture, video, audio, iframe';

export function open(root, button, onClose) {
  const { slug, readHash } = button.dataset;
  const blocks = blocksOf(root);
  const title = blocks.get('t').text;
  const scroller = root.closest('#panel-scroll'); // the panel's scroller, on the post page and in the homepage's reader
  const hl = 'highlights' in CSS ? new Highlight() : null;
  if (hl) CSS.highlights.set('ao-read', hl);
  const canSpeak = 'speechSynthesis' in window;
  let speed = 1, voice = null, engine = null, rec = null, ends = new Map();
  let at = null, marked = null, lastUser = -Infinity, note = HINT;

  const events = {
    word(r, c0, c1) { if (el.isConnected) mark(String(r), c0, c1); else close(); },
    block: (r) => mark(r),
    state: render,
    end: () => mark(null),
    play: () => play(), // the lock screen's play button
  };
  const ui = bar({ play: toggle, speed: faster, voice: use, close });
  const { el } = ui;
  // The reader is one of the page's players: another one starting pauses it, and it starting pauses them.
  Object.assign(el, { aoPlay: () => play(), aoPause: pause, aoPlaying: () => !!engine?.playing(),
                      aoTitle: () => `Listening: ${title}`, aoClock: () => (voice === 'recorded' ? engine.audio : null) });

  function make(kind) {
    engine?.close();
    voice = kind;
    engine = kind === 'recorded' ? recorded(rec, [...blocks.keys()], events, title) : speech(blocks, events);
    engine.rate(speed);
    ends = kind === 'recorded' ? engine.ends() : new Map();
  }
  // A post that is never recorded has no readHash and reads in the browser's voice, which listen.js made sure of.
  const ready = (readHash ? fetch(`/read/${slug}/${readHash}.json`).then((r) => r.json()).catch(() => ({}))
    : Promise.resolve({})).then((r) => {
    rec = r.parts ? r : null;
    if (!rec && readHash) note = canSpeak ? COMING : MUTE;
    if (rec || canSpeak) make(rec ? 'recorded' : 'speech');
    render();
  });

  function render() {
    ui.show({ playing: !!engine?.playing(), speed, voice, offered: !!readHash, recorded: !!rec, speech: canSpeak,
              note });
  }
  async function play(from) {
    await ready;
    if (!engine) return;
    claim(el);
    engine.play(from);
  }
  function pause() { engine?.pause(); }
  function toggle() { if (engine?.playing()) pause(); else play(); }
  function faster() {
    speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    engine?.rate(speed);
    render();
  }
  function use(kind) {
    if (kind === voice) return;
    const was = engine?.playing();
    make(kind);
    if (was) play(at);
    render();
  }

  // The word being read (block r, display characters c0..c1), or its whole block when the voice sends no words or
  // the page shows other text than the recording read; null clears the marks.
  function mark(r, c0, c1) {
    const b = r && blocks.get(r);
    if (marked !== (b?.el ?? null)) {
      marked?.classList.remove('ra-on');
      b?.el.classList.add('ra-on');
      marked = b?.el ?? null;
    }
    hl?.clear();
    if (!b) return;
    at = { r, c: c0 ?? 0 };
    const whole = c0 === undefined || (voice === 'recorded' && ends.get(r) !== b.text.length);
    const range = whole ? null : rangeOf(b, c0, c1);
    if (range) hl?.add(range);
    follow((range ?? b.el).getBoundingClientRect());
  }
  // Keep the reading in view, unless the reader has scrolled away themselves in the last few seconds.
  function follow(box) {
    if (performance.now() - lastUser < QUIET) return;
    const view = scroller.getBoundingClientRect();
    const band = (view.bottom - view.top) / 6;
    if (box.top >= view.top + band && box.bottom <= view.bottom - 1.5 * band) return;
    scroller.scrollBy({ top: box.top - view.top - 2 * band, behavior: 'smooth' });
  }
  const user = () => { lastUser = performance.now(); };
  const keys = (e) => { if (/^(Arrow(Up|Down)|Page(Up|Down)|Home|End| )$/.test(e.key)) user(); };

  function onClick(e) {
    if (e.button || e.target.closest(NOT_TEXT) || !e.target.closest('[data-r]') || String(getSelection())) return;
    const spot = hit(blocks, e.clientX, e.clientY);
    if (!spot) return;
    const word = wordAt(blocks.get(spot.r), spot.c);
    lastUser = -Infinity;
    play({ r: spot.r, c: word ? word[0] : spot.c });
  }

  function close() {
    engine?.close();
    hl?.clear();
    marked?.classList.remove('ra-on');
    el.remove();
    root.classList.remove('karaoke');
    root.removeEventListener('click', onClick);
    for (const t of ['wheel', 'touchmove']) scroller.removeEventListener(t, user);
    removeEventListener('keydown', keys);
    document.removeEventListener(AO_STOP, pause);
    removeEventListener('pagehide', close);
    button.setAttribute('aria-pressed', 'false');
    onClose();
  }

  root.classList.add('karaoke');
  root.append(el);
  button.setAttribute('aria-pressed', 'true');
  root.addEventListener('click', onClick);
  for (const t of ['wheel', 'touchmove']) scroller.addEventListener(t, user, { passive: true });
  addEventListener('keydown', keys);
  document.addEventListener(AO_STOP, pause);
  addEventListener('pagehide', close);
  render();
  return { toggle, close };
}
