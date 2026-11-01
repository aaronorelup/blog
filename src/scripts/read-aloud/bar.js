// Karaoke mode's bar, sticky at the foot of the panel: play/pause, speed, the voice (the recording or the browser's
// own, free), a line for the hint and the news, close. bar(on) → { el, show(state) }; on: play, speed, voice, close.
const PLAY = '<svg viewBox="0 0 12 12" width="14" height="14" aria-hidden="true"><path d="M3.2 1.6v8.8L10.4 6z" fill="currentColor"/></svg>';
const PAUSE = '<svg viewBox="0 0 12 12" width="14" height="14" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx=".8" fill="currentColor"/><rect x="7" y="1.5" width="3" height="9" rx=".8" fill="currentColor"/></svg>';

export function bar(on) {
  const el = document.createElement('div');
  el.className = 'ra-bar';
  el.setAttribute('role', 'region');
  el.setAttribute('aria-label', 'Read aloud');
  el.innerHTML =
    '<button type="button" class="ra-play"></button>' +
    '<button type="button" class="ra-speed" aria-label="Reading speed"></button>' +
    '<span class="ra-voice" role="group" aria-label="Voice">' +
      '<button type="button" data-voice="recorded">Recording</button>' +
      '<button type="button" data-voice="speech">Browser voice <small>free</small></button>' +
    '</span>' +
    '<span class="ra-note" aria-live="polite"></span>' +
    '<button type="button" class="ra-close" aria-label="Stop reading and close">×</button>';
  const $ = (s) => el.querySelector(s);
  $('.ra-play').addEventListener('click', () => on.play());
  $('.ra-speed').addEventListener('click', () => on.speed());
  $('.ra-close').addEventListener('click', () => on.close());
  for (const b of el.querySelectorAll('[data-voice]')) b.addEventListener('click', () => on.voice(b.dataset.voice));

  let shown = {};
  // state: { playing, speed, voice, recorded (a recording of this version exists), speech (the browser has a voice), note }
  function show(state) {
    if (state.playing !== shown.playing) {
      $('.ra-play').innerHTML = state.playing ? PAUSE : PLAY;
      $('.ra-play').setAttribute('aria-label', state.playing ? 'Pause' : 'Play');
    }
    $('.ra-speed').textContent = `${state.speed}x`;
    for (const b of el.querySelectorAll('[data-voice]')) {
      b.setAttribute('aria-pressed', String(b.dataset.voice === state.voice));
      b.disabled = !(b.dataset.voice === 'recorded' ? state.recorded : state.speech);
    }
    $('.ra-note').textContent = state.note;
    shown = { ...state };
  }
  return { el, show };
}
