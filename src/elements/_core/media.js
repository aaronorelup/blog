// What a player is made of and what it is doing: its <video> and <audio> (in a component, or in a same-origin
// iframe), whether it plays, whether it plays without sound, and pausing it. A component that drives its media
// itself answers through aoPlaying() and aoPause(). Read by player.js and now-playing.js.

export const isMediaEl = (el) => !!el && (el.tagName === 'VIDEO' || el.tagName === 'AUDIO');

export const mediaOf = (p) => {
  if (isMediaEl(p)) return [p];
  if (p.tagName === 'IFRAME') {
    try { return [...p.contentDocument.querySelectorAll('video, audio')]; } catch (e) { return []; }
  }
  return [...p.querySelectorAll('video, audio')];
};
export const isPlaying = (p) => (p.aoPlaying ? p.aoPlaying() : mediaOf(p).some((m) => !m.paused && !m.ended));
// Silent: everything playing is muted, at zero volume, or a video that has played a while and
// decoded no sound. A player whose media are all paused for a moment (cuts waiting on a stalled
// one) isn't silent, it's waiting.
export const isSilent = (p) => {
  const on = mediaOf(p).filter((m) => !m.paused);
  return on.length > 0 && on.every((m) => m.muted || m.volume === 0 || (m.tagName === 'VIDEO' &&
    (m.mozHasAudio === false || (m.webkitAudioDecodedByteCount === 0 && m.currentTime > 1))));
};
export const pausePlayer = (p) => (p.aoPause ? p.aoPause() : mediaOf(p).forEach((m) => { if (!m.paused) m.pause(); }));
