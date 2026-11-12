// The two sliding paper screens (pure). Measured from a boundary, the place where the next chapter's section
// begins, in vh: they slide in from -0.50 to -0.10, are shut from -0.10 to +0.10 (the stage changes scenes at 0,
// behind them) and slide apart from +0.10 to +0.50. There are none where the hero ends: the house's own panels
// open round the door instead. After the last chapter they shut once more, dark and with no shadow: in from 1.5
// to 1.1 vh before the end of the last section, and they stay shut under the footer.
import { easeEnds } from './tracks.js';

export const SCREEN_W = 0.52; // each screen's share of the window's width; they overlap a little at the post
export const IN = Object.freeze([-0.5, -0.1]);
export const OUT = Object.freeze([0.1, 0.5]);
export const CLOSE = Object.freeze([-1.5, -1.1]); // from the end of the last section

// How far shut the screens are (0 open, 1 shut) at u vh from a boundary.
export function shutAt(u) {
  if (u <= IN[0] || u >= OUT[1]) return 0;
  if (u < IN[1]) return easeEnds((u - IN[0]) / (IN[1] - IN[0]));
  if (u <= OUT[0]) return 1;
  return 1 - easeEnds((u - OUT[0]) / (OUT[1] - OUT[0]));
}
// The house closing, at u vh from the end of the last section: shut from CLOSE[1] on, for good.
export function closeAt(u) {
  if (u <= CLOSE[0]) return 0;
  if (u >= CLOSE[1]) return 1;
  return easeEnds((u - CLOSE[0]) / (CLOSE[1] - CLOSE[0]));
}

// The changes on the page, in order: one before each chapter but the first (none at the door after the hero),
// then the house closing. Each says until where it lasts, so the screens' field and shadow switch only while
// they are open and out of the frame.
export function changes(L) {
  const out = [];
  L.chapters.forEach((c, i) => {
    if (i === 0 || (i === 1 && L.chapters[0].hero)) return;
    out.push({ into: i, at: c.top, ends: c.top + OUT[1] * L.vh });
  });
  const last = L.chapters[L.chapters.length - 1];
  out.push({ into: -1, at: last.top + last.len * L.vh, ends: Infinity });
  return out;
}

// The screens at scroll position y (px): how far shut, where each screen stands (its translateX in px from its
// own place: the left screen's is 0, the right's 0.48 of the window), the field behind the paper (the coming
// chapter's light, or the night ground when the house closes) and the shadow of the coming chapter's object, in
// window px and in each screen's own px (the shadow does not travel: each screen wipes its own half away).
export function screensAt(y, L) {
  const list = changes(L);
  const c = list.find((e) => y < e.ends) ?? list[list.length - 1];
  const u = (y - c.at) / L.vh;
  const shut = c.into < 0 ? closeAt(u) : shutAt(u);
  const w = SCREEN_W * L.vw;
  const left = -(1 - shut) * w;
  const right = (1 - shut) * w;
  const into = c.into < 0 ? null : L.chapters[c.into];
  const s = into?.shadow;
  return {
    shut, into: c.into, field: into ? into.light : L.night, left, right, width: w,
    shadow: s ? { src: s.src, x: s.x, y: s.y, w: s.w, h: s.h, lx: s.x - left, rx: s.x - (L.vw - w) - right } : null,
  };
}
