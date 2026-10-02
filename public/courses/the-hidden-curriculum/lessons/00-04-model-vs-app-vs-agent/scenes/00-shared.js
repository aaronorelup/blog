/* 00.04 Model vs app vs agent — shared drawing (window.M)
   The lesson's one recurring object is "the engine, the car, the wheel":
     the ENGINE (the model): a gold-lined block with two truly meshing gears, a port either side (text in / text out);
     the CAR (the app): a side-view car, nose right, built around that engine (engine sits in the hood slot),
       its side window is literally a "chat" window;
     the WHEEL (the agent): a steering ring behind the windshield, a roof rack of tools, a loop around the car,
       and you, the passenger, in the cabin.
   Every scene draws these through M.engine / M.car / M.rack / M.loop and only moves, scales, dims or adds to them,
   so the drawing never changes between scenes. Geometry scales with s; every label is drawn at a fixed screen
   size (26 px+) so nothing shrinks below the course minimum when the car is small.
   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no
   Math.random, no state between frames). K.ctx() is read on every call: the runtime swaps canvases. */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const clamp01 = (v) => K.clamp(+v || 0);
  const pick = (v, d) => (v == null ? d : v);
  const TAU = Math.PI * 2;
  /** current uniform scale of the context (camera x K.at), so hairlines stay >= n screen px at any size */
  const scaleNow = () => { const m = G().getTransform(); return Math.hypot(m.a, m.b) || 1; };
  const px = (n) => n / scaleNow();
  const LW = (base, minPx = 1.5) => Math.max(base, px(minPx));
  const easeOut = K.ease.out;
  /** draw fn at local (x, y) at a fixed screen scale (labels stay 26 px whatever the car or camera scale) */
  const fixed = (x, y, fn) => K.at(x, y, 1 / scaleNow(), 0, fn);

  // ---------------------------------------------------------------- palette, type, motion
  // One meaning per colour, the whole lesson long:
  //   gold (C.head)        = the MODEL: the engine's outline and gears, "lit", the headlight (a nod to the Lanterns)
  //   cream (C.strong/body) on indigo tiles = the APP: the car's hairlines, chat bubbles, labels
  //   terracotta (C.accent) = the AGENT acting: tools in use, the loop's moving dot, commands, text going IN,
  //                           the swapped-in second engine's gears, "not reliable"/"which one?" warnings
  //   gold glow on the passenger = YOU deciding (the permission moment)
  //   pink: only K.petals on 01 and 09.
  const palette = {
    model: C.head, modelLine: C.gold, modelAlt: C.accent,
    app: C.strong, appLine: C.line2, appFill: K.rgba(C.tile, 0.55), glass: K.rgba(C.code, 0.92),
    agent: C.accent, you: C.head,
    textIn: C.accent, textOut: C.head,
    ghost: C.soft, quiet: C.quiet, label: C.strong, leader: C.line2,
  };
  const type = {
    label: { font: 'ui', weight: 600, size: 26 },     // pills, tags, rack labels, callouts
    read: { font: 'ui', weight: 600, size: 30 },      // anything to be read (dialog question)
    chip: { font: 'mono', weight: 600, size: 26 },    // text chips, commands, name chips (30 for names)
    bubble: { font: 'ui', weight: 400, size: 26 },    // chat bubbles
  };
  const motion = {
    move: 0.7,            // structural moves (engine into its slot, car sliding)
    build: 1.4,           // M.car o.build 0 -> 1 (feed K.seg(t, a, a + motion.build))
    turn: 0.8,            // idle gear speed (rad/s) for the big gear; small gear turns 1.5x the other way
    busy: 4.0,            // gear speed while the model is "thinking" (spin-up beats)
    roll: 6,              // wheel roll (rad/s) while the car drives
    bob: { speed: 1.6, amp: 3 },   // idle bob for the car body when parked (keep it tiny)
    loop: 1.6,            // one lap of the loop's dot
  };

  // ---------------------------------------------------------------- gears
  // Two real gears: same tooth module, 12 and 8 teeth (ratio 1.5), phase-locked so teeth sit in gaps at any angle.
  const GEAR = { big: { x: -24, y: 8, rp: 37.5, n: 12 }, small: { rp: 25, n: 8 }, theta: -0.42, add: 5 };
  GEAR.small.x = GEAR.big.x + Math.cos(GEAR.theta) * (GEAR.big.rp + GEAR.small.rp);
  GEAR.small.y = GEAR.big.y + Math.sin(GEAR.theta) * (GEAR.big.rp + GEAR.small.rp);
  const RATIO = GEAR.big.n / GEAR.small.n;
  const PHI = (1 + RATIO) * GEAR.theta + Math.PI - (TAU / GEAR.small.n) / 2;

  function gearPath(cx, cy, rp, n, ang) {
    const g = G(), p = TAU / n, ro = rp + GEAR.add, ri = rp - GEAR.add;
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const c = ang + i * p;
      const pts = [[ri, c - 0.5 * p], [ri, c - 0.3 * p], [ro, c - 0.15 * p], [ro, c + 0.15 * p], [ri, c + 0.3 * p], [ri, c + 0.5 * p]];
      pts.forEach(([r, a], j) => { const X = cx + Math.cos(a) * r, Y = cy + Math.sin(a) * r; (i === 0 && j === 0) ? g.moveTo(X, Y) : g.lineTo(X, Y); });
    }
    g.closePath();
  }
  function drawGear(cx, cy, rp, n, ang, color, lw, big) {
    const g = G();
    g.save();
    gearPath(cx, cy, rp, n, ang);
    g.fillStyle = C.tile; g.fill();
    g.strokeStyle = color; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke();
    g.beginPath(); g.arc(cx, cy, rp * 0.26, 0, TAU); g.stroke();
    if (big) {
      g.globalAlpha *= 0.55;
      g.beginPath(); g.arc(cx, cy, rp * 0.62, 0, TAU); g.stroke();
      for (let i = 0; i < 4; i++) { const a = ang + i * TAU / 4 + 0.4; g.beginPath(); g.moveTo(cx + Math.cos(a) * rp * 0.26, cy + Math.sin(a) * rp * 0.26); g.lineTo(cx + Math.cos(a) * rp * 0.62, cy + Math.sin(a) * rp * 0.62); g.stroke(); }
    } else {
      g.globalAlpha *= 0.55;
      g.beginPath(); g.moveTo(cx + Math.cos(ang) * rp * 0.26, cy + Math.sin(ang) * rp * 0.26); g.lineTo(cx + Math.cos(ang) * rp * 0.6, cy + Math.sin(ang) * rp * 0.6); g.stroke();
    }
    g.restore();
  }

  /** gear angle at t from a piecewise speed curve (exact integral, so speed changes never jump the gears).
   *  keys: [{at, rate, d}] — from time `at` the speed ramps linearly to `rate` (rad/s) over d seconds (default 0.4).
   *  base: speed before the first key (default motion.turn). Sort keys by `at`. e.g. 03 [[words]]:
   *  M.spin(t, [{at: w, rate: motion.busy}, {at: w + 1, rate: motion.turn}]) ; 06 stop: {at, rate: 0} */
  function spin(t, keys = [], base = motion.turn) {
    const T0 = -10;
    const pts = [[T0, base]];
    let r = base;
    keys.forEach((k) => { const a = Math.max(k.at, pts[pts.length - 1][0]); pts.push([a, r]); r = k.rate; pts.push([a + (k.d ?? 0.4), r]); });
    let ang = 0;
    for (let i = 0; i < pts.length; i++) {
      const [ta, ra] = pts[i];
      const [tb, rb] = i + 1 < pts.length ? pts[i + 1] : [Infinity, ra];
      if (t <= ta) break;
      const te = Math.min(t, tb);
      if (tb === Infinity || tb === ta) { ang += ra * (te - ta); continue; }
      const re = K.lerp(ra, rb, (te - ta) / (tb - ta));
      ang += (ra + re) / 2 * (te - ta);
    }
    return ang;
  }

  // ---------------------------------------------------------------- the engine (the model)
  // Local frame: card -100..100 x -70..70 (200 x 140), ports at x ±100. Size: s 1.0 (01 alone), 1.6 (03 on its stand),
  // 0.56 x car scale when in the hood (use M.slot). Reads as an engine down to s ~0.3.
  const DIG = (() => { const r = K.rng(404), out = []; for (let i = 0; i < 40; i++) { const v = (r() * 2.4 - 1.2); out.push((v < 0 ? '−' : ' ') + Math.abs(v).toFixed(r() < 0.5 ? 3 : 4)); } return out; })();
  /**
   * M.engine(t, x, y, s, o)
   * o.turn   big-gear angle in rad (default motion.turn * t; use M.spin for spin-ups / stops)
   * o.lit    0..1 gold outline + glow (default 1); 0 = grey line2 outline, soft gears (the "cold" engine)
   * o.glow   extra 0..1 gold glow (09 keep-1, 03 lit beat)
   * o.alt    true = the second engine: terracotta gears (04 swap)
   * o.digits 0..1 a faint scrolling column of weights behind the gears (03 "weights")
   * o.stand  0..1 legs and a base line under the card (03)
   * o.label  string pill under it at a fixed 26 px (e.g. 'model'); o.labelK 0..1
   * o.alpha, o.shadow (default true; pass false inside the car)
   */
  function engine(t, x, y, s, o = {}) {
    const a = pick(o.alpha, 1);
    if (a <= 0.002) return;
    const lit = clamp01(pick(o.lit, 1)), turn = pick(o.turn, motion.turn * t);
    const line = K.mixColor(C.line2, C.gold, lit), gearCol = o.alt ? C.accent : K.mixColor(C.soft, C.head, lit);
    K.layer(a, () => K.at(x, y, s, 0, () => {
      const g = G();
      // stand (behind the card)
      const st = clamp01(o.stand);
      if (st > 0) K.layer(st, () => {
        const lw = LW(3, 2);
        K.line(-58, 66, -72, 88, { color: C.soft, w: lw }); K.line(58, 66, 72, 88, { color: C.soft, w: lw });
        K.line(-118 * st, 90, 118 * st, 90, { color: C.soft, w: lw });
      });
      if (lit > 0 || o.glow) K.glow(0, 0, 170, C.head, 0.16 * lit + 0.3 * clamp01(o.glow));
      K.card(-100, -70, 200, 140, { r: 24, fill: C.tile, stroke: line, glow: 0.25 * lit + 0.75 * clamp01(o.glow), shadow: o.shadow, lw: LW(2, 1.5) });
      // ports: text goes in on the left, out on the right
      g.save(); g.strokeStyle = line; g.lineWidth = LW(2, 1.5); g.fillStyle = C.page;
      [-1, 1].forEach((sd) => { K.rr(sd * 100 - 6, -18, 12, 36, 5); g.fill(); g.stroke(); });
      g.restore();
      // weights: texture, not text to read
      const dg = clamp01(o.digits);
      if (dg > 0) {
        g.save(); K.rr(-92, -62, 184, 124, 18); g.clip();
        const off = (t * 14) % 20;
        for (let i = 0; i < 9; i++) {
          const yy = -60 + i * 20 - off + 20;
          K.text(DIG[(i + Math.floor(t * 14 / 20)) % DIG.length], -88, yy, { font: 'mono', size: 15, color: C.soft, alpha: 0.28 * dg });
          K.text(DIG[(i * 7 + 3 + Math.floor(t * 14 / 20)) % DIG.length], 46, yy, { font: 'mono', size: 15, color: C.soft, alpha: 0.28 * dg });
        }
        g.restore();
      }
      const glw = LW(2.4, 1.5);
      drawGear(GEAR.big.x, GEAR.big.y, GEAR.big.rp, GEAR.big.n, turn, gearCol, glw, true);
      drawGear(GEAR.small.x, GEAR.small.y, GEAR.small.rp, GEAR.small.n, -RATIO * turn + PHI, gearCol, glw, false);
    }));
    if (o.label) {
      const ly = y + (st0(o) ? 136 : 106) * s;
      K.pill(o.label, x, ly, { size: 26, stroke: C.gold, color: C.head, alpha: a * pick(o.labelK, 1) });
    }
  }
  const st0 = (o) => clamp01(o.stand) > 0.5;
  /** engine anchors in world space: 'in' / 'out' (ports), 'top', 'bottom', 'left', 'right', 'label' */
  function ept(x, y, s, name) {
    const P = { in: [-106, 0], out: [106, 0], left: [-100, 0], right: [100, 0], top: [0, -70], bottom: [0, 70], label: [0, 106], center: [0, 0] }[name] || [0, 0];
    return { x: x + P[0] * s, y: y + P[1] * s };
  }

  // ---------------------------------------------------------------- the car (the app)
  // Local frame: origin = middle of the body. Body x -425..425, y -80..88; cabin top -246; wheels at (±250, 100) r 56,
  // bottoms at 156; ground 158. Full extents ≈ x -430..440 (headlight glow to ~560), y -246..158 (rack adds to -430).
  const CAR = {
    body: { x0: -425, x1: 425, y0: -80, y1: 88, r: 44 },
    wheels: [-250, 250], wheelY: 100, wheelR: 56, archR: 72,
    cabin: [[-340, -78], [-312, -246], [40, -246], [150, -78]],
    glass: { x: -298, y: -232, w: 330, h: 140 },
    shield: [[46, -232], [56, -232], [134, -92], [46, -92]],
    slot: { x: 228, y: -10, s: 0.56 },
    hinge: [150, -80],
    lamp: [414, -16],
    steer: [-24, -136], seat: [-82, -134], passenger: [-196, -132], pseat: [-240, -132],
    rack: [-136, -292],
  };
  const ANCH = {
    center: [0, 0], body: [0, 0], engine: [CAR.slot.x, CAR.slot.y], slot: [CAR.slot.x, CAR.slot.y],
    cabin: [-120, -160], glass: [-133, -162], chat: [-133, -137], windshield: [92, -160], roof: [-130, -246],
    wheel: CAR.steer, steer: CAR.steer, seat: CAR.seat, driver: CAR.seat, passenger: CAR.passenger,
    headlight: CAR.lamp, nose: [425, 10], trunk: [-370, -20], bumper: [-428, 40], side: [-80, 24],
    frontWheel: [250, 100], rearWheel: [-250, 100], ground: [0, 158], rack: CAR.rack, hood: [290, -80],
    // label spots that stay clear of the car (pills at 26 px)
    labelModel: [300, -150], labelApp: [0, 214], labelAgent: [-440, -176], picker: [-133, -280],
  };
  /** world position of a car anchor (see ANCH keys above) for a car drawn at (x, y, s) */
  function pt(x, y, s, name) { const p = ANCH[name] || [0, 0]; return { x: x + p[0] * s, y: y + p[1] * s }; }
  /** where the engine sits for a car at (x, y, s): {x, y, s} to pass to M.engine */
  function slot(x, y, s) { return { x: x + CAR.slot.x * s, y: y + CAR.slot.y * s, s: CAR.slot.s * s }; }

  function bodyPath(o = {}) {
    const g = G(), b = CAR.body, r = b.r, R = CAR.archR, wy = CAR.wheelY;
    const dx = Math.sqrt(R * R - (wy - b.y1) * (wy - b.y1));
    const a0 = Math.atan2(b.y1 - wy, dx), a1 = Math.atan2(b.y1 - wy, -dx);
    g.beginPath();
    g.moveTo(b.x0 + r, b.y0 + 6);
    g.quadraticCurveTo(-200, b.y0 - 2, CAR.hinge[0], b.y0);           // roofline of the body to the windshield base
    g.quadraticCurveTo(300, b.y0 + 2, 372, b.y0 + 22);                 // the hood slopes down to the nose
    g.quadraticCurveTo(b.x1, b.y0 + 34, b.x1, b.y0 + 74);
    g.lineTo(b.x1, b.y1 - 18);
    g.arcTo(b.x1, b.y1, b.x1 - 18, b.y1, 18);
    [CAR.wheels[1], CAR.wheels[0]].forEach((wx) => { g.lineTo(wx + dx, b.y1); g.arc(wx, wy, R, a0, a1, true); });
    g.lineTo(b.x0 + 18, b.y1);
    g.arcTo(b.x0, b.y1, b.x0, b.y1 - 18, 18);
    g.lineTo(b.x0, b.y0 + r + 6);
    g.quadraticCurveTo(b.x0, b.y0 + 6, b.x0 + r, b.y0 + 6);
    g.closePath();
  }
  function poly(pts, r = 0) {
    const g = G(); g.beginPath();
    if (!r) { pts.forEach(([X, Y], i) => (i ? g.lineTo(X, Y) : g.moveTo(X, Y))); g.closePath(); return; }
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[n - 1], pts[0]); g.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; g.arcTo(p[0], p[1], q[0], q[1], r); }
    g.closePath();
  }
  /** steering wheel (side-on, drawn as a ring with spokes), centre (x, y), radius r. o: {k (draw progress), color, glow, alpha, w} */
  function steer(x, y, r, o = {}) {
    const k = clamp01(pick(o.k, 1)); if (k <= 0) return;
    const g = G(), col = o.color || C.head;
    K.layer(pick(o.alpha, 1), () => {
      if (o.glow) K.glow(x, y, r * 3.2, C.head, 0.45 * clamp01(o.glow));
      g.save(); g.strokeStyle = col; g.lineWidth = o.w || LW(r * 0.16, 2); g.lineCap = 'round';
      g.beginPath(); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * k); g.stroke();
      if (k > 0.6) {
        g.globalAlpha *= (k - 0.6) / 0.4; g.lineWidth = Math.max(g.lineWidth * 0.7, px(1.5));
        [Math.PI / 2, Math.PI / 2 + TAU / 3, Math.PI / 2 - TAU / 3].forEach((a) => { g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.22, y + Math.sin(a) * r * 0.22); g.lineTo(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95); g.stroke(); });
        g.beginPath(); g.arc(x, y, r * 0.22, 0, TAU); g.stroke();
      }
      g.restore();
    });
  }
  /** a seat back seen from the side, centre (x, y), height h. o: {color, alpha, dash} */
  function seat(x, y, h, o = {}) {
    const g = G();
    K.layer(pick(o.alpha, 1), () => {
      g.save(); g.strokeStyle = o.color || C.soft; g.lineWidth = LW(h * 0.045, 1.5); g.lineJoin = 'round';
      g.fillStyle = o.dash ? 'rgba(0,0,0,0)' : K.rgba(C.line2, 0.75);
      if (o.dash) g.setLineDash(o.dash.map(px));
      g.translate(x, y);
      g.save(); g.rotate(-0.18); K.rr(-h * 0.16, -h * 0.52, h * 0.3, h * 0.8, h * 0.14); g.fill(); g.globalAlpha *= 0.6; g.stroke(); g.restore();
      K.rr(-h * 0.12, h * 0.22, h * 0.6, h * 0.18, h * 0.08); g.fill(); g.globalAlpha *= 0.6; g.stroke();
      g.restore();
    });
  }
  /** the passenger (you): person icon, optional gold glow. o: {glow, alpha, color} */
  function person(x, y, s, o = {}) {
    if (o.glow) K.glow(x, y, s * 1.6, C.head, 0.5 * clamp01(o.glow));
    K.icon('person', x, y, s, { color: o.color || K.mixColor(C.strong, C.head, clamp01(o.glow)), alpha: pick(o.alpha, 1), w: LW(s * 0.06, 1.8) });
  }

  /**
   * M.car(t, x, y, s, o) — the app, side view, nose right. Standard: (960, 590, 1). See M.layout for each scene.
   * o.detail  'full' (default) | 'simple' (body, cabin, plain glass, wheels; for 04's side cars) | 'mini' (map marker, s ≈ 0.13)
   * o.build   0..1 assembles it (body → cabin + window → wheels → headlight); feed K.seg(t, a, a + M.motion.build). Default 1.
   * o.alpha   whole car;  o.bodyA  body + cabin opacity (06: 0.35);  o.bodyGlow 0..1 (09 keep-2: outline brightens to gold)
   * o.engine  state object for M.engine (turn, lit, glow, alt, alpha, dx, dy: local offset for slide-out), or false (empty bay)
   * o.hood    0..1 lifts the hood (06)
   * o.head    0..1 headlight + forward glow (default 0)
   * o.chat    0..1 two chat bubbles in the side window (default 1 - driver/passenger presence)
   * o.title   side-window title (default 'chat')
   * o.wheel   0..1 steering ring draws in (the agent);  o.wheelGlow 0..1 gold glow behind it
   * o.wheelOutline true = ring drawn as a dashed ghost (06 "no separate driver")
   * o.seatQ   0..1 a question mark in the empty driver's seat (06)
   * o.passenger 0..1 you, in the passenger seat;  o.youGlow 0..1 (asked for permission)
   * o.roll    wheel angle in rad (drive: M.motion.roll * t);  o.ground 0..1 ground line
   * o.rack    state for M.rack (tools on the roof) or omitted;  o.picker {label, k, open, options, hi} model picker above the window
   */
  function car(t, x, y, s, o = {}) {
    const A = pick(o.alpha, 1);
    if (A <= 0.002) return;
    const detail = o.detail || 'full', mini = detail === 'mini', full = detail === 'full';
    const b = pick(o.build, 1), part = (i) => easeOut(clamp01((b - i * 0.18) / 0.46));
    const kBody = part(0), kCab = part(1), kWheels = part(2), kLamp = part(3);
    const bodyA = pick(o.bodyA, 1), bodyGlow = clamp01(o.bodyGlow);
    const driver = Math.max(clamp01(o.wheel), clamp01(o.passenger));
    K.layer(A, () => K.at(x, y, s, 0, () => {
      const g = G();
      const hair = mini ? px(2.2) : LW(1.8, 1.5);
      const lineCol = mini ? C.strong : K.mixColor(C.line2, C.head, bodyGlow);
      // ground shadow
      K.layer(kBody, () => {
        g.save(); g.fillStyle = 'rgba(4,5,12,.45)'; g.beginPath(); g.ellipse(0, 160, 460, 16, 0, 0, TAU); g.fill(); g.restore();
        if (o.ground) K.line(-520, 158, 520, 158, { color: C.line, w: LW(2, 1.5), k: clamp01(o.ground) });
      });
      // headlight beam (behind the body)
      const head = clamp01(o.head) * kLamp;
      if (head > 0) {
        K.glow(CAR.lamp[0] + 40, CAR.lamp[1], mini ? 260 : 150, C.head, 0.42 * head);
        g.save(); g.globalAlpha *= 0.5 * head;
        const gr = g.createLinearGradient(CAR.lamp[0], 0, CAR.lamp[0] + 230, 0);
        gr.addColorStop(0, K.rgba(C.head, 0.35)); gr.addColorStop(1, K.rgba(C.head, 0));
        g.fillStyle = gr; g.beginPath(); g.moveTo(CAR.lamp[0], CAR.lamp[1] - 10); g.lineTo(CAR.lamp[0] + 230, CAR.lamp[1] - 60); g.lineTo(CAR.lamp[0] + 230, CAR.lamp[1] + 70); g.lineTo(CAR.lamp[0], CAR.lamp[1] + 12); g.closePath(); g.fill();
        g.restore();
      }
      // cabin (behind the body's top edge)
      K.layer(kCab * bodyA, () => {
        g.save(); g.translate(0, (1 - kCab) * 14);
        poly(CAR.cabin, 26);
        g.fillStyle = mini ? C.tile : palette.appFill; g.fill();
        g.strokeStyle = lineCol; g.lineWidth = hair; g.stroke();
        g.restore();
      });
      // body
      K.layer(kBody * bodyA, () => {
        g.save(); g.translate(0, (1 - kBody) * 16);
        if (bodyGlow > 0) { g.shadowColor = K.rgba(C.head, 0.5 * bodyGlow); g.shadowBlur = 36; }
        bodyPath(); g.fillStyle = mini ? C.tile : palette.appFill; g.fill();
        g.shadowColor = 'transparent';
        g.strokeStyle = lineCol; g.lineWidth = hair * (1 + bodyGlow * 0.4); g.stroke();
        if (!mini) {
          // belt line, door seam, handle: quiet detail
          K.line(-400, -34, 396, -34, { color: C.line, w: LW(1.5, 1) });
          K.line(-118, -78, -118, 70, { color: C.line, w: LW(1.5, 1) });
          K.line(-96, -14, -64, -14, { color: C.line2, w: LW(4, 2) });
          // tail light
          g.fillStyle = K.rgba(C.accent, 0.55); K.rr(-428, -54, 9, 30, 4); g.fill();
        }
        g.restore();
      });
      // engine bay + engine
      K.layer(kBody * (full || detail === 'simple' ? 1 : 0), () => {
        const sl = CAR.slot;
        g.save(); g.strokeStyle = C.line2; g.lineWidth = LW(1.5, 1); g.setLineDash([px(5), px(6)]);
        K.rr(sl.x - 64, sl.y - 46, 128, 92, 16); g.globalAlpha *= 0.6 + 0.4 * clamp01(o.hood); g.stroke(); g.restore();
      });
      if (o.engine !== false && !mini) {
        const e = o.engine || {};
        engine(t, CAR.slot.x + (e.dx || 0), CAR.slot.y + (e.dy || 0), CAR.slot.s, { shadow: false, ...e, label: null, alpha: pick(e.alpha, 1) * kBody });
      }
      if (mini) { g.save(); g.fillStyle = C.head; K.rr(CAR.slot.x - 50, CAR.slot.y - 34, 100, 68, 18); g.globalAlpha *= 0.85; g.fill(); g.restore(); }
      // hood (06): a panel hinged at the windshield base, lifting off the engine
      const hood = clamp01(o.hood);
      if (hood > 0 && !mini) {
        g.save(); g.translate(CAR.hinge[0], CAR.hinge[1]); g.rotate(-0.62 * hood);
        g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(150, -6, 236, 14); g.lineTo(242, 2); g.quadraticCurveTo(150, -22, 0, -16); g.closePath();
        g.fillStyle = '#2C2A3A'; g.fill(); g.strokeStyle = C.soft; g.lineWidth = hair; g.lineJoin = 'round'; g.stroke();
        g.restore();
        // the prop rod: from the bay floor up to the underside of the hood
        const th = 0.62 * hood, hx = CAR.hinge[0] + 205 * Math.cos(th), hy = CAR.hinge[1] - 205 * Math.sin(th) + 4;
        K.line(372, -36, hx, hy, { color: C.soft, w: LW(2.5, 1.2), alpha: clamp01(hood * 2 - 0.6) });
      }
      // wheels (in their arches)
      CAR.wheels.forEach((wx, i) => {
        const k = clamp01(kWheels * 1.15 - i * 0.15); if (k <= 0) return;
        const R = CAR.wheelR, wy = CAR.wheelY;
        g.save();
        g.globalAlpha *= Math.min(1, k * 3);
        g.beginPath(); g.arc(wx, wy, R, 0, TAU); g.fillStyle = C.page; g.fill();
        g.strokeStyle = mini ? C.strong : C.line2; g.lineWidth = mini ? px(3) : LW(10, 2); g.lineCap = 'round';
        g.beginPath(); g.arc(wx, wy, R - 5, -Math.PI / 2, -Math.PI / 2 + TAU * k); g.stroke();
        if (!mini) {
          g.lineWidth = LW(1.5, 1); g.strokeStyle = C.soft;
          g.beginPath(); g.arc(wx, wy, R * 0.62, 0, TAU * k); g.stroke();
          K.layer(clamp01((k - 0.5) * 2), () => K.at(wx, wy, 1, pick(o.roll, 0), () => K.icon('gear', 0, 0, 44, { color: C.soft, w: LW(2, 1.2) })));
        }
        g.restore();
      });
      // window(s)
      K.layer(kCab * Math.max(bodyA, 0.6), () => {
        g.save(); g.translate(0, (1 - kCab) * 14);
        // windshield pane
        poly(CAR.shield, 8); g.fillStyle = K.rgba(C.head, mini ? 0.25 : 0.07); g.fill();
        if (!mini) { g.strokeStyle = C.line2; g.lineWidth = LW(1.5, 1); g.stroke(); K.line(70, -214, 104, -150, { color: K.rgba(C.strong, 0.18), w: LW(3, 1.5) }); }
        const gl = CAR.glass;
        if (full) {
          const cr = K.win(gl.x, gl.y, gl.w, gl.h, { title: o.title ?? 'chat', titleSize: 26, kind: 'browser', shadow: false, fill: palette.glass, stroke: C.line2 });
          interior(t, cr, o, driver);
        } else {
          K.rr(gl.x, gl.y, gl.w, gl.h, 14); g.fillStyle = mini ? K.rgba(C.head, 0.25) : palette.glass; g.fill();
          if (!mini) { g.strokeStyle = C.line2; g.lineWidth = LW(1.5, 1); g.stroke(); }
        }
        g.restore();
      });
      // headlight lamp
      K.layer(kLamp, () => {
        g.save(); g.fillStyle = K.mixColor(C.line2, C.head, Math.max(head, mini ? 1 : 0.15)); K.rr(CAR.lamp[0] - 10, CAR.lamp[1] - 12, 18, 24, 7); g.fill(); g.restore();
      });
      if (o.rack && !mini) rack(t, CAR.rack[0], CAR.rack[1], 1, { ...o.rack, posts: true });
    }));
    // fixed-size overlays (labels never shrink)
    if (o.picker && o.picker.k !== 0 && !mini) {
      const p = pt(x, y, s, 'picker');
      picker(o.picker.label || 'Model A', p.x, p.y, { ...o.picker, alpha: A * pick(o.picker.k, 1) });
    }
  }
  function interior(t, cr, o, driver) {
    const g = G();
    const chat = clamp01(pick(o.chat, 1 - driver));
    if (chat > 0) K.layer(chat, () => {
      g.save(); g.fillStyle = K.rgba(C.strong, 0.16); K.rr(cr.x + 18, cr.y + 16, 170, 20, 10); g.fill();
      g.fillStyle = K.rgba(C.strong, 0.1); K.rr(cr.x + 18, cr.y + 44, 110, 20, 10); g.fill();
      g.fillStyle = K.rgba(C.head, 0.32); K.rr(cr.x + cr.w - 18 - 120, cr.y + 30, 120, 20, 10); g.fill(); g.restore();
    });
    const w = clamp01(o.wheel), q = clamp01(o.seatQ);
    if (w > 0 || q > 0 || clamp01(o.passenger) > 0) seat(CAR.seat[0], CAR.seat[1], 66, { alpha: Math.max(w, clamp01(o.passenger)) * 0.9 });
    if (w > 0) steer(CAR.steer[0], CAR.steer[1], 28, { k: w, glow: o.wheelGlow, color: o.wheelOutline ? C.soft : C.head, w: o.wheelOutline ? LW(2, 1.5) : undefined });
    if (q > 0) K.icon('question', CAR.seat[0] + 4, CAR.seat[1] - 2, 44, { color: C.accent, alpha: q });
    const p = clamp01(o.passenger);
    if (p > 0) {
      seat(CAR.pseat[0], CAR.pseat[1], 66, { alpha: p * 0.9 });
      K.layer(p, () => person(CAR.passenger[0], CAR.passenger[1] + (1 - p) * 8, 56, { glow: o.youGlow }));
    }
  }

  // ---------------------------------------------------------------- the roof rack (the agent's tools)
  const TOOLS = [
    { kind: 'folder', label: 'your files', x: -200 },
    { kind: 'terminal', label: 'terminal', x: 0 },
    { kind: 'code', label: 'edit code', x: 200 },
  ];
  /**
   * M.rack(t, x, y, s, o) — a bar with three tools sitting on it: your files · terminal · edit code.
   * Drawn by M.car via o.rack (car-local (0, -292)); call it directly only for a detached rack.
   * o.k 0..1 the bar draws;  o.tools: number | [k, k, k] each tool drops in (ease with 'back' for the first only)
   * o.labels 0..1 (default 1) labels above each tool, always 26 px on screen;  o.lit: index | [i...] tools that glow terracotta
   * o.hide: [i] tools not drawn (05: the terminal tile slides away to the Notepad side — draw it yourself at M.rackPt)
   */
  function rack(t, x, y, s, o = {}) {
    const g = G(), k = clamp01(pick(o.k, 1));
    const tk = (i) => clamp01(Array.isArray(o.tools) ? o.tools[i] : pick(o.tools, 1));
    const lit = [].concat(o.lit ?? []);
    const autoLabels = scaleNow() * s >= 0.75 ? 1 : 0;   // below ~0.75 the 26 px labels would collide
    K.at(x, y, s, 0, () => {
      if (o.posts) [-120, 120].forEach((px0) => K.line(px0, 0, px0, 46, { color: C.line2, w: LW(3, 1.5), k }));
      K.line(-K.lerp(0, 270, k), 0, K.lerp(0, 270, k), 0, { color: C.soft, w: LW(4, 2) });
      TOOLS.forEach((tool, i) => {
        if ((o.hide || []).includes(i)) return;
        const kk = tk(i); if (kk <= 0) return;
        const ty = -50 - (1 - Math.min(1, kk)) * 40;
        K.layer(Math.min(1, kk * 1.4), () => drawTool(tool.kind, tool.x, ty, 90, lit.includes(i)));
        K.layer(Math.min(1, kk) * pick(o.labels, autoLabels), () => fixed(tool.x, ty - 45 - px(14), () =>
          K.text(tool.label, 0, 0, { ...type.label, color: lit.includes(i) ? C.accent : C.body, align: 'center' })));
      });
    });
  }
  /** one tool glyph, centre (x, y), size sz. kind: 'folder' | 'terminal' | 'code' */
  function drawTool(kind, x, y, sz, lit) {
    if (kind === 'folder') {
      if (lit) K.glow(x, y, sz, C.accent, 0.35);
      K.folder(x, y, sz * 0.86);
    } else K.iconTile(kind, x, y, sz, { glow: lit ? 0.8 : 0, color: lit ? C.accent : C.head, stroke: lit ? C.accent : C.line2 });
  }
  /** world position of rack tool i (0 files, 1 terminal, 2 edit code) for a car at (x, y, s) */
  function rackPt(x, y, s, i) { return { x: x + (CAR.rack[0] + TOOLS[i].x) * s, y: y + (CAR.rack[1] - 50) * s, s: 90 * s }; }

  // ---------------------------------------------------------------- the loop (decide → do it → check)
  const LOOP_A = [-Math.PI * 0.75, 0, Math.PI / 2];
  /**
   * M.loop(t, o) — three arrows on an ellipse around the car, a station pill at each turn.
   * o.cx, o.cy, o.rx, o.ry  (default M.layout.loop: 960, 560, 620, 320)
   * o.k 0..1 arrows draw (staggered internally);  o.stations: number | [k, k, k] pills appear
   * o.labels (default ['decide', 'do it', 'check']);  o.active index: that pill gets a terracotta outline
   * o.dot u 0..1+ (laps) the moving dot's position from 'decide' (null = no dot);  o.alpha (arrows only, e.g. 0.3 / 0.6)
   * returns the station points [{x, y}, ...]
   */
  function loop(t, o = {}) {
    const L = { ...layout.loop, ...o }, g = G();
    const P = (a) => ({ x: L.cx + Math.cos(a) * L.rx, y: L.cy + Math.sin(a) * L.ry });
    const st = LOOP_A.map(P), labels = o.labels || ['decide', 'do it', 'check'];
    const k = clamp01(pick(o.k, 1));
    const gap = 78 / ((L.rx + L.ry) / 2);
    K.layer(pick(o.alpha, 1), () => {
      for (let i = 0; i < 3; i++) {
        const ki = clamp01(k * 3 - i); if (ki <= 0) continue;
        const a0 = LOOP_A[i] + gap, a1end = (i === 2 ? LOOP_A[0] + TAU : LOOP_A[i + 1]) - gap;
        const a1 = K.lerp(a0, a1end, ki);
        g.save(); g.strokeStyle = g.fillStyle = C.soft; g.lineWidth = 3; g.lineCap = 'round';
        g.beginPath(); for (let j = 0; j <= 40; j++) { const p = P(K.lerp(a0, a1, j / 40)); j ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); } g.stroke();
        const e = P(a1), bpt = P(a1 - 0.02), ang = Math.atan2(e.y - bpt.y, e.x - bpt.x), hs = 16;
        g.beginPath(); g.moveTo(e.x, e.y); g.lineTo(e.x - hs * Math.cos(ang - 0.45), e.y - hs * Math.sin(ang - 0.45)); g.lineTo(e.x - hs * Math.cos(ang + 0.45), e.y - hs * Math.sin(ang + 0.45)); g.closePath(); g.fill();
        g.restore();
      }
    });
    if (o.dot != null) {
      const u = o.dot, p = P(LOOP_A[0] + TAU * u);
      K.glow(p.x, p.y, 46, C.accent, 0.5);
      g.save(); g.fillStyle = C.accent; g.beginPath(); g.arc(p.x, p.y, 9, 0, TAU); g.fill(); g.restore();
    }
    st.forEach((p, i) => {
      const sk = clamp01(Array.isArray(o.stations) ? o.stations[i] : pick(o.stations, 1)); if (sk <= 0) return;
      const on = o.active === i;
      K.pill(labels[i], p.x, p.y, { size: 26, alpha: sk, stroke: on ? C.accent : C.line2, color: on ? C.accent : C.strong, glow: on ? 0.5 : 0, fill: C.tile });
    });
    return st;
  }
  /** point on the loop at u (0 = 'decide', 1/8 = top, 3/8 = 'do it', 5/8 = 'check') */
  function loopPt(u, o = {}) { const L = { ...layout.loop, ...o }, a = LOOP_A[0] + TAU * u; return { x: L.cx + Math.cos(a) * L.rx, y: L.cy + Math.sin(a) * L.ry }; }

  // ---------------------------------------------------------------- small recurring pieces
  /** layer pill: 'model' (gold) | 'app' (cream) | 'agent' (terracotta) | any text (cream). o: {size 26, alpha, glow} */
  function tag(which, x, y, o = {}) {
    const st = { model: [C.gold, C.head], app: [C.soft, C.strong], agent: [C.accent, C.accent] }[which] || [C.line2, C.strong];
    return K.pill(o.text || which, x, y, { size: o.size || 26, stroke: o.stroke || st[0], color: o.color || st[1], alpha: o.alpha, glow: o.glow, fill: C.tile });
  }
  /** mono text chip (soft square, r 10). o.kind 'in' (terracotta: text going in / a command) | 'out' (gold: text coming out)
   *  | 'plain' (cream). o: {size 26 (30 for names), alpha, glow, align 'center'|'left'}; returns {w, h} */
  function chip(s, x, y, o = {}) {
    const size = o.size || 26, f = { font: 'mono', weight: 600, size };
    const w = K.measure(s, f) + size * 1.1, h = size * 1.75;
    const col = { in: C.accent, out: C.head, cmd: C.accent, plain: C.line2 }[o.kind || 'plain'];
    const x0 = o.align === 'left' ? x : x - w / 2;
    K.card(x0, y - h / 2, w, h, { r: 10, fill: C.code, stroke: col, shadow: false, alpha: o.alpha, glow: o.glow, lw: 2 });
    K.text(s, x0 + w / 2, y + size * 0.34, { ...f, color: o.kind === 'out' ? C.head : C.strong, align: 'center', alpha: o.alpha });
    return { w, h };
  }
  /** label with a leader line from an anchor (ax, ay) to a pill at (lx, ly). o: {k (0..1: line draws, then pill), size 26, alpha, color, stroke, dot} */
  function callout(label, ax, ay, lx, ly, o = {}) {
    const k = clamp01(pick(o.k, 1)); if (k <= 0) return;
    const a = pick(o.alpha, 1);
    K.layer(a, () => {
      const lk = clamp01(k / 0.5);
      if (o.dot !== false) { const g = G(); g.save(); g.fillStyle = C.soft; g.globalAlpha *= lk; g.beginPath(); g.arc(ax, ay, 5, 0, TAU); g.fill(); g.restore(); }
      K.line(ax, ay, lx, ly, { color: C.line2, w: 1.5, k: lk });
      const pk = clamp01((k - 0.4) / 0.6);
      if (pk > 0) K.pill(label, lx, ly, { size: o.size || 26, alpha: pk, stroke: o.stroke || C.line2, color: o.color || C.strong, fill: C.tile });
    });
  }
  /** model picker pill with a drawn chevron (no font glyphs). o: {size 26, open 0..1, options [..], hi index, hiK 0..1, alpha, glow, w} */
  function picker(label, x, y, o = {}) {
    const g = G(), size = o.size || 26, f = { font: 'ui', weight: 600, size };
    const a = pick(o.alpha, 1); if (a <= 0.002) return;
    const tw = K.measure(label, f), w = o.w || tw + size * 1.6 + 30, h = size * 1.9;
    K.layer(a, () => {
      K.card(x - w / 2, y - h / 2, w, h, { r: h / 2, fill: C.tile, stroke: o.stroke || C.gold, shadow: false, glow: o.glow });
      K.text(label, x - w / 2 + size * 0.8, y + size * 0.34, { ...f, color: C.strong });
      const cx = x + w / 2 - size * 0.8 - 4, open = clamp01(o.open);
      g.save(); g.strokeStyle = C.head; g.lineWidth = 2.5; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); const d = 6 * (1 - 2 * open); g.moveTo(cx - 8, y - d * 0.6); g.lineTo(cx, y + d * 0.7); g.lineTo(cx + 8, y - d * 0.6); g.stroke(); g.restore();
      if (open > 0 && o.options) {
        const rh = size * 1.75, lw = Math.max(w, Math.max(...o.options.map((s) => K.measure(s, f))) + size * 1.6), lh = rh * o.options.length + 16;
        K.layer(open, () => {
          K.card(x - lw / 2, y + h / 2 + 10, lw, lh * (0.7 + 0.3 * open), { r: 16, fill: C.tile, stroke: C.line2 });
          o.options.forEach((s, i) => {
            const ry = y + h / 2 + 18 + i * rh;
            if (o.hi === i) { g.save(); g.fillStyle = K.rgba(C.head, 0.16 * pick(o.hiK, 1)); K.rr(x - lw / 2 + 8, ry, lw - 16, rh - 4, 10); g.fill(); g.restore(); }
            K.text(s, x - lw / 2 + size * 0.8, ry + rh * 0.5 + size * 0.34, { ...f, color: o.hi === i ? K.mixColor(C.strong, C.head, pick(o.hiK, 1)) : C.body });
          });
        });
      }
    });
    return { w, h };
  }
  /** chat window: K.win + bubbles. msgs: [{s, who: 'you' | 'ai', k (0..1 appear), at (typing start), cps}]
   *  o: {title 'chat', size 26, alpha, focus, stroke, accent (ai bubble outline colour)}; returns the content rect */
  function chat(t, x, y, w, h, msgs, o = {}) {
    const size = o.size || 26, f = { font: 'ui', size };
    const cr = K.win(x, y, w, h, { title: o.title ?? 'chat', titleSize: 26, kind: 'browser', alpha: o.alpha, focus: o.focus, stroke: o.stroke });
    const g = G();
    K.layer(pick(o.alpha, 1), () => {
      let yy = cr.y + 18;
      (msgs || []).forEach((m) => {
        const k = clamp01(pick(m.k, 1)); if (k <= 0) return;
        const full = m.s, str = m.at != null ? K.typed(full, t, m.at, m.cps || 40) : full;
        const lines = K.wrap(full, w - 100, f), shown = K.wrap(str, w - 100, f);
        const bw = Math.max(...lines.map((ln) => K.measure(ln, f))) + 32, bh = lines.length * size * 1.3 + 22;
        const you = m.who === 'you', bx = you ? cr.x + cr.w - 18 - bw : cr.x + 18;
        K.layer(k, () => {
          g.save(); g.translate(0, (1 - k) * 10);
          K.card(bx, yy, bw, bh, { r: 18, shadow: false, fill: you ? K.rgba(C.head, 0.14) : C.tile, stroke: you ? K.rgba(C.head, 0.55) : (m.stroke || o.accent || C.line2), lw: 1.5 });
          shown.forEach((ln, i) => K.text(ln, bx + 16, yy + 11 + size * 0.95 + i * size * 1.3, { ...f, color: you ? C.strong : C.body }));
          g.restore();
        });
        yy += bh + 12;
      });
    });
    return cr;
  }
  /** permission dialog: "Run this command?" with Yes / No. o: {w 520, title 'agent', q, cmd (mono line), choice: 'yes'|'no'|null, choiceK, alpha, focus}
   *  returns {x, y, w, h, yes: {x, y}, no: {x, y}} */
  function ask(t, x, y, o = {}) {
    const w = o.w || 520, q = o.q || 'Run this command?', hasCmd = !!o.cmd, h = hasCmd ? 250 : 200;
    const cr = K.win(x, y, w, h, { title: o.title || 'agent', titleSize: 26, kind: 'terminal', alpha: o.alpha, focus: pick(o.focus, true) });
    const a = pick(o.alpha, 1), ck = clamp01(pick(o.choiceK, 1));
    let yy = cr.y + 44;
    K.text(q, cr.x + 28, yy, { ...type.read, color: C.strong, alpha: a });
    if (hasCmd) { yy += 50; K.text(o.cmd, cr.x + 28, yy, { font: 'mono', size: 26, weight: 600, color: C.head, alpha: a }); }
    const py = cr.y + cr.h - 40, yes = { x: cr.x + 28 + 50, y: py }, no = { x: cr.x + 28 + 160, y: py };
    K.pill('Yes', yes.x, yes.y, { size: 26, alpha: a, stroke: o.choice === 'yes' ? C.head : C.gold, color: o.choice === 'yes' ? C.head : C.strong, glow: o.choice === 'yes' ? 0.7 * ck : 0 });
    K.pill('No', no.x, no.y, { size: 26, alpha: a, stroke: o.choice === 'no' ? C.accent : C.line2, color: o.choice === 'no' ? C.accent : C.strong, glow: o.choice === 'no' ? 0.7 * ck : 0 });
    return { x, y, w, h, yes, no, cmdY: hasCmd ? cr.y + 94 : null, cmdX: cr.x + 28 };
  }
  /** something the engine does NOT have, softly crossed out. kind: 'seat' | 'wheel' | 'memory' | any text (dashed pill).
   *  o: {k 0..1 appear, cross 0..1 the cross draws, alpha (default 0.45 resting), label (text under glyphs, 26 px)} */
  function ghost(kind, x, y, o = {}) {
    const k = clamp01(pick(o.k, 1)); if (k <= 0) return;
    const a = pick(o.alpha, 0.45) * k, g = G(), cross = clamp01(o.cross);
    K.layer(a, () => {
      let r = 44; const glyph = kind === 'seat' || kind === 'wheel' || kind === 'memory';
      if (kind === 'seat') seat(x, y, 78, { color: C.soft, dash: [6, 6] });
      else if (kind === 'wheel') { g.save(); g.setLineDash([6, 6]); steer(x, y, 34, { color: C.soft, w: 3 }); g.restore(); }
      else if (kind === 'memory') {
        g.save(); g.strokeStyle = C.soft; g.lineWidth = 3; g.setLineDash([6, 6]); K.rr(x - 46, y - 32, 92, 56, 14); g.stroke(); g.setLineDash([]);
        g.beginPath(); g.moveTo(x - 18, y + 24); g.lineTo(x - 26, y + 40); g.lineTo(x - 2, y + 24); g.stroke(); g.restore();
        K.icon('clock', x, y - 4, 34, { color: C.soft });
      } else {
        const f = { font: 'ui', weight: 600, size: 26 }, w = K.measure(kind, f) + 42, h = 50; r = w / 2;
        g.save(); g.strokeStyle = C.soft; g.lineWidth = 2; g.setLineDash([6, 6]); K.rr(x - w / 2, y - h / 2, w, h, h / 2); g.stroke(); g.restore();
        K.text(kind, x, y + 9, { ...f, color: C.soft, align: 'center' });
      }
      if (o.label) K.text(o.label, x, y + 76, { ...type.label, color: C.soft, align: 'center' });
      if (cross > 0) {
        g.save(); g.strokeStyle = C.accent; g.lineWidth = 3.5; g.lineCap = 'round';
        if (glyph) {
          // a small X badge at the top-right, drawn stroke by stroke
          const bx = x + 46, by = y - 40, R = 11, c1 = clamp01(cross * 2), c2 = clamp01(cross * 2 - 1);
          g.fillStyle = C.page; g.beginPath(); g.arc(bx, by, 20, 0, TAU); g.globalAlpha *= Math.min(1, cross * 3); g.fill();
          g.strokeStyle = C.accent; g.lineWidth = 2; g.stroke(); g.lineWidth = 3.5;
          g.beginPath(); g.moveTo(bx - R, by - R); g.lineTo(bx - R + 2 * R * c1, by - R + 2 * R * c1); g.stroke();
          if (c2 > 0) { g.beginPath(); g.moveTo(bx + R, by - R); g.lineTo(bx + R - 2 * R * c2, by - R + 2 * R * c2); g.stroke(); }
        } else {
          // strike-through across the pill
          g.beginPath(); g.moveTo(x - r + 10, y); g.lineTo(x - r + 10 + (2 * r - 20) * cross, y); g.stroke();
        }
        g.restore();
      }
    });
  }
  /** a chip riding a straight path from (x1,y1) to (x2,y2) at progress u (0..1), fading in/out at the ends. o: chip opts + {fade 0.15} */
  function ride(s, x1, y1, x2, y2, u, o = {}) {
    if (u <= 0 || u >= 1) return;
    const f = o.fade ?? 0.15, a = Math.min(1, u / f, (1 - u) / f);
    chip(s, K.lerp(x1, x2, u), K.lerp(y1, y2, u), { ...o, alpha: a * pick(o.alpha, 1) });
  }

  // ---------------------------------------------------------------- layouts
  // Car placements per scene (x, y, s), checked against the safe area x 80–1840, y 130–930.
  const layout = {
    title: { x: 960, y: 610, s: 0.86 },      // 01: under the title block (text ends y ~330), wheels end y ~745
    engineIntro: { x: 960, y: 560, s: 1.0 }, // 01 [[engine]] before it eases into the car's slot
    solo: { x: 960, y: 520, s: 1.6 },        // 03 engine on its stand (card 800..1120 x 408..632, base y 664)
    std: { x: 960, y: 590, s: 1.0 },         // 04 the app (car 535..1385 x 344..748)
    many: { cars: [{ x: 960, y: 590, s: 1 }, { x: 0, y: 590, s: 0.9 }, { x: 1920, y: 590, s: 0.9 }], z: 0.62 }, // 04 [[many-cars]] world coords under K.zoomAt(960, 540, z)
    agent: { x: 960, y: 640, s: 0.8 },       // 05 with rack + loop (rack labels y ~315, tools top ~332)
    loop: { cx: 960, cy: 560, rx: 620, ry: 320 }, // 05 loop around the agent car (stations: decide (522, 334), do it (1580, 560), check (960, 880))
    compare: { x: 520, y: 640, s: 0.5 },     // 05 [[notepad]]: car shrinks left, the Notepad story takes the right half
    breaks: { x: 820, y: 620, s: 1.0 },      // 06 hood up, bench engine at (1500, 600)
    small: { x: 400, y: 600, s: 0.45 },      // 07 anchor car at left of the 2x2 grid
    mini: { s: 0.13 },                       // 08 map marker (~115 px long); place by its centre
    end: { x: 960, y: 400, s: 0.55 },        // 09 above the three takeaway rows (rack: pass labels: 0)
  };
  /** interpolate two placements {x, y, s} by k (ease k yourself) */
  const lerpPlace = (a, b, k) => ({ x: K.lerp(a.x, b.x, k), y: K.lerp(a.y, b.y, k), s: K.lerp(a.s, b.s, k) });

  window.M = {
    palette, type, motion, layout, CAR, GEAR,
    engine, ept, spin,
    car, pt, slot, steer, seat, person,
    rack, rackPt, drawTool, TOOLS,
    loop, loopPt,
    tag, chip, ride, callout, picker, chat, ask, ghost,
    lerpPlace,
  };
})();
