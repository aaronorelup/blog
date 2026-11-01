// The overlay's frame on the homepage (#panel-screen, #panel-card): it grows out of the card that was clicked, or
// appears at once (Back, a deep link), fills the window less a margin, follows resizes, and shrinks back into its
// card, 560 ms each way. Each call cancels the steps still pending from the one before.
const MOVE = 'cubic-bezier(.4,0,.2,1)';
const SIDES = ['left', 'top', 'width', 'height'];
const TRANSITION = SIDES.map((p) => `${p} 560ms ${MOVE}`).join(',') + ',opacity 380ms ease';
const screen = document.getElementById('panel-screen');
const card = document.getElementById('panel-card');
const inner = document.getElementById('panel-inner');
const scrim = document.getElementById('panel-scrim');
let from = null;       // the card it grew out of, and shrinks back into
let timers = [];

const later = (ms, fn) => timers.push(setTimeout(fn, ms));

// Nearly the whole window, with a consistent margin on every side.
function full() {
  const mx = Math.max(14, Math.min(48, innerWidth * 0.025));
  const my = Math.max(14, Math.min(34, innerHeight * 0.03));
  return { left: mx, top: my, width: innerWidth - mx * 2, height: innerHeight - my * 2 };
}

function place(box, opacity, moving) {
  card.style.transition = moving ? TRANSITION : 'none';
  for (const k of SIDES) card.style[k] = box[k] + 'px';
  card.style.opacity = opacity;
}

function shown(on) {
  timers.forEach(clearTimeout);
  timers = [];
  screen.style.visibility = on ? 'visible' : 'hidden';
  screen.style.pointerEvents = on ? 'auto' : 'none';
  screen.setAttribute('aria-hidden', String(!on));
}

// covered() once it fills the window.
export function grow(src, covered) {
  shown(true);
  from = src;
  if (src) place(src.getBoundingClientRect(), '0.55', false); else place(full(), '0', false);
  inner.style.opacity = '0';
  scrim.style.opacity = '1';
  later(40, () => place(full(), '1', true));
  later(300, () => { inner.style.opacity = '1'; });
  later(600, covered);
}

export function appear(covered) {
  shown(true);
  from = null;
  place(full(), '1', false);
  inner.style.opacity = '1';
  scrim.style.opacity = '1';
  later(0, covered);
}

// done() once it has gone.
export function shrink(done) {
  shown(true);
  inner.style.opacity = '0';
  scrim.style.opacity = '0';
  place(from ? from.getBoundingClientRect() : full(), '0', true);
  later(540, () => { shown(false); done(); });
}

export const fit = () => place(full(), '1', false);
