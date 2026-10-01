/* 07 — The lantern: AI at every stop
   The road at the 'lantern' preset (y 560) with the lantern string (AI) hung above it at y 230.
   [[agent]]  a gold "coding agent" chip appears under stop 1, over an app.py window whose line it edits;
              lantern 1 lights. The agent is the subject of every later sentence, so every path starts at the chip.
   [[across]] a dashed terracotta request leaves the chip, climbs up the left of stop 1 (clear of the arrows) and arcs over
              the road to stop 5 (the model); lanterns 2, 3 light as it passes, lantern 5 when it lands.
   "MCP"      a second dashed path runs from the chip under the road to an MCP pill under stop 4;
   [[mcp]]    it branches to two other services (mail, docs); lantern 4 lights.
   "standing" a gold pin drops on stop 1 (where the agent stands); "keys" gold key chips ride both paths (request, MCP).
   [[light]]  each lantern drops a soft beam onto its stop (stop 5 included), left to right; the stops bloom;
              "AI = the lantern over the road" names the string. The spoken closing line is left to the caption. */
SCENE('07', (t, S) => {
  const C = K.C;
  const T = {
    agent: S.cue('agent', 2.29),
    across: S.cue('across', 5.86),
    mcpWord: S.find(/^MCP/, 0, 7.55),
    mcp: S.cue('mcp', 8.75),
    standing: S.find('standing', 0, 12.8),
    keys: S.find('keys', 0, 13.87),
    lantern: S.find(/^lantern/, 0, 15.9),
    light: S.cue('light', 16.81),
  };

  K.bg({ glow: 0.1, glowX: 960, glowY: 250 });

  const gm = M.geom('lantern');
  const LO = { xs: gm.xs, y: M.layout.lanternY.s07 };
  const c1 = gm.cards[0], c4 = gm.cards[3], c5 = gm.cards[4];

  // ---------------------------------------------------------------- the agent chip (under stop 1)
  const CHIP = { x: c1.x, y: 706, size: 26 };
  const chipTxt = { font: 'ui', size: CHIP.size, weight: 600 };
  const chipW = K.measure('coding agent', chipTxt) + 30 + CHIP.size * 1.8, chipH = 50;
  const chipR = CHIP.x + chipW / 2;

  // ---------------------------------------------------------------- the request path (agent → model)
  // three joined pieces: it leaves the chip's left end, climbs up the outside of stop 1 (x 96, left of the road,
  // so it never crosses a road arrow), then arcs over the whole road to the top of stop 5; sampled once and
  // walked by arc length (constant speed, u 0..1)
  const chipL = CHIP.x - chipW / 2, ox = 96;
  const bez = (P, u) => {
    const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
    return { x: a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], y: a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1] };
  };
  const pieces = [
    [[chipL - 4, CHIP.y], [ox + 10, CHIP.y], [ox, CHIP.y - 8], [ox, CHIP.y - 40]],
    [[ox, CHIP.y - 40], [ox, 600], [ox, 500], [ox, 440]],
    [[ox, 440], [ox, 350], [520, 372], [c5.x - 70, c5.t - 6]],
  ];
  const pts = [];
  pieces.forEach((P, pi) => { for (let j = pi ? 1 : 0; j <= 40; j++) pts.push(bez(P, j / 40)); });
  const cum = [0];
  for (let j = 1; j < pts.length; j++) cum.push(cum[j - 1] + Math.hypot(pts[j].x - pts[j - 1].x, pts[j].y - pts[j - 1].y));
  const L = cum[cum.length - 1];
  const cub = (u) => {
    const d = K.clamp(u) * L; let j = 1;
    while (j < cum.length - 1 && cum[j] < d) j++;
    const f = (d - cum[j - 1]) / ((cum[j] - cum[j - 1]) || 1);
    return { x: K.lerp(pts[j - 1].x, pts[j].x, f), y: K.lerp(pts[j - 1].y, pts[j].y, f) };
  };
  const arcD = 1.6;
  const arcK = K.io(t, T.across, arcD);
  // time the eased head reaches x (pure bisection: first on u, then on time)
  const uForX = (x) => { let lo = 0, hi = 1; for (let j = 0; j < 22; j++) { const m = (lo + hi) / 2; if (cub(m).x < x) lo = m; else hi = m; } return hi; };
  const reach = (u) => {
    let lo = T.across, hi = T.across + arcD;
    for (let j = 0; j < 18; j++) { const m = (lo + hi) / 2; if (K.io(m, T.across, arcD) < u) lo = m; else hi = m; }
    return hi;
  };
  const dashedCubic = (k, o) => {
    if (k <= 0) return;
    const g = K.ctx(); g.save();
    g.strokeStyle = g.fillStyle = o.color; g.lineWidth = o.w; g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash(o.dash);
    g.beginPath(); const n = 80;
    for (let i = 0; i <= n * k; i++) { const p = cub(i / n); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); }
    const e = cub(k); g.lineTo(e.x, e.y); g.stroke(); g.setLineDash([]);
    const b = cub(Math.max(0, k - 0.015)), a = Math.atan2(e.y - b.y, e.x - b.x), hs = o.headSize;
    g.beginPath(); g.moveTo(e.x, e.y); g.lineTo(e.x - hs * Math.cos(a - 0.45), e.y - hs * Math.sin(a - 0.45));
    g.lineTo(e.x - hs * Math.cos(a + 0.45), e.y - hs * Math.sin(a + 0.45)); g.closePath(); g.fill(); g.restore();
  };

  // ---------------------------------------------------------------- lantern lighting times
  const lightAt = [
    T.agent + 0.3,                   // the coding agent on your computer
    reach(uForX(gm.xs[1])),          // the request passes the network
    reach(uForX(gm.xs[2])),          // ...and the internet
    T.mcp + 0.2,                     // MCP reaches other services
    T.across + arcD - 0.05,          // it lands at the model
  ];
  const lanternLit = (i) => K.io(t, lightAt[i], M.motion.light);

  // props dim a little when the lantern line arrives, so the beams carry the end
  const propsA = 1 - 0.5 * K.io(t, T.light - 0.3, 0.8);

  // ---------------------------------------------------------------- [[light]] beams from each lantern onto its stop
  const beamAt = (i) => T.light + i * 0.25;
  for (let i = 0; i < 5; i++) {
    const bk = K.io(t, beamAt(i), M.motion.light);
    if (bk <= 0) continue;
    const p = M.lanternAt(i, LO), c = gm.cards[i];
    const y0 = p.y + 16, y1 = c.t + 2, w0 = 14, w1 = c.w * 0.42;
    const a = (0.75 + 0.25 * M.bump(t, beamAt(i), 1.1)) * bk;
    const g = K.ctx(); g.save();
    const gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, K.rgba(C.head, 0.30 * a)); gr.addColorStop(1, K.rgba(C.head, 0.07 * a));
    g.fillStyle = gr; g.beginPath();
    g.moveTo(p.x - w0, y0); g.lineTo(p.x + w0, y0); g.lineTo(c.x + w1, y1); g.lineTo(c.x - w1, y1); g.closePath(); g.fill();
    g.restore();
    K.glow(c.x, c.t + 4, 150, C.head, 0.16 * a);
  }

  // ---------------------------------------------------------------- the road (all five stops known)
  M.road(t, {
    geom: gm,
    lit: 1,
    pulse: (i) => M.bump(t, beamAt(i) + 0.15, 1.1),
    iconDx: (i) => (i === 2 ? K.wave(t, 1.2, 3) : 0),
  });

  // ---------------------------------------------------------------- lantern string
  const cordK = K.io(t, -0.2, 1.2);
  M.lanterns(t, { ...LO, lit: lanternLit, cord: cordK, alpha: K.io(t, -0.4, 0.8) });

  // the string's name, on "lantern"
  const nameK = K.io(t, T.lantern - 0.1, 0.6);
  if (nameK > 0) {
    K.text('AI = the lantern over the road', 960, 178 - (1 - nameK) * 8,
      { font: 'ui', size: 30, weight: 600, color: C.head, align: 'center', alpha: nameK });
  }

  // ---------------------------------------------------------------- [[agent]] code window + agent chip under stop 1
  const winK = K.io(t, T.agent, 0.6);
  if (winK > 0) {
    const wx = 84, wy = 748 + (1 - winK) * 18, ww = 390, wh = 160;
    K.layer(winK * propsA, () => {
      const r = K.win(wx, wy, ww, wh, { kind: 'code', title: 'app.py' });
      // line 2 rewrites itself: "Hi" → "Hello" (backspace, then type)
      const e0 = T.agent + 0.75, del = 3, cps = 12;
      const nDel = K.clamp(Math.floor((t - e0) * cps), 0, del);
      const typedFrom = e0 + del / cps + 0.15;
      const add = 'Hello"';
      const nAdd = K.clamp(Math.floor((t - typedFrom) * cps), 0, add.length);
      const line2 = '  return "' + 'Hi"'.slice(0, del - nDel) + add.slice(0, nAdd);
      const editing = t >= e0 - 0.2;
      if (editing) {
        const hk = K.io(t, e0 - 0.3, 0.4) * (1 - 0.6 * K.io(t, typedFrom + add.length / cps + 0.6, 0.8));
        const g = K.ctx();
        g.save(); g.fillStyle = K.rgba(C.head, 0.16 * hk); K.rr(r.x + 8, r.y + 26 + 26 * 1.55 - 6, r.w - 16, 40, 8); g.fill(); g.restore();
      }
      K.editor(r, t, ['def greet():', line2], { syntax: 'py', size: 26 });
      const done = t > typedFrom + add.length / cps + 0.5;
      if (editing && !done && K.caretOn(t)) {
        const cx = r.x + 26 + 60 + K.measure(line2, { font: 'mono', size: 26 });
        const g = K.ctx(); g.save(); g.fillStyle = C.head; g.fillRect(cx + 2, r.y + 26 + 26 + 40.3 - 22, 3, 28); g.restore();
      }
    });
  }
  // the chip: sparkle glyph + "coding agent", gold ring (AI light), between stop 1 and its window
  const chipK = K.io(t, T.agent - 0.05, 0.6);
  if (chipK > 0) {
    K.layer(chipK * (0.4 + 0.6 * propsA), () => {
      const y = CHIP.y + (1 - chipK) * 10;
      K.line(c1.x, c1.b + 4, c1.x, y - chipH / 2 - 2, { color: C.head, w: 2, alpha: 0.6 });
      K.card(CHIP.x - chipW / 2, y - chipH / 2, chipW, chipH, { r: chipH / 2, fill: C.tile, stroke: C.head, lw: 2, glow: 0.5 * lanternLit(0) });
      // four-point sparkle
      const sx = CHIP.x - chipW / 2 + CHIP.size * 0.9 + 12, sy = y, R = 13, rr = 3.2;
      const g = K.ctx(); g.save(); g.fillStyle = C.head; g.beginPath();
      g.moveTo(sx, sy - R); g.quadraticCurveTo(sx + rr, sy - rr, sx + R, sy); g.quadraticCurveTo(sx + rr, sy + rr, sx, sy + R);
      g.quadraticCurveTo(sx - rr, sy + rr, sx - R, sy); g.quadraticCurveTo(sx - rr, sy - rr, sx, sy - R); g.closePath(); g.fill(); g.restore();
      K.text('coding agent', sx + 22, y + CHIP.size * 0.34, { ...chipTxt, color: C.strong });
    });
  }

  // ---------------------------------------------------------------- [[across]] the request: chip → over the road → the model
  if (arcK > 0) K.layer(propsA, () => dashedCubic(arcK, { color: C.accent, w: 3, dash: [10, 10], headSize: 16 }));

  // "MCP": a path from the chip under the road to the MCP pill under stop 4, then [[mcp]] branches
  const pill = { x: c4.x, y: 714 };
  const pillW = K.measure('MCP', { font: 'ui', size: 28, weight: 600 }) + 28 * 1.6;
  const pathK = K.io(t, T.mcpWord - 0.15, 0.8);
  if (pathK > 0) {
    K.layer(propsA, () => {
      K.arrow(chipR + 6, CHIP.y + 8, pill.x - pillW / 2 - 8, pill.y + 4, { k: pathK, bend: 44, color: C.accent, w: 3, dash: [8, 8], headSize: 13 });
    });
  }
  const pillK = K.io(t, T.mcpWord + 0.45, 0.5);
  if (pillK > 0) {
    K.layer(pillK * propsA, () => {
      K.line(c4.x, c4.b + 4, c4.x, pill.y - 28, { color: C.line2, w: 2 });
      const lit4 = lanternLit(3);
      K.pill('MCP', pill.x, pill.y + (1 - pillK) * 10, { size: 28, color: C.strong, stroke: K.mixColor(C.line2, C.head, lit4), glow: 0.6 * lit4 });
    });
  }
  const tiles = [{ name: 'envelope', x: 1166 }, { name: 'book', x: 1454 }];
  tiles.forEach((tl, j) => {
    const a = T.mcp + j * 0.25, ak = K.io(t, a, M.motion.arrow), tk = K.io(t, a + 0.3, 0.5);
    if (ak <= 0) return;
    K.layer(propsA, () => {
      const sx = pill.x + (j ? 36 : -36), sy = pill.y + 22, ex = tl.x + (j ? -22 : 22), ey = 760;
      K.arrow(sx, sy, ex, ey, { k: ak, color: C.accent, w: 3, dash: [8, 8], headSize: 13, bend: j ? 14 : -14 });
      if (tk > 0) K.iconTile(tl.name, tl.x, 792 + (1 - tk) * 12, 64, { alpha: tk, color: C.soft });
    });
  });

  // "standing": a gold pin on stop 1, where the agent stands
  M.pin(t, T.standing - 0.15, c1.x, c1.roof.y - 2, { s: 40 });

  // "keys": two gold key chips (the scene 04 key style), one riding each of the agent's paths: the request to the
  // model carries its key over the gap between stops 2 and 3, the MCP path carries one mid-way; one soft pulse each
  const keyChip = (x, y, at) => {
    const k = K.io(t, at, 0.45);
    if (k <= 0) return;
    const b = M.bump(t, at + 0.35, 0.9);
    K.layer(k * propsA, () => {
      K.glow(x, y, 54, C.head, (0.26 + 0.22 * b) * k);
      K.card(x - 32, y - 32 + (1 - k) * 10, 64, 64, { r: 16, fill: C.tile, stroke: C.head, lw: 2, glow: 0.4 * b });
      K.icon('key', x, y + (1 - k) * 10, 40, { color: C.head });
    });
  };
  const kx1 = (gm.cards[1].r + gm.cards[2].l) / 2;
  const kTop = cub(uForX(kx1));
  keyChip(kx1, kTop.y, T.keys - 0.1);
  keyChip(820, 737, T.keys + 0.15);
});
