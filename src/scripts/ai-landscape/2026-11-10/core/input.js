// Pointer and idle (SPEC 4.2, 4.6): where the mouse is, eased with the page's weight, and how long the
// visitor has been still. Touch has no pointer orbit. Any real input calls the listeners added with onInput,
// which is how a tour knows to stop.
export function createInput({ reduced = false } = {}) {
  const coarse = matchMedia('(hover: none), (pointer: coarse)').matches;
  const input = { x: 0, y: 0, tx: 0, ty: 0, px: -1, py: -1, moved: false, idle: 0, touch: coarse, down: false, reduced };
  const heard = new Set();
  const say = (kind, e) => { input.idle = 0; heard.forEach((fn) => fn(kind, e)); };
  let lastX = 0;
  let lastY = 0;

  const move = (e) => {
    if (e.pointerType === 'touch') return;
    input.px = e.clientX; input.py = e.clientY; input.moved = true;
    input.tx = (e.clientX / window.innerWidth) * 2 - 1;
    input.ty = (e.clientY / window.innerHeight) * 2 - 1;
    if (Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY) > 8) { lastX = e.clientX; lastY = e.clientY; say('move', e); }
  };
  const opts = { passive: true };
  window.addEventListener('pointermove', move, opts);
  window.addEventListener('pointerdown', (e) => { input.down = true; say('down', e); }, opts);
  window.addEventListener('pointerup', () => { input.down = false; }, opts);
  window.addEventListener('wheel', (e) => say('wheel', e), opts);
  window.addEventListener('touchstart', (e) => say('touch', e), opts);
  window.addEventListener('keydown', (e) => say('key', e));
  document.documentElement.addEventListener('mouseleave', () => { input.tx = 0; input.ty = 0; });

  // fn(kind, event) on every real input. Returns the function that stops listening.
  input.onInput = (fn) => { heard.add(fn); return () => { heard.delete(fn); }; };
  input.update = (dt) => {
    input.idle += dt;
    if (reduced || input.touch) { input.x = 0; input.y = 0; return; }
    const k = 1 - Math.exp(-3 * dt);
    input.x += (input.tx - input.x) * k;
    input.y += (input.ty - input.y) * k;
  };
  return input;
}
