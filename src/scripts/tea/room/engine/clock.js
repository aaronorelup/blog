// The engine's two clock-like inputs as pure functions of what boot.js reads: the time and the pointer.
// The time is in seconds, held at STILL_T with ?still=1 or reduced motion. The pointer is [0, 0] until a mouse has
// moved, and always on a touch device, with ?still=1 and with reduced motion; otherwise each axis -1 to 1 from
// the window's centre.
export const STILL_T = 12.4;

export const clockOf = ({ now = 0, still = false, reduced = false } = {}) => (still || reduced ? STILL_T : now / 1000);

export function pointerOf({ x = 0, y = 0, vw = 1, vh = 1, moved = false, touch = false, still = false, reduced = false } = {}) {
  if (!moved || touch || still || reduced || !(vw > 0) || !(vh > 0)) return [0, 0];
  const c = (v) => Math.max(-1, Math.min(1, v));
  return [c((x / vw) * 2 - 1), c((y / vh) * 2 - 1)];
}
