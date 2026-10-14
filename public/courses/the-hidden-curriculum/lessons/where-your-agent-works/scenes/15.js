/* 15 — Keep this (end card, noBadge)
   Ground bookends the title card: the whole painted plate at shade .42 (fix pass: the old lamp glow plus the masked
   band read as flat brown), with soft indigo scrims behind the text and the street. A gold 'KEEP THIS' eyebrow
   names the card above row 1; the credit line is cream at 80%. The finished street sits small at the top (s 0.3, y ~150-400): your house with the
   counter, the workshop and the gold Claude-work folder (the back office has moved out: office 0), the road, and the
   vendor's building with the back office, the spare workshop and the logbook. Its labels hide automatically at this
   size, so the street is a picture; each beat lights its objects with a glow drawn over it.
   Three takeaways (M.keep rows, x 220, w 1480, y 450-816), each lead rising when it is said, the body on its first
   spoken word. Credit line (M.credits, default narrated five) at y 860 on [[credits]]. Petals avoid text and street.
   - [[keep-1]] "Pick the room" -> row 1; the counter's and workshop's doors glow on "room" and stay warm.
   - [[keep-2]] row 2; "yours" warms your house, "down the line" lights the road, "vendor's cloud" the building.
   - [[keep-3]] row 3; "account" lights the logbook, "private" the gold Claude-work folder.
   - [[credits]] the credit line fades in.
   Exit: street, rows and credits at rest; plate drift and petals only. No 'back' overshoot. Pure function of t. */
SCENE('15', (t, S) => {
  const C = K.C;

  // ---- times (local), each beat on its spoken word
  const k1 = S.cue('keep-1', 0), k2 = S.cue('keep-2', 7.2), k3 = S.cue('keep-3', 16.62), kc = S.cue('credits', 22.95);
  const tPick = S.find(/^pick$/i, 0, 1.32), tRoom = S.find(/^room$/i, 0, 1.78), tModel = S.find(/^model$/i, 0, 3.58);
  const tYours = S.find(/^yours/i, 0, 9.83), tDown = S.find(/^down$/i, 0, 12.39), tVendor = S.find(/^vendor/i, 0, 13.93);
  const tCheck = S.find(/^check$/i, 0, 16.62), tAccount = S.find(/^account$/i, 0, 17.11), tPrivate = S.find(/^private$/i, 0, 18.39);
  const tWork = S.find(/^work$/i, 1, 19.9);

  // ---- ground: as the title card (the lesson is bookended)
  // the whole plate at a light shade, like the title card, so the night indigo and the lanterns read; a soft indigo
  // scrim sits only behind the text column and the street (no warm lamp wash over everything)
  K.bg({ glow: 0.1 });
  if (K.img && K.img.plate) K.plate('plate', t, { zoom: true, shade: 0.42, alpha: K.io(t, 0, 1.2) });
  const g = K.ctx();
  const blob = (cx, cy, rx, ry, a) => {
    if (a <= 0.002) return;
    g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, K.rgba(C.page, 1)); gr.addColorStop(0.6, K.rgba(C.page, 0.82)); gr.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
  };
  blob(900, 660, 1000, 330, 0.88);   // takeaways and credits
  blob(960, 270, 520, 190, 0.7);     // the small street

  // ---- beat lights: a peak when said, then a resting level so the end frame is calm and complete
  const lit = (at, rest = 0.45) => {
    const on = K.io(t, at - 0.1, 0.6), pk = Math.max(0, 1 - Math.abs(t - (at + 0.6)) / 1.1);
    return Math.min(1, on * rest + (1 - rest) * pk * on);
  };
  const gDoors = lit(tRoom), gHouse = lit(tYours, 0.3), gRoad = lit(tDown), gVendor = lit(tVendor);
  const gLog = lit(tAccount), gFolder = lit(tPrivate);

  // ---- the finished street, small at the top
  const s = 0.33, sx = 960 - 975 * s, sy = 150 - 140 * s;
  const kin = K.io(t, 0.05, 0.8);
  const st = M.street(t, {
    x: sx, y: sy, s,
    house: {
      alpha: 0.82 * kin, office: 0, workFolder: 1,
      rooms: { chat: K.lerp(0.55, 1, gDoors), cowork: 0.5, code: K.lerp(0.55, 1, gDoors) },
    },
    road: { alpha: 0.82 * kin, label: false },
    vendor: {
      alpha: 0.82 * kin, office: 1, spare: 1, logbook: 1, logGlow: gLog,
      officeLit: K.lerp(0.5, 1, gVendor), spareLit: K.lerp(0.5, 1, gVendor), gear: t * 0.6,
    },
  });
  const H = st.house, V = st.vendor, R = st.road;
  // highlights drawn at full strength over the faint street (glow plus a thin gold ring), so they read at this size
  const ring = (x, y, w, h, r, a) => { if (a > 0.01) M.outline(x, y, w, h, r, 1, { color: C.head, w: 3, alpha: a }); };
  for (const n of ['chat', 'code']) {
    const rm = H.rooms[n];
    if (rm && gDoors > 0) { K.glow(rm.cx, rm.y + rm.h * 0.8, 70, C.head, 0.4 * gDoors); ring(rm.x, rm.y, rm.w, rm.h, 6, 0.9 * gDoors); }
  }
  if (gHouse > 0) { K.glow(H.x + H.w / 2, H.y + H.h / 2, 220, C.head, 0.14 * gHouse); ring(H.x - 6, H.y - 6, H.w + 12, H.h + 12, 8, 0.8 * gHouse); }
  if (gRoad > 0) {
    for (let i = 0; i < 3; i++) K.glow(K.lerp(R.x0, R.x1, (i + 0.5) / 3), R.y, 60, C.head, 0.4 * gRoad);
    K.line(R.x0 + 4, R.y, R.x1 - 4, R.y, { color: C.head, w: 4, alpha: 0.9 * gRoad });
  }
  if (gVendor > 0) { K.glow(V.x + V.w / 2, V.y + V.h / 2, 150, C.head, 0.2 * gVendor); ring(V.x - 6, V.y - 6, V.w + 12, V.h + 12, 8, 0.8 * gVendor); }
  if (gLog > 0) { K.glow(V.logbook.x - 18, V.logbook.y, 56, C.head, 0.6 * gLog); ring(V.logbook.x - 40, V.logbook.y - 13, 44, 25, 5, 0.9 * gLog); }
  const f = H.folders['Claude-work'];
  if (f && gFolder > 0) { K.glow(f.x, f.y, 56, C.head, 0.6 * gFolder); ring(f.x - 26, f.y - 20, 52, 40, 6, 0.95 * gFolder); }

  // ---- three takeaways, under a small gold eyebrow that names the card and the lesson
  const X = 220, W = 1480;
  K.eyebrow('Keep this  ·  Where your agent works', X, 428, { size: 24, color: C.head, alpha: K.io(t, k1 - 0.1, 0.6) });
  // lead and body reveal separately: the lead with an empty body, then the body alone under it; the row height
  // comes from the full row (k 0 measures without drawing)
  let y = 450;
  const row = (i, leadAt, bodyAt) => {
    M.keep(i, X, y, W, { k: K.io(t, leadAt - 0.15, 0.6), body: '' });
    M.keep(i, X, y, W, { k: K.io(t, bodyAt - 0.15, 0.6), lead: '' });
    y += M.keep(i, X, y, W, { k: 0 });
  };
  row(0, Math.max(k1, tPick), tModel);
  row(1, k2, tYours);
  row(2, Math.max(k3, tCheck), Math.min(tPrivate, tWork));

  // ---- credits
  M.credits(X, 860, W, { color: C.strong, alpha: 0.8 * K.io(t, kc - 0.1, 0.8) });

  // ---- petals, kept off the text and the street
  K.petals(t, { n: 5, seed: 15, alpha: 0.45 * K.io(t, 0.2, 1.2),
    avoid: [[sx + 60 * s, 110, sx + 1860 * s, 410], [X - 20, 400, X + W + 20, 830], [X - 20, 830, X + W + 20, 930]] });
});
