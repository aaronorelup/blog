// The film's grid (bible section 2). Every frame number in the film is an integer; time is never a float clock.
//
// 24 fps. One eighth note = 5 frames. One bar (6 notes) = 30 frames = 1.25 s. The programme is 432 notes = frames
// 0 to 2159 (90 s). 20:00 is note 288 = frame 1440 = 60 s. The coda is frames 2160 to 2399: black, sound only.

export const FPS = 24, NOTE_FRAMES = 5, BAR_FRAMES = 30, NOTES = 432, BREAK_NOTE = 288, BREAK_FRAME = 1440,
  PROGRAMME_FRAMES = 2160, CODA_FRAMES = 240, TOTAL_FRAMES = 2400;
export const NOTES_PER_BAR = BAR_FRAMES / NOTE_FRAMES;          // 6

/** Programme seconds shown for a frame: floor(frame * 5 / 6) (30:00 of programme in 90 s of film). */
export function clockSeconds(frame) {
  return Math.floor((frame * 5) / 6);
}

/** The clock bug's text for a frame: 'MM:SS' of floor(frame * 5 / 6) programme seconds. */
export function clockText(frame) {
  const sec = clockSeconds(frame);
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

/** The note playing at a frame: floor(frame / 5). */
export function noteAt(frame) {
  return Math.floor(frame / NOTE_FRAMES);
}

/** The first frame of note g. */
export function noteFrame(g) {
  return g * NOTE_FRAMES;
}

/** Film seconds of a frame (for tables and the sound; never used to drive the picture). */
export function filmSeconds(frame) {
  return frame / FPS;
}

/** The first frame whose clock shows `sec` programme seconds (e.g. 05:00 -> frame 360). */
export function frameAtClock(sec) {
  return Math.ceil((sec * 6) / 5);
}
