// Petals, fireflies, dust and the projector's beam on the one 2D canvas, from the time alone (1.5): a few things on
// slow sines, seeded, so the same time gives the same picture; with ?still=1 or reduced motion the time is held and
// the canvas is one fixed picture. Which scene asks for what is the scene's own data (`ambient`, a list of kinds);
// the hero's garden has a few petals and fireflies whatever its data says, until the hero's builder gives its own.
import { hash01 } from './tracks.js';

const KINDS = { 'hero/main': ['petals', 'fireflies'] };

export function kindsOf(key, L) {
  return L.scenes[key]?.ambient ?? KINDS[key] ?? [];
}

function petals(g, t, w, h) {
  for (let i = 0; i < 9; i++) {
    const a = hash01(i * 7 + 1), b = hash01(i * 7 + 2), c = hash01(i * 7 + 3);
    const speed = 0.012 + 0.01 * b;                 // screens a second, falling
    const y = ((a + t * speed) % 1.15) - 0.08;
    const x = (c + 0.03 * Math.sin(t * 0.4 + i * 1.7) + y * 0.12) % 1;
    const turn = t * (0.5 + b) + i;
    g.save();
    g.translate(x * w, y * h);
    g.rotate(turn);
    g.scale(1, 0.55 + 0.35 * Math.sin(turn * 0.7));
    g.fillStyle = 'rgba(232, 168, 190, 0.85)';
    g.beginPath();
    g.ellipse(0, 0, 5 * (0.8 + b * 0.4), 3.2, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
}

function fireflies(g, t, w, h) {
  for (let i = 0; i < 6; i++) {
    const a = hash01(i * 11 + 5), b = hash01(i * 11 + 6), c = hash01(i * 11 + 7);
    const x = (0.15 + 0.7 * a + 0.02 * Math.sin(t * 0.3 + i)) * w;
    const y = (0.6 + 0.3 * b + 0.015 * Math.cos(t * 0.37 + i * 2)) * h;
    const glow = 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(t * (0.8 + c) + i * 3));
    const r = 9;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(255, 232, 160, ${glow})`);
    grad.addColorStop(0.25, `rgba(255, 216, 146, ${glow * 0.5})`);
    grad.addColorStop(1, 'rgba(255, 216, 146, 0)');
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
}

// Draws the ambient things of the scene that is on. Returns whether anything time-driven is in view (the engine then
// asks for a frame every tick).
export function drawAmbient(canvas, a, L) {
  if (!canvas) return false;
  const g = canvas.getContext('2d');
  const k = canvas.width / L.vw;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, canvas.width, canvas.height);
  const kinds = kindsOf(a.scene, L);
  if (!kinds.length) return false;
  g.setTransform(k, 0, 0, k, 0, 0);
  if (kinds.includes('petals')) petals(g, a.t, L.vw, L.vh);
  if (kinds.includes('fireflies')) fireflies(g, a.t, L.vw, L.vh);
  return true;
}
