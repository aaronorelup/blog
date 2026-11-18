// Steam: up to 80 wisps lifting off the tea on buoyancy and curl noise, as many as its heat gives (Newton's law in
// brew.js: emission follows T - T_air). At night the lamp lights it from behind, so it glows on the lamp's side and
// all but vanishes on the far one; by day steam is invisible and only its moving shadow crosses the tray. Last of all
// one thread rises alone and breaks.
import { curl2, mulberry32, smooth } from './rng.js';

const MAX = 80;

export function makeSteam(seed) {
  return { ps: [], rng: mulberry32(seed + 77), acc: 0, lastThread: false };
}

export function stepSteam(st, s, dt) {
  const heat = s.W > 0.05 ? s.temp : 0;
  const ending = s.phase === 'rest';
  st.acc += dt * 30 * heat * heat * (ending ? 0 : 1);
  while (st.acc >= 1 && st.ps.length < MAX) {
    st.acc -= 1;
    const a = st.rng() * Math.PI * 2, r = Math.sqrt(st.rng()) * 0.7;
    st.ps.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, age: 0, life: 2.2 + st.rng() * 1.6, seed: st.rng() * 100, k: 1 });
  }
  if (st.acc > 1) st.acc = 1;
  if (ending && !st.lastThread && s.t > s.revealT + 5.6) {
    st.lastThread = true;
    st.ps.push({ x: -0.12, y: 0.06, age: 0, life: 4.6, seed: 42, k: 1.6, last: true });
  }
  for (const p of st.ps) {
    p.age += dt;
    const [ex, ey] = curl2(p.x * 2 + p.seed, p.y * 2 + s.t * 0.2, 3);
    p.x += (ex * 0.06 + p.x * 0.05 + 0.02) * dt;
    p.y += (ey * 0.06 + p.y * 0.05 - 0.03) * dt;
  }
  st.ps = st.ps.filter((p) => p.age < p.life);
}

// A soft puff, made once per color: steam is drawn as overlapping puffs stretched along each wisp.
const sprites = {};
function puff(rgb) {
  if (sprites[rgb]) return sprites[rgb];
  const c = document.createElement('canvas'), x = c.getContext('2d');
  c.width = c.height = 64;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(${rgb},0.9)`); g.addColorStop(0.45, `rgba(${rgb},0.35)`); g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return (sprites[rgb] = c);
}

export function drawSteam(ctx, st, v, pal) {
  const day = pal.mode === 'day', img = puff(day ? '92,62,40' : '246,231,200');
  for (const p of st.ps) {
    const q = p.age / p.life, fade = Math.sin(Math.PI * q) * (p.last ? 1.5 : 1);
    const h = (0.1 + 0.5 * q) * v.R;               // how high it has risen: its shadow falls further off
    const ox = day ? h * 0.28 : 0, oy = day ? h * 0.36 : 0;
    const lit = day ? 1 : 0.1 + 0.9 * Math.max(0, Math.min(1, 0.45 - (p.x * 0.6 + p.y * 0.8)));
    const len = (0.12 + 0.34 * q) * v.R * p.k, wid = (0.035 + 0.07 * q) * v.R;
    const breaks = p.last ? smooth(0.55, 0.9, q) : 0;
    for (let j = 0; j < 4; j++) {
      const u = (j + 0.5) / 4 - 0.5;
      if (breaks && Math.abs(u) < breaks * 0.3) continue;   // the last thread parts in the middle
      const ang = p.seed + p.age * 0.5 + Math.sin(u * 2.4 + p.seed + p.age * 1.3) * 0.5;
      const x = v.cx + p.x * v.R + Math.cos(ang) * len * u + ox, y = v.cy + p.y * v.R + Math.sin(ang) * len * u + oy;
      ctx.setTransform(Math.cos(ang), Math.sin(ang), -Math.sin(ang), Math.cos(ang), x, y);
      ctx.globalAlpha = Math.min(1, (day ? 0.07 : 0.085) * fade * lit);
      ctx.drawImage(img, -len * 0.22, -wid / 2, len * 0.44, wid);
    }
  }
  ctx.globalAlpha = 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// The still life's one painted thread of steam (reduced motion).
export function stillThread(st) {
  st.ps = [{ x: -0.1, y: 0.04, age: 1.6, life: 4.6, seed: 42, k: 1.6, last: false }];
}
