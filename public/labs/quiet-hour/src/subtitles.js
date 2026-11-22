// Burned-in subtitles (film level, bible section 7): one warm serif line at the bottom of the frame.
//
//   const subs = createSubtitles(engine);
//   subs.at(frame)            -> { id, text, alpha } | null   (pure function of the frame, 0..2399)
//   subs.draw(ctx, w, h, cue) -> draws that cue onto a transparent film-size 2D canvas
//
// Which line shows when is the engine's (engine.subtitleAt: the line rules, the queue, how long each
// line stays). This file only shows it, with a short fade at each end so a line never pops the frame.

const FONT = '"QH Serif"';
const FADE = 3;                                                   // frames

export function createSubtitles(engine) {
  const at = (f) => engine.subtitleAt(f);
  return {
    at(frame) {
      const c = at(frame);
      if (!c) return null;
      const alpha = Math.min(1, (frame - c.start + 1) / FADE, (c.end - frame) / FADE);
      return { id: c.id, text: c.text, alpha: Math.max(0, alpha) };
    },
    draw(ctx, w, h, cue) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!cue) return;
      const size = Math.round(h * 0.046);
      ctx.font = `${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.globalAlpha = cue.alpha;
      const y = Math.round(h * 0.915), x = Math.round(w / 2);
      ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, size * 0.16);
      ctx.strokeStyle = 'rgba(10,8,6,0.85)'; ctx.strokeText(cue.text, x, y);
      ctx.fillStyle = '#f3dfb8'; ctx.fillText(cue.text, x, y);      // warm cream
      ctx.globalAlpha = 1;
    },
  };
}
