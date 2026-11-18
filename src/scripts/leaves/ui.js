// The room's paper and buttons: where the slip, the hint and a leaf's label sit (set from the layout), the slip
// arriving at the reveal with its seal, the leaf label, the offscreen list of leaves for the keyboard, the pills.
// Every word comes from src/data/leaves.js.
import { COPY } from '../../data/leaves.js';
import { drawSeal } from './seal.js';
import { ENTRY } from './leaves.js';

export function bindUi(root, data) {
  const $ = (sel) => root.querySelector(sel);
  const ui = { slip: $('.lv-slip'), hint: $('.lv-hint'), label: $('.lv-label'), list: $('.lv-list'),
    leave: $('.lv-leave'), sound: $('.lv-sound'), seal: $('.lv-seal'), line2: $('.lv-line2'), alt: $('.lv-alt') };

  ui.place = (L) => {
    const { W, H, cx, cy, Ro } = L;
    const portrait = H > W * 1.05;
    let left, top, width;
    if (portrait) {
      width = Math.min(440, W - 32); left = (W - width) / 2; top = Math.min(cy + Ro + 24, H - 150);
    } else {
      width = Math.min(330, W - (cx + Ro + 40) - 16); left = cx + Ro + 40; top = cy - 30;
      if (width < 250) { width = Math.min(330, W - 32); left = W - 16 - width; top = H - 80 - 150; }
    }
    Object.assign(ui.slip.style, { left: `${left}px`, top: `${top}px`, width: `${width}px` });
    Object.assign(ui.hint.style, { left: `${cx + Ro * 0.78}px`, top: `${cy + Ro * 0.8}px` });
  };

  // The slip: real text, announced as it arrives; its second line is the brew's own tally.
  ui.showSlip = (tally, digits, seed, still) => {
    ui.line2.textContent = COPY.line2({ n: data.leaves.length, ...tally });
    ui.slip.hidden = false;
    ui.slip.classList.toggle('lv-still', !!still);
    requestAnimationFrame(() => {
      ui.slip.classList.add('lv-in');
      drawSeal(ui.seal, digits, seed);
    });
  };

  ui.showLabel = (p, x, y) => {
    if (!p) { ui.label.classList.remove('lv-on'); return; }
    const text = p.kind === ENTRY ? COPY.label(p.id, p.title) : COPY.wordLeaf;
    if (ui.label.textContent !== text) ui.label.textContent = text;
    const w = ui.label.offsetWidth || 200;
    const left = Math.max(12, Math.min(innerWidth - w - 12, x - w / 2));
    Object.assign(ui.label.style, { left: `${left}px`, top: `${Math.max(12, y - 52)}px` });
    ui.label.classList.add('lv-on');
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
