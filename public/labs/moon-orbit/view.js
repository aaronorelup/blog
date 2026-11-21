// The picture: the Moon, the throws and a strip of the ball's height above the ground, on one canvas. World units are
// km with y up and the Moon's centre at 0, 0. The thrower stands at 0, R + 1. Nothing here does physics: it draws the
// points the engine flew, joining them with the curve their speeds give (Hermite), so a sparse path still draws round.
import { EDGE, HEIGHT, R } from './engine.js';

const PALETTES = {
  night: { sky0: '#0b0c18', sky1: '#151726', star: '242,231,213', moon0: '#c9c6bd', moon1: '#77746d', rim: 'rgba(242,231,213,0.25)',
    ground: '#9d998f', crater: 'rgba(20,20,30,0.10)', ball: '#fff6e0', path: '240,192,106', old: '201,188,169', text: '#f2e7d5',
    soft: '#9c917f', flat: '226,121,92', panel: 'rgba(16,18,32,0.78)', grid: 'rgba(242,231,213,0.12)', earth: '#4c86c6' },
  day: { sky0: '#fbf3e8', sky1: '#f3e7d2', star: '58,58,66', moon0: '#e7e1d6', moon1: '#b5ab9b', rim: 'rgba(58,58,66,0.35)',
    ground: '#d6cdbd', crater: 'rgba(58,58,66,0.08)', ball: '#3a3a42', path: '168,94,43', old: '122,108,93', text: '#3a3a42',
    soft: '#6b5e52', flat: '190,122,16', panel: 'rgba(251,243,232,0.86)', grid: 'rgba(58,58,66,0.12)', earth: '#3f78b5' },
};

// A fixed scatter of stars and craters, the same on every load.
function scatter(n, seed) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: n }, () => [rnd(), rnd(), rnd()]);
}
const STARS = scatter(170, 7);
const CRATERS = scatter(26, 11).map(([a, b, c]) => [a * 2 * Math.PI, Math.sqrt(b) * 0.92, 0.03 + 0.1 * c * c]);

// Position on a path at time t: [x, y], by cubic Hermite between the two points around it.
export function at(path, t) {
  let lo = 0;
  let hi = path.length - 1;
  if (t <= path[0][0]) return [path[0][1], path[0][2]];
  if (t >= path[hi][0]) return [path[hi][1], path[hi][2]];
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (path[mid][0] <= t) lo = mid;
    else hi = mid;
  }
  return hermite(path[lo], path[hi], t);
}
function hermite(a, b, t) {
  const d = b[0] - a[0];
  const u = (t - a[0]) / d;
  const u2 = u * u;
  const u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;
  return [h00 * a[1] + h10 * d * a[3] + h01 * b[1] + h11 * d * b[3], h00 * a[2] + h10 * d * a[4] + h01 * b[2] + h11 * d * b[4]];
}

export function createView(canvas) {
  const ctx = canvas.getContext('2d');
  let W = 1;
  let H = 1;
  let dpr = 1;
  let pal = PALETTES.night;
  const cam = { x: 0, y: 0, k: 1 };
  const box = { top: 56, text: 0, strip: 0 };

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    box.strip = H >= 300 ? Math.round(Math.min(130, H * 0.22)) : Math.round(Math.max(54, H * 0.24));
    box.top = W < 480 ? 44 : 54;
  }

  // The scale and centre that fit a box of world points into the main view, leaving room for the strip, the chips
  // and the readout (box.text, how far down the readout reaches, set by the lesson).
  function fit(b, strip) {
    const top = Math.max(box.top, box.text) + 8;
    const bottom = (strip ? box.strip : 0) + 30;
    const w = Math.max(b.x1 - b.x0, 4.5);
    const h = Math.max(b.y1 - b.y0, 2.2);
    const k = Math.min((W - 36) / w, (H - top - bottom) / h);
    const cx = 0.5 * (b.x0 + b.x1);
    const cy = 0.5 * (b.y0 + b.y1) - (bottom - top) / (2 * k);
    return { x: cx, y: cy, k };
  }
  // Ease the camera towards a target, scale in log terms so a zoom from the whole Moon to 5 km feels even.
  function follow(target, dt, snap) {
    const a = snap ? 1 : 1 - Math.exp(-dt / 0.28);
    const lk = Math.log(cam.k) + (Math.log(target.k) - Math.log(cam.k)) * a;
    cam.k = Math.exp(lk);
    cam.x += (target.x - cam.x) * a;
    cam.y += (target.y - cam.y) * a;
    return Math.abs(Math.log(target.k / cam.k)) < 0.002 && Math.hypot(target.x - cam.x, target.y - cam.y) * cam.k < 0.5;
  }
  const sx = (x) => W / 2 + (x - cam.x) * cam.k;
  const sy = (y) => H / 2 - (y - cam.y) * cam.k;

  function sky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.sky0);
    g.addColorStop(1, pal.sky1);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (const [a, b, c] of STARS) {
      ctx.fillStyle = `rgba(${pal.star},${0.18 + 0.5 * c})`;
      const z = c > 0.92 ? 1.6 : 1;
      ctx.fillRect(a * W, b * H, z, z);
    }
  }

  function moon() {
    const rpx = R * cam.k;
    const cxp = sx(0);
    const cyp = sy(0);
    const view = Math.hypot(W, H) / cam.k;
    if (rpx < 4 * Math.hypot(W, H)) {
      const g = ctx.createRadialGradient(cxp - rpx * 0.35, cyp - rpx * 0.4, rpx * 0.1, cxp, cyp, rpx);
      g.addColorStop(0, pal.moon0);
      g.addColorStop(1, pal.moon1);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cxp, cyp, rpx, 0, 2 * Math.PI);
      ctx.fill();
      if (rpx > 30 && rpx < 0.7 * Math.min(W, H)) {
        ctx.fillStyle = pal.crater;
        for (const [ang, rr, size] of CRATERS) {
          ctx.beginPath();
          ctx.arc(cxp + Math.cos(ang) * rr * rpx, cyp + Math.sin(ang) * rr * rpx, size * rpx * 0.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.strokeStyle = pal.rim;
      ctx.lineWidth = 1;
      ctx.stroke();
      return;
    }
    // Close in: the ground is a strip of the visible arc, filled down well past the bottom of the view.
    const mid = Math.atan2(cam.x, cam.y);
    const half = Math.min(Math.PI, (0.75 * view) / R);
    const n = 160;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = mid - half + (2 * half * i) / n;
      ctx.lineTo(sx(R * Math.sin(a)), sy(R * Math.cos(a)));
    }
    const deep = R - Math.min(R, view);
    for (let i = n; i >= 0; i--) {
      const a = mid - half + (2 * half * i) / n;
      ctx.lineTo(sx(deep * Math.sin(a)), sy(deep * Math.cos(a)));
    }
    ctx.closePath();
    const g = ctx.createLinearGradient(0, sy(R * Math.cos(mid)), 0, H);
    g.addColorStop(0, pal.ground);
    g.addColorStop(1, pal.moon1);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = pal.rim;
    ctx.stroke();
  }

  // The thrower on a 1 km pillar of rock, drawn to scale when it is big enough to see, as a marker when not.
  function thrower(label) {
    const x = sx(0);
    const yTop = sy(R + HEIGHT);
    const yFoot = sy(R);
    ctx.fillStyle = pal.ground;
    if (yFoot - yTop > 6) {
      const w = Math.max(3, Math.min(40, 0.35 * cam.k));
      ctx.beginPath();
      ctx.moveTo(x - w * 1.6, yFoot + 2);
      ctx.lineTo(x - w * 0.5, yTop);
      ctx.lineTo(x + w * 0.5, yTop);
      ctx.lineTo(x + w * 1.6, yFoot + 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = pal.text;
    ctx.beginPath();
    ctx.arc(x, yTop - 7, 2.6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillRect(x - 1.2, yTop - 5, 2.4, 5);
    if (label) {
      ctx.font = '12px Karla, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = pal.soft;
      ctx.fillText(label, x + 8, yTop - 4);
    }
  }

  // A path up to time t, skipping points closer than a pixel and a half, rounding long gaps with Hermite.
  function trail(path, t, rgb, alpha, width) {
    if (!path || path.length < 2) return;
    ctx.strokeStyle = `rgba(${rgb},${alpha})`;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    let px = sx(path[0][1]);
    let py = sy(path[0][2]);
    ctx.moveTo(px, py);
    for (let i = 1; i < path.length; i++) {
      const b = path[i];
      const a = path[i - 1];
      const end = Math.min(b[0], t);
      const bx = sx(b[1]);
      const by = sy(b[2]);
      const gap = Math.hypot(bx - px, by - py);
      if (gap < 1.5 && end === b[0] && i < path.length - 1) continue;
      const parts = Math.min(24, Math.max(1, Math.ceil(gap / 8)));
      for (let j = 1; j <= parts; j++) {
        const tt = a[0] + ((end - a[0]) * j) / parts;
        const [x, y] = hermite(a, b, tt);
        px = sx(x);
        py = sy(y);
        ctx.lineTo(px, py);
      }
      if (b[0] >= t) break;
    }
    ctx.stroke();
  }

  function ball(x, y) {
    const bx = sx(x);
    const by = sy(y);
    ctx.fillStyle = `rgba(${pal.path},0.25)`;
    ctx.beginPath();
    ctx.arc(bx, by, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = pal.ball;
    ctx.beginPath();
    ctx.arc(bx, by, 3.2, 0, 2 * Math.PI);
    ctx.fill();
  }

  function tick(x, y, text) {
    const bx = sx(x);
    const by = sy(y);
    ctx.strokeStyle = `rgba(${pal.path},0.9)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx - 4, by - 4);
    ctx.lineTo(bx + 4, by + 4);
    ctx.moveTo(bx + 4, by - 4);
    ctx.lineTo(bx - 4, by + 4);
    ctx.stroke();
    if (!text) return;
    ctx.font = '600 12px Karla, system-ui, sans-serif';
    ctx.textAlign = bx > W - 90 ? 'right' : 'left';
    ctx.fillStyle = pal.text;
    ctx.fillText(text, bx + (bx > W - 90 ? -8 : 8), by - 8);
  }

  // Where Earth's pull takes over, once the view is big enough to show it, labelled where the ball meets it.
  function edgeRing(meet) {
    const rpx = EDGE * cam.k;
    if (rpx > 4 * Math.hypot(W, H) || rpx < 20) return;
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(sx(0), sy(0), rpx, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    if (!meet) return;
    const a = Math.atan2(meet[0], meet[1]);
    const lx = sx(0.86 * EDGE * Math.sin(a));
    const ly = sy(0.86 * EDGE * Math.cos(a));
    ctx.font = '12px Karla, system-ui, sans-serif';
    ctx.fillStyle = pal.soft;
    ctx.textAlign = lx > W / 2 ? 'right' : 'left';
    ctx.fillText("60,000 km: Earth's pull takes over", Math.max(12, Math.min(W - 12, lx)), Math.max(box.top + 20, Math.min(H - 40, ly)));
  }

  // A scale bar of a round length about a fifth of the view.
  function scaleBar(bottom) {
    const target = (W * 0.2) / cam.k;
    const p = 10 ** Math.floor(Math.log10(target));
    const len = [1, 2, 5, 10].map((m) => m * p).filter((v) => v <= target).pop() || p;
    const px = len * cam.k;
    const x = 16;
    const y = H - bottom - 14;
    ctx.strokeStyle = pal.soft;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y);
    ctx.lineTo(x + px, y);
    ctx.lineTo(x + px, y - 4);
    ctx.stroke();
    ctx.font = '11px Karla, system-ui, sans-serif';
    ctx.fillStyle = pal.soft;
    ctx.textAlign = 'left';
    ctx.fillText(`${len >= 1 ? len.toLocaleString('en-US') : len} km`, x + px + 6, y + 3);
  }

  // The height strip: height above the ground against distance along it, with the same throw on flat ground dashed.
  function strip(s) {
    const h = box.strip;
    const top = H - h;
    ctx.fillStyle = pal.panel;
    ctx.fillRect(0, top, W, h);
    ctx.strokeStyle = pal.grid;
    ctx.beginPath();
    ctx.moveTo(0, top + 0.5);
    ctx.lineTo(W, top + 0.5);
    ctx.stroke();
    const left = 44;
    const right = W - 14;
    const y0 = H - 18;
    const y1 = top + 20;
    const xs = (d) => left + (d / s.xMax) * (right - left);
    const ys = (a) => y0 - (a / s.yMax) * (y0 - y1);
    ctx.font = '11px Karla, system-ui, sans-serif';
    ctx.fillStyle = pal.soft;
    ctx.textAlign = 'left';
    ctx.fillText('Height above the ground, against distance along it', left, top + 13);
    ctx.textAlign = 'right';
    const yTick = niceStep(s.yMax / (h < 100 ? 1.05 : 2.2));
    ctx.strokeStyle = pal.grid;
    ctx.beginPath();
    for (let v = 0; v <= s.yMax + 1e-9; v += yTick) {
      ctx.moveTo(left, Math.round(ys(v)) + 0.5);
      ctx.lineTo(right, Math.round(ys(v)) + 0.5);
      ctx.fillText(v ? fmtKm(v) : '0', left - 6, ys(v) + 4);
    }
    ctx.stroke();
    const xTick = niceStep(s.xMax / 4.5);
    ctx.textAlign = 'center';
    for (let d = xTick; d < s.xMax * 0.97; d += xTick) ctx.fillText(fmtKm(d), xs(d), y0 + 13);
    if (s.flat) {
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = `rgba(${pal.flat},0.9)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const n = 40;
      for (let i = 0; i <= n; i++) {
        const d = (s.flat.range * i) / n;
        ctx.lineTo(xs(d), ys(HEIGHT * (1 - (d / s.flat.range) ** 2)));
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(${pal.flat},1)`;
      ctx.textAlign = xs(s.flat.range) > right - 120 ? 'right' : 'left';
      ctx.fillText(`flat ground: ${fmtKm(s.flat.range)}`, xs(s.flat.range) + (ctx.textAlign === 'right' ? -4 : 4), ys(0) - 5);
    }
    if (s.points.length > 1) {
      ctx.strokeStyle = `rgba(${pal.path},1)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      let last = -1;
      for (const [d, a] of s.points) {
        const x = xs(d);
        if (x - last < 0.8) continue;
        ctx.lineTo(x, ys(Math.max(0, a)));
        last = x;
      }
      ctx.stroke();
      const [d, a] = s.points[s.points.length - 1];
      ctx.fillStyle = pal.ball;
      ctx.beginPath();
      ctx.arc(xs(d), ys(Math.max(0, a)), 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  function draw(scene) {
    pal = PALETTES[scene.mode] || PALETTES.night;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sky();
    const cur = scene.current;
    const tail = cur && cur.path[cur.path.length - 1];
    edgeRing(cur && cur.t >= tail[0] && Math.hypot(tail[1], tail[2]) > 0.99 * EDGE ? [tail[1], tail[2]] : null);
    moon();
    for (const old of scene.old) trail(old.path, Infinity, pal.old, 0.38, 1.5);
    for (const old of scene.old) if (old.fate === 'landed') tick(old.end.x, old.end.y, '');
    if (cur) {
      trail(cur.path, cur.t, pal.path, 1, 2.2);
      if (cur.mark) tick(cur.end.x, cur.end.y, cur.mark);
    }
    thrower(cam.k > 6 ? 'you, 1 km up' : cam.k > 0.15 && !cur ? 'you are here' : '');
    if (cur) ball(cur.x, cur.y);
    const stripOn = !!scene.strip;
    scaleBar(stripOn ? box.strip : 0);
    if (stripOn) strip(scene.strip);
  }

  return { resize, fit, follow, draw, cam, size: () => ({ W, H }), box };
}

// A round step about as big as x: 1, 2 or 5 times a power of ten.
function niceStep(x) {
  const p = 10 ** Math.floor(Math.log10(x));
  return [1, 2, 5, 10].map((m) => m * p).find((v) => v >= x) || 10 * p;
}

export function fmtKm(km) {
  if (km >= 100) return `${Math.round(km).toLocaleString('en-US')} km`;
  if (km >= 10) return `${km.toFixed(1)} km`;
  return `${km.toFixed(km >= 1 ? 1 : 2)} km`;
}
