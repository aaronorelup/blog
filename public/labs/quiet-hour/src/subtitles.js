// Burned-in subtitles (film level, bible section 7): one warm serif line at the bottom of the frame.
//
//   const subs = createSubtitles(engine.cues);
//   subs.at(frame)            -> { id, text, alpha } | null   (pure function of the frame)
//   subs.draw(ctx, w, h, cue) -> draws that cue onto a transparent film-size 2D canvas
//
// The cue list (when each line starts and how long it stays) comes from the engine: the rules that
// pick the lines live there, this file only shows them. A cue needs a start frame, an end frame and
// the text; the field names below cover the engine's shape and a plain { start, end, text }.

const FONT = '"QH Serif"';
const FADE = 3;                         // frames of fade in and out (no full-frame light change)

function norm(c) {
  const start = c.startFrame ?? c.frame ?? c.start ?? c.from;
  let end = c.endFrame ?? c.end ?? c.to;
  if (end == null && c.frames != null) end = start + c.frames;
  if (end == null && c.durationFrames != null) end = start + c.durationFrames;
  return { id: c.id, text: c.subtitle ?? c.text, start, end };
}

export function createSubtitles(cues = []) {
  const list = (cues || []).map(norm).filter((c) => c.text && Number.isFinite(c.start) && Number.isFinite(c.end))
    .sort((a, b) => a.start - b.start);
  return {
    list,
    at(frame) {
      let hit = null;
      for (const c of list) if (frame >= c.start && frame < c.end) hit = c;      // the later cue wins (it cut the earlier)
      if (!hit) return null;
      const alpha = Math.min(1, (frame - hit.start + 1) / FADE, (hit.end - frame) / FADE);
      return { id: hit.id, text: hit.text, alpha: Math.max(0, alpha) };
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
      ctx.fillStyle = '#f3dfb8'; ctx.fillText(cue.text, x, y);              // warm cream
      ctx.globalAlpha = 1;
    },
  };
}
