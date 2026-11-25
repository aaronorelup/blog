// The tablecloth demo's drawing (AO-092): a side view of the table, cloth and dish (a "lane"), and the graph of the
// push from the cloth and the brake from the table against time, whose areas are the speed given and taken. Canvas
// 2D, coloured from the page's own tokens so day and night both work. Every position, time and force drawn comes from
// a run of sim.js; only the tumble of a dish that has gone over the edge is drawing.

export const H_TABLE = 0.75;

export function palette(el) {
  const cs = getComputedStyle(el);
  const v = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  const day = document.documentElement.dataset.mode === 'day';
  return {
    day,
    tile: v('--pc-tile', '#201F2C'),
    head: v('--pc-head', '#F0C06A'),
    strong: v('--pc-strong', '#F2E7D5'),
    body: v('--pc-body', '#C9BCA9'),
    soft: v('--pc-soft', '#9C917F'),
    line: v('--pc-line', '#302E3E'),
    line2: v('--pc-line2', '#4A445A'),
    accent: v('--pc-accent', '#E2795C'),
    woodTop: day ? '#C4874F' : '#8A5A36',
    woodSide: day ? '#9A5F36' : '#5B3A26',
    cloth: day ? '#F3E7D2' : '#E9DCC4',
    clothEdge: day ? '#C2603F' : '#B8573A',
    plate: '#F6EFE2',
    plateLine: day ? '#8F8270' : '#B9A98F',
    rim: '#C9A227',
    glass: day ? 'rgba(80,110,140,0.55)' : 'rgba(190,215,235,0.7)',
    tea: '#B8622E',
  };
}

// Size a canvas to its box at the screen's pixel density and return its context in CSS pixels.
export function fit(canvas, cssW, cssH) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(cssW * dpr));
  const hh = Math.max(1, Math.round(cssH * dpr));
  if (canvas.width !== w || canvas.height !== hh) {
    canvas.width = w;
    canvas.height = hh;
  }
  canvas.style.height = `${cssH}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  return ctx;
}

export const font = (size, weight = 600, mono = false) =>
  `${weight} ${size}px ${mono ? '"JetBrains Mono", ui-monospace, monospace' : 'Karla, system-ui, sans-serif'}`;

function arrow(ctx, x1, y, x2, color, width = 3) {
  const dir = Math.sign(x2 - x1) || 1;
  const head = Math.min(9, Math.abs(x2 - x1) * 0.6);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2 - dir * head * 0.7, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y);
  ctx.lineTo(x2 - dir * head, y - head * 0.62);
  ctx.lineTo(x2 - dir * head, y + head * 0.62);
  ctx.closePath();
  ctx.fill();
}

// A label that stays inside [lo, hi] horizontally.
function label(ctx, text, x, y, color, size = 12, align = 'center', lo = 0, hi = Infinity, weight = 600) {
  ctx.font = font(size, weight);
  const w = ctx.measureText(text).width;
  let left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  left = Math.max(lo + 2, Math.min(hi - w - 2, left));
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, left, y);
}

// The dish's outline in metres, x across, y up from its foot.
const SHAPES = {
  plate: (r) => [[-0.045, 0], [0.045, 0], [0.05, 0.006], [r, 0.019], [r, 0.023], [r - 0.035, 0.017], [-(r - 0.035), 0.017], [-r, 0.023], [-r, 0.019], [-0.05, 0.006]],
  glass: (r, hgt) => [[-r, 0], [r, 0], [r + 0.006, hgt], [-(r + 0.006), hgt]],
};

function drawDish(ctx, P, spec, cx, baseY, s, angle) {
  const plate = spec.kind !== 'glass';
  const pts = plate ? SHAPES.plate(spec.diameter / 2) : SHAPES.glass(spec.diameter / 2, spec.height || 0.12);
  const tall = plate ? 0.023 : spec.height || 0.12;
  const ky = plate ? Math.max(1, 7 / (tall * s)) : 1; // a plate is drawn at least 7 px thick
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.rotate(angle);
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px * s, -py * s * ky) : ctx.moveTo(px * s, -py * s * ky)));
  ctx.closePath();
  if (plate) {
    ctx.fillStyle = P.plate;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = P.plateLine;
    ctx.stroke();
    ctx.fillStyle = P.rim;
    const r = spec.diameter / 2;
    ctx.fillRect(-r * s, -0.023 * s * ky - 1, 4, 2);
    ctx.fillRect(r * s - 4, -0.023 * s * ky - 1, 4, 2);
  } else {
    const r = spec.diameter / 2;
    const hgt = spec.height || 0.12;
    ctx.fillStyle = P.tea;
    ctx.beginPath();
    ctx.moveTo(-r * s + 2, -0.012 * s);
    ctx.lineTo(r * s - 2, -0.012 * s);
    ctx.lineTo((r + 0.004) * s - 2, -hgt * 0.7 * s);
    ctx.lineTo(-(r + 0.004) * s + 2, -hgt * 0.7 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px * s, -py * s) : ctx.moveTo(px * s, -py * s)));
    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = P.glass;
    ctx.stroke();
  }
  ctx.restore();
  return tall * s * ky;
}

// One side view. lane: {x, y, w, h, wx0, wx1, L} (box in CSS px, the metres shown, the edge). frame: {c, d} where c
// is the cloth's back edge (m) and d the dish's state from the simulation. spec: the dish. opts: {mass, pxPerN,
// arrows, room, backEdge, title, outcome}.
export function drawLane(ctx, P, lane, frame, spec, opts = {}) {
  const { x, y, w, h, wx0, wx1, L } = lane;
  const s = w / (wx1 - wx0);
  const X = (m) => x + (m - wx0) * s;
  const top = Math.round(y + h * (opts.topAt ?? 0.48));
  const narrow = w < 420;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // the table: its top, its near end and a leg
  const th = Math.max(6, 0.035 * s);
  const x0 = X(Math.max(wx0, 0));
  ctx.fillStyle = P.woodSide;
  ctx.fillRect(x0, top, X(L) - x0, th);
  ctx.fillStyle = P.woodTop;
  ctx.fillRect(x0, top, X(L) - x0, 2);
  const legW = Math.max(5, 0.05 * s);
  ctx.fillStyle = P.woodSide;
  ctx.fillRect(X(L - 0.06) - legW / 2, top + th, legW, h);
  if (wx0 < 0.06) ctx.fillRect(X(0.06) - legW / 2, top + th, legW, h);

  // the cloth: on the table from its back edge to the near edge, then down over the edge, pulled toward you
  const c = frame.c;
  const ct = 4;
  ctx.fillStyle = P.cloth;
  if (c < L) {
    const a = X(Math.max(c, wx0));
    ctx.fillRect(a, top - ct, X(L) - a, ct);
    ctx.fillStyle = P.clothEdge;
    ctx.fillRect(a, top - 1, X(L) - a, 1);
    ctx.fillStyle = P.cloth;
  }
  const hangTop = top - ct + Math.max(0, c - L) * s;
  ctx.fillRect(X(L), Math.max(top - ct, hangTop), ct, y + h - hangTop + 4);

  // the cloth's back edge, the end that has to pass under the dish
  if (opts.backEdge && c > wx0 && c < L - 0.01) {
    ctx.strokeStyle = P.clothEdge;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(X(c), top - ct - 9);
    ctx.lineTo(X(c), top - ct);
    ctx.stroke();
    label(ctx, narrow ? 'back edge' : "cloth's back edge", X(c) - 3, top - ct - 3, P.soft, 11, 'right', x, x + w, 400);
  }

  // the dish
  const d = frame.d;
  const falling = d.phase === 'falling' || d.phase === 'down';
  let dishTop = top;
  if (d.phase !== 'down') {
    const drop = falling ? (H_TABLE - d.y) * s : 0;
    const tumble = falling ? Math.min(1, (H_TABLE - d.y) / 0.35) * (spec.kind === 'glass' ? 1.5 : 1.3) : 0;
    const onCloth = c < d.x && !falling;
    const baseY = top - (onCloth ? ct : 0) + drop;
    dishTop = baseY - drawDish(ctx, P, spec, X(d.x), baseY, s, tumble);
  }

  // the forces on it, from the simulation's acceleration times the dish's mass
  const mass = opts.mass ?? spec.mass ?? 0.6;
  if (opts.arrows && !falling) {
    const F = mass * (d.f || 0);
    const ay = Math.min(dishTop, top - ct - 2) - 12;
    const maxLen = Math.max(30, w * 0.42);
    const len = Math.min(maxLen, Math.max(12, Math.abs(F) * (opts.pxPerN ?? 22)));
    const cx = X(d.x);
    if (F > 0.0005) {
      arrow(ctx, cx - len / 2, ay, cx + len / 2, P.head);
      label(ctx, `${narrow ? 'push' : 'cloth pushes'} ${F.toFixed(2)} N`, cx, ay - 9, P.head, 12, 'center', x, x + w);
    } else if (F < -0.0005) {
      arrow(ctx, cx + len / 2, ay, cx - len / 2, P.accent);
      label(ctx, `${narrow ? 'brake' : 'table brakes'} ${Math.abs(F).toFixed(2)} N`, cx, ay - 9, P.accent, 12, 'center', x, x + w);
    } else if (d.phase === 'riding') {
      label(ctx, 'riding on the cloth', cx, ay - 4, P.body, 12, 'center', x, x + w);
    }
  }

  // how far it has slid, against the room it has before the edge
  if (opts.room) {
    const ry = top + th + 12;
    const xs = X(spec.x0);
    const xe = X(L);
    ctx.strokeStyle = P.line2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xs, ry);
    ctx.lineTo(xe, ry);
    ctx.stroke();
    const slid = Math.max(0, Math.min(d.x, L) - spec.x0);
    ctx.strokeStyle = falling ? P.accent : P.head;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(xs, ry);
    ctx.lineTo(xs + slid * s, ry);
    ctx.stroke();
    ctx.fillStyle = P.line2;
    ctx.fillRect(xs - 1, ry - 5, 2, 10);
    ctx.fillRect(xe - 1, ry - 5, 2, 10);
    const room = (L - spec.x0) * 100;
    const txt = falling ? `over the edge after ${room.toFixed(0)} cm` : `slid ${(slid * 100).toFixed(1)} of ${room.toFixed(0)} cm`;
    label(ctx, txt, xs - 10, ry + 4, falling ? P.accent : P.body, 12, 'right', x, xs - 6, 600);
  }

  if (opts.title) label(ctx, opts.title, x + 4, y + 16, P.strong, 13, 'left', x, x + w);
  if (opts.outcome) {
    const col = opts.outcome.bad ? P.accent : P.head;
    if (narrow && opts.title) label(ctx, opts.outcome.text, x + 4, y + 33, col, 13, 'left', x, x + w);
    else label(ctx, opts.outcome.text, x + w - 4, y + 16, col, 13, 'right', x, x + w);
  }
  if (d.phase === 'down' || (falling && d.y < H_TABLE - 0.2)) label(ctx, 'fell off', X(L) + 6, top + 30, P.accent, 12, 'left', x, x + w);
  ctx.restore();
}

// The push from the cloth (above the line) and the brake from the table (below) against time, up to time t. The push
// times its duration is the speed the cloth gives the dish, times the dish's mass. ev: {push, pushEnd, brake,
// brakeEnd, over} in N and s. scale: {T, F} the axes' ends.
export function drawImpulse(ctx, P, box, ev, t, scale, opts = {}) {
  const { x, y, w, h } = box;
  const narrow = w < 360;
  const left = x + (narrow ? 8 : 10);
  const right = x + w - 8;
  const y0 = Math.round(y + h * 0.56);
  const upPx = y0 - (y + 38);
  const downPx = y + h - 18 - y0;
  const X = (sec) => left + (Math.min(sec, scale.T) / scale.T) * (right - left);
  const Up = (N) => (Math.min(N, scale.F) / scale.F) * upPx;
  const Dn = (N) => (Math.min(N, scale.F) / scale.F) * downPx;

  // time ticks
  ctx.font = font(10, 400, true);
  ctx.fillStyle = P.soft;
  const step = scale.T > 0.9 ? 0.2 : 0.1;
  for (let s = step; s < scale.T - 1e-9; s += step) {
    ctx.fillRect(X(s), y0 - 2, 1, 4);
    if (!narrow || Math.round(s * 10) % 2 === 0) ctx.fillText(`${s.toFixed(1)} s`, X(s) - 9, y + h - 4);
  }

  // the push
  const pEnd = Math.min(t, ev.pushEnd);
  if (ev.push > 0 && pEnd > 0) {
    ctx.fillStyle = P.head;
    ctx.globalAlpha = 0.28;
    ctx.fillRect(X(0), y0 - Up(ev.push), X(pEnd) - X(0), Up(ev.push));
    ctx.globalAlpha = 1;
    ctx.strokeStyle = P.head;
    ctx.lineWidth = 2;
    ctx.strokeRect(X(0), y0 - Up(ev.push), X(pEnd) - X(0), Up(ev.push));
  }
  // the brake
  if (ev.brake > 0 && t > ev.pushEnd) {
    const bEnd = Math.min(t, ev.brakeEnd);
    ctx.fillStyle = P.accent;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(X(ev.pushEnd), y0, X(bEnd) - X(ev.pushEnd), Dn(ev.brake));
    ctx.globalAlpha = 1;
    ctx.strokeStyle = P.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(X(ev.pushEnd), y0, X(bEnd) - X(ev.pushEnd), Dn(ev.brake));
  }
  // the axis and the moment shown
  ctx.fillStyle = P.line2;
  ctx.fillRect(left, y0, right - left, 1.5);
  ctx.fillRect(X(Math.min(t, scale.T)), y + 18, 1, h - 34);

  ctx.font = font(11);
  const k1 = 'push from the cloth';
  const w1 = ctx.measureText(k1).width;
  ctx.fillStyle = P.head;
  ctx.fillRect(left, y + 5, 9, 9);
  label(ctx, k1, left + 13, y + 13, P.head, 11, 'left', x, x + w);
  ctx.fillStyle = P.accent;
  ctx.fillRect(left + w1 + 28, y + 5, 9, 9);
  label(ctx, 'brake from the table', left + w1 + 41, y + 13, P.accent, 11, 'left', x, x + w);

  // the area, once the push is over: force times time is the speed given (per kilogram of dish)
  if (t >= ev.pushEnd && ev.push > 0 && opts.speed != null) {
    const J = ev.push * ev.pushEnd;
    const txt = narrow
      ? `${J.toFixed(2)} N·s, so ${opts.speed.toFixed(2)} m/s`
      : `${ev.push.toFixed(2)} N × ${ev.pushEnd.toFixed(3)} s = ${J.toFixed(2)} N·s, so ${opts.speed.toFixed(2)} m/s`;
    label(ctx, txt, X(0) + 4, Math.max(y + 32, y0 - Up(ev.push) - 6), P.strong, 12, 'left', x, x + w);
  }
  if (ev.over != null && t >= ev.over) {
    label(ctx, 'over the edge', X(ev.over) + 4, y0 + 16, P.accent, 12, 'left', x, x + w);
  }
}
