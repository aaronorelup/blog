// Burned-in subtitles (film level, bible section 7): the maker's lines, so the film reads with the sound off.
//
//   const subs = createSubtitles(engine);
//   subs.at(frame)            -> { id, text, alpha } | null   (pure function of the frame, 0..2399)
//   subs.draw(ctx, w, h, cue) -> draws that cue onto a transparent film-size 2D canvas
//
// Which line shows when, and for how long, is the engine's (engine.subtitleAt). This file only shows it: the serif
// face, warm cream with a soft dark edge, bottom centre, the cap-to-descender size about 4.5% of the frame's height,
// one line or two balanced lines, a 3-frame fade in and out so a line never pops the frame.
//
// Legibility: Cormorant is a delicate face, so the letters get a hairline of their own colour (a touch of weight)
// and a soft dark halo (a blurred shadow plus a thin translucent edge) that holds them on the bright tube as well
// as on the dark room. Checked at 1920x1080 and with the frame scaled to 640 wide.

const FONT = '"QH Serif"';
const FADE = 3;                                                   // frames
const SIZE = 0.050;                                               // font size / frame height (glyph body ~4.5%)
const LINE = 1.16;                                                // line spacing, in font sizes
const BASE = 0.918;                                               // last line's baseline / frame height
const MAX_W = 0.62;                                             // widest line / frame width
const CREAM = '#f4e3c1';

/** Split a line into at most two balanced lines that each fit maxW; prefers breaking after punctuation. */
function wrap(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return [text];
  const words = text.split(' ');
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const wa = ctx.measureText(a).width, wb = ctx.measureText(b).width;
    const over = Math.max(0, wa - maxW) + Math.max(0, wb - maxW);
    const punct = /[.,;:?!]$/.test(words[i - 1]) ? 0.82 : 1;     // a sentence break is worth a little imbalance
    const score = over * 10 + Math.abs(wa - wb) * punct + (wb > wa ? 0 : 4);   // a longer bottom line reads better
    if (!best || score < best.score) best = { score, lines: [a, b] };
  }
  return best.lines;
}

export function createSubtitles(engine) {
  const at = (f) => engine.subtitleAt(f);
  return {
    at(frame) {
      const c = at(frame);
      if (!c) return null;
      const alpha = Math.min(1, (frame - c.start + 1) / FADE, (c.end - frame) / FADE);
      return { id: c.id, text: c.text, alpha: Math.max(0, Math.min(1, alpha)) };
    },
    draw(ctx, w, h, cue) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!cue || cue.alpha <= 0) return;
      const size = Math.round(h * SIZE);
      ctx.font = `${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      const lines = wrap(ctx, cue.text, w * MAX_W);
      const x = Math.round(w / 2), y0 = Math.round(h * BASE - (lines.length - 1) * size * LINE);
      ctx.lineJoin = 'round'; ctx.miterLimit = 2;
      ctx.globalAlpha = cue.alpha;
      // 1. the soft dark halo: a wide blurred shadow drawn under the letters
      ctx.save();
      ctx.shadowColor = 'rgba(6,5,4,0.9)'; ctx.shadowBlur = size * 0.32; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = size * 0.03;
      ctx.strokeStyle = 'rgba(8,6,5,0.55)'; ctx.lineWidth = size * 0.14;
      lines.forEach((t, i) => ctx.strokeText(t, x, y0 + i * size * LINE));
      ctx.restore();
      // 2. the letters, with a hairline of their own colour for weight
      ctx.fillStyle = CREAM; ctx.strokeStyle = CREAM; ctx.lineWidth = Math.max(0.6, size * 0.028);
      lines.forEach((t, i) => { const y = y0 + i * size * LINE; ctx.fillText(t, x, y); ctx.strokeText(t, x, y); });
      ctx.globalAlpha = 1;
    },
  };
}
