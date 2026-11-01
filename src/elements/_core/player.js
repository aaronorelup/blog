// One player at a time, the rules below. Elements import claim(), current and the two events; enhance() calls
// hookFrames(root). Every change of what plays updates the now-playing bar.
import { isMediaEl, isPlaying, isSilent, mediaOf, pausePlayer } from './media.js';
import { nowPlaying } from './now-playing.js';

// One player at a time, across the whole page. A "player" is whatever plays as one unit: a
// lone <video> or <audio>, a component that drives several in step (a synced <ao-compare>,
// <ao-cues>, <ao-listen>), a same-origin iframe with its own player in it, or a running
// <ao-game>. Starting one pauses every other, so a reader never has two soundtracks at once
// and a forgotten loop never keeps decoding three screens up.
//
// What a playing player does when it leaves the screen depends on what it is:
//   - hidden outright (the homepage closed the reader or switched views): it stops.
//   - scrolled away and silent (a muted loop, a B-roll clip): it pauses, and carries on when
//     it is scrolled back to, unless something else has played since.
//   - scrolled away with sound: it keeps playing, because the reader may be listening while
//     they read on, and a small bar at the foot of the window says what's playing, with
//     pause, a way back to it, and close.
//   - a game pauses itself (see <ao-game>).
// Components can give their element aoPlay()/aoPause() (and aoTitle()/aoClock() for the bar);
// anything else is driven through the media elements inside it.
export const AO_LISTEN_PLAY = 'ao-listen-play'; // detail: the player that just started
export const AO_STOP = 'ao-stop'; // the homepage closing the reader: stop everything
const GROUPS = 'ao-cues, ao-compare[sync], ao-listen, ao-game';
const playerOf = (el) => (el.closest && el.closest(GROUPS)) || frameOf.get(el.ownerDocument) || el;
const frameOf = new WeakMap(); // an iframe's document -> the iframe, for media inside it
const frames = new Set();
export let current = null;

export function claim(p) {
  const changed = current !== p;
  if (changed && current) {
    current._aoResume = null;
    pausePlayer(current);
  }
  current = p;
  // Anything else still playing stops too: a player that started before this module loaded,
  // or one inside a frame that was never seen starting.
  for (const m of document.querySelectorAll('video, audio')) if (!m.paused && playerOf(m) !== p) m.pause();
  for (const f of frames) if (f !== p) mediaOf(f).forEach((m) => { if (!m.paused) m.pause(); });
  if (changed) document.dispatchEvent(new CustomEvent(AO_LISTEN_PLAY, { detail: p }));
  watch(p);
  nowPlaying.update(current);
}

const onMediaPlay = (e) => { if (isMediaEl(e.target)) claim(playerOf(e.target)); };
document.addEventListener('play', onMediaPlay, true);
// The bar's clock and buttons follow whatever the current player's media do.
for (const type of ['pause', 'ended', 'timeupdate', 'volumechange']) {
  document.addEventListener(type, (e) => { if (current && isMediaEl(e.target) && playerOf(e.target) === current) nowPlaying.update(current); }, true);
}
document.addEventListener(AO_STOP, () => {
  for (const m of document.querySelectorAll('video, audio')) if (!m.paused) m.pause();
  for (const f of frames) mediaOf(f).forEach((m) => m.pause());
  if (current) { current._aoResume = null; pausePlayer(current); }
  nowPlaying.update(current);
});

// A same-origin iframe (the BLACKWATER player page, say) is a player too: its media are
// reachable, so starting one pauses the post's and the other way round.
function hookFrame(f) {
  if (frames.has(f) || f.closest('ao-game')) return;
  let doc;
  try { doc = f.contentDocument; } catch (e) { return; }
  if (!doc || doc.URL === 'about:blank') return;
  frames.add(f);
  frameOf.set(doc, f);
  doc.addEventListener('play', (e) => { if (isMediaEl(e.target)) claim(f); }, true);
  for (const type of ['pause', 'ended', 'timeupdate']) doc.addEventListener(type, () => { if (current === f) nowPlaying.update(current); }, true);
}
document.addEventListener('load', (e) => { if (e.target && e.target.tagName === 'IFRAME') hookFrame(e.target); }, true);

// Where the current player is, relative to the screen.
const sight = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => entries.forEach((e) => onSight(e.target, e.isIntersecting)))
  : null;
const watched = new WeakSet();
function watch(p) {
  if (!sight || watched.has(p) || p.localName === 'ao-game') return;
  watched.add(p);
  sight.observe(p);
}
function onSight(p, inView) {
  p._aoInView = inView;
  if (inView) {
    const resume = p._aoResume;
    p._aoResume = null;
    if (resume && p === current) (p.aoPlay ? p.aoPlay() : resume.forEach((m) => m.play().catch(() => {})));
  } else if (!p.isConnected || !p.getClientRects().length) {
    p._aoResume = null;
    pausePlayer(p);
  } else if (p === current && isPlaying(p) && isSilent(p)) {
    p._aoResume = mediaOf(p).filter((m) => !m.paused);
    pausePlayer(p);
  }
  nowPlaying.update(current);
}

// The frames that finished loading before the listener above could see them (on the homepage, this module and a
// post's elements load after the post is swapped in).
export function hookFrames(root = document) {
  for (const f of root.querySelectorAll('iframe')) {
    try { if (f.contentDocument?.readyState === 'complete') hookFrame(f); } catch (e) { /* cross-origin */ }
  }
}
