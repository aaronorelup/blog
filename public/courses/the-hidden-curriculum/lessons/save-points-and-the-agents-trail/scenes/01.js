// 01 · The point (title card on the painted plate, noBadge).
// Centred column: title + subtitle from frame 0; [[purpose]] the purpose line rises 12 px into place;
// [[conclusion]] the conclusion writes in line by line as each line is spoken, and the emblem's three stones pop in
// left to right (stagger .12); its lantern swings in on "live" (the scene's one 'back', inside M.signpost).
// [[why]] a small arrow runs along the emblem path on "push" (0.4 s) and the lantern dips once on "mistake travels".
// Credit line at y 880 (S117, S212). Petals drift around the text. Last frame: everything still, petals drift.
SCENE('01', (t, S) => {
  const K = window.K, C = K.C, M = window.M;

  const cPur = S.cue('purpose', 0);
  const cConc = S.cue('conclusion', 9.61);
  const cWhy = S.cue('why', 22.94);
  // the first spoken word matching re at or after local time `after`
  const wordAt = (re, after, fb) => {
    for (let i = 0; i < S.words.length; i++) {
      const w = String(S.words[i][0]).toLowerCase().replace(/[^a-z'’]/g, '');
      if (S.word(i) >= after - 0.05 && re.test(w)) return S.word(i);
    }
    return fb;
  };
  const wLive = wordAt(/^live$/, cConc, cConc + 8.1);
  const wPush = wordAt(/^push$/, cWhy, cWhy + 1.85);
  const wMistake = wordAt(/^mistake$/, cWhy, cWhy + 3.2);

  K.bg();
  K.plate('plate', t, { zoom: true, shade: 0.5 });

  // a soft indigo scrim behind the text column so cream and gold read over the painting
  const g = K.ctx();
  const blob = (cx, cy, rx, ry, a) => {
    g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, K.rgba(C.page, 1)); gr.addColorStop(0.62, K.rgba(C.page, 0.85)); gr.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
  };
  blob(960, 540, 1000, 480, 0.85);
  // a second, tighter scrim under the purpose + conclusion lines (they sit over the lanterns and lit house)
  blob(960, 470, 900, 190, 0.5);

  // ---------------------------------------------------------------- title and subtitle
  K.title('Git without typing it', 960, 228, { size: 80, align: 'center' });
  K.text("save points and the agent's trail", 960, 288, { font: 'ui', weight: 600, size: 34, color: C.soft, align: 'center' });

  // ---------------------------------------------------------------- purpose line (rises 12 px on [[purpose]])
  const W = 1360, X = 960 - W / 2;
  const purpose = "In this lesson you'll learn what git's save points, parallel lines and remote copies are, and how to read the trail your agent leaves, so you notice what it touched.";
  const pOpt = { font: 'read', size: 34, color: C.strong, align: 'center' };
  const pk = K.io(t, cPur - 0.1, 0.6, 'out');
  K.wrap(purpose, W, pOpt).forEach((ln, i) => K.text(ln, 960, 368 + i * 46 + 12 * (1 - pk), { ...pOpt, alpha: 0.35 + 0.65 * pk }));

  // ---------------------------------------------------------------- conclusion (writes in line by line)
  const conclusion = 'The agent types every git command, so your part is recognition: know that a save point and a copy elsewhere exist, which branch is live, what the diff changed, and whether it touched anything you never named.';
  const cOpt = { font: 'read', size: 32, italic: true, color: C.body, align: 'center' };
  const cLines = K.wrap(conclusion, 1200, cOpt);
  const i0 = S.words.findIndex((w, i) => Math.abs(S.word(i) - cConc) < 0.05);
  let wi = 0;
  cLines.forEach((ln, i) => {
    const at = i0 >= 0 ? S.word(Math.min(S.words.length - 1, i0 + wi)) : cConc + i * 4;
    wi += ln.split(' ').length;
    const k = K.io(t, at - 0.25, 0.55, 'out');
    if (k <= 0.002) return;
    K.text(ln, 960, 486 + i * 43 + 8 * (1 - k), { ...cOpt, alpha: k });
  });

  // ---------------------------------------------------------------- the emblem: path, three stones, 'main' + lantern
  const ek = K.io(t, cConc - 0.3, 0.6);
  M.emblem(t, 960, 742, {
    s: 1.1,
    alpha: 0.25 + 0.75 * ek,
    stonesK: (i) => K.stagger(t, cConc, i, 0.12, 0.5),
    lantern: K.io(t, wLive - 0.15, 0.9),
    run: K.seg(t, wPush - 0.05, wPush + 0.35),
    dip: K.env(t, wMistake, wMistake + 0.9, 0.45),
  });

  // ---------------------------------------------------------------- credit line
  M.credits(260, 892, 1400, { align: 'center' });

  // ---------------------------------------------------------------- petals, kept off the text
  K.petals(t, {
    n: 6, seed: 13, alpha: 0.8,
    avoid: [[260, 160, 1660, 620], [680, 580, 1260, 810], [240, 860, 1680, 925]],
  });
});
