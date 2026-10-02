// 13 — The lantern: newest and fastest
// The building moves from 12's small thumbnail to the 'stage' layout (left, x 412–988) so the right column is free;
// the dim floor strip of the old street fades in under it. Beats, each on its words:
//  - "the fastest moving": the lanterns' speed label "fastest of all" (M.speedLabel, terracotta).
//  - [[models]] the three lanterns swap one after another, then do it again on "old ones get switched off"
//    (the fastest swap rate in the lesson); two short lines under the label.
//  - [[stale]] the snapshot: a brain in a photo frame, a time line that stops at a dashed cut "training ended" while the
//    world runs on (faint dashes); then three greyed suggestions, each on its spoken noun, with a thin dashed arrow to the
//    part it belongs to (sign, sign, door).
//  - [[agent]] the suggestions leave and the snapshot strip slides down to y ~556 as a dim reminder; the agent (sparkle) drops in beside the lanterns; on "old street" the floor strip
//    warms; three gold chips (cd project, .venv, git commit) fly out round the building and slide into the stone on their
//    words; the stone glows: it works on old ground.
//  - [[check]] rings on the sign ("paint", cream) and the lock ("locks", terracotta); on "ask" a chat icon and the pill
//    "which version are you assuming?" beside the agent (the strip below brightens); on "check" the chat icon becomes a
//    check and "today" lights at the far end of the strip.
//  - "AI is the lantern": the recurring line at y 820; on [[light]] the lantern light spreads down over the building and
//    along the old street.
// Exit: lit building, chips resting in the stone, the question held (softer), the line held.
SCENE('13', (t, S) => {
  const C = K.C;

  // ---- times (cue, then the spoken word, with fallbacks from cues.json)
  const tFast = S.find('fastest', 0, 2.29);
  const tModels = S.cue('models', 4.2);
  const tOld = S.find('old', 0, 6.44);              // "and old ones get switched off"
  const tStale = S.cue('stale', 8.49);
  const tLearned = S.find('learned', 0, 9.25);
  const tSnap = S.find('snapshot', 0, 9.93);
  const tStops = S.find('stops', 0, 11.4);
  const tEnded = S.find('training', 0, 12.42);
  const tPkg = S.find('package', 0, 15.99);
  const tCmd = S.find('retired', 0, 17.25);
  const tLogin = S.find('login', 0, 18.97);
  const tAgent = S.cue('agent', 21.73);
  const tCoding = S.find('coding', 0, 21.93);
  const tStreet = S.find('street', 0, 24.34);
  const tCd = S.find('cd', 0, 25.68);
  const tVenv = S.find('.venv', 0, 26.89);
  const tGit = S.find('git', 0, 29.46);
  const tCheck = S.cue('check', 30.49);
  const tPaint = S.find('paint', 0, 31.7);
  const tLocks = S.find('locks', 0, 32.49);
  const tAsk = S.find('ask', 0, 33.36);
  const tChecked = S.find('check', 0, 35.62);
  const tLantern = S.find('AI', 2, 36.75);          // "AI is the lantern:"
  const tLight = S.cue('light', 38.25);
  const tLights = S.find('lights', 0, 38.46);

  // ---- the building: from 12's thumbnail to the stage
  const mk = K.io(t, 0, 0.9);
  const L = M.lerpLayout('small', 'stage', mk);
  const ST = M.LAYOUTS.stage;

  // lanterns: two full swap rounds, one lantern after another (0.5 s each, 0.3 s apart)
  const swap = (i) => K.seg(t, tModels + 0.1 + 0.3 * i, tModels + 0.6 + 0.3 * i) + K.seg(t, tOld + 0.3 * i, tOld + 0.5 + 0.3 * i);

  // the agent's chips land in the stone: stone glow grows with each landing
  const FLY = 0.85;
  const jobs = [
    { s: 'cd project', at: tCd },
    { s: '.venv', at: tVenv },
    { s: 'git commit', at: tGit },
  ];
  const landed = jobs.reduce((a, j) => a + K.io(t, j.at + FLY - 0.1, 0.4), 0);
  const lightK = K.io(t, tLights, 1.2);
  const stoneLit = Math.min(1, 0.3 * landed + 0.25 * M.bump(t, tStreet, 1.2)) * (1 - 0.3 * lightK) + 0.3 * lightK;

  // ---- ground
  K.bg({ glow: 0.15, glowX: 700, glowY: 240 });

  // the old street as a dim floor strip; it warms on "old street" and when the light spreads
  const floorIn = K.io(t, 0.1, 0.8);
  const floorA = (0.3 + 0.18 * M.bump(t, tStreet - 0.1, 1.6) + 0.22 * lightK) * floorIn;
  if (lightK > 0) M.light('floor', lightK, { a: 0.16 * lightK, h: 46 });
  // clip off the strip's own far-end lantern ghosts (y 846–880): only the line and its ticks remain
  { const g = K.ctx(); g.save(); g.beginPath(); g.rect(0, 886, K.W, K.H - 886); g.clip();
    M.street(t, { geom: 'floor', alpha: floorA, show: 0, lanterns: 0, cord: 0 }); g.restore(); }

  // extra warmth over the lanterns: the brightest they have been
  const lp = M.at(L, 'lanterns');
  K.glow(lp.x, lp.y + 10, 300 * L.s, M.palette.lanternGlow, 0.1 * mk + 0.05 * lightK);

  // continuity with 12's last frame: the sign keeps its words through the move (detail on from t=0, the kit keeps the
  // text at its screen minimum while small); 12's lit app+passkey pair settles to the single passkey 14 starts with,
  // quietly inside the move, and its glow cools.
  const settle = K.io(t, 0.2, 0.6);
  M.building(t, {
    layout: L,
    detail: true,
    sign: 'Python 3.13',
    roofLabel: 'PYTHON · 1991',
    stoneLabel: '', stoneLit,
    lock: 'passkey',
    lockFrom: settle < 1 ? ['app', 'passkey'] : null, lockK: settle < 1 ? settle : null,
    lockLit: 1 - settle,
    doorGlow: 0.6 * (1 - K.io(t, 0.1, 0.9)),
    lanterns: 1, swap, light: lightK,
    roofLit: 0.3 + 0.5 * lightK,
    windows: 0.6 + 0.3 * lightK,
  });

  // the stone's own label (drawn here so it can fade as the chips arrive)
  // drawn in building coordinates so it rides with the move from t=0 (same size rule as the kit: >= 20 px on screen)
  const labelA = 1 - K.io(t, tCd - 0.2, 0.5);
  if (labelA > 0) M.inBuilding(L, (s) => K.layer(labelA, () => K.eyebrow('STONE · THE IDEA', 960, 764,
    { size: Math.max(20, 20 / s), align: 'center', tracking: 4, color: K.mixColor(C.soft, C.gold, 0.4) })));

  // ---- "fastest of all" + the model churn (right column, top)
  const colOut = 1 - K.io(t, tStale - 0.2, 0.5);
  const fastK = K.io(t, tFast, 0.8);
  if (colOut > 0) {
    M.speedLabel(ST, 'lanterns', fastK, { alpha: colOut });
    const lx = M.toScreen(ST, 1280, 0).x + 70, ly = M.at(ST, 'lanterns').y;
    const m1 = K.io(t, tModels, 0.5), m2 = K.io(t, tOld, 0.5);
    K.layer(colOut, () => {
      if (m1 > 0) K.text('new models every few months', lx + 16 * (1 - m1), ly + 58, { font: 'ui', weight: 600, size: 26, color: C.body, alpha: m1 });
      if (m2 > 0) K.text('old ones switched off', lx + 16 * (1 - m2), ly + 102, { font: 'ui', weight: 600, size: 26, color: C.soft, alpha: m2 });
    });
  }

  // ---- [[stale]] the snapshot (right column)
  // On [[agent]] the three suggestions leave and the snapshot strip slides down (+60, +260) and dims: it stays as a
  // reminder under the agent's question ("which version are you assuming?" = the snapshot), so the right half never empties.
  const staleOut = 1 - K.io(t, tAgent - 0.3, 0.5);          // the suggestions and their arrows
  const mv = K.io(t, tAgent - 0.3, 0.9);                    // the strip's move into the reminder spot
  const askLift = M.bump(t, tAsk + 0.3, 1.6);               // it brightens while the question is asked
  const tToday = K.io(t, tChecked - 0.05, 0.5);             // "check": today's end of the line lights
  const lightK13 = K.io(t, tLights, 1.2);
  const stripA = (1 - 0.58 * mv + 0.3 * askLift + 0.1 * tToday) * (1 - 0.25 * lightK13);
  if (t > tStale - 0.1) K.layer(stripA, () => K.at(60 * mv, 260 * mv, 1, 0, () => {
    const g = K.ctx();
    // the frame (a snapshot) around the brain
    const fx = 1120, fy = 232, fw = 140, fh = 128, bcx = fx + fw / 2, bcy = fy + fh / 2;
    const bK = K.io(t, tLearned - 0.1, 0.5);
    if (bK > 0) M.brain(bcx, bcy + 6 * (1 - bK), 64, { color: C.strong, alpha: bK });
    const fK = K.io(t, tSnap, 0.4);
    if (fK > 0) K.layer(Math.min(1, fK * 1.5), () => {
      const s = K.lerp(1.18, 1, K.ease.out(fK));
      K.at(bcx, bcy, s, 0, () => {
        g.save(); g.strokeStyle = C.line2; g.lineWidth = 2;
        K.rr(-fw / 2, -fh / 2, fw, fh, 10); g.stroke();
        // corner brackets: the camera's frame
        g.strokeStyle = M.palette.lanternGlow; g.lineWidth = 3; g.lineCap = 'round';
        const c = 18, x0 = -fw / 2 - 8, y0 = -fh / 2 - 8, x1 = fw / 2 + 8, y1 = fh / 2 + 8;
        [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([x, y, sx, sy]) => {
          g.beginPath(); g.moveTo(x, y + sy * c); g.lineTo(x, y); g.lineTo(x + sx * c, y); g.stroke();
        });
        g.restore();
      });
    });
    // the time line: known up to the cut, then the world runs on without it
    const ty = bcy, xa = fx + fw + 24, xCut = 1560, xEnd = 1770;
    const lineK = K.io(t, tStops - 0.2, 1.0);
    K.line(xa, ty, xCut, ty, { k: lineK, color: C.soft, w: 3 });
    const cutK = K.io(t, tEnded, 0.5);
    if (cutK > 0) {
      K.line(xCut, ty - 46, xCut, ty + 46, { k: cutK, color: C.strong, w: 3, dash: [8, 8] });
      K.text('training ended', xCut, ty - 62 + 10 * (1 - cutK), { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center', alpha: cutK });
    }
    const onK = K.io(t, tEnded + 0.6, 0.8);
    if (onK > 0) K.arrow(xCut + 14, ty, xEnd, ty, { k: onK, color: C.quiet, w: 2.5, dash: [6, 10] });
    // on "check": the far end of the line is today, the place to check against
    if (tToday > 0) {
      K.glow(xEnd - 6, ty, 40, C.strong, 0.18 * tToday);
      K.text('today', xEnd - 42, ty - 22 + 8 * (1 - tToday), { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center', alpha: tToday });
    }
  }));

  if (t > tStale - 0.1 && staleOut > 0) K.layer(staleOut, () => {
    // three stale suggestions, each with a dashed arrow back to its part
    const chips = [
      { s: 'old package version', at: tPkg, part: 'sign', col: C.strong, y: 476 },
      { s: 'retired command', at: tCmd, part: 'sign', col: C.strong, y: 552 },
      { s: 'old login method', at: tLogin, part: 'lock', col: C.accent, y: 628 },
    ];
    const cx0 = 1150;
    chips.forEach((c, i) => {
      const k = K.io(t, c.at - 0.05, 0.5);
      if (k <= 0) return;
      const to = { font: 'ui', weight: 600, size: 26 };
      const w = K.measure(c.s, to) + 42, h = 50, x = cx0 + 16 * (1 - K.ease.out(k));
      K.layer(k, () => {
        K.card(x, c.y - h / 2, w, h, { r: h / 2, fill: C.tile, stroke: K.mixColor(C.line2, c.col, 0.4), shadow: false });
        K.text(c.s, x + 21, c.y + 9, { ...to, color: C.soft });
      });
      // the arrow back to the part (sign: its right end; lock: the door's right edge)
      // sign: just past the pill's right end ('Python 3.13' pill is ~190 px wide on stage); lock: the door's right edge
      const p = M.at(ST, c.part), tx = c.part === 'sign' ? p.x + 112 : p.r + 4, tyy = p.y + (c.part === 'sign' ? 4 + 12 * i : 0);
      K.arrow(cx0 - 10, c.y, tx, tyy, { k: K.io(t, c.at + 0.25, 0.6), color: K.mixColor(c.col, C.soft, 0.4), w: 2, dash: [6, 7], bend: c.part === 'lock' ? -14 : 10 });
    });
  });

  // ---- [[agent]] the coding agent beside the lanterns
  const ag = M.at(ST, 'agent');
  const agK = K.io(t, tCoding - 0.1, 0.6, 'out');
  if (agK > 0) {
    const pulse = jobs.reduce((a, j) => a + M.bump(t, j.at - 0.05, 0.5), 0);
    const ay = ag.y - 46 * (1 - agK) + K.wave(t, 1.6, 3);
    K.layer(agK, () => {
      K.glow(ag.x, ay, 70 + 20 * pulse, M.palette.lanternGlow, 0.22 + 0.15 * pulse);
      K.icon('sparkle', ag.x, ay, 52, { color: M.palette.lanternGlow });
    });
    // its name, until the question takes that spot
    const nk = K.io(t, tCoding + 0.2, 0.5) * (1 - K.io(t, tAsk - 0.5, 0.4));
    if (nk > 0) K.text('coding agent', 1010 + 14 * (1 - K.ease.out(nk)), ag.y + 9, { font: 'ui', weight: 600, size: 26, color: C.body, alpha: nk });
  }

  // the chips: out round the right of the building, then sliding into the stone on their words
  {
    const to = { font: 'mono', weight: 600, size: 26 };
    const ws = jobs.map((j) => K.measure(j.s, to) + 30), gap = 16, total = ws.reduce((a, b) => a + b, 0) + gap * (jobs.length - 1);
    const st = M.toScreen(ST, 960, 757);
    let x = st.x - total / 2;
    jobs.forEach((j, i) => {
      const cx = x + ws[i] / 2; x += ws[i] + gap;
      const fk = K.clamp((t - j.at) / FLY);
      if (t < j.at) return;
      const u = K.ease.io(fk);
      // cubic: from just right of the agent (clear of the lanterns and the pole) -> out to the right of the walls -> along the stone into its slot
      // (starts 60 px lower than before so it never crosses the 'coding agent' label at y ~250–282)
      const P0 = [ag.x + 170, ag.y + 96], P1 = [1070, 400], P2 = [1070, st.y], P3 = [cx, st.y];
      const B = (a, b, c, d) => (1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b + 3 * (1 - u) * u * u * c + u ** 3 * d;
      const px = B(P0[0], P1[0], P2[0], P3[0]), py = B(P0[1], P1[1], P2[1], P3[1]);
      const sc = K.lerp(0.5, 1, K.ease.out(K.seg(fk, 0, 0.5)));
      const land = K.io(t, j.at + FLY - 0.1, 0.4);
      K.layer(K.ease.out(K.seg(fk, 0, 0.3)), () => K.at(px, py, sc, 0, () => {
        const w = ws[i], h = 46;
        if (land > 0) K.glow(0, 0, w * 0.7, C.head, 0.12 * land);
        K.card(-w / 2, -h / 2, w, h, { r: 10, fill: K.mixColor(C.tile, C.panel, 0.3), stroke: K.mixColor(C.line2, C.head, 0.4 + 0.5 * land), shadow: false });
        K.text(j.s, 0, 9, { ...to, color: C.head, align: 'center' });
      }));
    });
  }

  // ---- [[check]] rings on the paint and the lock, then the question beside the agent
  const fadeQ = 1 - 0.45 * K.io(t, tLight, 0.8);
  {
    const sg = M.at(ST, 'sign'), lk = M.at(ST, 'lock');
    const r1 = K.io(t, tPaint - 0.05, 0.6), r2 = K.io(t, tLocks - 0.05, 0.6);
    const ringOut = 1 - K.io(t, tLantern - 0.2, 0.7);
    if (r1 > 0 && ringOut > 0) K.layer(ringOut * (1 - 0.4 * r2), () => K.ring(sg.x, sg.y, 128, 40, r1, { color: C.strong, w: 3, rot: 0 }));
    if (r2 > 0 && ringOut > 0) K.layer(ringOut, () => K.ring(lk.x, lk.y - 6, 56, 50, r2, { color: C.accent, w: 3, rot: 0 }));

    const qK = K.io(t, tAsk - 0.05, 0.6);
    if (qK > 0) K.layer(qK * fadeQ, () => {
      const q = 'which version are you assuming?', to = { font: 'ui', weight: 600, size: 30 };
      const w = K.measure(q, to) + 48, h = 57, ix = 1030, iy = ag.y, px = 1072 + 14 * (1 - K.ease.out(qK));
      K.card(px, iy - h / 2, w, h, { r: h / 2, fill: C.tile, stroke: K.mixColor(C.line2, C.strong, 0.45), shadow: false });
      K.text(q, px + 24, iy + 10, { ...to, color: C.strong });
      // chat -> check
      const ck = K.io(t, tChecked - 0.05, 0.5);
      if (ck < 1) K.icon('chat', ix, iy, 40, { color: C.strong, alpha: 1 - ck });
      if (ck > 0) K.at(ix, iy, K.lerp(1.25, 1, K.ease.out(ck)), 0, () => K.icon('check', 0, 0, 40, { color: C.strong, alpha: ck }));
    });
  }

  // ---- the recurring line
  const sayK = K.io(t, tLantern - 0.05, 0.7);
  M.say('AI is the lantern: it lights every district, but it doesn’t walk the streets for you.', 828, sayK, { size: 34 });
});
