/* 08 — Keep this
   End card. The closed case file (all tabs done, signed, stamped) sits small on a thin shelf at right under a lantern.
   Left column: three takeaways rise on their cues (bold gold lead, cream Georgia rest); each one glows its tabs once
   (Clue+Search, Rulebook+Briefing, Experiment; the stamp warms at keep-3). [[lantern]]: the lantern brightens, its
   light washes down over the file, and the closing line appears in italic. Sparse petals avoid the text and file. */
SCENE('08', (t, S) => {
  const C = K.C;
  const cK1 = S.cue('keep-1', 0), cK2 = S.cue('keep-2', 8.08), cK3 = S.cue('keep-3', 12.78), cL = S.cue('lantern', 17.66);

  // ------------------------------------------------------------ ground: night, plate in the lower band
  K.bg({ glow: 0.45, glowX: 1490, glowY: 260 });
  K.plate('plate', t, { shade: 0.55, mask: [620, 860] });

  // ------------------------------------------------------------ right: the shelved file under the lantern
  const F = M.geo('shelf');
  const litK = K.io(t, cL, 0.9);                      // the lantern brightens on [[lantern]]
  const LX = 1490, LY = 230;
  // light from the lantern washing down onto the file (soft, widening glows; no hard cone edge)
  if (litK > 0) {
    K.glow(F.cx, F.y0 - 40, 360, C.head, 0.10 * litK);
    K.glow(F.cx, F.cy, 300, C.head, 0.08 * litK);
  }
  // shelf: a thin night-wood board with a lit top edge
  const SY = F.y1 + 14;
  K.card(F.cx - 250, SY, 500, 14, { r: 4, fill: M.palette.wood, stroke: false, shadow: false });
  K.line(F.cx - 246, SY + 1, F.cx + 246, SY + 1, { color: K.rgba(C.head, 0.35 + 0.35 * litK), w: 1.5 });
  K.layer(0.5, () => K.line(F.cx - 236, SY + 14, F.cx + 236, SY + 14, { color: M.palette.woodDark, w: 3 }));

  // flashes: each glows once on its takeaway
  const fl = (a) => K.env(t, a + 0.15, a + 1.9, 0.5);
  const f1 = fl(cK1), f2 = fl(cK2), f3 = fl(cK3);
  M.drawFile(t, F, {
    tabs: 2, sign: 1, signed: 1, stamp: 1, caseNo: false,
    flash: [f1, f1, f2, f2, f3],
    glow: 0.25 + 0.75 * litK,
  });
  // the CLOSED stamp warms at keep-3 and stays a little warmer
  const stK = K.io(t, cK3 + 0.15, 0.6) * (1 - 0.6 * K.io(t, cK3 + 1.9, 0.8));
  if (stK > 0) K.glow(F.stamp.x, F.stamp.y, 120, C.accent, 0.22 * stK);

  K.map.lantern(t, 0, { x: LX, y: LY, s: 1.4, lit: 0.6 + 0.4 * litK, glowK: 1 + 1.4 * litK });

  // ------------------------------------------------------------ left: three takeaways
  const X = 236, NX = 186, W = 900;
  const keep = [
    ['The error is the first clue, and its exact words are the search key.', 'Find the line that names the failure, and never paraphrase it.'],
    ['Give the AI the evidence, then check its verdict.', 'Put the error, versions, command and file on its desk; check any package, flag or function it names against the docs for your version.'],
    ['A tiny test settles it.', 'Until a run proves it, an answer is a guess.'],
  ];
  const LEAD = { font: 'head', weight: 700, size: 40 }, REST = { font: 'read', size: 30 };
  const LLH = 50, RLH = 40, GAP = 44;
  K.layer(K.io(t, -0.6, 0.6), () => K.title('Keep this', X - 50, 196, { size: 56 }));
  let y = 262;
  const ats = [cK1 + 0.1, cK2, cK3];
  keep.forEach(([lead, rest], i) => {
    const ll = K.wrap(lead, W, LEAD), rl = K.wrap(rest, W, REST);
    const y0 = y;
    y += ll.length * LLH + 8 + rl.length * RLH + GAP;
    const k = K.io(t, ats[i], 0.7, 'out');
    if (k <= 0) return;
    const dy = (1 - k) * 22;
    K.layer(k, () => {
      K.text(String(i + 1), NX, y0 + 36 + dy, { font: 'head', weight: 700, size: 40, color: K.rgba(C.head, 0.75), align: 'center' });
      ll.forEach((s, j) => K.text(s, X, y0 + 36 + j * LLH + dy, { ...LEAD, color: C.head }));
      const ry = y0 + 36 + ll.length * LLH + 6;
      rl.forEach((s, j) => K.text(s, X, ry + j * RLH + dy, { ...REST, color: C.strong }));
    });
  });

  // closing line, on [[lantern]]
  const qk = K.io(t, cL + 0.2, 0.8, 'out');
  if (qk > 0) K.layer(qk, () => {
    const qy = y + 26 + (1 - qk) * 16;
    K.line(X, qy - 46, X + 120, qy - 46, { color: K.rgba(C.head, 0.5), w: 2 });
    K.para('AI is the lantern: it lights every district, but it doesn’t walk the streets for you.', X, qy, W,
      { font: 'read', size: 30, italic: true, lh: 40, color: C.head });
  });

  // the five-step habit named under the shelf (tabs are icon-only at this scale)
  K.layer(K.io(t, -0.6, 0.6) * 0.9, () => K.text('Clue · Search · Rulebook · Briefing · Experiment', F.cx, SY + 62,
    { font: 'ui', weight: 600, size: 26, color: K.rgba(C.head, 0.85), align: 'center' }));

  // ------------------------------------------------------------ petals, kept off the text and the file
  K.petals(t, { n: 5, seed: 8, alpha: 0.6, avoid: [[120, 130, 1180, 930], [1170, 160, 1810, 850]] });
});
