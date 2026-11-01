// The coin: Aaron's face on the hero card. Hover breathes, a click tosses it up and spins it like a flipped coin, and
// it lands on a face: his, or the reverse (a bonsai by day, a lit andon after dark, which fades in with --mix). Five
// night tosses in a row open the lantern door (lantern.js).
import { landed, tossed } from './lantern.js';

export function bindCoin() {
  const btn = document.getElementById('avatar'),
        toss = document.getElementById('avatar-toss'),
        spin = document.getElementById('avatar-spin'),
        rim = document.getElementById('coin-rim');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // stacked discs between the two faces read as milled edge when the coin turns edge-on
  for (let i = -6; i <= 6; i++) {
    const d = document.createElement('span');
    const inset = Math.abs(i) > 4 ? 2 : 0;
    d.style.cssText = 'position:absolute;inset:' + inset + 'px;border-radius:50%;background:' +
      (i % 2 ? '#4A4A50' : '#3A3A42') + ';transform:translateZ(' + i + 'px)';
    rim.appendChild(d);
  }

  btn.addEventListener('pointerenter', () => {
    if (btn.dataset.busy || reduce) return;
    toss.style.animation = 'avatar-bob 1.6s ease-in-out infinite';
  });
  btn.addEventListener('pointerleave', () => {
    if (!btn.dataset.busy) toss.style.animation = '';
  });

  // the card's backdrop-filter flattens the 3D context, so backface-visibility and
  // depth sorting can't be trusted — drive the turn and swap the faces by hand
  const [front, back] = Array.from(spin.children).filter(c => c !== rim);
  const show = (deg) => {
    const facing = Math.cos(deg * Math.PI / 180);
    const edge = Math.abs(facing) < 0.06;
    front.style.opacity = (!edge && facing > 0) ? '1' : '0';
    back.style.opacity = (!edge && facing < 0) ? '1' : '0';
  };
  let turn = 0;
  show(0);

  btn.addEventListener('click', () => {
    if (btn.dataset.busy) return;
    btn.dataset.busy = '1';
    const lit = tossed(performance.now());
    let half = 3 + Math.floor(Math.random() * 5);     // odd counts land on the bonsai
    if (lit && Math.round((turn + half * 180) / 180) % 2 === 0) half++;
    const dur = reduce ? 420 : 1150;
    const from = turn, to = from + half * 180;
    toss.style.animation = '';
    void toss.offsetWidth;                            // restart cleanly on repeat clicks
    if (!reduce) toss.style.animation = 'avatar-hop ' + dur + 'ms cubic-bezier(.32,.05,.36,1)';

    const t0 = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 2.6);     // fast off the thumb, slows as it lands
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const deg = from + (to - from) * ease(p);
      spin.style.transform = 'rotateY(' + deg + 'deg)';
      show(deg);
      if (p < 1) { requestAnimationFrame(tick); return; }
      turn = to % 360;
      toss.style.animation = '';
      const done = () => { delete btn.dataset.busy; };
      if (!landed(back, done)) done();               // a lit toss stays busy: we're leaving
    };
    requestAnimationFrame(tick);
  });
}
