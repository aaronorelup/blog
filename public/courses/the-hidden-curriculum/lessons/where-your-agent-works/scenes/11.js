/* 11 — The spare workshop works on a copy
   One street (M.street at s 0.6, top of frame) with a band underneath (y 640-930) that carries one idea per beat.
   - [[cloud-session]] the vendor's spare workshop ('cloud session') opens; the worker walks out of your workshop,
     along the road and into it; label "isolated VM / Anthropic-managed"; on "close your laptop" your house goes dark
     while the spare workshop's gear keeps turning. Band: S129 card "Each session runs in an isolated,
     Anthropic-managed VM".
   - [[copy]] a GitHub depot stands mid-street; a drawn terminal types `claude --cloud`; a dashed bundle travels from
     the depot (not from your house) into the spare workshop; a dashed grey arrow from your bench is crossed out;
     label "your pushed branch, not your local copy" + pill `push first`. Band: terminal + S129 clone card.
   - [[creds]] a locked box with a key hangs on the vendor's outer wall; it never goes inside. Band: S129 credentials
     card (with its "In Anthropic-hosted environments" qualifier).
   - [[bundle]] the depot greys ('no remote'); a bundle leaves your house and crosses the road. Band: a card on the
     GitHub App case, then a "what goes in the bundle" panel: notes.txt (untracked: not included), server.key
     (committed: goes up), .env (uncommitted edit: 'Left on this machine: .env' on macOS · Linux · WSL).
   - [[windows-caveat]] the track pill turns to "native Windows"; the bundle crosses again with a terracotta outline
     and a terracotta copy of .env flies into it. "Know what crosses."
   Exit: spare workshop working (gear turning), road quiet, panel at rest. No 'back' overshoot. Pure function of t. */
SCENE('11', (t, S) => {
  const C = K.C;
  K.bg();

  // ---- times (local), on the spoken words
  const tCS = S.cue('cloud-session', 0), tCopy = S.cue('copy', 9.92), tCreds = S.cue('creds', 16.95);
  const tBund = S.cue('bundle', 22.29), tWin = S.cue('windows-caveat', 48.33);
  const w = (re, n, fb) => S.find(re, n, fb);
  const tSpare = w(/^spare$/i, 0, 1.94), tIso = w(/^isolated$/i, 0, 3.29), tClose = w(/^close$/i, 0, 8.38);
  const tGH = w(/^github,?$/i, 0, 13.15), tNot = w(/^not$/i, 0, 14.05), tBench = w(/^bench/i, 0, 15.15), tPush = w(/^push$/i, 0, 15.65);
  const tNever = w(/^never$/i, 0, 19.91);
  const tNo = w(/^no$/i, 0, 22.6), tApp = w(/^app$/i, 0, 27.23), tBundled = w(/^bundled$/i, 0, 30.31);
  const tUntr = w(/^untracked$/i, 0, 32.74), tComm = w(/^committed$/i, 0, 34.81), tKeys = w(/^keys$/i, 0, 36.15);
  const tMac = w(/^mac/i, 0, 37.84), tUnc = w(/^uncommitted$/i, 0, 40.62), tNamed = w(/^named$/i, 0, 42.32);
  const tDot = w(/^dot$/i, 0, 44.54), tStay2 = w(/^stay$/i, 1, 47.01);
  const tNative = w(/^native$/i, 0, 48.59), tUnc2 = w(/^uncommitted$/i, 1, 49.67), tUpload = w(/^upload$/i, 0, 51.74);
  const tKnow = w(/^know$/i, 0, 53.43);

  // ---- the street (storyboard's wide street, scaled into the top of the frame)
  const ST = { x: 304, y: 50, s: 0.68 };
  const dark = K.io(t, tClose, 0.8) * (1 - K.io(t, tCopy + 0.6, 0.7));
  const gear = t * 1.4;
  const depotIn = K.io(t, tCopy - 0.2, 0.6), depotGrey = K.io(t, tNo, 0.7);
  const codeLit = 0.8 * (1 - K.io(t, tSpare, 1.2) * 0.5);
  const street = M.street(t, {
    ...ST,
    house: { labels: false, doors: false, shelfAlpha: { Finances: 0 }, office: 0, rooms: { chat: 0.8, cowork: 0.8, code: codeLit }, dark },
    road: { label: false },
    vendor: { office: 1, officeLit: 0.55, spare: K.io(t, tCS + 0.2, 0.7), spareLit: 0.5 + 0.5 * K.io(t, tSpare + 1.2, 0.8), gear },
  });
  const H = street.house, V = street.vendor, at = street.at;
  const roadY = street.road.y;

  // ---- the house's own text, drawn here instead of by M.house (labels:false, doors:false): at s 0.68 the shared
  //      folder names sit on the folder icons and touch each other (same workaround as scene 12). Same words and
  //      places: Karla 600 26 on screen, every name standing on the shelf plank clear of its icon, door pills 26 px.
  {
    const s = ST.s, lit = 1 - 0.62 * dark;                         // the house's lights-out overlay, matched
    K.at(H.x, H.y, s, 0, () => {
      K.eyebrow('YOUR COMPUTER', M.L.house.w / 2, -38, { ...M.T.eyebrow, size: 24 / s, color: C.head, align: 'center', alpha: lit });
      // Finances is drawn here too (shelfAlpha 0 in M.house), so its terracotta ring can be sized from its 26 px name
      {
        const fx = (H.folders.Finances.x - H.x) / s, ft = { font: 'ui', weight: 600, size: 26 / s };
        const rw = Math.max(168, K.measure('Finances', ft) + 28 / s);
        K.layer(lit, () => {
          K.folder(fx, 48, 70, { name: null });
          M.outline(fx - rw / 2, 2, rw, 116, 14, 1, { color: M.P.never, w: 2.5 });
        });
      }
      for (const n of M.L.shelfNames) {
        const lx = (H.folders[n].x - H.x) / s;
                K.text(n, lx, 111,   // descenders clear of the plank (118); caps (~85) clear of the icon (79.5)
          { font: 'ui', weight: 600, size: 26 / s, color: C.body, align: 'center', alpha: lit });
      }
      for (const [n, label, rl] of [['chat', 'Chat', 0.8], ['code', 'Code', codeLit]]) {
        const r = M.L.rooms[n], dx = (r[0] + r[1]) / 2, on = rl > 0.5;   // as M.house: a dimmed room's pill greys
        K.at(dx, M.L.doorY, 1 / s, 0, () => K.pill(label, 0, 0, { size: 26, alpha: lit, color: on ? C.strong : C.body, stroke: on ? K.mixColor(C.line2, C.head, 0.6) : C.line2 }));
      }
    });
  }

  // ---- the GitHub depot, mid-street between your house and the vendor (world x 1110-1300, y 600-760)
  const dp = at(1110, 600), dw = 190 * ST.s, dh = 160 * ST.s, dcx = dp[0] + dw / 2;
  if (depotIn > 0) {
    K.layer(depotIn, () => {
      const col = K.mixColor(K.mixColor(C.line2, C.head, 0.7), C.soft, depotGrey);
      K.card(dp[0], dp[1], dw, dh, { r: 10, fill: K.mixColor(C.tile, C.page, 0.3 + 0.4 * depotGrey), stroke: col, lw: 2 });
      // branch glyph: a trunk and one branch (K.path) with three commit dots
      const bx = dcx - 18, by0 = dp[1] + 18, by1 = dp[1] + dh - 18;
      K.path([[bx, by1], [bx, by0]], { head: false, color: col, w: 3, tension: 0 });
      K.path([[bx, by1 - 18], [bx + 34, by0 + 24], [bx + 34, by0 + 10]], { head: false, color: col, w: 3, tension: 0.4 });
      const g = K.ctx();
      [[bx, by1], [bx, by0], [bx + 34, by0 + 10]].forEach(([x, y]) => { g.save(); g.beginPath(); g.arc(x, y, 6, 0, 7); g.fillStyle = col; g.fill(); g.restore(); });
      M.label('GitHub', dcx, dp[1] - 16, { color: K.mixColor(C.strong, C.soft, depotGrey) });
      if (depotGrey > 0) {
        K.line(dp[0] + 8, dp[1] + dh - 8, dp[0] + dw - 8, dp[1] + 8, { k: depotGrey, color: C.soft, w: 3 });
        M.label('no remote', dcx, dp[1] + dh + 34, { color: C.soft, italic: true, alpha: depotGrey * (1 - K.io(t, tBundled - 0.7, 0.4)) });
      }
    });
  }

  // ---- the worker: out of your workshop, along the road, into the spare workshop
  const wk = K.io(t, tSpare + 0.1, 1.5, 'io');
  const wPts = [H.rooms.code.spot, [H.rooms.code.spot[0] + 10, roadY - 34], [V.spare.x + 30, roadY - 34], [V.spare.spot[0] - 60, V.spare.spot[1] + 20], V.spare.spot];
  const wp = M.along(wPts, wk);
  M.worker(t, wp[0], wp[1], { s: 64, walk: wk > 0 && wk < 1 ? 1 : 0, glow: 0.4 * K.io(t, tSpare + 1.6, 0.6) });

  // ---- right-hand column (x 1500-1840): one label group at a time
  const RX = 1566;
  const isoA = K.io(t, tIso - 0.2, 0.5) * (1 - K.io(t, tCopy + 1.6, 0.4));
  if (isoA > 0) {
    K.line(V.spare.x + V.spare.w + 6, V.spare.cy, RX - 8, V.spare.cy, { color: K.rgba(C.head, 0.6), w: 2, k: isoA });
    M.label('isolated VM', RX, V.spare.cy - 8, { align: 'left', color: C.strong, size: 30, alpha: isoA });
    M.label('Anthropic-managed', RX, V.spare.cy + 30, { align: 'left', color: C.body, alpha: isoA });
  }
  const runA = K.io(t, tClose + 0.3, 0.5) * (1 - K.io(t, tCopy + 1.6, 0.4));
  if (runA > 0) {
    M.label('laptop closed:', RX, V.spare.cy + 88, { align: 'left', color: C.soft, alpha: runA });
    M.label('still working', RX, V.spare.cy + 122, { align: 'left', color: C.head, alpha: runA });
  }

  // ---- [[copy]]: the pushed branch travels from the depot, never from your bench
  const bk = K.io(t, tGH - 0.1, 1.3);
  const bPts = [[dcx, dp[1] + dh / 2], [dcx + 30, dp[1] - 40], [V.spare.x + 30, V.spare.spot[1] - 50], [V.spare.cx - 100, V.spare.spot[1] - 46]];
  const bA = K.io(t, tGH - 0.3, 0.3) * (1 - K.io(t, tBund + 0.2, 0.6));
  if (bA > 0) {
    const bp = M.along(bPts, bk);
    M.bundle(bp[0], bp[1], 46, { alpha: bA });
  }
  const notA = K.io(t, tNot - 0.1, 0.5) * (1 - K.io(t, tBund, 0.6));
  if (notA > 0) {
    const b0 = H.rooms.code.bench, b1 = [V.spare.x - 8, V.spare.y + 20];
    K.arrow(b0[0] + 40, b0[1] - 30, b1[0], b1[1], { k: K.io(t, tNot - 0.1, 0.9), cx: (b0[0] + b1[0]) / 2, cy: H.y - 10, color: C.soft, w: 3, dash: [8, 9] });
    const mx = 0.25 * (b0[0] + 40) + 0.5 * (b0[0] + b1[0]) / 2 + 0.25 * b1[0], my = 0.25 * (b0[1] - 30) + 0.5 * (H.y - 10) + 0.25 * b1[1];
    const xk = K.io(t, tBench - 0.1, 0.4);
    if (xk > 0) K.layer(notA, () => {
      const g = K.ctx(); g.save(); g.beginPath(); g.arc(mx, my, 24, 0, 7); g.fillStyle = C.tile; g.fill(); g.restore();
      K.icon('cross', mx, my, 34 * xk, { color: C.strong, w: 3.5 });
    });
  }
  const brA = K.io(t, tGH + 0.2, 0.5) * (1 - K.io(t, tCreds - 0.2, 0.5));
  if (brA > 0) {
    M.label('your pushed branch,', RX, V.spare.cy - 8, { align: 'left', color: C.strong, alpha: brA });
    M.label('not your local copy', RX, V.spare.cy + 28, { align: 'left', color: C.strong, alpha: brA });
    M.pillL('push first', RX, V.spare.cy + 86, { size: 26, color: C.page, fill: C.head, stroke: C.head, alpha: K.io(t, tPush - 0.1, 0.4) * brA });
  }

  // ---- [[creds]]: a locked box with the key stays on the vendor's outer wall
  const crA = K.io(t, tCreds, 0.6) * (1 - K.io(t, tBund + 0.2, 0.6));
  if (crA > 0) K.layer(crA, () => {
    const bx = V.x + V.w + 10, by = V.office.cy - 50, bw = 84, bh = 100;
    K.line(V.x + V.w, by + 20, bx, by + 20, { color: C.line2, w: 3 });
    const glow = Math.max(0, 1 - Math.abs(t - (tNever + 0.5)) / 1.2);
    if (glow > 0) K.glow(bx + bw / 2, by + bh / 2, 90, C.head, 0.3 * glow);
    K.card(bx, by, bw, bh, { r: 6, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.5), lw: 2 });
    K.icon('key', bx + bw / 2, by + 34, 36, { color: C.head, w: 2.6 });
    K.icon('lock', bx + bw / 2, by + 74, 30, { color: C.body, w: 2.4 });
    const lx = bx + bw + 16;
    M.label('credentials', lx, by + 30, { align: 'left', color: C.strong });
    M.label('stay out', lx, by + 64, { align: 'left', color: C.strong });
    M.label('of the VM', lx, by + 98, { align: 'left', color: C.strong });
    M.pillL('Anthropic-hosted', RX, by + 150, { size: 26, color: C.body, fill: C.panel, stroke: C.line2 });
  });

  // ---- [[bundle]] / [[windows-caveat]]: the local project crosses the road as a bundle
  const step = [H.x + H.w + 24, roadY - 34];          // your front step (just outside the house, where the road starts)
  const cross = (t0, never) => {
    const k = K.io(t, t0, 1.6), a = K.io(t, t0 - 0.2, 0.3) * (1 - K.io(t, t0 + 2.4, 0.6));
    if (a <= 0) return;
    const pts = [step, [step[0] + 40, roadY], [V.x - 20, roadY], [V.spare.x + 30, V.spare.spot[1] - 50], [V.spare.cx - 100, V.spare.spot[1] - 46]];
    const p = M.along(pts, k);
    M.bundle(p[0], p[1], 46, { alpha: a, never });
  };
  cross(tBundled - 0.2, false);
  cross(tUnc2, true);
  // the .env left on the front step (macOS · Linux · WSL)
  const envStep = K.io(t, tStay2 - 0.3, 0.5);
  if (envStep > 0) {
    K.layer(envStep * (1 - 0.6 * K.io(t, tNative, 0.5)), () => K.file(step[0], step[1] - (1 - envStep) * 20, 40));
  }

  // ================= the band (y 640-930) =================
  const BW = 1360, BX = 960 - BW / 2, BY = 664;
  const EB = 'Anthropic · Claude Code in the cloud · read 2026-10-14';
  const band = (a0, a1) => K.io(t, a0, 0.5) * (1 - K.io(t, a1, 0.4));
  // card 1: the VM
  M.dated(BX + 120, BY, BW - 240, { eyebrow: EB, body: 'Each session runs in an isolated, Anthropic-managed VM', quote: true, footer: true, alpha: band(tIso - 0.4, tCopy - 0.3) });
  // card 2: terminal + clone quote
  const c2 = band(tCopy - 0.1, tCreds - 0.3);
  if (c2 > 0) K.layer(c2, () => {
    const r = K.win(90, BY, 520, 250, { kind: 'terminal', title: 'Terminal', titleSize: 26 });
    K.term(r, t, [{ at: tCopy + 0.1, cmd: 'claude --cloud', cps: 14 }], { prompt: '~/demo $ ', size: 30, rows: 3 });
    M.dated(640, BY, 1190, { eyebrow: EB, body: "clones your current directory's GitHub remote at your current branch, not your local checkout, so push first", quote: true, footer: true });
  });
  // card 3: credentials
  M.dated(BX + 20, BY, BW - 40, { eyebrow: EB, body: "In Anthropic-hosted environments, your GitHub credentials stay encrypted on Anthropic's servers and never enter a session's VM.", quote: true, footer: true, alpha: band(tCreds + 0.2, tBund - 0.3) });
  // card 4: the GitHub App case
  M.dated(BX + 20, BY, BW - 40, { eyebrow: EB, body: 'Also for a repo “that the Claude GitHub App isn\'t installed on”, “even if you connected GitHub with /web-setup”', footer: true, alpha: band(tNo, tUntr - 0.6) });

  // panel 5: what goes in the bundle
  const pA = K.io(t, tUntr - 0.5, 0.5);
  if (pA > 0) K.layer(pA, () => {
    const px = 90, py = 652, pw = 1740, ph = 278;
    K.card(px, py, pw, ph, { r: 24, stroke: C.line2 });
    K.eyebrow(EB, px + 32, py + 40, { ...M.T.eyebrow, color: C.head });
    const win = K.io(t, tNative - 0.1, 0.5);
    // track pill + the source's words for that track
    const trA = K.io(t, tMac - 0.2, 0.4);
    if (trA > 0) {
      const tx = px + pw - 32;
      K.layer(1 - win, () => M.pillL('macOS · Linux · WSL', tx, py + 32, { align: 'right', size: 26, color: C.strong, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.5), alpha: trA }));
      K.layer(win, () => M.pillL('native Windows', tx, py + 32, { align: 'right', size: 26, color: C.accent, fill: C.tile, stroke: C.accent }));
    }
    // the bundle on the right
    const bxC = 1660, byC = py + 150;
    const bundleNever = K.io(t, tUnc2 + 1.0, 0.4);
    K.layer(1 - bundleNever, () => M.bundle(bxC, byC, 150, { label: 'the bundle' }));
    K.layer(bundleNever, () => M.bundle(bxC, byC, 150, { label: 'the bundle', never: true }));
    // three rows
    const rows = [
      { name: 'notes.txt', kind: 'untracked', y: py + 94 },
      { name: 'server.key', kind: 'committed', y: py + 146 },
      { name: '.env', kind: 'uncommitted edit', y: py + 198 },
    ];
    const laneX0 = 820, laneX1 = bxC - 100;
    rows.forEach((r, i) => {
      const ra = K.stagger(t, tUntr - 0.4, i, 0.15, 0.5);
      K.layer(ra, () => {
        K.file(px + 60, r.y - 8, 44);
        K.text(r.name, px + 104, r.y, { ...M.T.mono, color: C.strong });
        K.text(r.kind, px + 330, r.y, { ...M.T.mono, weight: 400, color: C.soft });
      });
    });
    // row 1: untracked -> not included
    const r1 = K.io(t, tUntr + 0.3, 0.5);
    M.pillL('not included', laneX0, rows[0].y - 9, { size: 26, font: 'mono', weight: 400, color: C.body, fill: C.panel, stroke: C.line2, alpha: r1 });
    // row 2: committed -> a dashed copy goes up (keys included)
    const r2 = K.io(t, tComm + 0.2, 1.1);
    if (r2 > 0) {
      const cx = K.lerp(laneX0 + 30, bxC - 30, r2), cy = rows[1].y - 8 - Math.sin(Math.PI * r2) * 24;
      M.copy(cx, cy, 40, { alpha: 1 - K.io(t, tComm + 1.2, 0.3) });
      const gw = M.pillL('goes up', laneX0, rows[1].y - 9, { size: 26, font: 'mono', weight: 400, color: C.page, fill: C.head, stroke: C.head, alpha: K.io(t, tComm + 0.9, 0.4) });
      M.pillL('keys included', laneX0 + gw + 16, rows[1].y - 9, { size: 26, color: C.strong, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.5), alpha: K.io(t, tKeys - 0.1, 0.4) });
    }
    // row 3: .env — stays (macOS · Linux · WSL), then uploads (native Windows)
    const q3 = K.io(t, tNamed - 0.2, 0.5) * (1 - K.io(t, tDot - 0.2, 0.4));
    if (q3 > 0) K.text('“named like credentials or keys”', laneX0, rows[2].y, { font: 'read', size: 28, italic: true, color: C.strong, alpha: q3 });
    const leftA = K.io(t, tDot, 0.5) * (1 - win);
    M.pillL('Left on this machine: .env', laneX0, rows[2].y - 9, { size: 26, font: 'mono', weight: 400, color: C.body, fill: C.panel, stroke: C.line2, alpha: leftA });
    if (win > 0) {
      const r3 = K.io(t, tUnc2 + 0.1, 1.1);
      const cx = K.lerp(laneX0 + 30, bxC - 30, r3), cy = rows[2].y - 8 - Math.sin(Math.PI * r3) * 24;
      M.copy(cx, cy, 40, { never: true, alpha: (r3 > 0 ? 1 : 0) * (1 - K.io(t, tUnc2 + 1.2, 0.3)) });
      const uw = M.pillL('goes up', laneX0, rows[2].y - 9, { size: 26, font: 'mono', weight: 400, color: C.accent, fill: C.tile, stroke: C.accent, alpha: K.io(t, tUnc2 + 0.9, 0.4) });
      const qa = K.io(t, tUpload - 0.3, 0.5);
      if (qa > 0) K.text('“… whatever the file\'s name”', laneX0 + uw + 18, rows[2].y, { font: 'read', size: 28, italic: true, color: C.strong, alpha: qa });
    }
    // the line under both tracks: its own row under the table, never in the header
    const kA = K.io(t, tKnow - 0.1, 0.5);
    if (kA > 0) {
      K.title('Know what crosses.', px + 60, py + 256, { size: 36, align: 'left', alpha: kA });
    }
  });
});
