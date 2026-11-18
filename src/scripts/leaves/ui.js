// The room's paper and buttons: where the slip, the hint and a leaf's label sit (set from the layout), the slip
// arriving at the reveal with its seal, the leaf label (outside the rim, never over the number, a thread to its
// leaf), the offscreen list of leaves for the keyboard, the pills. Every word comes from src/data/leaves.js.
import { COPY } from '../../data/leaves.js';
import { drawSeal } from './seal.js';
import { ENTRY } from './leaves.js';

const GUTTER = 16, PILLS = 76;

export function bindUi(root, data) {
  const $ = (sel) => root.querySelector(sel);
  const ui = { slip: $('.lv-slip'), hint: $('.lv-hint'), label: $('.lv-label'), list: $('.lv-list'),
    leave: $('.lv-leave'), sound: $('.lv-sound'), seal: $('.lv-seal'), line2: $('.lv-line2'), alt: $('.lv-alt'), L: null };

  // Landscape: the slip about 40 px off the rim, the two centred together (index.js moves the cup to make room);
  // where that does not fit, low on the right. Portrait: under the cup.
  ui.place = (L) => {
    ui.L = L;
    const { W, H, cx, cy, Ro } = L;
    let left, top, width;
    if (L.portrait) {
      width = Math.min(440, W - 2 * GUTTER); left = (W - width) / 2; top = cy + Ro + GUTTER;
    } else if (L.beside) {
      width = L.slipW; left = cx + Ro + 40; top = cy - 70;
    } else {
      width = Math.min(330, W - 2 * GUTTER); left = W - GUTTER - width; top = H - PILLS - 150;
    }
    Object.assign(ui.slip.style, { left: `${left}px`, top: `${top}px`, width: `${width}px` });
    Object.assign(ui.hint.style, { left: `${cx + Ro * 0.78}px`, top: `${cy + Ro * 0.8}px` });
    if (!ui.slip.hidden) ui.fit();
  };

  // Once the slip has a height: beside the cup, centred on it; under it, clear of the pills.
  ui.fit = () => {
    const { H, cy, Ro } = ui.L, h = ui.slip.offsetHeight;
    let top = parseFloat(ui.slip.style.top);
    if (ui.L.portrait) top = Math.min(cy + Ro + GUTTER, H - PILLS - 8 - h);
    else if (ui.L.beside) top = Math.max(GUTTER, Math.min(cy - h * 0.48, H - PILLS - h));
    else top = H - PILLS - 8 - h;
    ui.slip.style.top = `${Math.max(GUTTER, top)}px`;
  };

  // The slip: real text, announced as it arrives; its second line is the brew's own tally.
  ui.showSlip = (tally, digits, seed, still) => {
    ui.line2.textContent = COPY.line2({ n: data.leaves.length, ...tally });
    ui.slip.hidden = false;
    ui.slip.classList.toggle('lv-still', !!still);
    ui.fit();
    requestAnimationFrame(() => {
      ui.slip.classList.add('lv-in');
      drawSeal(ui.seal, digits, seed);
    });
  };

  // A leaf's label, at the leaf (x, y, CSS px): set off the rim on the leaf's side, or above or below the cup, as
  // the room allows, kept 16 px inside the screen and off the number. Returns the point on its edge the leaf's
  // thread runs to (paint.js), or null when it hides.
  ui.showLabel = (p, x, y) => {
    if (!p) { ui.label.classList.remove('lv-on'); return null; }
    const text = p.kind === ENTRY ? COPY.label(p.id, p.title) : COPY.wordLeaf;
    if (ui.label.textContent !== text) ui.label.textContent = text;
    const { W, H, cx, cy, Ro, R } = ui.L, w = ui.label.offsetWidth || 200, h = ui.label.offsetHeight || 34;
    let dx = x - cx, dy = y - cy;
    const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const ax = cx + dx * (Ro + 14), ay = cy + dy * (Ro + 14);
    const side = (u) => (u > 0.35 ? 0 : u < -0.35 ? -1 : -0.5);
    // the number's box, from glyphs.js (0.92 R across); the slip, once it is down
    const nx0 = cx - 0.5 * R, nx1 = cx + 0.5 * R, ny0 = cy - 0.27 * R, ny1 = cy + 0.27 * R;
    const tries = [
      [ax + side(dx) * w, ay + side(dy) * h],
      [x - w / 2, cy - Ro - 14 - h],
      [x - w / 2, cy + Ro + 14],
      [x - w / 2, ny0 - 14 - h],
      [x - w / 2, ny1 + 14],
    ];
    const slip = ui.slip.hidden ? null : ui.slip.getBoundingClientRect();
    const area = (l, t, x0, y0, x1, y1) => Math.max(0, Math.min(l + w, x1) - Math.max(l, x0)) * Math.max(0, Math.min(t + h, y1) - Math.max(t, y0));
    let best = null;
    tries.forEach(([l0, t0], i) => {
      const l = Math.max(GUTTER, Math.min(W - GUTTER - w, l0)), t = Math.max(GUTTER, Math.min(H - GUTTER - h, t0));
      const qx = Math.max(l, Math.min(cx, l + w)), qy = Math.max(t, Math.min(cy, t + h));
      const inCup = Math.max(0, Ro - Math.hypot(qx - cx, qy - cy));
      const score = area(l, t, nx0, ny0, nx1, ny1) * 1000 + (slip ? area(l, t, slip.left, slip.top, slip.right, slip.bottom) * 40 : 0)
        + inCup * (i > 2 ? 3 : 1) + Math.hypot(l - l0, t - t0);
      if (!best || score < best.score) best = { l, t, score };
    });
    Object.assign(ui.label.style, { left: `${best.l}px`, top: `${best.t}px` });
    ui.label.classList.add('lv-on');
    return { x: Math.max(best.l, Math.min(x, best.l + w)), y: Math.max(best.t, Math.min(y, best.t + h)) };
  };

  ui.hideHint = () => ui.hint.classList.add('lv-gone');
  ui.showHint = () => ui.hint.classList.add('lv-shown');

  ui.setSound = (on) => {
    ui.sound.setAttribute('aria-pressed', String(on));
    ui.sound.textContent = on ? COPY.soundOn : COPY.soundOff;
  };
  return ui;
}

// The tally the slip reports: of all the color the entries released, the share from this month's leaves.
export function tallyOf(leaves) {
  let total = 0, fresh = 0, recent = 0;
  for (const p of leaves) {
    if (p.kind !== ENTRY) continue;
    total += p.released;
    if (p.days < 31) { fresh += p.released; recent++; }
  }
  return { share: total ? fresh / total : 0, recent };
}
