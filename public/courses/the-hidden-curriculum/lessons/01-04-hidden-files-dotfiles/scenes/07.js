// 07: The drawer of keys with no lock (.env).
// Camera: wide like 06 (shop floor dimmed); one gentle lean-in on the drawer (capped so the top shelf and the badge
// stay clear), then wide again for the rest. One idea per beat, all inside the project's back room:
//   env-file     the .env file itself: name = value lines, loaded as environment variables (01.05)
//   no-lock      the lock over the drawer is crossed: plain text, out of sight, not encrypted
//   never-commit rule one: the path up to the .git ledger is barred by the .gitignore list (.env typed on it); a key
//                that already reached the ledger is "in .git history" and gets crossed: replace it
//   never-paste  rule two as struck pills; a key copy travels drawer -> agent -> ~/.claude/projects/ in a small
//                HOME BACK ROOM card (the ~ room from 05), "a transcript file"
//   push-net     GitHub (cloud, empty) above a net pill: a recognised key stops under it, an unrecognised one slips
//                through a gap; PUSH PROTECTION facts land on their words
SCENE('07', (t, S) => {
  K.bg();
  const L = M.layout, P = M.palette, C = K.C;
  const cue = (n, fb) => S.cue(n, fb);
  const w = (word, n, fb) => S.find(word, n, fb);

  // ---- cue times (local seconds)
  const cEnv = cue('env-file', 0);
  const cLock = cue('no-lock', 22.44);
  const cCommit = cue('never-commit', 28.83);
  const cPaste = cue('never-paste', 43.8);
  const cNet = cue('push-net', 58.82);

  // ---- word anchors
  const wDrawer = w('drawer', 0, cEnv + 0.39);
  const wDot = w(/^dot$/i, 0, cEnv + 5.32);
  const wInside = w('Inside', 0, cEnv + 7.34);
  const wName = w('name', 0, cEnv + 9.32);
  const wEquals = w('equals', 0, cEnv + 10.23);
  const wValue = w('value', 0, cEnv + 11.56);
  const wPassword = w('password', 0, cEnv + 13.83);
  const wLoads = w('loads', 0, cEnv + 19.0);
  const wEnvVars = w('environment', 0, cEnv + 20.44);
  const wLock = w('lock', 0, cLock + 1.13);
  const wPlain = w('plain', 1, cLock + 2.01);
  const wHidden = w('Hidden', 0, cLock + 3.23);
  const wNever = w('never', 0, cCommit + 1.38);
  const wIgnore = w('ignore', 0, cCommit + 4.83);
  const wList = w('list', 0, cCommit + 5.33);
  const wPull = w('pull', 0, cCommit + 8.76);
  const wHistory = w('history', 0, cCommit + 9.52);
  const wReplace = w('replace', 0, cCommit + 13.8);
  const wPaste = w('paste', 0, cPaste + 1.68);
  const wChat = w('chat', 0, cPaste + 2.53);
  const wAgent = w('agent', 0, cPaste + 3.89);
  const wRead = w('read', 0, cPaste + 4.3);
  const wClaude = w('Claude', 0, cPaste + 5.3);
  const wTool = w('tool', 0, cPaste + 8.53);
  const wEnds = w('ends', 0, cPaste + 10.77);
  const wTranscript = w('transcript', 0, cPaste + 11.89);
  const wHiddenF = w('hidden', 1, cPaste + 13.32);
  const wGitHub = w('GitHub', 0, cNet);
  const wBlocks = w('blocks', 0, cNet + 0.74);
  const wSome = w('some', 0, cNet + 1.1);
  const wKnown = w('known', 0, cNet + 1.29);
  const wPublic = w('public', 0, cNet + 2.94);
  const wOnly = w('only', 1, cNet + 4.85);
  const wOverride = w('override', 0, cNet + 7.15);

  const fadeOut = (b) => 1 - K.io(t, b, 0.6);
  const ui26 = { font: 'ui', weight: 600, size: 26 };
  const pillW = (s) => K.measure(s, ui26) + 26 * 1.6;

  // ---- shelf rows from 06's last frame (.git and .venv half-lit, .vscode lit), dimmed for the drawer,
  // .git back to full for rule one, everything off the shelves from rule two on
  const dimIn = K.io(t, wDrawer, 0.9);
  const gitA = K.lerp(K.lerp(0.5, 0.12, dimIn), 1, K.io(t, cCommit, 0.6)) * fadeOut(cPaste);
  const venvA = K.lerp(0.5, 0.12, dimIn) * fadeOut(cCommit);
  const vsA = K.lerp(1, 0.12, dimIn) * fadeOut(cCommit);

  // ---- the drawer
  const openK = K.io(t, wDrawer + 0.3, 0.7);
  const keyK = K.io(t, wDrawer + 0.7, 0.5);
  const lockK = K.io(t, cLock, 0.5);
  const crossK = K.io(t, wLock, 0.6);

  // no push-in: the room stays wide (same framing as 06) and the drawer is singled out in place by its ring
  K.withCam(M.cam(t, [{ at: -10, view: 'wide' }]), () => {
    M.shop(t, { floorDim: 1 });

    // ---- 06's shelves
    const sGit = M.slot(0, 0);
    const ledY = M.slot(0, 1, 64).y;
    if (gitA > 0) {
      for (let i = 0; i < 5; i++) {
        const px = sGit.x - 30 + i * 9, py = sGit.y - 30 - i * 3;
        const dimC = (c) => K.mixColor(c, P.room, 1 - gitA);   // dim by colour: stacked pages stay opaque
        K.card(px - 26, py - 20, 52, 40, { r: 4, fill: dimC(P.paper), stroke: dimC(P.paperShade), shadow: false });
        K.line(px - 16, py - 6, px + 14, py - 6, { color: dimC(P.inkSoft), w: 2, alpha: 0.6 });
        K.line(px - 16, py + 4, px + 8, py + 4, { color: dimC(P.inkSoft), w: 2, alpha: 0.6 });
      }
      M.item(sGit.x, sGit.y, 80, { kind: 'folder', name: '.git', label: 'right', size: 30, alpha: gitA });
    }
    // ledger label; for rule one it becomes "in .git history" when the old key shows up inside the book
    const histK = K.io(t, wPull - 0.1, 0.4);   // starts after 'ledger' has faded: no crossfade overlap
    const shelfLabel = (icon, label, y, a) => {
      if (a <= 0) return;
      K.layer(a, () => {
        K.glow(1545, y, 60, C.head, 0.12);
        K.icon(icon, 1545, y, 60, { color: C.head, w: 3.5 });
        if (label) K.text(label, 1595, y + 30 * 0.36, { ...M.type.read, color: C.strong });
      });
    };
    shelfLabel('book', null, ledY, gitA);
    if (gitA > 0) {
      K.text('logbook', 1595, ledY + 11, { ...M.type.read, color: C.strong, alpha: gitA * (1 - K.io(t, wPull - 0.4, 0.3)) });
      K.text('in .git history', 1595, ledY + 11, { ...M.type.read, color: C.strong, alpha: gitA * histK });
    }
    if (venvA > 0) {
      M.item(M.slot(1, 0).x, M.slot(1, 0).y, 80, { kind: 'folder', name: '.venv', label: 'right', size: 30, alpha: venvA });
      shelfLabel('puzzle', 'toolbox', M.slot(1, 1, 64).y, venvA);
      // 06's tiny self-ignoring .gitignore inside .venv, with its gold check
      K.layer(venvA, () => K.at(M.slot(1, 0).x + 4, M.slot(1, 0).y + 8, 1, 0, () => {
        K.file(0, 0, 40, {});
        K.glow(26, -22, 26, C.head, 0.35);
        K.icon('check', 26, -22, 30, { color: C.head, w: 4 });
      }));
    }
    if (vsA > 0) {
      M.item(M.slot(2, 0).x, M.slot(2, 0).y, 80, { kind: 'folder', name: '.vscode', label: 'right', size: 30, alpha: vsA });
      shelfLabel('gear', 'editor settings', M.slot(2, 1, 64).y, vsA);
    }
    // the .gitignore list stays taped to the wall (as 06 left it); it rings when it is named
    const wallRing = K.io(t, wIgnore - 0.3, 0.6) * (1 - K.io(t, wPull, 0.6));
    M.note('.gitignore', 1120, 300, { ring: wallRing });

    const D = L.drawer;
    const dr = M.drawer(D.x, D.y, D.w, D.h, { open: openK, key: keyK, lock: lockK, crossed: crossK, t });
    // "a file called dot E N V": ring the name plate
    const plateK = K.io(t, wDot - 0.1, 0.6) * fadeOut(wInside);
    if (plateK > 0) K.ring(dr.front.x + D.w / 2, dr.front.y + D.h / 2 + 2, 88, 40, plateK, { color: P.attention, w: 4, rot: 0 });

    // ================================================================ env-file + no-lock: the file itself
    const edK = K.io(t, wInside - 0.2, 0.6) * fadeOut(cCommit);
    if (edK > 0) K.layer(edK, () => {
      const Wx = 1212, Wy = 250 + (1 - K.io(t, wInside - 0.2, 0.6)) * 24, Ww = 600, Wh = 230;
      K.win(Wx, Wy, Ww, Wh, { kind: 'code', title: '' });
      M.dotName('.env', Wx + 56, Wy + 34, { size: 26 });
      const f = { font: 'mono', weight: 600, size: 30 };
      const x0 = Wx + 30, y1 = Wy + 108, y2 = Wy + 172;
      const nK = K.io(t, wName - 0.1, 0.4), eK = K.io(t, wEquals - 0.05, 0.4), vK = K.io(t, wValue - 0.1, 0.4);
      const nm = 'API_KEY', eq = '=', val = 'xxxx-not-a-real-key';
      const nw = K.measure(nm, f), ew = K.measure(eq, f), vw = K.measure(val, f);
      K.text(nm, x0, y1, { ...f, color: C.strong, alpha: nK });
      K.text(eq, x0 + nw, y1, { ...f, color: C.head, alpha: eK });
      K.text(val, x0 + nw + ew, y1, { ...f, color: P.secret, alpha: vK });
      const labOut = 1 - K.io(t, wPassword - 0.5, 0.4);
      M.caption('name', x0 + nw / 2, y1 + 42, { alpha: nK * labOut });
      M.caption('value', x0 + nw + ew + vw / 2, y1 + 42, { alpha: vK * labOut });
      K.mark(x0, y1 + 10, nw, K.io(t, wName, 0.4) * labOut, { color: C.head, w: 3, alpha: 0.7 });
      K.mark(x0 + nw + ew, y1 + 10, vw, K.io(t, wValue, 0.5) * labOut, { color: P.secret, w: 3, alpha: 0.7 });
      const l2 = K.io(t, wPassword - 0.1, 0.4);
      const nm2 = 'DB_PASSWORD', val2 = 'xxxx';
      const nw2 = K.measure(nm2, f);
      K.text(nm2, x0, y2, { ...f, color: C.strong, alpha: l2 });
      K.text(eq, x0 + nw2, y2, { ...f, color: C.head, alpha: l2 });
      K.text(val2, x0 + nw2 + ew, y2, { ...f, color: P.secret, alpha: l2 });
      const ptK = K.io(t, wPlain - 0.1, 0.5);
      K.pill('plain text', Wx + Ww - 120, y2 - 10, { size: 26, alpha: ptK, color: C.strong });
    });

    // loads as environment variables -> 01.05
    const evK = K.io(t, wEnvVars - 0.1, 0.5) * fadeOut(cLock);
    const evArrow = K.io(t, wLoads, 1.2) * fadeOut(cLock);
    K.arrow(1500, 492, 1500, 578, { k: evArrow, color: C.soft, w: 3 });
    if (evK > 0) M.ref('01.05', 'environment variables', 1500, 608, { alpha: evK });
    const hidK = K.io(t, wHidden, 0.6) * fadeOut(cCommit);
    if (hidK > 0) K.pill('out of sight, not encrypted', 1500, 608, { size: 26, alpha: hidK, color: C.strong });

    // ================================================================ never-commit: barred from the .git ledger
    const cOut = fadeOut(cPaste);
    // the whole rule-one picture fades out as one (alpha), so nothing retracts or slides on the way out
    if (cOut > 0) K.layer(cOut, () => {
    // the way from the drawer up to the .git folder on the top shelf, barred just in front of .git
    const sG = M.slot(0, 0);
    const barY = sG.y + 76, barX = sG.x + 20;                 // just under .git's plank
    const upK = K.io(t, wNever - 0.8, 0.8);
    K.arrow(1560, 704, barX + 34, barY + 16, { k: upK, color: C.soft, w: 3 });
    const barK = K.io(t, wNever, 0.4);
    if (barK > 0) {
      K.glow(barX, barY, 80, C.head, 0.25 * barK);
      K.line(barX - 72 * barK, barY, barX + 72 * barK, barY, { color: C.head, w: 9 });
      // label beside the bar: "x never into .git"
      K.layer(K.io(t, wNever + 0.2, 0.5), () => {
        const lx = barX + 92, ly = barY;
        K.icon('cross', lx + 12, ly, 26, { color: P.danger, w: 4 });
        const nw = K.measure('never into ', ui26);
        K.text('never into ', lx + 34, ly + 9, { ...ui26, color: C.strong });
        M.dotName('.git', lx + 34 + nw, ly + 9, { size: 26 });
      });
    }
    // the .gitignore list comes off the wall and opens in the middle band; ".env" is typed on it
    const noteK = K.io(t, wIgnore - 0.3, 0.6);
    if (noteK > 0) {
      const nx1 = 1182, ny1 = 560, nw = 236, nh = 146;
      const nx = K.lerp(1060, nx1, noteK), ny = K.lerp(286, ny1, noteK), sc = K.lerp(0.55, 1, noteK);
      K.layer(K.clamp(noteK * 1.6), () => K.at(nx, ny, sc, 0, () => {
        const g = K.ctx();
        g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
        K.rr(0, 0, nw, nh, 6); g.fillStyle = P.paper; g.fill(); g.restore();
        g.beginPath(); g.arc(nw / 2, 4, 7, 0, 7); g.fillStyle = C.gold; g.fill();
        M.dotName('.gitignore', 22, 40, { size: 26, color: P.ink, dot: P.paperDot });
        K.line(20, 54, nw - 20, 54, { color: P.paperShade, w: 2 });
        M.dotName('.venv/', 22, 90, { size: 26, color: P.inkSoft, dot: P.paperDot });
        const typed = K.typed('.env', t, wList, 8);
        if (typed) M.dotName(typed, 22, 128, { size: 26, color: P.ink, dot: P.paperDot });
        if (typed.length === 4) K.mark(20, 136, K.measure('.env', { font: 'mono', size: 26, weight: 600 }) + 4, K.io(t, wList + 0.5, 0.4), { color: P.paperDot, w: 3, alpha: 0.8 });
      }));
    }
    // a key committed before the list existed is already inside the ledger: listing it later doesn't pull it out
    const oldK = K.io(t, wPull - 0.2, 0.6);
    if (oldK > 0) {
      K.glow(1545, ledY + 4, 44, P.secret, 0.35 * oldK);
      K.icon('key', 1545, ledY + 4 - (1 - oldK) * 14, 40, { color: P.secret, w: 4.5, alpha: oldK });
    }
    const repK = K.io(t, wReplace - 0.2, 0.5);
    if (repK > 0) {
      K.icon('cross', 1545, ledY + 6, 70, { color: P.danger, w: 5, alpha: repK });
      const rs = 'replace a leaked key';
      K.pill(rs, 1810 - pillW(rs) / 2, 492, { size: 26, alpha: repK, color: C.strong });
      K.arrow(1764, 466, 1596, ledY + 40, { k: repK, color: C.soft, w: 2.5 });
    }
    });

    // ================================================================ never-paste: the rule, then what happens
    const dOut = fadeOut(cNet);
    // rule two as two plain cream pills, each led by a small terracotta "no" sign (no strike-through)
    const rule = (s, x, y, kIn) => {
      if (kIn <= 0) return;
      const pw = pillW(s) + 40;
      K.card(x - pw / 2, y - 24.7, pw, 49.4, { r: 24.7, fill: C.tile, stroke: C.line2, shadow: false, alpha: kIn });
      K.layer(kIn, () => {
        const ix = x - pw / 2 + 30;
        K.ring(ix, y, 13, 13, 1, { color: P.danger, w: 3.5, rot: 0 });
        K.line(ix - 9, y + 9, ix + 9, y - 9, { color: P.danger, w: 3.5 });
        K.text(s, ix + 24, y + 9, { ...ui26, color: C.strong });
      });
    };
    const pX = 1620;
    rule('never paste into chat', pX, 590, K.io(t, wPaste - 0.4, 0.5) * dOut);
    rule('never let an agent read it', pX, 652, K.io(t, wAgent - 0.4, 0.5) * dOut);

    // the agent (a tool) on the shop's side of the room, reading the drawer anyway
    const agX = 1262, agY = 618;
    const agK = K.io(t, wAgent - 0.2, 0.6) * dOut;
    if (agK > 0) M.staff(agX, agY, 56, { t, i: 1, alpha: agK, label: 'agent' });

    // the home back room (05's ~ room), a small card sliding in at top right
    const hmIn = K.io(t, wClaude - 0.2, 0.7);
    const hmK = hmIn * dOut;
    const hx = 1388 + (1 - hmIn) * 50, hy = 232, hw = 444, hh = 196;
    const fX = hx + 48, fY = hy + 108;
    if (hmK > 0) K.layer(hmK, () => {
      K.card(hx, hy, hw, hh, { r: 14, fill: P.room, stroke: C.head, shadow: true });
      K.icon('house', hx + 34, hy + 34, 36, { color: C.head, w: 3 });
      K.text('~', hx + 64, hy + 44, { font: 'mono', weight: 600, size: 30, color: C.head });
      K.text('HOME BACK ROOM', hx + 96, hy + 43, { font: 'ui', weight: 700, size: 26, color: C.head });
      M.item(fX, fY, 56, { kind: 'folder', name: '~/.claude/projects/', label: 'right', size: 26, dotK: K.io(t, wHiddenF - 0.1, 0.6) });
      K.text('a transcript file', hx + 30, hy + 172, { ...ui26, color: C.strong, alpha: K.io(t, wTranscript - 0.1, 0.5) });
    });
    M.caption("per Claude Code's docs", hx + hw / 2, hy + hh + 34, { alpha: K.io(t, wTranscript + 0.4, 0.6) * dOut });

    // a copy of the key: drawer -> agent ("anything a tool reads") -> the transcript folder ("ends up")
    const k1 = K.io(t, wTool - 0.1, 1.2), k2 = K.io(t, wEnds, 1.1);
    const kA = K.io(t, wTool - 0.1, 0.3) * dOut;
    if (kA > 0) {
      let kx = K.lerp(dr.keyX, agX + 30, k1), ky = K.lerp(dr.keyY, agY + 6, k1);
      kx = K.lerp(kx, fX, k2); ky = K.lerp(ky, fY + 6, k2);
      K.glow(kx, ky, 40, P.secret, 0.3 * kA);
      K.icon('key', kx, ky, 40, { color: P.secret, w: 4, alpha: kA });
    }
    // the reading path, drawn as the key travels (dashed, unblocked)
    const rdA = K.io(t, wTool - 0.3, 0.5) * dOut;
    if (rdA > 0) {
      K.line(dr.keyX - 30, dr.keyY - 8, agX + 40, agY + 14, { k: k1, color: C.line2, w: 2, dash: [6, 9], alpha: rdA });
      K.line(agX + 10, agY - 40, fX - 34, fY + 10, { k: k2, color: C.line2, w: 2, dash: [6, 9], alpha: rdA });
    }

    // ================================================================ push-net: a net, not a plan
    // GitHub, the remote: empty until the unrecognised key gets through
    const ghK = K.io(t, wGitHub - 0.1, 0.6);
    const cloudX = 1540, cloudY = 290;
    if (ghK > 0) K.layer(ghK, () => {
      K.glow(cloudX, cloudY, 110, C.head, 0.08);
      K.icon('cloud', cloudX, cloudY, 130, { color: C.strong, w: 3.5 });
      K.text('GitHub', cloudX + 84, cloudY + 12, { ...M.type.read, color: C.strong });
    });
    // the net across the way up, with a gap near the right end
    const netY = 625, gapX0 = 1724, gapX1 = 1784;
    const netK = K.io(t, wBlocks - 0.1, 0.7);
    if (netK > 0) {
      const x0 = 1222, xe = K.lerp(x0, 1812, netK);
      K.line(x0, netY, Math.min(xe, gapX0), netY, { color: C.soft, w: 3, dash: [4, 8] });
      if (xe > gapX1) K.line(gapX1, netY, xe, netY, { color: C.soft, w: 3, dash: [4, 8] });
      const ps = 'push declined: secret detected';
      K.pill(ps, 1222 + pillW(ps) / 2 + (1 - netK) * 60, netY, { size: 26, alpha: netK, color: C.strong });
    }
    // PUSH PROTECTION: three facts, each on its word, in the middle band at left
    const ppK = K.io(t, wBlocks - 0.2, 0.5);
    if (ppK > 0) K.text('PUSH PROTECTION', 1222, 408, { font: 'ui', weight: 700, size: 26, color: C.head, alpha: ppK });
    [['some known key patterns', wSome], ['public repos', wPublic], ['you can override it', wOverride]].forEach(([s, at], i) => {
      const a = K.io(t, at - 0.1, 0.5);
      if (a > 0) K.text(s, 1222, 450 + i * 38, { ...M.type.read, color: C.strong, alpha: a });
    });
    // key A: a pattern it knows, stopped under the net
    const aUp = K.io(t, wKnown - 0.2, 0.9);
    const aAlpha = K.io(t, wKnown - 0.3, 0.3);
    const aX = 1450;
    if (aAlpha > 0) {
      const ay = K.lerp(dr.keyY, netY + 48, aUp), ax = K.lerp(dr.keyX, aX, aUp);
      K.glow(ax, ay, 40, P.secret, 0.3 * aAlpha);
      K.icon('key', ax, ay, 40, { color: P.secret, w: 4, alpha: aAlpha });
    }
    // key B: a kind it doesn't recognise, through the gap and up into GitHub
    const b1 = K.io(t, wOnly, 0.9), b2 = K.io(t, wOnly + 0.8, 1.1);
    const bAlpha = K.io(t, wOnly - 0.1, 0.3);
    if (bAlpha > 0) {
      const gx = (gapX0 + gapX1) / 2;
      let bx = K.lerp(dr.keyX + 40, gx, b1), by = K.lerp(dr.keyY, netY, b1);
      bx = K.lerp(bx, cloudX + 4, b2); by = K.lerp(by, cloudY + 12, b2);
      K.glow(bx, by, 40, P.secret, 0.3 * bAlpha);
      K.icon('key', bx, by, 40, { color: P.secret, w: 4, alpha: bAlpha });
    }
  });
});
