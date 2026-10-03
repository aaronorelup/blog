/* 00.06 scene 07: The experiment that closes the case.
   The file slides from 06's corner to the bench position; the Experiment tab lights. The tiny test checks one of 06's
   confident-witness claims (a made-up turbo= flag) in a three-line scratch file: the run fails with TypeError
   (claim disproved, terracotta cross), then the rerun without the invented flag passes (cream tick). The clerk's
   agent runs the SAME scratch file and gets the same TypeError; you ring it: "what does it prove?". Direction: the clerk's legwork reaches all five tabs, a /llms.txt chip on the Rulebook. Your job is
   written on the case sheet (clues in, verdict checked); signature, then the CLOSED stamp ('back', the scene's one
   overshoot). At [[ignore]] the bench clears and three grey cards land on a two-plank shelf at right. In the last
   0.6 s before the hand-over everything else fades and the file glides to 08's shelf position, so only one file
   exists across the crossfade. */
SCENE('07', (t, S) => {
  const C = K.C, g = K.ctx();
  K.bg();

  // ---- beats (local seconds)
  const cBench = S.cue('bench', 0);
  const cResult = S.cue('result', 8.47);
  const cAgent = S.cue('agent-runs', 11.35);
  const cHead = S.cue('heading', 19.56);
  const cIgnore = S.cue('ignore', 28.98);
  const wLast = S.find('settles', 0, cBench + 0.9);
  const wTiny = S.find('tiny', 0, cBench + 2.2);
  const wSmallest = S.find('smallest', 0, cBench + 3.8);
  const wScratch = S.find('scratch', 0, cBench + 7.1);
  const wFail = S.find(/^fail/, 0, cResult + 0.75);
  const wKnow = S.find('know', 0, cResult + 1.5);
  const wStill = S.find('still', 0, cAgent + 5.8);
  const wProves = S.find(/^proves\./, 0, cAgent + 7.0);
  const wDoing = S.find('doing', 0, cHead + 1.4);
  const wDocs = S.find('docs', 0, cHead + 3.4);
  const wJob = S.find('job', 0, cHead + 5.7);
  const wClues = S.find('clues', 0, cHead + 6.7);
  const wVerdict = S.find('verdict', 0, cHead + 7.9);
  const wChecked = S.find('checked', 0, cHead + 8.5);
  const wFlags = S.find('memorising', 0, cIgnore + 2.0);
  const wTool = S.find('which', 0, cIgnore + 3.6);
  const wForum = S.find('forum', 0, cIgnore + 5.4);
  const tOut = S.out || (S.dur + 0.4);

  // ---- exit: everything but the file fades, then the file glides to 08's shelf spot
  const endFade = 1 - K.io(t, tOut - 0.62, 0.4);
  const shelfK = K.io(t, tOut - 0.55, 0.7);
  // the bench (editor, results, agent log, legwork, /llms.txt) clears at [[ignore]]
  const benchA = 1 - K.io(t, cIgnore, 0.6);

  // ---- the case file: corner (06's end) -> bench -> (exit) shelf
  const Fb = M.lerpGeo('corner', 'bench', K.io(t, cBench + 0.1, M.motion.move));
  const F = shelfK > 0 ? M.lerpGeo(Fb, 'shelf', shelfK) : Fb;
  const expV = K.io(t, wLast, M.motion.light) + K.io(t, wVerdict, M.motion.light);
  const signK = K.io(t, wJob - 0.2, 0.8);
  const signedK = K.io(t, wClues, 1.3, 'sine');
  const stampK = K.io(t, wChecked + 0.25, 0.6, 'back');

  // ---- you, left of the file
  const youX = 175, youY = 600;
  M.you(t, youX, youY, 110, { alpha: K.io(t, cBench + 0.2, 0.6) * endFade, label: K.io(t, cBench + 0.4, 0.6) });

  // your job, written on the case sheet: two cream pills (screen coords of the pills, for your line)
  const p1 = K.io(t, wClues, 0.5), p2 = K.io(t, wVerdict, 0.5);
  M.drawFile(t, F, {
    tabs: [2, 2, 2, 2, expV],
    sign: signK, signed: signedK, stamp: stampK,
    caseNo: shelfK > 0.3 ? false : undefined,
    content: (Fc) => {
      const s = Fc.s, cA = endFade;
      // the experiment's result goes into the case file, in your hand (no numerals: Georgia's old-style figures)
      const a = K.io(t, cResult + 0.5, 0.6) * cA;
      if (a > 0) K.text('Experiment: turbo= does not exist', Fc.inner.x + 30 * s, Fc.inner.y + 52 * s, { font: 'read', italic: true, size: 32 * s, color: K.rgba(C.strong, 0.9 * a) });
      const py = Fc.inner.y + 172 * s;
      if (p1 > 0) K.pill('clues in', Fc.inner.x + 120 * s, py, { size: 28 * s, color: C.strong, stroke: K.rgba(C.strong, 0.5), alpha: p1 * cA });
      if (p2 > 0) {
        const px = Fc.inner.x + 400 * s;
        const w = K.pill('verdict checked', px, py, { size: 28 * s, color: C.strong, stroke: K.rgba(C.strong, 0.5), alpha: p2 * cA });
        if (cA > 0) K.layer(cA, () => M.tick(px + w / 2 + 36 * s, py, 44 * s, K.io(t, wChecked, 0.5)));
      }
    },
    glow: 0.35 * K.io(t, wChecked + 0.4, 0.8),
  });
  // your line to "clues in" (the clue comes from you)
  if (p1 > 0 && shelfK <= 0) {
    const py = F.inner.y + 172 * F.s;
    K.layer(endFade, () => M.youLine(youX + 40, youY + 20, F.inner.x + 30, py, K.io(t, wClues, 0.7), { bend: -30 }));
  }

  // ---- the bench: editor window (scratch file) testing the AI's answer from 04
  const edK = K.io(t, wTiny, M.motion.land);
  const EX = 1180, EY = 290, EW = 620, EH = 232;
  if (edK > 0 && benchA > 0) K.layer(edK * benchA, () => K.at(0, (1 - edK) * 40, 1, 0, () => {
    const R = K.win(EX, EY, EW, EH, { kind: 'code', title: 'scratch/test_idea.py', titleSize: 26, focus: expV > 0.5 && expV < 1.5 && t < cHead });
    K.editor(R, t, ['# AI says: try turbo=True', 'import json', 'json.loads("{}", turbo=True)'], { syntax: 'py', typeAt: wSmallest, cps: 18, size: 28 });
    // "scratch" underlined as it is said
    K.mark(EX + 56, EY + 42, K.measure('scratch', { font: 'ui', weight: 600, size: 26 }), K.io(t, wScratch, 0.5), { w: 4 });
  }));

  // ---- result strips: run 1 disproves the AI's claim (TypeError, terracotta cross); the rerun without the
  // invented flag passes (your cream tick). Pass or fail, you know more.
  const failA = K.io(t, cResult, 0.5) * benchA;
  const S1Y = 540, S2Y = 652;
  if (failA > 0) K.layer(failA, () => {
    const x = EX, w = EW, h = 96;
    K.card(x, S1Y, w, h, { r: 14, fill: C.tile, stroke: K.rgba(C.accent, 0.55), shadow: false });
    K.text('output', x + 24, S1Y + 36, { font: 'ui', weight: 600, size: 26, color: C.soft });
    K.text('TypeError', x + 120, S1Y + 37, { font: 'mono', weight: 600, size: 28, color: C.accent });
    K.text("unexpected keyword argument 'turbo'", x + 24, S1Y + 78, { font: 'mono', size: 26, color: C.strong });
    M.cross(x + w - 40, S1Y + 30, 40, K.io(t, cResult + 0.2, 0.5));
  });
  const passA = K.io(t, wKnow - 0.3, 0.5) * benchA;
  if (passA > 0) K.layer(passA, () => K.at(0, (1 - passA) * 16, 1, 0, () => {
    const x = EX, w = EW, h = 70;
    K.card(x, S2Y, w, h, { r: 14, fill: C.tile, stroke: C.line2, shadow: false });
    K.text('rerun without turbo=', x + 24, S2Y + 45, { font: 'ui', weight: 600, size: 26, color: C.soft });
    const lx = x + 24 + K.measure('rerun without turbo=', { font: 'ui', weight: 600, size: 26 }) + 22;
    K.text('runs', lx, S2Y + 46, { font: 'mono', size: 28, color: C.strong });
    M.tick(x + w - 40, S2Y + h / 2, 44, K.io(t, wKnow, 0.5));
  }));
  const passLbl = K.io(t, wKnow, 0.5) * (1 - K.io(t, cIgnore - 0.6, 0.5));
  if (passLbl > 0) K.text('pass or fail, you know more', EX, 772, { font: 'read', italic: true, size: 30, color: K.rgba(C.body, passLbl) });

  // ---- the agent's log above the editor: the clerk runs the SAME scratch file and gets the same result
  const logK = K.io(t, cAgent, 0.5);
  const LX = EX, LY = 172, LW = EW, LH = 80;
  const msgHead = 'ran test_idea.py: ', msgVal = 'TypeError';
  const mono = { font: 'mono', size: 28 };
  const vx = LX + 96 + K.measure(msgHead, mono) + 14, vw = K.measure(msgVal, mono);
  if (logK > 0 && benchA > 0) K.layer(logK * benchA, () => {
    K.card(LX, LY, LW, LH, { r: 16, fill: K.rgba(C.tile, 0.9), stroke: K.rgba(C.head, 0.5), shadow: false });
    M.clerk(t, LX + 46, LY + LH / 2, 56, { glow: 0.6 });
    const msg = msgHead + msgVal;
    const t0 = cAgent + 0.4, cps = 22;
    const typed = K.typed(msg, t, t0, cps);
    const head = typed.slice(0, msgHead.length), tail = typed.slice(msgHead.length);
    const x0 = LX + 96, y0 = LY + LH / 2 + 10;
    K.text(head, x0, y0, { ...mono, color: C.body });
    if (tail) K.text(tail, vx, y0, { ...mono, color: C.accent });
  });
  // you ring the agent's result: what does it prove?
  const ringOut = 1 - K.io(t, cHead - 0.5, 0.45);
  const ringK = K.io(t, wStill, 0.7) * ringOut;
  if (ringK > 0) {
    K.layer(ringOut, () => K.ring(vx + vw / 2, LY + LH / 2 + 1, vw / 2 + 20, 30, K.io(t, wStill, 0.7), { color: C.strong, w: 4, rot: 0 }));
    const qa = K.io(t, wProves - 0.5, 0.5) * ringOut;
    K.text('what does it prove?', LX + LW, 152, { font: 'ui', weight: 600, size: 28, color: K.rgba(C.strong, qa), align: 'right' });
  }

  // ---- where it's heading
  const headA = K.io(t, cHead, 0.5) * benchA;
  if (headA > 0) K.eyebrow("WHERE IT'S HEADING", LX + LW, 152, { align: 'right', alpha: headA });
  // the clerk's legwork now reaches all five tabs (right to left, from the agent log)
  const legK = K.seg(t, wDoing - 0.2, wDoing + 1.8);
  if (legK > 0 && benchA > 0) M.legwork(F, K.io(legK, 0, 1, 'sine'), { from: { x: LX, y: LY + LH / 2 }, first: 4, upto: 0, lift: 22, alpha: (0.95 - 0.35 * K.io(t, wJob, 0.8)) * benchA });
  // a slim /llms.txt book stacks on the Rulebook tab
  const bookK = K.io(t, wDocs, M.motion.land);
  if (bookK > 0 && benchA > 0) {
    const T = F.tabs[2], bw = 214, bh = 44, bx = T.cx - bw / 2, by = 150 - (1 - bookK) * 30;
    K.layer(bookK * benchA, () => {
      K.card(bx, by, bw, bh, { r: 8, fill: C.tile, stroke: K.rgba(C.head, 0.75), shadow: false });
      K.line(bx + 10, by + 6, bx + 10, by + bh - 6, { color: K.rgba(C.head, 0.6), w: 3 });
      K.icon('sparkle', bx + 34, by + bh / 2, 22, { color: C.head });
      K.text('/llms.txt', bx + 54, by + bh / 2 + 9, { font: 'mono', size: 26, color: C.head });
    });
  }

  // ---- safe to ignore for now: three grey cards land on a two-plank shelf at right
  const shA = K.io(t, cIgnore + 0.3, 0.6) * endFade;
  if (shA > 0) {
    const size = 28, h = 56, rowGap = 36;
    const rowY = [640, 640 + h + rowGap];
    K.eyebrow('Safe to ignore for now', EX, 600, { alpha: shA, color: C.soft });
    // planks: one under each row of cards
    const plankAt = [wFlags - 0.3, wForum - 0.3];
    rowY.forEach((ry, i) => K.layer(shA * K.io(t, plankAt[i], 0.5), () => {
      const py = ry + h + 4;
      K.card(EX - 16, py, 640, 12, { r: 4, fill: M.palette.wood, stroke: false, shadow: false });
      K.line(EX - 12, py + 1, EX + 620, py + 1, { color: K.rgba(C.head, 0.25), w: 1.5 });
    }));
    const items = [['memorising flags', wFlags], ['which tool is best', wTool], ['forum etiquette', wForum]];
    let x = EX, row = 0;
    const gap = 14;
    items.forEach(([s, at]) => {
      const w = K.measure(s, { font: 'ui', weight: 600, size }) + 44;
      if (x + w > EX + 620) { x = EX; row++; }
      const y = rowY[row];
      const k = K.io(t, at, M.motion.land);
      if (k > 0) {
        const dim = 1 - 0.15 * K.io(t, at + 0.6, 0.6);
        const dx = (1 - k) * 60, dy = -(1 - k) * 50 + Math.sin(k * Math.PI) * -10;
        K.layer(k * dim * endFade, () => {
          K.card(x + dx, y + dy, w, h, { r: 14, fill: K.rgba(C.tile, 0.85), stroke: C.line2, shadow: false });
          K.text(s, x + dx + 22, y + dy + 38, { font: 'ui', weight: 600, size, color: K.rgba(C.strong, 0.8) });
        });
      }
      x += w + gap;
    });
  }
});
