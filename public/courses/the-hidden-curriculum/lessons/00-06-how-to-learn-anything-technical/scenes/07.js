/* 07 "Make sure it's secure": the owner asks, the crew says yes; a true yes and a false yes look the same;
   two dated self-report failures; then the line (a wall from your side) with two doors (learn to check it / bring in an expert). */
SCENE('07', (t, S) => {
  const C = K.C, P = M.palette, g = K.ctx();
  K.bg({ glow: 0.32, glowX: 700, glowY: 640 });
  const DY = 80;                                   // whole group sits 80 px lower (bottom quarter used)

  // ---- beats (local seconds)
  const tAsk = S.cue('ask', 0.9);
  const tYes = S.cue('yes', 3.9);
  const tOut = S.find('output', 0, 6.97);          // "just another output"
  const tTwo = S.cue('two-yeses', 10);
  const tFalse = S.find('false', 0, 11.4);
  const tWrong = S.find('self-reports', 0, 14.1);
  const tRep = S.cue('replit', 16);
  const tCould = S.find(/^could\.$/i, 0, 24.8);
  const tStudy = S.find('study', 0, 26.1);
  const tWall = S.cue('wall', 31.8);
  const tDoors = S.find('doors', 0, 34.4);
  const tLearn = S.cue('learn', 35.3);
  const tExpert = S.cue('expert', 38.3);
  const tVend = S.find('companies', 0, 42.9);

  // ---- the house (small, built, lit) and its crew
  const gm = M.house(t, 420, 600 + DY, 300, { lights: 1 });
  const ground = gm.ground;                        // 788
  const dimK = K.io(t, tWrong, 0.8);               // doubt: the yes goes soft
  const crewC = M.crew(t, 655, 420 + DY, 64, { i: 1, dim: dimK });

  // ---- the owner
  M.person(t, 900, ground, 150, 'owner', { i: 0 });

  // ---- owner asks
  const askK = K.io(t, tAsk - 0.1, 0.5, 'out');
  const askFade = 1 - K.io(t, tRep, 0.6);
  if (askFade > 0) M.bubble('Make sure it\'s secure.', 1010, 478 + DY, 'owner', { k: askK, alpha: askFade, size: 32 });

  // ---- crew answers yes (bubble 1), then a twin slides out beside it
  const yesK = K.io(t, tYes - 0.05, 0.5, 'out');
  const checkK = K.io(t, tYes + 0.6, 0.4);
  const twoK = K.io(t, tTwo, 0.7, 'io');
  const by = 262 + DY, b1x = 470;
  const b2x = K.lerp(b1x, 905, twoK);
  // during "two yeses": a slow alternating highlight between the twins (they look the same)
  const altK = K.env(t, tTwo + 0.8, tWrong, 0.6);
  if (altK > 0) {
    const ph = 0.5 + 0.5 * Math.sin((t - tTwo - 0.8) * Math.PI / 1.4 - Math.PI / 2);
    K.glow(b1x, by, 230, C.head, 0.3 * altK * (1 - ph));
    K.glow(905, by, 230, C.head, 0.3 * altK * ph);
  }
  if (twoK > 0) M.bubble('Yes, it\'s secure.', b2x, by, 'crew', { k: 1, alpha: Math.min(1, twoK * 2), check: 1, dim: dimK, tail: 'none', size: 30 });
  M.bubble('Yes, it\'s secure.', b1x, by, 'crew', { k: yesK, check: checkK, dim: dimK, tail: twoK > 0.5 ? 'none' : 'right', size: 30 });

  // "just another output" (before the twins), then "true?" / "false?" under the twins, same colour
  const outK = K.env(t, tOut - 0.1, tTwo - 0.2, 0.4);
  if (outK > 0) M.label('just another output', b1x, by + 88, 'note', { alpha: outK });
  const tfK = K.io(t, tTwo + 0.6, 0.5);
  if (tfK > 0) {
    M.label('true?', b1x, by + 92, 'plain', { alpha: tfK });
    M.label('false?', 905, by + 92, 'plain', { alpha: K.io(t, Math.max(tTwo + 0.6, tFalse - 0.1), 0.5) });
  }

  // ---- two self-reports that were wrong (right column), cleared when the wall rises
  const cardsOut = 1 - K.io(t, tWall - 0.5, 0.5);
  if (cardsOut > 0) K.layer(cardsOut, () => {
    const cx = 1190, cw = 620, cy1 = 200;
    const h1 = M.dated(cx, cy1, cw, 'Replit / SaaStr · Jul 2025',
      'An agent deleted a production database, then said it couldn\'t be restored.',
      { kind: 'unseen', k: K.io(t, tRep, 0.6, 'out') });
    const couldK = K.io(t, tCould - 0.05, 0.5);
    if (couldK > 0) M.chip('it could', cx + cw - 110, cy1 + h1 + 12 + 26, 'unseen', { k: couldK });
    M.dated(cx, cy1 + h1 + 12 + 52 + 34, cw, 'Preprint · Jun 2026',
      '"Building to the Test": agents passed every test while the real thing barely worked.',
      { kind: 'unseen', k: K.io(t, tStudy, 0.6, 'out') });
  });

  // ---- the wall, front view, standing on the same ground as the house
  const W = { x0: 1180, x1: 1780, y0: 340 + DY, y1: ground };
  const wallK = K.io(t, tWall, 0.8, 'out');
  const doorH = 250, doorW = 160;
  const doors = [
    { x: 1330, k: K.io(t, tLearn, 0.7), label: 'learn to check it' },
    { x: 1630, k: K.io(t, tExpert, 0.7), label: 'bring in an expert' },
  ];
  const doorsK = K.io(t, tDoors - 0.15, 0.5);
  if (wallK > 0) {
    const top = K.lerp(W.y1, W.y0, wallK);
    // shadow at its foot
    g.save(); g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse((W.x0 + W.x1) / 2, W.y1 + 3, (W.x1 - W.x0) * 0.54, 8, 0, 0, 7); g.fill(); g.restore();
    g.save();
    g.beginPath(); g.rect(W.x0 - 12, top - 14, W.x1 - W.x0 + 24, W.y1 - top + 14); g.clip();
    // body: a plain slate face (no brick courses: brick belongs to the crew's wall in 04)
    const sg = g.createLinearGradient(0, W.y0, 0, W.y1);
    sg.addColorStop(0, '#34303F'); sg.addColorStop(1, '#25222E');
    g.fillStyle = sg; g.fillRect(W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0);
    g.strokeStyle = P.outline; g.lineWidth = 3; g.strokeRect(W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0);
    g.restore();
    // the course's "line" motif: dashed cream rule along the top edge (same dash as the split divider in 14)
    if (wallK > 0.98) {
      const lk = K.io(t, tWall + 0.7, 0.6);
      K.line(W.x0 - 24, W.y0, W.x1 + 24, W.y0, { k: lk, color: C.strong, w: 3, dash: [8, 8] });
    }
    // label above the line
    M.label("the line: can't check it", (W.x0 + W.x1) / 2, W.y0 - 40, 'plain', { alpha: K.io(t, tWall + 0.9, 0.5) });

    // doors (closed outlines on "two doors", then they swing open)
    doors.forEach((d, i) => {
      if (doorsK <= 0) return;
      const x0 = d.x - doorW / 2, y0 = W.y1 - doorH;
      K.layer(doorsK, () => {
        // opening: dark inside, gold light once open
        g.save(); g.fillStyle = '#14131D'; K.rr(x0, y0, doorW, doorH, [14, 14, 0, 0]); g.fill(); g.restore();
        if (d.k > 0) {
          g.save(); g.beginPath(); K.rr(x0, y0, doorW, doorH, [14, 14, 0, 0]); g.clip();
          K.glow(d.x, y0 + doorH * 0.55, doorH * 0.6, C.head, 0.45 * d.k);
          g.restore();
          K.glow(d.x, W.y1 - 4, doorW * 0.9, C.head, 0.18 * d.k);
          if (i === 0) K.layer(d.k, () => K.icon('book', d.x, y0 + doorH * 0.5, 96, { color: P.machine, w: 4 }));
          else M.person(t, d.x - 16, W.y1 - 6, 170, 'inspector', { i: 3, alpha: d.k });
        }
        // door leaf, hinged on the left, swinging inward-out (narrows as it opens)
        const sw = Math.cos(d.k * Math.PI * 0.46);
        g.save();
        g.fillStyle = K.mixColor(P.wood, '#3A2618', d.k * 0.5); g.strokeStyle = P.woodHi; g.lineWidth = 3;
        K.rr(x0, y0, doorW * sw, doorH, [14, 14, 0, 0]); g.fill(); g.stroke();
        if (sw > 0.35) {
          g.fillStyle = K.rgba(P.lamp, 0.85);
          g.beginPath(); g.arc(x0 + doorW * sw - 22 * sw, y0 + doorH * 0.55, 6, 0, 7); g.fill();
        }
        g.restore();
        // frame
        g.save(); g.strokeStyle = d.k > 0 ? K.mixColor(P.outline, C.head, d.k) : P.outline; g.lineWidth = 4;
        g.beginPath(); g.moveTo(x0, W.y1); g.lineTo(x0, y0 + 14); g.quadraticCurveTo(x0, y0, x0 + 14, y0);
        g.lineTo(x0 + doorW - 14, y0); g.quadraticCurveTo(x0 + doorW, y0, x0 + doorW, y0 + 14); g.lineTo(x0 + doorW, W.y1); g.stroke();
        g.restore();
        if (d.k > 0) M.label(d.label, d.x, W.y1 + 44, 'machine', { alpha: K.io(t, (i ? tExpert : tLearn) + 0.2, 0.5) });
      });
    });

    // vendors agree
    const vK = K.io(t, tVend, 0.5);
    if (vK > 0) M.chip('vendors: doesn\'t replace human review', (W.x0 + W.x1) / 2, W.y1 + 106, 'neutral', { k: vK });
  }
});
