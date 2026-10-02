/* 00.03 · 04 — One long street of years
   The street of years drawn in full for the first time (geom 'full'), now drawn as a STREET:
   - "Picture one long street": a cobbled road band (kerbs, one paving stone per year) draws in left to right
     under the street line, decade ticks appearing as it passes.
   - "with a year painted on every building": ten blank ghost buildings rise out of the road, left to right
     (houses on both kerbs, roofs up; each house is sized to the sign it will carry, ~1991 is a terrace of three
     roofs for web · Python · Linux).
   - Then, cue by cue, the gold walks along the street (litTo, eased ahead of the names) and each building lights
     and gets its year painted on: the shared year tag hangs on its stem onto the house's facade.
   - [[far-end]]: the last stretch turns terracotta; the three lanterns (ghosts since frame 0) light one by one on
     their names, each with its stacked terracotta tag and a thin stem down to its exact year.
   - "fifty": a gold bracket spans the old street; "few": a short terracotta one spans the lanterns.
   The houses are drawn here (00-shared.js has no house option yet); see engineRequests: they should move into
   M.street so 05–09 keep the same buildings.
   Exit: the whole street with every lit building, brackets held, lanterns glowing, glow settled at centre. */
SCENE('04', (t, S) => {
  const M = window.M, C = K.C, gm = M.geom('full'), g = K.ctx();

  // ---- cues (local seconds)
  const cSev = S.cue('seventies', 3.9), cEig = S.cue('eighties', 11.1), cNin = S.cue('nineties', 17.6);
  const cTwo = S.cue('two-thousands', 23), cFar = S.cue('far-end', 30.2);
  const tLong = S.find('one', 0, 0.55);                 // "Picture one long street"
  const tEvery = S.find('every', 0, 2.79);              // "...painted on every building"
  const tFifty = S.find('fifty', 0, 44.5), tFew = S.find('few', 0, 45.8);
  const tLanterns = S.find('lanterns', 0, 31.8);        // "...the very end of the street, the lanterns."

  // ---- the road draws in on "one long street" (ticks appear as it passes)
  const draw = K.lerp(M.Y0, M.Y1, K.io(t, tLong, 1.8, 'io'));
  const xd = M.X(draw, gm);

  // ---- the gold walks the street, one decade-run per cue, a beat ahead of the names it reaches
  const LEAD = 0.3;
  const runs = [[cSev, 1976], [cEig, 1986], [cNin, 1999], [cTwo, 2018], [cFar, 2026]];
  let lit = M.Y0;
  runs.forEach(([at, to]) => { lit = K.lerp(lit, to, K.io(t, at - LEAD, M.motion.draw, 'io')); });

  // ---- each building gets its year on its spoken year (or name, when the name is said first)
  const hangAt = [
    S.find('1969', 0, 3.9),        // unix
    S.find('1973', 0, 6.4),        // ethernet
    S.find('1981', 0, 11.1),       // ms-dos
    S.find('1983', 0, 14.0),       // dns
    S.find('web', 0, 17.9),        // ~1991 web · Python · Linux
    S.find('JavaScript', 0, 21.1), // js
    S.find('Git', 0, 23.0),        // git ("Git," comes before "GitHub,")
    S.find('GitHub', 0, 24.6),     // github
    S.find('Docker', 0, 26.3),     // docker
    S.find(/^V$/, 0, 28.1),        // vs code ("V S Code")
  ];
  const show = (i) => K.io(t, hangAt[i], M.motion.hang, 'out');
  // the building being named warms briefly, then rests
  const itemLit = (i) => 0.75 * K.io(t, hangAt[i] + 0.2, 0.4) * (1 - K.io(t, hangAt[i] + 2.2, 0.8));
  // blank buildings rise out of the road on "every building", left to right
  const riseAt = (i) => tEvery + 0.07 * i;
  const rise = (i) => K.io(t, riseAt(i), 0.45, 'out');
  const named = (i) => K.io(t, hangAt[i], 0.4, 'io');      // ghost → lit building

  // ---- the lanterns: ghosts from frame 0; a faint warmth on "the lanterns"; each lights on its name
  const lightAt = [
    S.find('GitHub', 1, 32.7),     // "GitHub Copilot"
    S.find('ChatGPT', 0, 36.2),
    S.find(/^M$/, 1, 38.4),        // "M C P" (the first M is "M S DOS")
  ];
  const warm = 0.18 * K.io(t, tLanterns, 0.8);
  const lanterns = (i) => Math.max(warm, K.io(t, lightAt[i], M.motion.light, 'io'));
  const lanternTags = (i) => K.io(t, lightAt[i] + 0.1, M.motion.hang, 'out');
  const stretch = K.io(t, cFar - LEAD, M.motion.draw, 'io');

  // ---- ground: the lamp glow follows the newest lit year, then settles at centre on "fifty"
  const glowX = K.lerp(M.X(Math.max(lit, 1969), gm), 960, K.io(t, tFifty, 1.2, 'io'));
  K.bg({ glow: 0.12, glowX, glowY: 560 });

  // ================================================================ the road (under the street line)
  const RH = 13, roadT = gm.y - RH, roadB = gm.y + RH;
  if (xd > gm.x0) {
    g.save();
    g.beginPath(); g.rect(gm.x0 - 4, roadT - 2, xd - gm.x0 + 4, RH * 2 + 4); g.clip();
    // surface: muted indigo, a touch lighter than the page
    K.rr(gm.x0 - 2, roadT, (M.X(M.Y1, gm) - gm.x0) + 4, RH * 2, 6);
    g.fillStyle = K.mixColor(C.panel, C.line, 0.75); g.fill();
    // cobbles: one paving stone per year, two courses, the lower course offset half a year
    g.strokeStyle = K.rgba(C.page, 0.75); g.lineWidth = 2;
    g.beginPath();
    for (let y = M.Y0 + 1; y < M.Y1; y++) {
      const xa = M.X(y, gm), xb = M.X(y + 0.5, gm);
      g.moveTo(xa, roadT + 3); g.lineTo(xa, gm.y - 3);
      g.moveTo(xb, gm.y + 3); g.lineTo(xb, roadB - 3);
    }
    g.stroke();
    // kerbs
    g.strokeStyle = C.line2; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(gm.x0, roadT); g.lineTo(M.X(M.Y1, gm), roadT); g.moveTo(gm.x0, roadB); g.lineTo(M.X(M.Y1, gm), roadB); g.stroke();
    g.restore();
  }

  // ================================================================ the buildings
  // a house is the tag's rect padded into a facade, with a gable roof above it (web · Python · Linux: three roofs).
  // Above the street a house stands on the far kerb side; below it, on the near side; roofs always point up.
  const PAD = 7, EAVE = 8, RT = 14;   // low roofs: the near-side roofs clear the decade labels, ~1991's clear MS-DOS
  const houseGeo = (b) => {
    const r = M.itemRect(gm, b), above = gm[b.row] < 0;
    const x0 = r.x0 - PAD, x1 = r.x1 + PAD, y0 = r.y0 - PAD, y1 = r.y1 + PAD;
    const peaks = b.key === 'web' ? 3 : 1;
    return { r, above, x0, x1, y0, y1, peaks, top: y0 - RT };
  };
  const roofPath = (h, dy) => {
    const w = (h.x1 - h.x0 + 2 * EAVE) / h.peaks, ys = h.y0 + dy;
    g.beginPath(); g.moveTo(h.x0 - EAVE, ys + 1);
    for (let p = 0; p < h.peaks; p++) {
      const a = h.x0 - EAVE + p * w;
      g.lineTo(a + w / 2, ys - RT); g.lineTo(a + w, ys + 1);
    }
  };
  const roofStroke = (lk, warmK) => K.mixColor(C.line2, C.head, (0.3 + 0.35 * lk) + 0.3 * warmK);
  // dy: rise offset; clip: the road edge the house rises out of
  const houseAt = (i) => {
    const b = M.BUILDINGS[i], h = houseGeo(b);
    const rk = rise(i), lk = named(i), wk = K.clamp(itemLit(i));
    const dy = h.above ? (1 - rk) * (roadT - h.top + 2) : -(1 - rk) * (h.y1 - roadB + 2);
    return { b, h, rk, lk, wk, dy, a: (0.42 + 0.58 * lk) };
  };
  const clipSide = (h) => {
    g.beginPath();
    if (h.above) g.rect(0, 0, K.W, roadT - 1); else g.rect(0, roadB + 1, K.W, K.H);
    g.clip();
  };
  const drawHouse = (i) => {
    const s = houseAt(i), h = s.h; if (s.rk <= 0) return;
    K.layer(s.a * K.clamp(s.rk * 3), () => {
      g.save(); clipSide(h);
      // ghost path to the road (the shared stem draws the lit one over it)
      const pathEnd = h.above ? h.y1 + s.dy : h.top + s.dy;
      K.line(h.r.cx, h.above ? roadT : roadB, h.r.cx, pathEnd, { color: C.line2, w: 1.5, alpha: 0.6 * (1 - s.lk) });
      // facade
      K.rr(h.x0, h.y0 + s.dy, h.x1 - h.x0, h.y1 - h.y0, 6);
      g.fillStyle = K.mixColor(C.panel, C.tile, 0.35); g.fill();
      g.lineWidth = 1.5; g.strokeStyle = K.mixColor(C.line2, C.head, 0.12 + 0.2 * s.lk); g.stroke();
      // a blank house has a door; it is covered by its sign once the year is painted on
      const dw = 16, dh = 22, dyB = h.y1 + s.dy;
      K.rr(h.r.cx - dw / 2, dyB - dh - 2, dw, dh + 2, [8, 8, 0, 0]);
      g.fillStyle = K.rgba(C.line2, 0.9); g.fill();
      // roof
      roofPath(h, s.dy); g.closePath();
      g.fillStyle = K.mixColor(C.tile, C.head, 0.08 + 0.06 * s.lk); g.fill();
      roofPath(h, s.dy);
      g.lineWidth = 1.8 + 0.6 * s.wk; g.lineJoin = 'round'; g.strokeStyle = roofStroke(s.lk, s.wk); g.stroke();
      g.restore();
    });
  };
  // roofs again over the street layer, so a stem hanging to a near-side sign enters under its roof
  const drawRoof = (i) => {
    const s = houseAt(i), h = s.h; if (s.rk <= 0 || h.above) return;
    K.layer(s.a * K.clamp(s.rk * 3), () => {
      g.save(); clipSide(h);
      g.beginPath(); g.rect(h.x0 - EAVE - 2, h.top + s.dy - 4, h.x1 - h.x0 + 2 * EAVE + 4, RT + 4 + PAD - 1); g.clip();
      g.fillStyle = K.mixColor(C.panel, C.tile, 0.35);
      g.fillRect(h.x0 + 1, h.y0 + s.dy + 1, h.x1 - h.x0 - 2, PAD - 2);
      roofPath(h, s.dy); g.closePath();
      g.fillStyle = K.mixColor(C.tile, C.head, 0.08 + 0.06 * s.lk); g.fill();
      roofPath(h, s.dy);
      g.lineWidth = 1.8 + 0.6 * s.wk; g.lineJoin = 'round'; g.strokeStyle = roofStroke(s.lk, s.wk); g.stroke();
      g.restore();
    });
  };

  // ---- leader stems: each lantern tag hangs on a thin terracotta stem straight down to its year's node
  M.LANTERNS.forEach((L, i) => {
    const k = K.io(t, lightAt[i] + 0.35, 0.6, 'io'); if (k <= 0) return;
    const r = M.lanternTagRect(gm, i), x = M.X(L.year, gm), y0 = r.y1 - 2, y1 = gm.y - gm.node;
    K.line(x, y0, x, K.lerp(y0, y1, k), { color: K.mixColor(C.line2, C.accent, 0.75), w: 1.5 });
  });

  M.BUILDINGS.forEach((_, i) => drawHouse(i));

  M.street(t, {
    geom: gm, draw, litTo: lit, show, itemLit,
    lanterns, lanternTags, stretch, cord: 1,
    tickLabels: 0,                    // drawn below at 26 px (the shared ones are 22 px)
  });

  M.BUILDINGS.forEach((_, i) => drawRoof(i));

  // ---- decade labels, 26 px, appearing as the street reaches each decade
  for (let d = 1970; d <= 2020; d += 10) {
    const k = K.seg(draw, d - 0.5, d + 1.5); if (k <= 0) continue;
    K.text(String(d), M.X(d, gm), gm.y + 42, { font: 'mono', weight: 500, size: 26, color: C.soft, align: 'center', alpha: 0.85 * k });
  }

  // ---- "More than fifty years of street. A few years of lanterns."
  const by = M.layout.s04.bracketY;
  M.bracket(gm, 1969, 2020, { k: K.io(t, tFifty, 0.9, 'io'), color: C.head, y: by, label: '50+ years of street' });
  M.bracket(gm, 2021, 2026, { k: K.io(t, tFew, 0.7, 'io'), color: C.accent, y: by, label: 'a few years of lanterns', align: 'right' });
});
