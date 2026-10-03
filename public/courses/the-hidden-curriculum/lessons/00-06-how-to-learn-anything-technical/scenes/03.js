/* 00.06 scene 03: One case file, five tabs (the mental model).
   The file slides in from 02's case room to home and the case is typed onto its first line, the five tabs pop up
   as named, you work every tab alone (2021), the clerk arrives at its desk (2026):
   chat app = YOU walk the evidence over to the clerk; agent = the CLERK walks the tabs and fetches the files itself.
   You sign. Then the picture breaks: the error is a note, not a culprit; no final reveal, just a loop. */
SCENE('03', (t, S) => {
  K.bg();
  const g = K.ctx();
  const C = K.C;

  // ---- cue times (local seconds) ----
  const cTabs = S.cue('tabs', 2.66);
  const cAlone = S.cue('alone', 8.74);
  const cClerk = S.cue('clerk-arrives', 11.81);
  const cSign = S.cue('sign', 22.2);
  const cBreaks = S.cue('breaks', 25.08);
  const cNoReveal = S.cue('no-reveal', 30.8);
  const fw = (w, n, fb) => { const v = S.find(w, n, fb); return Number.isFinite(v) ? v : fb; };
  const tabAt = [fw('clue', 0, 4.64), fw('search', 0, 5.36), fw('rulebook', 0, 6.03), fw('briefing', 0, 6.77), fw('experiment', 0, 7.47)];
  const tSmall = fw('small', 0, 1.47);
  const tWorked = fw('worked', 0, 10.12), tAloneW = fw(/^alone/, 0, 10.97);
  const tClerkW = fw('clerk', 0, 13.05);
  const tChat = fw('chat', 0, 17.14), tCarry = fw('carry', 0, 18.01), tToIt = fw(/^it;?$/, 0, 19.04);
  const tAgent = fw('agent', 0, 19.97), tFiles = fw(/^files/, 0, 20.91);
  const tSignW = fw('sign', 0, 23.39);
  const tCulprit = fw(/^culprit/, 0, 28.17), tNote = fw('note', 0, 29.09);
  const tNext = fw('next', 0, 32.89), tWorks = fw(/^works/, 0, 33.67);

  // ---- a slow 2% push while the case is introduced, eased back out before the 2021 beat ----
  const push = 1 + 0.02 * (K.io(t, tSmall - 0.2, 2.6) - K.io(t, tabAt[4] + 0.4, 0.9));
  g.save(); g.translate(960, 560); g.scale(push, push); g.translate(-960, -560);

  // ---- the file: 02's room position -> home ----
  const slide = K.io(t, 0.1, 0.8);
  const F = M.lerpGeo('room', 'home', slide);

  // ---- you (left): steps toward the file to pick up the evidence in chat mode, then back ----
  const step = K.io(t, tChat - 0.05, 0.5) * (1 - K.io(t, tToIt + 0.3, 0.5));
  const youX = K.lerp(150, 380, slide) + 70 * step, youY = K.lerp(650, 620, slide), youS = K.lerp(100, 120, slide);

  // ---- the clerk (right) ----
  const CX = 1600, CY = 600;
  const clerkK = K.io(t, cClerk, 0.7);

  // ---- small evidence chips: an error and app.py (typed onto the sheet with the case) ----
  const chipFont = { font: 'mono', size: 26 };
  const chips = [{ icon: 'warning', text: 'error', col: C.accent }, { icon: 'code', text: 'app.py', col: C.strong }];
  chips.forEach((c) => { c.w = 64 + K.measure(c.text, chipFont); });
  const chipH = 50;
  const drawChip = (c, x, y, o = {}) => { // centred at x, y
    const a = o.alpha == null ? 1 : o.alpha;
    if (a <= 0) return;
    K.layer(a, () => {
      if (o.glow) K.glow(x, y, c.w * 0.7, C.head, 0.35 * o.glow);
      K.card(x - c.w / 2, y - chipH / 2, c.w, chipH, { r: 10, fill: '#2B2735', stroke: o.stroke || K.rgba(C.strong, 0.55), shadow: false });
      K.icon(c.icon, x - c.w / 2 + 26, y, 26, { color: c.col });
      K.text(c.text, x - c.w / 2 + 48, y + 9, { ...chipFont, color: C.strong });
    });
  };
  const chipHome = (i) => {
    const S0 = F.sheet, s = F.s, x = S0.x + 56 * s + (i ? chips[0].w * s + 18 * s : 0) + chips[i].w * s / 2;
    return [x, S0.y + 150 * s];
  };
  // chips on the sheet: appear with the typed case, glow when fetched, fade before the error card needs the room
  const chipIn = [K.io(t, tSmall + 0.75, 0.45), K.io(t, tSmall + 0.95, 0.45)];
  const chipOut = 1 - K.io(t, cBreaks, 0.5);

  // ---- tab flashes ----
  const flash = [0, 0, 0, 0, 0];
  const addFlash = (i, v) => { flash[i] = Math.max(flash[i], v); };
  tabAt.forEach((a, i) => addFlash(i, K.env(t, a, a + 0.7, 0.3)));
  // 2021: your solid line reaches tab i at (i + 1) / 5 of its run; each tab stays lit until the clerk arrives
  const yA = tWorked - 0.15, yB = Math.max(tAloneW + 0.3, yA + 1.4);
  for (let i = 0; i < 5; i++) addFlash(i, 0.85 * K.env(t, K.lerp(yA, yB, (i + 1) / 5) - 0.1, cClerk - 0.1, 0.3));
  // the clerk's trip (agent): desk -> Briefing -> Rulebook -> Search -> Clue -> into the sheet -> back
  const trip = { leave: tAgent, b: tAgent + 0.42, hop: 0.22 };
  trip.clue = trip.b + 3 * trip.hop; trip.dive = trip.clue + 0.3; trip.ret = Math.max(trip.dive + 0.15, tFiles + 0.35); trip.home = trip.ret + 0.7;
  for (let j = 0; j < 4; j++) addFlash(3 - j, K.env(t, trip.b + j * trip.hop - 0.05, trip.b + j * trip.hop + 0.35, 0.25));
  // the Clue tab flips the card out at [[breaks]]
  addFlash(0, K.env(t, cBreaks + 0.1, cBreaks + 1.0, 0.3));

  // 02 left the file with its tabs showing small; here they sit tucked low until each is named, then pop up
  const reveal = tabAt.map((a) => K.lerp(0.3, 1, K.io(t, a - 0.1, M.motion.light)));
  const caseGlow = K.env(t, cTabs, cTabs + 1.2, 0.4) * 0.7;

  // Workaround for 00-shared.js: its in-tab labels are 26 px at tracking -0.4, and 'Experiment' touches its tab's
  // slanted sides. Keep every label at 26 px and only tighten letter-spacing as much as each word needs to keep
  // >= 8 px clear of the slants (Experiment ends near -1 px tracking).
  const tabLabels = new Set(M.TABS.map((T) => T.label));
  const maxLW = F.tabs[0].w - 2 * (6 + 8) * F.s;
  const kText = K.text;
  K.text = (str, x, y, o = {}) => {
    if (!(tabLabels.has(str) && o.size >= 24 && o.size <= 27)) return kText(str, x, y, o);
    const base = { font: 'ui', weight: 600, size: 26, tracking: 0 };
    const w0 = K.measure(str, base), n = str.length;
    const tr = Math.max(-1.6, Math.min(-0.4, (maxLW - w0) / n));
    return kText(str, x, y, { ...o, size: 26, tracking: tr });
  };
  // the case typed onto the first line, as on the title card
  const caseLine = 'Stuck on an error.';
  const typedStr = K.typed(caseLine, t, tSmall - 0.1, 22);
  try {
    M.drawFile(t, F, {
      tabs: 0,
      reveal,
      flash,
      glow: caseGlow,
      sign: K.io(t, cSign, 0.8),
      signed: K.io(t, tSignW - 0.05, 0.9, 'lin'),
      content: (FF) => {
        if (typedStr.length) {
          const tx = FF.sheet.x + 56 * FF.s, ty = FF.sheet.y + 96 * FF.s;
          const w = K.text(typedStr, tx, ty, { font: 'read', size: 34 * FF.s, color: K.rgba(C.strong, 0.92) });
          if (!K.typedDone(caseLine, t, tSmall - 0.1, 22) && K.caretOn(t)) K.line(tx + w + 4, ty - 26 * FF.s, tx + w + 4, ty + 4, { color: C.strong, w: 2 });
        }
      },
    });
  } finally { K.text = kText; }

  // a sampled smooth path (Catmull-Rom through waypoints), a point on it, and a drawer for its first k
  const spline = (W, per = 18) => {
    const P = [];
    for (let i = 0; i < W.length - 1; i++) {
      const p0 = W[Math.max(0, i - 1)], p1 = W[i], p2 = W[i + 1], p3 = W[Math.min(W.length - 1, i + 2)];
      for (let j = i ? 1 : 0; j <= per; j++) {
        const u = j / per, u2 = u * u, u3 = u2 * u;
        P.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3)));
      }
    }
    return P;
  };
  const quad = (a, c, b, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * a[0] + 2 * u * v * c[0] + u * u * b[0], v * v * a[1] + 2 * u * v * c[1] + u * u * b[1]]; });
  const at = (P, k) => { const f = Math.max(0, Math.min(1, k)) * (P.length - 1); const i = Math.min(P.length - 2, Math.floor(f)), u = f - i; return [K.lerp(P[i][0], P[i + 1][0], u), K.lerp(P[i][1], P[i + 1][1], u)]; };
  const drawPath = (P, k, o) => {
    if (k <= 0) return;
    const n = Math.max(1, Math.floor(k * (P.length - 1))), [ex, ey] = at(P, k);
    K.layer(o.alpha == null ? 1 : o.alpha, () => {
      g.save(); g.strokeStyle = g.fillStyle = o.color; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
      if (o.dash) g.setLineDash(o.dash);
      g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i <= n; i++) g.lineTo(P[i][0], P[i][1]); g.lineTo(ex, ey); g.stroke();
      if (o.head !== false) {
        g.setLineDash([]);
        const [bx, by] = at(P, Math.max(0, k - 0.02)), ang = Math.atan2(ey - by, ex - bx), hs = 14;
        g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - hs * Math.cos(ang - 0.45), ey - hs * Math.sin(ang - 0.45));
        g.lineTo(ex - hs * Math.cos(ang + 0.45), ey - hs * Math.sin(ang + 0.45)); g.closePath(); g.fill();
      }
      g.restore();
    });
  };

  // ---- chips on the sheet (above the file, below everything that moves) ----
  const fetchGlow = K.env(t, trip.dive - 0.05, trip.ret + 0.1, 0.2);
  const pickGlow = K.env(t, tChat + 0.45, tCarry + 0.1, 0.2);
  chips.forEach((c, i) => {
    const [x, y] = chipHome(i);
    if (F.s > 0.9) drawChip(c, x, y + (1 - chipIn[i]) * 10, { alpha: chipIn[i] * chipOut, glow: Math.max(fetchGlow, pickGlow) });
  });

  // ---- 2021: the Briefing tab was a forum post (no AI to brief yet) ----
  const tBriefPass = K.lerp(yA, yB, 4 / 5);
  const forumK = K.io(t, tBriefPass - 0.25, 0.4) * (1 - K.io(t, cClerk + 0.1, 0.45));
  if (forumK > 0) {
    const T3 = F.tabs[3];
    K.pill('a forum post', T3.cx, F.y0 + 62 + (1 - forumK) * 6, { size: 26, color: C.soft, stroke: K.rgba(C.soft, 0.45), fill: '#24212F', alpha: forumK });
  }

  // ---- 2021: you worked every tab alone (solid cream), fades as the clerk arrives ----
  const yourK = K.seg(t, yA, yB);
  const yourAlpha = 1 - K.io(t, cClerk, 0.6);
  if (yourAlpha > 0 && yourK > 0) M.yourwork(F, yourK, { from: { x: youX + 40, y: youY - 70 }, first: 0, upto: 4, alpha: yourAlpha });

  // ---- the year chip above you ----
  const y21 = K.io(t, cAlone, 0.45) * (1 - K.io(t, cClerk, 0.45));
  const y26 = K.io(t, cClerk, 0.45);
  if (y21 > 0) M.dated('2021', youX, youY - 128 + (1 - y21) * 8, { alpha: y21, color: C.soft });
  if (y26 > 0) M.dated('2026', youX, youY - 128 + (1 - y26) * 8, { alpha: y26 });

  M.you(t, youX, youY, youS, { label: K.io(t, 0.4, 0.6) });

  // ---- chat app: you lift copies of the evidence out of the file and carry them over to the clerk's desk ----
  const deskSpot = [[CX - 112 - chips[0].w / 2 + 50, CY + 32], [CX + 112 + chips[1].w / 2 - 50, CY + 32]];
  const chatFade = 1 - K.io(t, tAgent - 0.45, 0.4);
  const reachK = K.io(t, tChat + 0.15, 0.45);
  const [h0x, h0y] = chipHome(0);
  if (reachK > 0 && chatFade > 0) {
    M.youLine(youX + 48, youY - 40, h0x - chips[0].w / 2 - 10, h0y, reachK, { alpha: chatFade * (1 - 0.6 * K.io(t, tCarry + 0.3, 0.5)), bend: -20 });
  }
  const carryP = spline([[h0x + 40, h0y - 30], [860, 330], [1010, 212], [1250, 200], [1400, 300], [CX - 190, CY - 40]]);
  const carryK = K.io(t, tCarry - 0.05, Math.max(0.9, tToIt - tCarry + 0.05), 'io');
  if (carryK > 0 && chatFade > 0) {
    drawPath(carryP, carryK, { color: C.strong, alpha: chatFade * 0.9, head: false });
    const land = K.io(t, tToIt - 0.05, 0.35);
    const [px, py] = at(carryP, carryK);
    chips.forEach((c, i) => {
      const rx = px + (i ? chips[1].w / 2 + 6 : -chips[0].w / 2 - 6), ry = py + 34;
      drawChip(c, K.lerp(rx, deskSpot[i][0], land), K.lerp(ry, deskSpot[i][1], land), { alpha: chatFade, stroke: K.rgba(C.strong, 0.9) });
    });
  }

  // ---- 2026: the clerk at its desk; in agent mode the clerk itself makes the trip ----
  const T = F.tabs, tp = (i) => [T[i].cx - 14 * F.s, T[i].top - 18 * F.s];
  const home = [CX, CY];
  const legFrom = { x: CX - 30, y: CY - 52 };
  // the trip, as timed segments: leave -> Briefing (bend like M.legwork's first leg), 3 hops, dive, return
  const lift = 40 * F.s;
  const seg0 = quad([legFrom.x, legFrom.y], [(legFrom.x + tp(3)[0]) / 2, Math.min(legFrom.y, tp(3)[1]) - 30], tp(3));
  const hopsP = [2, 1, 0].map((i) => { const a = tp(i + 1), b = tp(i); return quad(a, [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - lift], b); });
  const [hx, hy] = chipHome(0), [hx1] = chipHome(1);
  const chipMid = [(hx + hx1) / 2, hy + 84];
  const diveP = quad(tp(0), [560, chipMid[1] + 20], chipMid, 16);
  const retP = quad(chipMid, [1200, 720], [CX - 20, CY - 6], 30);
  const tripSegs = [[seg0, trip.leave, trip.b], ...hopsP.map((P, j) => [P, trip.b + j * trip.hop, trip.b + (j + 1) * trip.hop]), [diveP, trip.clue, trip.dive], [retP, trip.ret, trip.home]];
  let clerkPos = home;
  if (t >= trip.leave && t < trip.home) {
    clerkPos = chipMid;
    for (const [P, a, b] of tripSegs) {
      if (t < a) break;
      clerkPos = at(P, K.ease.io(K.seg(t, a, b)));
    }
  }
  const away = K.io(t, trip.leave, 0.25) * (1 - K.io(t, trip.home - 0.25, 0.25));
  const legFade = (1 - 0.55 * K.io(t, cBreaks, 0.6)) * (1 - K.io(t, cNoReveal - 0.3, 0.6));

  // the clerk's dashed trail: legwork over four tabs (stops at Briefing; Experiment stays yours), then the dive
  const legK = t < trip.b ? 0.25 * K.seg(t, trip.leave, trip.b) : 0.25 + 0.75 * K.seg(t, trip.b, trip.clue);
  if (t > trip.leave) M.legwork(F, legK * 1.0, { from: legFrom, first: 3, upto: 0, alpha: legFade });
  const diveK = K.seg(t, trip.clue, trip.dive);
  if (diveK > 0) drawPath(diveP, diveK, { color: C.head, dash: M.palette.clerkDash, head: false, alpha: legFade * (1 - K.io(t, cSign, 0.6)) });

  // the desk stays put; the clerk leaves it during the trip
  if (clerkK > 0) M.deskSliver(CX - 96 * 1.3, CY + 96 * 0.62, 96 * 2.6, { alpha: clerkK });
  // copies the clerk brings back sit on the desk
  const backLand = K.io(t, trip.home - 0.1, 0.35);
  const carried = t >= trip.ret && t < trip.home;
  if (clerkK > 0) {
    const cs = K.lerp(96, 72, away);
    M.clerk(t, clerkPos[0], clerkPos[1] + (1 - clerkK) * 40, cs, { alpha: clerkK, glow: 0.8 + 0.2 * away });
    if (carried) chips.forEach((c, i) => drawChip(c, clerkPos[0] + (i ? chips[1].w / 2 + 6 : -chips[0].w / 2 - 6), clerkPos[1] + 62, { stroke: K.rgba(C.head, 0.85) }));
    if (backLand > 0) chips.forEach((c, i) => drawChip(c, K.lerp(CX + (i ? chips[1].w / 2 + 6 : -chips[0].w / 2 - 6), deskSpot[i][0], backLand), K.lerp(CY + 62, deskSpot[i][1], backLand), { stroke: K.rgba(C.head, 0.85), alpha: 1 - 0.35 * K.io(t, cBreaks, 0.6) }));
    const lk = K.io(t, tClerkW, 0.5);
    if (lk > 0) K.text('the clerk', CX, CY + 48 + 44 + 56, { font: 'ui', weight: 600, size: 28, color: K.rgba(C.head, lk), align: 'center' });
  }

  // mode labels under the desk (one at a time): chat app, then agent
  const chatK = K.io(t, tChat - 0.05, 0.45) * (1 - K.io(t, tAgent - 0.3, 0.4));
  const agentK = K.io(t, tAgent - 0.05, 0.45) * (1 - K.io(t, cBreaks, 0.6));
  const modeLabel = (eb, body, a, dy) => {
    if (a <= 0) return;
    K.layer(a, () => {
      K.eyebrow(eb, CX, 812 + dy, { size: 22, align: 'center' });
      K.text(body, CX, 854 + dy, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'center' });
    });
  };
  modeLabel('chat app', 'you carry the evidence', chatK, (1 - K.io(t, tChat - 0.05, 0.45)) * 8);
  modeLabel('agent', 'it walks to your files', agentK, (1 - K.io(t, tAgent - 0.05, 0.45)) * 8);

  // only what's on its desk: the empty desktop pulses as it is said
  const tOnly = fw('only', 0, 14.99);
  const deskK = K.io(t, tOnly - 0.1, 0.45) * (1 - K.io(t, tChat - 0.35, 0.35));
  if (deskK > 0 && clerkK > 0) {
    K.glow(CX, CY + 66, 170, C.head, 0.28 * deskK * (0.75 + 0.25 * Math.sin((t - tOnly) * 5)));
    K.layer(deskK, () => K.text("only what's on its desk", CX, 844 + (1 - deskK) * 8, { font: 'ui', weight: 600, size: 30, color: C.head, align: 'center' }));
  }

  // ---- [[breaks]]: the error flips from a culprit into a note ----
  const cardIn = K.io(t, cBreaks + 0.2, 0.7);
  if (cardIn > 0) {
    const T0 = F.tabs[0];
    const cw = 620, ch = 170;
    const ccx = K.lerp(T0.cx, F.cx, cardIn), ccy = K.lerp(T0.cy + 20, F.sheet.y + 230, cardIn);
    const sc = K.lerp(0.25, 1, cardIn);
    const fu = K.seg(t, tCulprit + 0.25, tCulprit + 0.75);
    const flipS = Math.abs(Math.cos(Math.PI * fu));
    const noteFace = fu >= 0.5;
    K.layer(Math.min(1, cardIn * 1.5), () => K.at(ccx, ccy, sc, 0, () => {
      g.save(); g.scale(1, Math.max(0.02, flipS));
      const X = -cw / 2, Y = -ch / 2;
      if (!noteFace) {
        K.card(X, Y, cw, ch, { r: 18, fill: '#262333', stroke: C.line2 });
        g.save(); g.strokeStyle = C.soft; g.lineWidth = 4; g.lineCap = 'round';
        g.beginPath(); g.moveTo(X + 52, Y + 128); g.quadraticCurveTo(X + 52, Y + 36, X + 92, Y + 34); g.quadraticCurveTo(X + 132, Y + 36, X + 132, Y + 128); g.stroke();
        g.restore();
        K.icon('question', X + 92, Y + 92, 46, { color: C.soft });
        K.eyebrow('the error', X + 172, Y + 62, { size: 22, color: C.soft });
        K.text('a culprit?', X + 172, Y + 116, { font: 'read', size: 36, italic: true, color: C.soft });
        const strike = K.io(t, tCulprit - 0.05, 0.35);
        if (strike > 0) K.line(X + 168, Y + 104, X + 168 + K.measure('a culprit?', { font: 'read', size: 36, italic: true }) + 8, Y + 104, { k: strike, color: C.accent, w: 3 });
      } else {
        K.card(X, Y, cw, ch, { r: 18, fill: '#2E2838', stroke: K.rgba(C.head, 0.75), glow: 0.35 });
        g.save(); g.strokeStyle = C.head; g.lineWidth = 3.5; g.lineJoin = 'round';
        const nx = X + 60, ny = Y + 40;
        g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + 46, ny); g.lineTo(nx + 66, ny + 20); g.lineTo(nx + 66, ny + 90); g.lineTo(nx, ny + 90); g.closePath(); g.stroke();
        g.beginPath(); g.moveTo(nx + 46, ny); g.lineTo(nx + 46, ny + 20); g.lineTo(nx + 66, ny + 20); g.stroke();
        g.restore();
        K.line(nx + 12, ny + 44, nx + 52, ny + 44, { color: K.rgba(C.head, 0.7), w: 3 });
        K.line(nx + 12, ny + 60, nx + 46, ny + 60, { color: K.rgba(C.head, 0.7), w: 3 });
        K.line(nx + 12, ny + 76, nx + 52, ny + 76, { color: K.rgba(C.head, 0.7), w: 3 });
        K.eyebrow('the error', X + 172, Y + 62, { size: 22 });
        const ft = { font: 'read', size: 34, color: C.strong };
        K.text('a note, written to help you', X + 172, Y + 116, ft);
        const nx0 = X + 172 + K.measure('a ', ft), nw = K.measure('note', ft);
        K.mark(nx0, Y + 132, nw, K.io(t, tNote, 0.45));
      }
      g.restore();
    }));
  }

  // ---- [[no-reveal]]: the loop from Experiment back to Clue, with its words inside the arc ----
  const loopK = K.io(t, tNext - 0.6, Math.max(1.2, tWorks - tNext + 0.8), 'io');
  if (loopK > 0) M.loop(F, loopK);
  const l1 = K.io(t, cNoReveal, 0.5), l2 = K.io(t, tNext - 0.4, 0.5);
  if (l1 > 0) K.text('no final reveal', 960, 182 + (1 - l1) * 8, { font: 'read', size: 30, italic: true, color: K.rgba(C.soft, l1), align: 'center' });
  if (l2 > 0) K.text('just the next step that works', 960, 222 + (1 - l2) * 8, { font: 'read', size: 30, color: K.rgba(C.strong, l2), align: 'center' });

  g.restore(); // camera push
});
