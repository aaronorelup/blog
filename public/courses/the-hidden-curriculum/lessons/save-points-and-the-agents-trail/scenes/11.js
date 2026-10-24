/* 11 — Pencil and torn stones
   The map at z 1. A pull request is a pencilled side trail off the newest stone (a short-lived branch) with a
   dashed join waiting to meet main; its checks fail and get fixed; the walker flips "Merge when ready" and only
   then is it inked (a merge stone lands on main, main's signpost moves onto it). Auto mode: the agent's own merge
   attempt bounces off a shield. Rewriting history: two stones are lifted off the line, greyed, their IDs struck
   through, and two NEW coral stones with new IDs are laid in their place, so the station's copy (old IDs)
   disagrees. Then the "recognise, don't type" list, and Lovable's safe way: the old stones settle back and a
   "revert 0839e49" stone is added with a back-arrow to the stone it undoes. */
SCENE('11', (t, S) => {
  K.bg();
  const C = K.C, L = M.L, Y = L.pathY, id = M.ids();
  const W = (w, n, fb, o) => S.find(w, n, fb, o);

  // ---- beats (local seconds; every one hangs on a cue or a spoken word)
  const tPencil = S.cue('pencil', 0), tCi = S.cue('ci', 6.2), tMerge = S.cue('merge', 10.6);
  const tTear = S.cue('tear', 24.6), tNames = S.cue('names', 31.7), tRev = S.cue('revert', 47.1);
  const tChecks = W('checks', 0, tCi + 2.1, { whole: true });
  const tFix = W('fix', 0, tCi + 2.8, { whole: true });
  const tFlip = W('flip', 0, tMerge + 1.5);
  const tAuto = W('auto', 0, tMerge + 5, { whole: true });
  const tBlocks = W('blocks', 0, tAuto + 0.6, { whole: true });
  const tWho = W('who', 0, tMerge + 9, { whole: true });
  const tTears = W('tears', 0, tTear + 1.5);
  const tRelays = W('re-lays', 0, tTear + 3.1);
  const tDis = W('disagrees', 0, tTear + 5.6);
  const tForce = W('force', 0, tNames + 3.4);
  const tAmend = W('amending', 0, tNames + 4.3);
  const tReset = W('reset', 0, tNames + 7.8);
  const tClean = W('clean', 0, tNames + 8.9);
  const tStash = W('stash', 0, tNames + 9.6);
  const tAuto2 = W('auto', 1, tNames + 13, { whole: true });
  const tAdd = tRev + 1.0;                                         // revert stone lands with "to undo a change", not on "add"
  const tListIn = tForce - 0.5;                                   // the list card opens on "force", not on [[names]]

  // ---- geometry: the PR side trail (a short-lived branch) and the stones after the merge stone
  const mX = L.mergeX;                                             // 0839e49, the newest stone at the start
  const prS = [1065, 670];                                         // the PR's own stone, below the line
  const PR = [[mX, Y], [1024, 600], prS];                           // pencilled stretch
  const JOIN = [prS, [1110, 646], [1130, Y + 30], [1130, Y]];      // dashed join into main
  const mcX = 1130, revX = 1210;                                   // the merge stone, the revert stone
  const out = (a) => 1 - K.io(t, a, 0.5);                          // fade-out helper

  // ---- shared progress values
  const pk = K.io(t, tPencil + 0.4, 3.2, 'sine');                  // the pencil stretch draws
  const jk = K.io(t, tPencil + 3.0, 0.9);                          // ...then its dashed join to main
  const ink = K.io(t, tFlip + 0.5, 1.2);                           // inked once the switch is flipped
  const mcK = K.io(t, tFlip + 1.0, 0.6);                           // the merge stone lands on main
  const rk = K.io(t, tAdd, 0.6);                                   // the revert stone
  // tear: the two old stones lift off and grey out; new coral stones are laid; at [[revert]] it is undone
  const lift = K.io(t, tTears, 0.7) * (1 - K.io(t, tRev + 0.6, 0.7));
  const grey = K.io(t, tTears + 0.2, 0.5) * (1 - K.io(t, tRev + 0.8, 0.6));
  const strike = K.io(t, tRelays + 0.2, 0.4) * (1 - K.io(t, tRev + 0.3, 0.4));
  const newK = K.io(t, tRelays, 0.6), newA = 1 - K.io(t, tRev, 0.5);
  const brk = K.io(t, tTears - 0.3, 0.4) * (1 - K.io(t, tRev + 1.5, 0.5));   // everything after steps aside
  const sideA = 1 - 0.65 * brk;
  // main's signpost: 0839e49 -> merge stone (flip) -> the new 5e7b310 (tear) -> back (revert) -> revert stone (add)
  let signX = K.lerp(mX, mcX, K.io(t, tFlip + 1.4, 0.6));
  signX = K.lerp(signX, mX, K.io(t, tRelays + 0.4, 0.6) * (1 - K.io(t, tRev + 1.0, 0.6)));
  signX = K.lerp(signX, revX, K.io(t, tAdd + 0.6, 0.6));

  // pencil tip along the PR polyline
  const tip = (() => {
    const d1 = Math.hypot(PR[1][0] - PR[0][0], PR[1][1] - PR[0][1]), d2 = Math.hypot(PR[2][0] - PR[1][0], PR[2][1] - PR[1][1]);
    const s = pk * (d1 + d2);
    if (s <= d1) { const u = s / d1; return [K.lerp(PR[0][0], PR[1][0], u), K.lerp(PR[0][1], PR[1][1], u)]; }
    const u = (s - d1) / d2; return [K.lerp(PR[1][0], PR[2][0], u), K.lerp(PR[1][1], PR[2][1], u)];
  })();

  // ---- the map (identical to every other scene; only states change)
  M.sheet(t);
  M.mainPath({ x1: K.lerp(1160, 1240, rk) });
  M.trail(PR, { kind: 'pencil', k: pk, ink, alpha: sideA, tension: 0.4 });
  M.trail(JOIN, { kind: 'pencil', k: jk, ink, alpha: sideA * K.lerp(0.75, 1, ink), tension: 0.4, dash: ink > 0.5 ? [20, 12] : [4, 9] });
  M.trail(L.side, { kind: 'side', alpha: sideA });
  M.back(L.stoneX[0], Y, L.stoneX[1], Y, { alpha: 0.75 * (1 - brk) });
  M.back(L.stoneX[1], Y, mX, Y, { alpha: 0.75 * (1 - brk) });
  M.back(L.sideStones[0][0], L.sideStones[0][1], L.sideStones[1][0], L.sideStones[1][1], { alpha: 0.75 * (1 - brk) });
  M.back(mX, Y, mcX, Y, { alpha: 0.75 * mcK * (1 - brk), bend: -24 });
  M.back(mcX, Y, revX, Y, { alpha: 0.75 * K.io(t, tAdd + 0.3, 0.5) });
  M.stone(L.stoneX[0], Y, { id: id.home });
  M.stone(L.sideStones[0][0], L.sideStones[0][1], { id: id.contact, alpha: sideA });
  M.stone(L.sideStones[1][0], L.sideStones[1][1], { id: id.phone, alpha: sideA });
  M.signFor('feature/contact', L.sideStones[1][0], L.sideStones[1][1], { alpha: sideA });

  // the two stones a rewrite replaces: lifted off the line, greyed, old IDs struck through
  [[L.stoneX[1], id.about], [mX, id.merge]].forEach(([x, sid]) => {
    const y = Y + 130 * lift;
    const col = K.mixColor(C.gold, C.soft, grey);
    const g = M.stone(x, y, { id: sid, color: col, idColor: K.mixColor(C.body, C.soft, grey), alpha: 1 - 0.45 * grey });
    if (strike > 0) {
      const w = K.measure(sid, M.T.mono) + 12;
      K.line(x - w / 2, g.idY - 9, K.lerp(x - w / 2, x + w / 2, K.ease.out(strike)), g.idY - 9, { color: C.accent, w: 3, alpha: 0.9 });
    }
  });
  // ...and the new commits laid in their place (made-up IDs: a rewrite makes NEW commits)
  if (newK > 0 && newA > 0) [[L.stoneX[1], 'a91c0d2'], [mX, '5e7b310']].forEach(([x, nid], i) => {
    M.stone(x, Y, { id: nid, k: K.io(t, tRelays + i * 0.25, 0.6), color: C.accent, idColor: C.accent, alpha: newA });
  });
  // the pull request's stone: pencil outline, then inked
  M.stone(prS[0], prS[1], { state: ink > 0.55 ? 'solid' : 'outline', k: K.io(t, tPencil + 2.8, 0.6), color: K.mixColor(C.soft, C.gold, ink), alpha: sideA });
  M.back(prS[0], prS[1], mcX, Y, { alpha: 0.6 * mcK * (1 - brk), bend: 20 });
  // the merge stone on main
  M.stone(mcX, Y, { k: mcK, alpha: sideA });
  // the revert stone (Lovable's safe way): labelled, with a curved arrow back to the stone it undoes
  M.stone(revX, Y, { k: rk, glyph: '↺' });
  if (rk > 0) {
    const la = K.clamp(rk * 1.5 - 0.3);
    M.label('revert ' + id.merge, (revX + mX) / 2, Y - 96, { color: C.head, alpha: la });
    K.arrow(revX - 14, Y - 34, mX + 10, Y - 36, { k: K.io(t, tAdd + 0.5, 0.9), cx: (revX + mX) / 2, cy: Y - 130, color: C.head, w: 3, alpha: 0.95 });
  }
  M.signFor('main', signX, Y, { t, lantern: 1 });

  // the little pencil at the drawing tip
  const pa = K.env(t, tPencil + 0.3, tPencil + 3.9, 0.4);
  if (pa > 0) K.layer(pa, () => K.at(tip[0], tip[1] - 4, 1, -0.85, () => {
    K.line(12, 0, 64, 0, { color: C.soft, w: 9 });
    K.line(56, 0, 64, 0, { color: C.accent, w: 9, alpha: 0.5 });
    const g = K.ctx(); g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(13, -4.5); g.lineTo(13, 4.5); g.closePath(); g.fillStyle = C.paper; g.fill(); g.restore();
  }));

  // pill beside the stretch: proposed -> merged
  const prA = K.io(t, tPencil + 1.2, 0.5) * out(tTear - 0.7);
  const swapLbl = K.io(t, tFlip + 1.2, 0.5);
  if (prA > 0) {
    // while the agent's own attempt is being blocked, the human's merge steps back so the two never read as one event
    const quiet = 1 - 0.75 * K.io(t, tAuto - 0.1, 0.4);
    K.pill('pull request: proposed', 1160, 732, { size: 26, color: C.body, stroke: C.line2, alpha: prA * (1 - swapLbl) });
    K.pill('merged: your switch', 1160, 732, { size: 26, color: C.head, stroke: C.head, alpha: prA * swapLbl * quiet });
  }

  // ---- [[ci]] three checks under it; the middle one fails, the guide's pen fixes it; they leave before "auto"
  const ckA = out(tAuto - 0.5);
  const failK = K.io(t, tChecks, 0.3), fixed = K.io(t, tFix + 0.5, 0.4);
  [1070, 1150, 1230].forEach((cx, i) => {
    const k = K.stagger(t, tCi + 0.3, i, 0.15, 0.5) * ckA; if (k <= 0) return;
    const cy = 800, res = K.io(t, tChecks - 0.2 + i * 0.1, 0.3);   // pending -> result
    const bad = i === 1 && fixed < 0.5 && failK > 0.5;
    const col = res < 0.5 ? C.soft : bad ? C.accent : C.head;
    K.layer(k, () => {
      K.card(cx - 22, cy - 22, 44, 44, { r: 22, fill: C.tile, stroke: col, lw: 2.5, shadow: false });
      K.icon(res < 0.5 ? 'clock' : bad ? 'cross' : 'check', cx, cy, 26, { color: col, w: 3 });
    });
  });

  // ---- [[merge]] ... "auto mode blocks": the agent's own merge attempt bounces off a shield
  const shA = K.env(t, tAuto, tTear - 0.6, 0.4);
  const shPos = [1110, 800];
  if (shA > 0) K.layer(shA, () => {
    const go = K.io(t, tAuto + 0.1, 0.7), back = K.io(t, tBlocks + 0.1, 0.5, 'out');
    const ex = K.lerp(shPos[0] - 42, shPos[0] - 78, back);
    K.arrow(910, 792, ex, 800, { k: go, color: C.accent, w: 3, dash: [9, 7], bend: -10 });
    const sk = K.io(t, tAuto + 0.5, 0.4);
    K.layer(sk, () => {
      const g = K.ctx(); g.save(); g.beginPath(); g.arc(shPos[0], shPos[1], 32, 0, 7); g.fillStyle = C.page; g.fill(); g.lineWidth = 2.5; g.strokeStyle = C.head; g.stroke(); g.restore();
      K.icon('shield', shPos[0], shPos[1], 36, { color: C.head, w: 2.6 });
    });
    K.pill('agent merging on its own: blocked', 1010, 874, { size: 26, color: C.head, stroke: C.head, alpha: K.io(t, tBlocks, 0.4) });
  });

  // ---- the guide (draws the pencil, fixes the check, tries to merge) and the walker (flips the switch)
  const gx = K.lerp(K.lerp(L.guide[0], 860, K.io(t, tPencil + 0.1, 1.2)), 700, K.io(t, tTear - 0.3, 0.8));
  const drawing = t < tPencil + 3.7, fixing = t > tFix - 0.6 && t < tFix + 0.9;
  M.guide(t, gx, 776, {
    penTo: drawing ? tip : fixing ? [1150, 800] : null,
    scribble: drawing ? K.env(t, tPencil + 0.5, tPencil + 3.6, 0.3) : fixing ? K.env(t, tFix - 0.3, tFix + 0.6, 0.2) : 0,
  });
  const walkA = out(tTear - 0.4);
  const wk = M.walker(t, L.walker[0], L.walker[1], {
    alpha: walkA,
    look: t > tMerge && t < tTear ? [1420, 706] : null,
    sightAlpha: 0.4 + 0.4 * K.env(t, tFlip - 0.8, tFlip + 1.6, 0.3),
  });

  // ---- right column, [[ci]]: S208 card
  const RX = 1290, RW = 510;   // clear of main's plank when it stands on the merge stone
  M.dated(RX, 150, RW, { eyebrow: 'Anthropic · Get started with the desktop app · ' + M.READ, quote: true,
    body: 'After opening a PR, Claude Code monitors CI check results and can automatically fix failures',
    alpha: K.env(t, tCi + 0.2, tMerge + 0.1, 0.5) });

  // ---- [[merge]] the switch; card A (Merge when ready) then card B (auto mode blocks), pointers
  M.dated(RX, 150, RW, { eyebrow: 'Merge when ready · Use Claude Code Desktop · ' + M.READ,
    body: 'Turns on GitHub’s auto-merge for that pull request when you switch it on.',
    alpha: K.env(t, tMerge + 0.3, tAuto - 0.2, 0.5) });
  const bOpt = { eyebrow: 'Auto mode blocks · Choose a permission mode · ' + M.READ, quote: true,
    body: 'Merging a pull request no human has approved, approving Claude’s own pull request, or disabling CI checks' };
  const hB = M.dated(RX, 150, RW, { ...bOpt, measure: true });
  M.dated(RX, 150, RW, { ...bOpt, alpha: K.env(t, tAuto, tTear - 0.6, 0.5) });
  M.pointer('the lesson on who signs off before you ship', RX - 50, 150 + hB + 46, { alpha: K.env(t, tWho, tTear - 0.6, 0.5) });
  M.pointer('the lesson on checking code you can’t read', RX - 50, 150 + hB + 108, { alpha: K.env(t, tWho + 0.6, tTear - 0.6, 0.5) });

  const swA = K.env(t, tMerge + 0.3, tTear - 0.6, 0.5);
  if (swA > 0) K.layer(swA, () => {
    const sx = 1420, sy = 706, on = K.io(t, tFlip, 0.3);
    M.label('Merge when ready', sx, 666, { color: C.strong });
    K.card(sx - 40, sy - 20, 80, 40, { r: 20, fill: K.mixColor(C.panel || C.tile, C.head, 0.75 * on), stroke: K.mixColor(C.line2, C.head, on), lw: 2, shadow: false });
    const kx = K.lerp(sx - 20, sx + 20, on), g = K.ctx();
    g.save(); g.beginPath(); g.arc(kx, sy, 15, 0, 7); g.fillStyle = K.mixColor(C.soft, C.page, on); g.fill(); g.restore();
    // the walker's pointer travels to the knob and clicks it on "flip"
    const mv = K.io(t, tFlip - 1.1, 0.9), ca = K.env(t, tFlip - 1.2, tFlip + 1.4, 0.3) * walkA;
    if (ca > 0) K.cursor(K.lerp(wk.eye[0] - 10, sx - 20, mv), K.lerp(wk.eye[1] + 10, sy + 4, mv), { alpha: ca, click: K.seg(t, tFlip, tFlip + 0.6), press: K.env(t, tFlip - 0.05, tFlip + 0.2, 0.08) });
  });

  // ---- [[tear]] the station's copy across the valley still holds the OLD IDs: copies disagree
  const stA = K.env(t, tTear + 0.1, tListIn + 0.2, 0.5);
  if (stA > 0) {
    M.valley({ k: K.io(t, tTear + 0.1, 0.8), alpha: stA });
    const st = M.station(t, { k: K.io(t, tTear + 0.2, 1.0), alpha: stA, stones: [{ id: id.home }, { id: id.about }, { id: id.merge }, {}] });
    // the mismatch draws on as the new stones land and holds (full strength) until the list replaces the station
    const mk = K.io(t, Math.min(tDis - 0.9, tRelays + 0.9), 0.6), mA = out(tListIn - 0.3);
    if (mk > 0 && mA > 0) K.layer(mA, () => {
      const s2 = st.slots[2];
      K.ring(mX, Y, 40, 40, mk, { color: C.accent, w: 3.5, rot: 0 });
      K.ring(s2[0], s2[1], 34, 34, mk, { color: C.accent, w: 3.5, rot: 0 });
      K.path([[mX + 36, Y + 24], [1180, Y + 80], [1400, Y + 150], [s2[0], s2[1] + 80]], { k: mk, head: false, color: C.accent, w: 3.5, dash: [12, 8] });
      K.pill('copies disagree', 1570, 836, { size: 26, color: C.accent, stroke: C.accent, fill: C.page, alpha: K.clamp(mk * 2 - 1) });
    });
  }
  const brA = K.env(t, tTear + 0.2, tListIn, 0.5);
  if (brA > 0) {
    M.breaks(200, 228, { alpha: brA });
    K.text('stones can be torn out', 244, 272, { font: 'ui', weight: 600, size: 30, color: C.strong, alpha: brA });
  }

  // ---- [[names]] recognise, don't type (opens on "force", its first heading with it)
  const lA = K.env(t, tListIn, tRev - 0.2, 0.5);
  if (lA > 0) K.layer(lA, () => {
    const x = RX, y = 150, w = RW, h = 566, mono = { font: 'mono', weight: 600, size: 28, color: C.strong };
    K.card(x, y, w, h, { r: 24, stroke: C.line2, lw: 1.5 });
    K.text('recognise, don’t type', x + 30, y + 52, { ...M.T.eyebrow, color: C.head });
    const rv = (a, fn) => { const k = K.io(t, a, 0.4); if (k > 0) K.layer(k, () => K.at((1 - K.ease.out(k)) * 12, 0, 1, 0, fn)); };
    rv(tListIn, () => K.text('rewrites history', x + 30, y + 104, { font: 'ui', weight: 600, size: 26, color: C.body }));
    rv(tForce, () => K.text('git push --force', x + 30, y + 150, mono));
    rv(tAmend, () => K.text('amending a pushed commit', x + 30, y + 194, { ...mono, font: 'ui' }));
    rv(tReset - 0.3, () => K.text('throws away unsaved work', x + 30, y + 258, { font: 'ui', weight: 600, size: 26, color: C.body }));
    rv(tReset, () => K.text('git reset --hard', x + 30, y + 304, mono));
    rv(tReset + 0.3, () => K.text('git checkout -- .', x + 30, y + 348, mono));
    rv(tReset + 0.6, () => K.text('git restore .', x + 30, y + 392, mono));
    rv(tClean, () => K.text('git clean -fd', x + 30, y + 436, mono));
    rv(tStash, () => K.text('git stash drop', x + 30, y + 480, mono));
    rv(tStash + 0.35, () => K.text('git stash clear', x + 30, y + 524, mono));
    rv(tAuto2, () => M.pillL('blocked by default in auto mode', x, y + h + 52, { size: 26, color: C.head, stroke: C.head, icon: 'shield' }));
    rv(tAuto2 + 0.8, () => K.para('Before it discards uncommitted work, it runs git status itself · ' + M.READ, x, y + h + 120, w - 20, { font: 'ui', size: 26, color: C.body }));
  });

  // ---- [[revert]] Lovable's safe way; the backup note is a footnote inside the card
  const lvA = K.io(t, tRev + 0.2, 0.6);
  if (lvA > 0) {
    const lx = 1360, lw = 440, pad = 30;
    const cOpt = { eyebrow: 'Lovable · Git sync docs · ' + M.READ,
      body: '“Do not force-push, rebase, or squash commits that are already on the synced branch.” “To undo a change, add a commit that reverts it.”' };
    const h = M.dated(lx, 150, lw, { ...cOpt, measure: true });
    const note = 'A rewrite replaces Lovable’s copy; the owner can restore a backup (since 2026-10-05).';
    const nl = K.wrap(note, lw - pad * 2, { font: 'ui', size: 26 }).length, nh = nl * 34 + 34;
    const fA = K.io(t, tRev + 1.4, 0.6);
    K.layer(lvA, () => K.card(lx, 150, lw, h + nh * fA, { r: 24, stroke: C.line2, lw: 1.5 }));
    M.dated(lx, 150, lw, { ...cOpt, alpha: lvA });
    if (fA > 0) K.para(note, lx + pad, 150 + h + 38, lw - pad * 2, { font: 'ui', size: 26, color: C.body, alpha: lvA * fA });
  }
});
