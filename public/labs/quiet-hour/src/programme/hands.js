// THE QUIET HOUR, the maker's hands on the programme bench (hands-builder).
//
//   const hands = createHands({ layout });
//   hands.drawUnder(ctx, S, view)   // kept for the API; draws nothing (nothing of the hands lies under the bench's
//                                   // objects: the hands hover over everything)
//   hands.drawOver(ctx, S, view)    // the hands, cuffs, sleeves and the chalk they hold, each hand with its soft paper
//                                   // shadow, which falls on everything under it
//
// Both are called by ./index.js with ctx already in bench units (../layout.js), every frame, fresh from S.
//
// The look: cut paper. Each hand is a palm, a thumb and four fingers (rounded paper strips on pivots: a pose is a list
// of numbers), a knitted oatmeal cuff and sleeve that runs off the bottom of the picture toward the maker. Pieces
// overlap like layered card, with a thin darker cut edge and a crisp shadow of each piece on the pieces under it; the
// whole hand casts one soft shadow on the bench that grows and softens as the hand lifts.
//
// Everything is a pure function of S for this frame:
//   - where each hand is: the engine's pose weights (S.hands.left / right), blended here, eased, with a lift and a
//     small arc while the weights are mixed (a hand in transit rises off the bench and lands again);
//   - what it touches: the layout's objects and S (the crank handle from S.crankAngle, the knob and its turn from
//     S.knobAngle / S.needle / S.lr, the chalk tip from S.chalkTick / S.chalkU, the title card from S.titleSlide, the
//     lid from S.lidClosed, the dial tap from S.hands.dialTap, the tap-along finger from S.hands.fingerLift);
//   - leaving and returning: S.hands.present (the fingers gather, the hand lifts, then the arm draws back along
//     itself out of the bottom of the picture; returning is the same backwards, at the engine's quicker pace);
//   - idle life: a slow breath of the resting fingers, a closed form of the bar clock (S.bar + S.barPhase).
//   - the chalk: taken at 19:35 (S.hands.left.chalk), pinched for the tick, then kept tucked in the left hand.
// AUTHORED (bible 9, "the maker and the hands' design"): every number in the pose table, the elbows, the hand's size,
// the easing, the arc, the lift, the breath. No rule of the bible is decided here.
// No state between calls; the one scratch canvas is cleared (in the rectangle it is read from) before it is drawn.

const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (t) => { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c); };
const mixHex = (a, b, t) => {
  const p = (h, i) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t)).join(',')})`;
};
const isNum = (x) => typeof x === 'number' && Number.isFinite(x);

// ---- colours (cut paper; the picture's warmth is applied by the programme afterwards) --------------------------------
const C = {
  skin: '#e8b48c', skinEdge: '#b4774f', skinLight: '#f6d3b4',
  knit: '#d8ccb2', knitEdge: '#a3957a', knitDark: 'rgba(112,96,70,0.42)', knitRib: 'rgba(120,104,78,0.38)',
  chalk: '#f2efe4', chalkEdge: '#bdb6a4',
  piece: 'rgba(84,40,18,0.30)', castShadow: '12,8,4',
};

// ---- the hand's parts, in hand-local bench units -------------------------------------------------------------------
// Left hand, palm down, seen from above: fingers toward -y, wrist toward +y, thumb on +x. The right hand is the same
// drawn mirrored. Angles: from -y toward +x (radians).
const FINGERS = [
  { base: [28, -36], a: 0.07, L: [31, 21, 17], w: 18.5 },    // index
  { base: [9, -42], a: 0.0, L: [34, 23, 18], w: 19.5 },      // middle
  { base: [-11, -40], a: -0.07, L: [31, 21, 17], w: 18.5 },  // ring
  { base: [-29, -32], a: -0.17, L: [24, 16, 14], w: 16 },    // little
];
const THUMB = { base: [37, -2], L: [31, 27], w: 20.5 };
const PALM = [[-33, 50], [-44, 12], [-45, -24], [-39, -42], [-10, -50], [22, -48], [42, -38], [48, -10], [47, 24], [34, 52]];
const WRIST = 44;            // the cuff's edge, local y
const HAND_K = 1.1;          // the hands' size on the bench (1 = the numbers above): big enough to read at a quarter size

// ---- poses (left-hand local numbers). f: per finger [spread, curl, lift]; t: thumb [angle, bend, curl] -----------------
const POSE = {
  rest: { f: [[0.0, 0.42, 0], [0, 0.45, 0], [-0.03, 0.48, 0], [-0.08, 0.52, 0]], t: [0.62, 0.25, 0.1], bend: -0.1, hover: 0.06 },
  tap: { f: [[-0.02, 0, 0], [0.02, 0.8, 0], [-0.02, 0.88, 0], [-0.06, 0.92, 0]], t: [0.5, 0.65, 0.25], bend: 0.08, hover: 0.22 },
  chalk: { f: [[0.18, 0.6, 0], [0.04, 0.8, 0], [-0.04, 0.86, 0], [-0.1, 0.9, 0]], t: [0.1, -0.12, 0], bend: -0.3, hover: 0.28 },
  grip: { f: [[0.3, 0.6, 0], [0.1, 0.62, 0], [-0.1, 0.66, 0], [-0.32, 0.72, 0]], t: [0.55, 0.45, 0], bend: 0.0, hover: 0.16 },
  card: { f: [[0.05, 0.04, 0], [0, 0.03, 0], [-0.05, 0.05, 0], [-0.1, 0.08, 0]], t: [0.95, 0.12, 0], bend: -0.55, hover: 0.04 },
  lid: { f: [[0.05, 0.3, 0], [0, 0.3, 0], [-0.05, 0.33, 0], [-0.12, 0.38, 0]], t: [0.8, 0.25, 0], bend: 0.0, hover: 0.06 },
  crank: { f: [[0.05, 0.93, 0], [0, 0.96, 0], [-0.05, 0.96, 0], [-0.11, 0.96, 0]], t: [0.2, 0.95, 0], bend: 0.1, hover: 0.32 },
};
const CARRY = { f: [[0.04, 0.34, 0], [0, 0.38, 0], [-0.04, 0.42, 0], [-0.1, 0.46, 0]], t: [0.8, 0.4, 0.1] };   // a hand in transit
const CHALK_STICK = { len: 50, w: 10, dir: -0.95, out: 36 };   // the stick, held in the pinch; `out` of it shows past the pinch

// one finger: joint points (local) for spread, curl, lift; palmK foreshortens the knuckle line with the palm
function fingerChain(F, spread, curl, lift, palmK) {
  const a = (F.a + spread) * (1 - 0.35 * curl);
  const dx = Math.sin(a), dy = -Math.cos(a);
  const bx = F.base[0], by = F.base[1] * palmK;
  const th1 = curl * 1.3, th2 = th1 + curl * 1.5, th3 = th2 + curl * 1.0;
  const pts = [[bx - dx * 10, by - dy * 10], [bx, by]];
  let x = bx, y = by;
  const k = 1 + 0.1 * lift, fore = Math.cos(0.8 * clamp(lift, 0, 1));   // a raised finger: nearer, so wider, and shorter
  for (const [L, th] of [[F.L[0], th1], [F.L[1], th2], [F.L[2], th3]]) {
    const p = L * k * fore * Math.max(0.1, Math.cos(th));
    x += dx * p; y += dy * p; pts.push([x, y]);
  }
  return { pts, w: F.w * k, tip: [x, y] };
}
function thumbChain(t, palmK) {
  const [ang, bend, curl] = t;
  const bx = THUMB.base[0], by = THUMB.base[1] * palmK;
  const pts = [[bx - 8, by + 10], [bx, by]];
  let x = bx, y = by;
  [[THUMB.L[0], ang], [THUMB.L[1], ang - bend]].forEach(([L, a]) => {
    const p = L * (1 - 0.45 * curl);
    x += Math.sin(a) * p; y -= Math.cos(a) * p; pts.push([x, y]);
  });
  return { pts, w: THUMB.w, tip: [x, y] };
}
function handGeometry(P, palmK) {
  const fingers = FINGERS.map((F, i) => fingerChain(F, P.f[i][0], P.f[i][1], P.f[i][2], palmK));
  const thumb = thumbChain(P.t, palmK);
  const pinch = [(fingers[0].tip[0] + thumb.tip[0]) / 2, (fingers[0].tip[1] + thumb.tip[1]) / 2];
  return { fingers, thumb, pinch };
}
const chalkTipLocal = (g) => [g.pinch[0] + Math.sin(CHALK_STICK.dir) * CHALK_STICK.out, g.pinch[1] - Math.cos(CHALK_STICK.dir) * CHALK_STICK.out];

export function createHands({ layout }) {
  const { HANDS, CRANK, KNOB, DIAL, TITLE_CARD, BOX, BENCH } = layout;
  const LD = layout.LIGHT_DIR || { dx: 0.62, dy: 0.78 };   // the way paper shadows fall on this bench
  // where each forearm comes from for each pose (an elbow off the bottom of the bench; it moves with the reach, so the
  // arm never lies across what the hand is showing: the chalking hand comes from the lower right, clear of the needle)
  const ELBOW = {
    left: { rest: [470, 1900], tap: [360, 1800], chalk: [1180, 1820], grip: [930, 1860], card: [600, 1900], lid: [980, 1850], crank: [470, 1900] },
    right: { crank: [1330, 1960] },
  };
  const elbowOf = (side, pose) => ELBOW[side][pose] || ELBOW[side].rest || ELBOW[side].crank;
  const dialPos = (u, rr) => { const a = DIAL.a0 + clamp(u, 0, 1) * (DIAL.a1 - DIAL.a0); return [DIAL.x + Math.cos(a) * DIAL.r * rr, DIAL.y + Math.sin(a) * DIAL.r * rr]; };
  let layer = null, lctx = null;

  // local -> bench for a hand at palm (px, py), axis angle A (the direction the fingers point), mirrored or not
  const toBench = (px, py, A, mir, s, l) => {
    const r = A + Math.PI / 2, c = Math.cos(r), sn = Math.sin(r), lx = (mir ? -l[0] : l[0]) * s, ly = l[1] * s;
    return [px + lx * c - ly * sn, py + lx * sn + ly * c];
  };
  // put the local point `cl` of the hand on the bench point `target`: the arm comes from the elbow, so the hand's
  // axis depends on where the palm is; four fixed-point steps are plenty
  function solve(target, cl, bend, mir, sh, s) {
    let px = target[0], py = target[1], A = 0;
    for (let i = 0; i < 4; i++) {
      A = Math.atan2(py - sh[1], px - sh[0]) + (mir ? -bend : bend);
      const q = toBench(0, 0, A, mir, s, cl);
      px = target[0] - q[0]; py = target[1] - q[1];
    }
    return { x: px, y: py, A };
  }

  // the chalk's tip on the dial: over the tick, outward, as S.chalkTick draws it (the number is chalked by S alone)
  const tickOf = (S) => clamp(isNum(S.chalkTick) ? S.chalkTick : (S.chalk || 0) / 0.4, 0, 1);
  function chalkTip(S) {
    const t = tickOf(S);
    return { p: dialPos(S.chalkU, lerp(0.8, 1.16, t)), hover: t > 0 ? 0 : 1 };
  }
  // the stick the maker chalks with: taken from the tray (programme-art draws the tray and its chalk, lower left, off
  // the P-DIAL picture) as the chalk pose begins (19:35), pinched for the tick, then kept, tucked under the curled
  // fingers with one end showing, for the rest of the programme: it leaves with the hands and comes back with them.
  // 0 = not taken yet; else the share of it that is in the pinch (the rest: tucked).
  const chalkPinch = (S) => sstep(clamp(S.hands.left.chalk || 0, 0, 1));
  const chalkHeld = (S) => (S.hands.left.chalk || 0) > 0 || tickOf(S) > 0;

  // ---- one pose's placement: target point on the bench and which local point goes there --------------------------
  function place(pose, S, side) {
    const mir = side === 'right', sh = elbowOf(side, pose);
    const P = POSE[pose] || POSE.rest, g = handGeometry(P, 1);
    let target, cl = [0, 0], bend = P.bend, hover = P.hover;
    switch (pose) {
      case 'crank': {
        target = [CRANK.x + Math.cos(S.crankAngle) * CRANK.r, CRANK.y + Math.sin(S.crankAngle) * CRANK.r];
        cl = [0, -50];
        bend += 0.22 * Math.sin(S.crankAngle + 0.9);                  // the wrist follows the handle round
        break;
      }
      case 'tap': {
        target = [DIAL.x - 62, DIAL.y + 74];                          // on the glass, clear of the needle and the zone
        cl = g.fingers[0].tip;
        break;
      }
      case 'chalk': {
        const ct = chalkTip(S);
        target = ct.p; cl = chalkTipLocal(g); hover += 0.25 * ct.hover;
        break;
      }
      case 'grip': {
        target = [KNOB.x, KNOB.y];
        cl = [-4, -90];                                               // the fingers curl over its near rim, thumb up its side
        // the twist: the hand turns with the knob through each turn, from behind it back to straight
        let twist = 0;
        if (S.knobTurning && isNum(S.lr) && S.lr > 0 && S.needle > 0 && S.needleU > 0.02) {
          const remU = Math.log(S.lr / S.needle) / Math.log(DIAL.max / DIAL.min);
          twist = clamp(-remU * (S.knobAngle / S.needleU) * 0.6, -0.5, 0.5);
          hover -= 0.08;
        }
        bend += twist;
        break;
      }
      case 'card': {
        const s = clamp(S.titleSlide, 0, 1);
        const sh2 = s < 0.4 ? s : 0.4 + 0.16 * (1 - Math.exp(-(s - 0.4) / 0.16));   // pushes, then lets it glide
        const cx = lerp(TITLE_CARD.x, TITLE_CARD.exitX, sh2);
        target = [cx + TITLE_CARD.w * 0.8, TITLE_CARD.y + TITLE_CARD.h * 0.84];   // fingertips on the card's lower edge
        hover += 0.5 * clamp((s - 0.45) / 0.4, 0, 1);
        cl = g.fingers[1].tip;
        break;
      }
      case 'lid': {
        const l = clamp(S.lidClosed || 0, 0, 1);
        target = [BOX.x + BOX.w * 0.5, BOX.y + Math.max(10, BOX.h * Math.sin(l * Math.PI / 2)) - 6];   // on the lid's edge
        cl = [0, -50];
        break;
      }
      default: {                                                      // rest (and anything without a place)
        const R = HANDS[side] && HANDS[side].rest ? HANDS[side].rest : HANDS.left.rest;
        target = [R.x, R.y];
      }
    }
    const s = HAND_K;
    const at = solve(target, cl, bend, mir, sh, s);
    return { ...at, P, hover, pose, sh };
  }

  // ---- the whole hand for this frame ---------------------------------------------------------------------------------
  function handState(S, side) {
    const H = S.hands, W = side === 'left' ? H.left : H.right;
    const present = clamp(H.present, 0, 1);
    if (!(present > 0)) return null;
    const mir = side === 'right';
    let poses = Object.entries(W).filter(([, w]) => w > 1e-6);
    if (side === 'right') poses = poses.map(([k, w]) => [k === 'rest' ? 'crank' : (POSE[k] ? k : 'crank'), w]);
    if (!poses.length) poses = [[side === 'right' ? 'crank' : 'rest', 1]];
    // eased weights (smoothstep each, renormalised): a hand accelerates out of one pose and settles into the next
    let es = poses.map(([, w]) => sstep(w)), sum = es.reduce((a, b) => a + b, 0) || 1;
    es = es.map((e) => e / sum);
    const raw = poses.map(([, w]) => w), rs = raw.reduce((a, b) => a + b, 0) || 1;
    const tau = clamp(1 - raw.reduce((a, w) => a + (w / rs) * (w / rs), 0), 0, 0.5) * 2;   // 0 in a pose, 1 half way
    const pl = poses.map(([k]) => place(k, S, side));
    let x = 0, y = 0, ax = 0, ay = 0, hover = 0;
    const sh = [0, 0];
    const P = { f: [0, 1, 2, 3].map(() => [0, 0, 0]), t: [0, 0, 0] };
    pl.forEach((p, i) => {
      const e = es[i];
      x += p.x * e; y += p.y * e; sh[0] += p.sh[0] * e; sh[1] += p.sh[1] * e; ax += Math.cos(p.A) * e; ay += Math.sin(p.A) * e; hover += p.hover * e;
      for (let j = 0; j < 4; j++) for (let k = 0; k < 3; k++) P.f[j][k] += p.P.f[j][k] * e;
      for (let k = 0; k < 3; k++) P.t[k] += p.P.t[k] * e;
    });
    let A = Math.atan2(ay, ax);
    // the arc: a hand travelling between two places bows away from the shoulder (it swings from the elbow)
    for (let i = 0; i < pl.length; i++) for (let j = i + 1; j < pl.length; j++) {
      const dx = pl[j].x - pl[i].x, dy = pl[j].y - pl[i].y, d = Math.hypot(dx, dy);
      if (d < 1) continue;
      let nx = -dy / d, ny = dx / d;
      if ((nx * ((pl[i].x + pl[j].x) / 2 - sh[0]) + ny * ((pl[i].y + pl[j].y) / 2 - sh[1])) < 0) { nx = -nx; ny = -ny; }
      const k = 4 * es[i] * es[j] * 0.12 * d;
      x += nx * k; y += ny * k;
    }
    // in transit the fingers relax into a carry and the hand lifts
    for (let j = 0; j < 4; j++) for (let k = 0; k < 3; k++) P.f[j][k] = lerp(P.f[j][k], CARRY.f[j][k], 0.7 * tau);
    for (let k = 0; k < 3; k++) P.t[k] = lerp(P.t[k], CARRY.t[k], 0.7 * tau);
    hover += 0.55 * tau;

    // the fingers' own movements, from S
    if (side === 'left') {
      P.f[0][2] += H.fingerLift || 0;                                         // tap-along: the index lifts
      const tw = W.tap || 0;
      P.f[0][2] += tw * (1 - clamp(H.dialTap || 0, 0, 1));                    // five-minute tap: up, then onto the glass
      hover += tw * 0.25 * (1 - clamp(H.dialTap || 0, 0, 1)) - tw * 0.15 * clamp(H.dialTap || 0, 0, 1);
    }
    // idle: the resting fingers breathe (a slow closed form of the bar clock, about 3.75 s a breath)
    const restW = side === 'left' ? (W.rest || 0) : 0;
    const ph = TAU * ((S.bar || 0) + (S.barPhase || 0)) / 3;
    if (restW > 0) {
      for (let j = 0; j < 4; j++) { P.f[j][1] += restW * 0.05 * Math.sin(ph - j * 0.5); P.f[j][0] += restW * 0.012 * Math.sin(ph + j); }
      P.t[0] += restW * 0.05 * Math.sin(ph + 0.8);
      y += restW * 1.6 * Math.sin(ph); x += restW * 0.8 * Math.sin(ph * 0.5 + 1);
    }
    if (side === 'right') hover += 0.04 * Math.sin(S.crankAngle * 2);

    // leaving and returning: gather, lift, then draw back along the arm and out of the picture
    const u = 1 - present;
    let palmK = 1;
    if (u > 0) {
      const g1 = sstep(u / 0.4), g2 = Math.pow(clamp((u - 0.12) / 0.88, 0, 1), 1.5);   // lift first; then draw back, slow to start
      for (let j = 0; j < 4; j++) { P.f[j][1] = lerp(P.f[j][1], Math.max(P.f[j][1], 0.5), g1); P.f[j][0] *= 1 - 0.5 * g1; P.f[j][2] *= 1 - g1; }
      P.t[0] = lerp(P.t[0], 0.45, g1); P.t[1] = lerp(P.t[1], 0.5, g1);
      palmK = 1 - 0.18 * g1;
      hover += 0.9 * g1;
      const bx = sh[0] - x, by = sh[1] - y, bl = Math.hypot(bx, by);
      const uy = by / bl, D = Math.max(300, (BENCH.h + 150 - y) / Math.max(0.35, uy));
      x += (bx / bl) * D * g2; y += (by / bl) * D * g2;
      A += (mir ? -1 : 1) * 0.08 * g1;
    }
    hover = clamp(hover, 0, 1.6);
    return { x, y, A, P, hover, palmK, mir, sh, side, chalk: side === 'left' && chalkHeld(S), pinch: side === 'left' ? chalkPinch(S) : 0 };
  }

  // ---- drawing -------------------------------------------------------------------------------------------------------
  function strokePiece(c, pts, w, fill, edge, sdx, sdy) {
    const path = () => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); };
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.save(); c.globalCompositeOperation = 'source-atop'; c.translate(sdx, sdy); path(); c.strokeStyle = C.piece; c.lineWidth = w + 1; c.stroke(); c.restore();
    path(); c.strokeStyle = edge; c.lineWidth = w + 2.6; c.stroke();
    c.strokeStyle = fill; c.lineWidth = w - 0.4; c.stroke();
  }
  function smoothClosed(c, pts) {
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[n - 1], pts[0]);
    c.beginPath(); c.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); c.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
    c.closePath();
  }
  function fillPiece(c, build, fill, edge, sdx, sdy, lw = 2.6) {
    c.save(); c.globalCompositeOperation = 'source-atop'; c.translate(sdx, sdy); build(); c.fillStyle = C.piece; c.fill(); c.restore();
    build(); c.fillStyle = fill; c.fill(); c.strokeStyle = edge; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
  }

  // the sleeve and cuff, in bench units: from the wrist toward the shoulder, off the bottom of the bench
  function drawSleeve(c, h, wrist, sdx, sdy, cuffOnly) {
    const ux0 = h.sh[0] - wrist[0], uy0 = h.sh[1] - wrist[1], ul = Math.hypot(ux0, uy0), ux = ux0 / ul, uy = uy0 / ul;
    const vx = -uy, vy = ux;
    const P = (t, v) => [wrist[0] + (ux * t + vx * v) * HAND_K, wrist[1] + (uy * t + vy * v) * HAND_K];   // sleeve units
    const tEnd = Math.min(ul, Math.max(260, uy > 0.2 ? (BENCH.h + 140 - wrist[1]) / uy : 900)) / HAND_K;
    if (!cuffOnly) {
      // the sleeve body: widening toward the elbow, stockinette Vs
      const body = () => { const a = P(40, -41), b = P(tEnd, -60), d = P(tEnd, 60), e = P(40, 41); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); };
      fillPiece(c, body, C.knit, C.knitEdge, sdx, sdy);
      c.save(); body(); c.clip();
      c.beginPath();
      for (let t = 54; t < tEnd; t += 10) {
        const hw = lerp(41, 60, (t - 40) / Math.max(1, tEnd - 40));
        for (let v = -hw + 6; v < hw - 3; v += 10) {
          const a = P(t, v - 4), m = P(t + 6, v), b = P(t, v + 4);
          c.moveTo(a[0], a[1]); c.lineTo(m[0], m[1]); c.lineTo(b[0], b[1]);
        }
      }
      c.strokeStyle = C.knitDark; c.lineWidth = 1.7; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
      c.restore();
      return;
    }
    // the ribbed cuff, over the wrist end of the palm
    const cuff = () => {
      const a = P(-10, -37), b = P(46, -39), d = P(46, 39), e = P(-10, 37), m = P(-17, 0);
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]);
      c.quadraticCurveTo(m[0], m[1], a[0], a[1]); c.closePath();
    };
    fillPiece(c, cuff, C.knit, C.knitEdge, sdx, sdy);
    c.save(); cuff(); c.clip(); c.beginPath();
    for (let v = -33; v <= 33; v += 6.6) { const a = P(-16, v), b = P(44, v); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
    c.strokeStyle = C.knitRib; c.lineWidth = 1.8; c.stroke();
    const f1 = P(40, -39), f2 = P(40, 39); c.beginPath(); c.moveTo(f1[0], f1[1]); c.lineTo(f2[0], f2[1]);
    c.strokeStyle = C.knitEdge; c.lineWidth = 2; c.stroke();
    c.restore();
  }

  function drawChalkStick(c, x, y, a, sdx, sdy) {
    c.save(); c.translate(x, y); c.rotate(a);
    const L = CHALK_STICK.len, w = CHALK_STICK.w;
    const b = () => { c.beginPath(); c.moveTo(-L / 2 + w / 2, -w / 2); c.lineTo(L / 2 - 2, -w / 2); c.quadraticCurveTo(L / 2 + 2, 0, L / 2 - 2, w / 2); c.lineTo(-L / 2 + w / 2, w / 2); c.arc(-L / 2 + w / 2, 0, w / 2, Math.PI / 2, Math.PI * 1.5); c.closePath(); };
    fillPiece(c, b, C.chalk, C.chalkEdge, sdx, sdy, 1.8);
    c.restore();
  }

  // the stick in hand-local units: in the pinch (its tip past the fingers), or tucked under the curled little fingers
  function stickAt(g, h) {
    const t = chalkTipLocal(g), d = CHALK_STICK.dir;
    const pin = [t[0] - Math.sin(d) * CHALK_STICK.len / 2, t[1] + Math.cos(d) * CHALK_STICK.len / 2, d - Math.PI / 2];
    const tuck = [-44, -30 * h.palmK, Math.PI + 0.3];
    const k = h.pinch;
    return [lerp(tuck[0], pin[0], k), lerp(tuck[1], pin[1], k), lerp(tuck[2], pin[2], k)];
  }

  // one hand into the layer (bench units on c), returns nothing; the layer is composited with its cast shadow after
  function drawHand(c, h) {
    const g = handGeometry(h.P, h.palmK);
    const s = HAND_K * (1 + 0.08 * h.hover);
    // piece shadow direction: away from the lamp, in hand-local terms
    const wsd = [2.8 * LD.dx, 2.8 * LD.dy];
    const r = h.A + Math.PI / 2, cs = Math.cos(r), sn = Math.sin(r);
    const locSd = [(wsd[0] * cs + wsd[1] * sn) / s * (h.mir ? -1 : 1), (-wsd[0] * sn + wsd[1] * cs) / s];
    const wrist = toBench(h.x, h.y, h.A, h.mir, s, [0, WRIST * h.palmK]);
    drawSleeve(c, h, wrist, wsd[0], wsd[1], false);
    c.save();
    c.translate(h.x, h.y); c.rotate(r); if (h.mir) c.scale(-1, 1); c.scale(s, s);
    if (h.chalk && h.pinch < 0.5) { const st = stickAt(g, h); drawChalkStick(c, st[0], st[1], st[2], locSd[0], locSd[1]); }   // tucked
    for (let j = 3; j >= 0; j--) {
      const lf = clamp(h.P.f[j][2], 0, 1);
      strokePiece(c, g.fingers[j].pts, g.fingers[j].w, lf > 0.02 ? mixHex(C.skin, C.skinLight, lf) : C.skin, C.skinEdge, locSd[0], locSd[1]);
    }
    strokePiece(c, g.thumb.pts, g.thumb.w, C.skin, C.skinEdge, locSd[0], locSd[1]);
    const palm = PALM.map(([px, py]) => [px, py * h.palmK]);
    fillPiece(c, () => smoothClosed(c, palm), C.skin, C.skinEdge, locSd[0], locSd[1]);
    if (h.chalk && h.pinch >= 0.5) {                         // the chalk in the pinch: over the hand, under the fingertip
      const st = stickAt(g, h);
      drawChalkStick(c, st[0], st[1], st[2], locSd[0], locSd[1]);
      const ip = g.fingers[0].pts;
      strokePiece(c, ip.slice(Math.max(0, ip.length - 2)), g.fingers[0].w, C.skin, C.skinEdge, locSd[0], locSd[1]);
      const tp = g.thumb.pts;
      strokePiece(c, tp.slice(tp.length - 2), g.thumb.w, C.skin, C.skinEdge, locSd[0], locSd[1]);
    }
    c.restore();
    drawSleeve(c, h, wrist, wsd[0], wsd[1], true);
  }

  function bbox(h, m) {
    const s = HAND_K * (1 + 0.08 * h.hover), pts = [];
    for (const l of [[-70, -130], [70, -130], [-70, 60], [70, 60], [90, -60], [-90, -60]]) pts.push(toBench(h.x, h.y, h.A, h.mir, s, l));
    const w = toBench(h.x, h.y, h.A, h.mir, s, [0, WRIST]);
    const ux = h.sh[0] - w[0], uy = h.sh[1] - w[1], ul = Math.hypot(ux, uy);
    const far = Math.min(ul, 1100);
    pts.push([w[0] + ux / ul * far - 70, w[1] + uy / ul * far], [w[0] + ux / ul * far + 70, w[1] + uy / ul * far]);
    const dev = pts.map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
    return [Math.min(...dev.map((p) => p[0])), Math.min(...dev.map((p) => p[1])), Math.max(...dev.map((p) => p[0])), Math.max(...dev.map((p) => p[1]))];
  }

  function drawUnder(ctx, S, view) {                // eslint-disable-line no-unused-vars
    // nothing of the hands lies under the bench's objects: the hands hover over everything, and their shadow is drawn
    // with them in drawOver (index.js calls both, in this order, after the bench)
  }

  function drawOver(ctx, S, view) {                 // eslint-disable-line no-unused-vars
    const hs = [handState(S, 'right'), handState(S, 'left')].filter(Boolean);
    if (!hs.length) return;
    const cv = ctx.canvas, m = ctx.getTransform(), scale = Math.hypot(m.a, m.b);
    if (!layer || layer.width !== cv.width || layer.height !== cv.height) {
      layer = document.createElement('canvas'); layer.width = cv.width; layer.height = cv.height; lctx = layer.getContext('2d');
    }
    for (const h of hs) {
      const off = 9 + 34 * h.hover, blur = 5 + 18 * h.hover;
      const ox = LD.dx * off * scale, oy = LD.dy * off * scale;
      const pad = blur * scale * 2 + Math.hypot(ox, oy) + 6;
      let [x0, y0, x1, y1] = bbox(h, m);
      x0 = Math.max(0, Math.floor(x0 - pad)); y0 = Math.max(0, Math.floor(y0 - pad));
      x1 = Math.min(cv.width, Math.ceil(x1 + pad)); y1 = Math.min(cv.height, Math.ceil(y1 + pad));
      if (x1 <= x0 || y1 <= y0) continue;
      lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalCompositeOperation = 'source-over'; lctx.globalAlpha = 1;
      lctx.clearRect(x0, y0, x1 - x0, y1 - y0);
      lctx.save(); lctx.beginPath(); lctx.rect(x0, y0, x1 - x0, y1 - y0); lctx.clip();
      lctx.setTransform(m);
      drawHand(lctx, h);
      lctx.restore();
      const lf = clamp(h.P.f[0][2], 0, 1);
      if (lf > 0.02) {                                       // a raised finger throws its own shadow further out
        const g = handGeometry(h.P, h.palmK), s = HAND_K * (1 + 0.08 * h.hover);
        const pts = g.fingers[0].pts.slice(1).map((q) => toBench(h.x, h.y, h.A, h.mir, s, q));
        const d = off + 34 * lf;
        ctx.save(); ctx.filter = `blur(${(blur * 0.6 + 6 * lf) * scale}px)`;
        ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, px + LD.dx * d, py + LD.dy * d));
        ctx.strokeStyle = `rgba(${C.castShadow},${(0.55 * lf).toFixed(3)})`; ctx.lineWidth = g.fingers[0].w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.shadowColor = `rgba(${C.castShadow},${(0.46 - 0.2 * clamp(h.hover, 0, 1)).toFixed(3)})`;
      ctx.shadowBlur = blur * scale; ctx.shadowOffsetX = ox; ctx.shadowOffsetY = oy;
      ctx.drawImage(layer, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
      ctx.restore();
    }
  }

  return { drawUnder, drawOver };
}
