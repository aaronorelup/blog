// The recording: { parts: [{ src, dur, words: [[r, c0, c1, t0, t1]] }] }, one part per section, played in turn by one
// <audio> (kept out of the page, so the page's players never pause it as one of theirs), the next part fetched at 80%,
// speed by playbackRate, the word found by binary search on every animation frame, the lock screen told what plays.
// recorded(rec, order, on, title) → the engine index.js drives; order: the block refs in reading order.
export function recorded({ parts }, order, on, title) {
  const rank = new Map(order.map((r, i) => [r, i]));
  const audio = new Audio();
  audio.preload = 'auto';
  let part = -1, word = -1, want = false, raf = 0, ahead = -1, seek = 0, plays = 0;

  // A part's time is set once its metadata is in: a seek before that is dropped by some browsers. The latest
  // target wins, so a second click while a part loads isn't undone by the first one's.
  audio.addEventListener('loadedmetadata', () => { audio.currentTime = seek; });
  function load(i, t) {
    seek = t;
    if (i !== part) { part = i; word = -1; audio.src = parts[i].src; }
    else if (audio.readyState >= 1) audio.currentTime = t;
  }
  // The last word that has started by time ms in the current part.
  function find(ms) {
    const words = parts[part].words;
    let lo = 0, hi = words.length - 1, found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (words[mid][3] <= ms) { found = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return found;
  }
  function tick() {
    raf = 0;
    if (!want) return;
    raf = requestAnimationFrame(tick);
    if (audio.readyState < 1) return; // a new part's metadata is still on its way
    const w = find(audio.currentTime * 1000);
    if (w !== word && w >= 0) { word = w; on.word(...parts[part].words[w]); }
    if (ahead !== part + 1 && part + 1 < parts.length && audio.currentTime > 0.8 * (parts[part].dur / 1000)) {
      ahead = part + 1;
      fetch(parts[ahead].src).catch(() => {});
    }
  }
  // A play() that a later one replaced (a click on a word while a part still loads) is rejected: only the latest
  // one's refusal (autoplay, a file that won't play) stops the reading.
  function run() {
    want = true;
    const n = ++plays;
    audio.play().then(() => { if (!raf) raf = requestAnimationFrame(tick); },
      () => { if (n === plays) { want = false; on.state(); } });
    on.state();
  }
  audio.addEventListener('ended', () => {
    if (part + 1 < parts.length) { load(part + 1, 0); run(); return; }
    want = false;
    part = -1;
    on.state();
    on.end();
  });

  // The part and time of the word at or after block r, offset c (the first word of a later block when r has none).
  function locate({ r, c }) {
    const after = rank.get(r);
    for (const [i, p] of parts.entries()) {
      for (const w of p.words) {
        const k = rank.get(String(w[0]));
        if (k > after || (k === after && w[2] > c)) return [i, w[3] / 1000];
      }
    }
    return [0, 0];
  }

  // The lock screen names the reading while it is open; its play goes through on.play (index.js), which first pauses
  // the page's other players, as the bar's does.
  const session = navigator.mediaSession;
  if (session) session.metadata = new MediaMetadata({ title, artist: 'Aaron Orelup', album: 'aaronorelup.com' });
  function pause() { want = false; audio.pause(); on.state(); }
  return {
    audio,
    play(from) {
      if (from) load(...locate(from));
      else if (part < 0) load(0, 0);
      run();
      session?.setActionHandler('play', () => on.play());
      session?.setActionHandler('pause', pause);
    },
    pause,
    playing: () => want,
    rate(x) { audio.defaultPlaybackRate = audio.playbackRate = x; }, // the default survives a new part's load
    // The words each block has in the recording, for the check that the page shows the text the voice read.
    ends() {
      const out = new Map();
      for (const p of parts) for (const [r, , c1] of p.words) out.set(String(r), Math.max(out.get(String(r)) ?? 0, c1));
      return out;
    },
    close() {
      want = false;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (!session) return;
      session.metadata = null;
      for (const action of ['play', 'pause']) session.setActionHandler(action, null);
    },
  };
}
